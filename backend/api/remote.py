from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import time
from datetime import datetime
from fastapi.responses import StreamingResponse
import json

from backend.database.database import get_db
from backend.utils.auth import get_current_active_user
from backend.models.user import User
from backend.crud.model import get_model_config, get_model_configs
from backend.schemas.remote import (
    RemoteChatRequest, RemoteChatResponse, RemoteChatStreamResponse
)
from backend.crud.chat import create_chat_history, add_chat_message, get_chat_history_by_url, get_chat_history, get_user_latest_chat_history
from backend.models.chat import get_current_time
from backend.schemas.chat import ChatHistoryCreate, ChatMessageCreate

router = APIRouter()

@router.post("/chat", response_model=RemoteChatResponse)
async def simple_remote_chat(
    chat_request: RemoteChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """简化版远程聊天 - 通过配置的模型发送聊天消息"""
    
    # 获取模型配置
    model_config = get_model_config(db, chat_request.config_id, current_user.id)
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    
    if not model_config.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模型配置未激活"
        )
    
    # 处理聊天历史保存
    chat_history_id = None
    if chat_request.chat_url:
        # 如果提供了聊天URL，查找现有聊天历史
        chat_history = get_chat_history_by_url(db, chat_request.chat_url, current_user.id)
        if chat_history:
            chat_history_id = chat_history.id
        else:
            # 如果URL不存在，创建新的聊天历史，使用用户的第一条消息作为标题
            # 限制标题长度，避免过长
            title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
            
            # 从上下文设置中获取enable_context状态
            context_enabled = True  # 默认启用
            if chat_request.context_settings:
                # 如果上下文设置中有enable_context字段，使用它
                if 'enable_context' in chat_request.context_settings:
                    context_enabled = chat_request.context_settings['enable_context']
                # 或者根据其他上下文功能的状态来判断
                elif not (chat_request.context_settings.get('enable_summary', True) or 
                         chat_request.context_settings.get('smart_selection', True)):
                    context_enabled = False
            
            chat_data = ChatHistoryCreate(
                title=title,
                config_id=chat_request.config_id,
                enable_context=context_enabled,
                context_settings=chat_request.context_settings or {}
            )
            chat_history = create_chat_history(db, chat_data, current_user.id)
            chat_history_id = chat_history.id
    else:
        # 如果没有提供chat_url，总是创建新的聊天历史
        title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
        
        # 从上下文设置中获取enable_context状态
        context_enabled = True  # 默认启用
        if chat_request.context_settings:
            # 如果上下文设置中有enable_context字段，使用它
            if 'enable_context' in chat_request.context_settings:
                context_enabled = chat_request.context_settings['enable_context']
            # 或者根据其他上下文功能的状态来判断
            elif not (chat_request.context_settings.get('enable_summary', True) or 
                     chat_request.context_settings.get('smart_selection', True)):
                context_enabled = False
        
        chat_data = ChatHistoryCreate(
            title=title,
            config_id=chat_request.config_id,
            enable_context=context_enabled,
            context_settings=chat_request.context_settings or {}
        )
        chat_history = create_chat_history(db, chat_data, current_user.id)
        chat_history_id = chat_history.id
    
    try:
        headers = {
            "Authorization": f"Bearer {model_config.api_key}",
            "Content-Type": "application/json"
        }
        
        # 构建消息历史
        messages = []
        if chat_request.conversation_history:
            messages.extend(chat_request.conversation_history)
        
        # 添加当前用户消息
        messages.append({"role": "user", "content": chat_request.message})
        
        # 根据模型配置和请求参数决定是否使用流式传输
        use_streaming = chat_request.stream if chat_request.stream is not None else model_config.enable_streaming
        
        data = {
            "model": model_config.model_name,
            "messages": messages,
            "max_tokens": chat_request.max_tokens or 10000,
            "temperature": chat_request.temperature or model_config.temperature,
            "stream": use_streaming
        }
        
        # 添加可选的参数，使用模型配置的默认值作为后备
        if chat_request.top_p is not None:
            data["top_p"] = chat_request.top_p
        elif model_config.top_p is not None:
            data["top_p"] = model_config.top_p
            
        if chat_request.frequency_penalty is not None:
            data["frequency_penalty"] = chat_request.frequency_penalty
        elif model_config.frequency_penalty is not None:
            data["frequency_penalty"] = model_config.frequency_penalty
            
        if chat_request.presence_penalty is not None:
            data["presence_penalty"] = chat_request.presence_penalty
        elif model_config.presence_penalty is not None:
            data["presence_penalty"] = model_config.presence_penalty
        
        url = f"{model_config.base_url}/v1/chat/completions"
        
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=chat_request.timeout or 30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # 保存聊天消息到数据库
                if chat_history_id:
                    # 保存用户消息
                    user_message = ChatMessageCreate(
                        role="user",
                        content=chat_request.message,
                        message_metadata={
                            "config_id": chat_request.config_id,
                            "max_tokens": chat_request.max_tokens,
                            "temperature": chat_request.temperature
                        }
                    )
                    add_chat_message(db, chat_history_id, user_message, current_user.id)
                    
                    # 保存模型回复
                    assistant_message = ChatMessageCreate(
                        role="assistant",
                        content=content,
                        message_metadata={
                            "name": model_config.model_name,
                            "response_time": response_time,
                            "usage": result.get("usage", {}),
                            "finish_reason": result["choices"][0].get("finish_reason", "stop")
                        }
                    )
                    add_chat_message(db, chat_history_id, assistant_message, current_user.id)
                
                # 获取聊天历史URL
                chat_url = None
                if chat_history_id:
                    chat_history = get_chat_history(db, chat_history_id, current_user.id)
                    if chat_history:
                        chat_url = chat_history.url
                
                return RemoteChatResponse(
                    success=True,
                    message="聊天成功",
                    response=content,
                    name=model_config.model_name,
                    response_time=response_time,
                    usage=result.get("usage", {}),
                    finish_reason=result["choices"][0].get("finish_reason", "stop"),
                    chat_url=chat_url
                )
            else:
                return RemoteChatResponse(
                    success=False,
                    message="聊天失败",
                    error=f"HTTP {response.status_code}: {response.text}",
                    response_time=response_time
                )
                
    except Exception as e:
        return RemoteChatResponse(
            success=False,
            message="聊天失败",
            error=f"请求异常: {str(e)}"
        )

@router.post("/chat/stream")
async def stream_remote_chat(
    chat_request: RemoteChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """流式远程聊天 - 通过配置的模型发送聊天消息并返回流式响应"""
    
    # 获取模型配置
    model_config = get_model_config(db, chat_request.config_id, current_user.id)
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    
    if not model_config.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模型配置未激活"
        )
    
    # 处理聊天历史保存
    chat_history_id = None
    if chat_request.chat_url:
        # 如果提供了聊天URL，查找现有聊天历史
        chat_history = get_chat_history_by_url(db, chat_request.chat_url, current_user.id)
        if chat_history:
            chat_history_id = chat_history.id
        else:
            # 如果URL不存在，创建新的聊天历史
            title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
            chat_data = ChatHistoryCreate(
                title=title,
                config_id=chat_request.config_id,
                context_settings=chat_request.context_settings or {}
            )
            chat_history = create_chat_history(db, chat_data, current_user.id)
            chat_history_id = chat_history.id
    else:
        # 如果没有提供chat_url，总是创建新的聊天历史
        title = chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message
        chat_data = ChatHistoryCreate(
            title=title,
            config_id=chat_request.config_id,
            context_settings=chat_request.context_settings or {}
        )
        chat_history = create_chat_history(db, chat_data, current_user.id)
        chat_history_id = chat_history.id
    
    # 先保存用户消息
    user_message_data = ChatMessageCreate(
        role="user",
        content=chat_request.message,
        message_metadata={
            "config_id": chat_request.config_id,
            "temperature": chat_request.temperature,
            "max_tokens": chat_request.max_tokens
        }
    )
    user_message = add_chat_message(db, chat_history_id, user_message_data, current_user.id)
    
    # 记录开始时间用于计算响应时间
    start_time = time.time()
    
    # 在流式传输开始前获取所有需要的数据，避免会话问题
    api_key = model_config.api_key
    model_name = model_config.model_name
    base_url = model_config.base_url
    temperature = model_config.temperature
    
    async def generate_stream():
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            # 构建消息历史
            messages = []
            if chat_request.conversation_history:
                messages.extend(chat_request.conversation_history)
            
            # 添加当前用户消息
            messages.append({"role": "user", "content": chat_request.message})
            
            data = {
                "model": model_name,
                "messages": messages,
                "max_tokens": chat_request.max_tokens or 10000,
                "temperature": chat_request.temperature or temperature,
                "stream": True  # 强制启用流式传输
            }
            
            # 添加可选的参数，使用模型配置的默认值作为后备
            if chat_request.top_p is not None:
                data["top_p"] = chat_request.top_p
            elif model_config.top_p is not None:
                data["top_p"] = model_config.top_p
                
            if chat_request.frequency_penalty is not None:
                data["frequency_penalty"] = chat_request.frequency_penalty
            elif model_config.frequency_penalty is not None:
                data["frequency_penalty"] = model_config.frequency_penalty
                
            if chat_request.presence_penalty is not None:
                data["presence_penalty"] = chat_request.presence_penalty
            elif model_config.presence_penalty is not None:
                data["presence_penalty"] = model_config.presence_penalty
            
            url = f"{base_url}/v1/chat/completions"
            
            full_content = ""
            
            async with httpx.AsyncClient(timeout=chat_request.timeout or 30.0) as client:
                async with client.stream("POST", url, headers=headers, json=data) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_line = line[6:]  # 移除 "data: " 前缀
                                if data_line.strip() == "[DONE]":
                                    # 流式传输结束，保存助手消息到数据库
                                    if full_content:
                                        try:
                                            assistant_message_data = ChatMessageCreate(
                                                role="assistant",
                                                content=full_content,
                                                message_metadata={
                                                    "model": model_name,
                                                    "config_id": chat_request.config_id,
                                                    "temperature": chat_request.temperature,
                                                    "max_tokens": chat_request.max_tokens,
                                                    "streaming": True,
                                                    "response_time": time.time() - start_time
                                                }
                                            )
                                            # 使用新的数据库会话保存消息
                                            from backend.database.database import SessionLocal
                                            new_db = SessionLocal()
                                            try:
                                                add_chat_message(new_db, chat_history_id, assistant_message_data, current_user.id)
                                                print(f"助手消息保存成功，聊天ID: {chat_history_id}")
                                            finally:
                                                new_db.close()
                                        except Exception as e:
                                            print(f"保存助手消息失败: {e}")
                                    
                                    # 发送结束信号
                                    yield f"data: {json.dumps({'type': 'done', 'success': True, 'chat_id': chat_history_id})}\n\n"
                                    break
                                else:
                                    try:
                                        chunk_data = json.loads(data_line)
                                        if "choices" in chunk_data and len(chunk_data["choices"]) > 0:
                                            choice = chunk_data["choices"][0]
                                            if "delta" in choice and "content" in choice["delta"]:
                                                content_chunk = choice["delta"]["content"]
                                                full_content += content_chunk
                                                
                                                # 发送内容块
                                                yield f"data: {json.dumps({'type': 'content', 'content': content_chunk})}\n\n"
                                    except json.JSONDecodeError:
                                        continue
                    else:
                        # 发送错误信息
                        error_response = {
                            "type": "error",
                            "success": False,
                            "error": f"HTTP {response.status_code}: {response.text}"
                        }
                        yield f"data: {json.dumps(error_response)}\n\n"
                        
        except Exception as e:
            # 发送异常信息
            error_response = {
                "type": "error", 
                "success": False,
                "error": f"请求异常: {str(e)}"
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@router.post("/chat/stream/save")
async def save_stream_message(
    chat_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """保存流式传输完成后的消息"""
    try:
        message = add_chat_message(db, chat_id, message_data, current_user.id)
        if message:
            return {"success": True, "message_id": message.id}
        else:
            return {"success": False, "error": "保存消息失败"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "remote",
        "timestamp": datetime.utcnow().isoformat()
    } 