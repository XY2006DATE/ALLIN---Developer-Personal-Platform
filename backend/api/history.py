from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from backend.database.database import get_db
from backend.utils.auth import get_current_active_user
from backend.models.user import User
from backend.crud.chat import (
    create_chat_history, get_chat_history, get_chat_history_by_url,
    get_user_chat_histories, update_chat_history, delete_chat_history,
    add_chat_message, get_chat_messages, get_chat_history_count,
    get_context_aware_messages, update_context_summary
)
from backend.crud.model import get_model_config
from backend.schemas.chat import (
    ChatHistoryCreate, ChatHistoryUpdate, ChatHistoryResponse,
    ChatHistoryDetailResponse, ChatHistoryListResponse,
    ChatMessageCreate, ChatMessageResponse,
    ChatExportRequest, ChatExportResponse, ChatHistoryFilter,
    ContextSummaryRequest, ContextSummaryResponse
)

router = APIRouter()

@router.post("/", response_model=ChatHistoryResponse)
async def create_chat(
    chat_data: ChatHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新的聊天历史"""
    # 验证模型配置是否存在且属于当前用户
    model_config = get_model_config(db, chat_data.config_id, current_user.id)
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    
    chat_history = create_chat_history(db, chat_data, current_user.id)
    return chat_history

@router.get("/", response_model=ChatHistoryListResponse)
async def get_chat_histories(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(100, ge=1, le=1000, description="限制数量"),
    config_id: Optional[int] = Query(None, description="模型配置ID过滤"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取用户的聊天历史列表"""
    chats = get_user_chat_histories(db, current_user.id, skip, limit, config_id)
    total = get_chat_history_count(db, current_user.id, config_id)
    
    return ChatHistoryListResponse(
        chats=chats,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{chat_id}", response_model=ChatHistoryDetailResponse)
async def get_chat_detail(
    chat_id: int,
    use_context: bool = Query(True, description="是否使用上下文感知的消息选择"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取聊天历史详情"""
    chat_history = get_chat_history(db, chat_id, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    # 根据参数选择使用普通消息还是上下文感知消息
    # 只有当启用上下文功能且启用智能选择时才使用上下文感知消息
    context_enabled = chat_history.enable_context
    smart_selection_enabled = chat_history.context_settings.get('smart_selection', True)
    
    if use_context and context_enabled and smart_selection_enabled:
        messages = get_context_aware_messages(db, chat_id, current_user.id)
    else:
        messages = get_chat_messages(db, chat_id, current_user.id)
    
    # 获取模型名称
    model_config = get_model_config(db, chat_history.config_id, current_user.id)
    name = model_config.name if model_config else None
    
    return ChatHistoryDetailResponse(
        **chat_history.__dict__,
        messages=messages,
        name=name
    )

@router.get("/url/{url}", response_model=ChatHistoryDetailResponse)
async def get_chat_by_url(
    url: str,
    use_context: bool = Query(True, description="是否使用上下文感知的消息选择"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """根据URL获取聊天历史详情"""
    chat_history = get_chat_history_by_url(db, url, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    # 根据参数选择使用普通消息还是上下文感知消息
    # 只有当启用上下文功能且启用智能选择时才使用上下文感知消息
    context_enabled = chat_history.enable_context
    smart_selection_enabled = chat_history.context_settings.get('smart_selection', True)
    
    if use_context and context_enabled and smart_selection_enabled:
        messages = get_context_aware_messages(db, chat_history.id, current_user.id)
    else:
        messages = get_chat_messages(db, chat_history.id, current_user.id)
    
    # 获取模型名称
    model_config = get_model_config(db, chat_history.config_id, current_user.id)
    name = model_config.name if model_config else None
    
    return ChatHistoryDetailResponse(
        **chat_history.__dict__,
        messages=messages,
        name=name
    )

@router.put("/{chat_id}", response_model=ChatHistoryResponse)
async def update_chat(
    chat_id: int,
    chat_update: ChatHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新聊天历史"""
    chat_history = update_chat_history(db, chat_id, chat_update, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    return chat_history

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除聊天历史"""
    success = delete_chat_history(db, chat_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    return {"message": "聊天历史已删除"}

@router.post("/{chat_id}/messages", response_model=ChatMessageResponse)
async def add_message(
    chat_id: int,
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """添加聊天消息"""
    message = add_chat_message(db, chat_id, message_data, current_user.id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    return message

@router.get("/{chat_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    chat_id: int,
    use_context: bool = Query(True, description="是否使用上下文感知的消息选择"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取聊天消息列表"""
    # 检查聊天历史是否存在
    chat_history = get_chat_history(db, chat_id, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    # 根据参数选择使用普通消息还是上下文感知消息
    # 只有当启用上下文功能且启用智能选择时才使用上下文感知消息
    context_enabled = chat_history.enable_context
    smart_selection_enabled = chat_history.context_settings.get('smart_selection', True)
    
    if use_context and context_enabled and smart_selection_enabled:
        messages = get_context_aware_messages(db, chat_id, current_user.id)
    else:
        messages = get_chat_messages(db, chat_id, current_user.id)
    
    if not messages:
        return []
    
    return messages

@router.post("/{chat_id}/context/summary", response_model=ContextSummaryResponse)
async def generate_context_summary(
    chat_id: int,
    summary_request: ContextSummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """生成或更新聊天历史的上下文摘要"""
    chat_history = get_chat_history(db, chat_id, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    try:
        summary = update_context_summary(db, chat_id, current_user.id)
        if summary:
            return ContextSummaryResponse(
                success=True,
                summary=summary,
                message="上下文摘要已更新"
            )
        else:
            return ContextSummaryResponse(
                success=False,
                message="无法生成上下文摘要"
            )
    except Exception as e:
        return ContextSummaryResponse(
            success=False,
            message=f"生成上下文摘要失败: {str(e)}"
        )

@router.post("/{chat_id}/export", response_model=ChatExportResponse)
async def export_chat(
    chat_id: int,
    export_request: ChatExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """导出聊天历史"""
    chat_history = get_chat_history(db, chat_id, current_user.id)
    if not chat_history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="聊天历史不存在"
        )
    
    messages = get_chat_messages(db, chat_id, current_user.id)
    
    try:
        if export_request.format == "json":
            data = {
                "chat_id": chat_history.id,
                "url": chat_history.url,
                "title": chat_history.title,
                "created_at": chat_history.created_at.isoformat(),
                "updated_at": chat_history.updated_at.isoformat(),
                "context_summary": chat_history.context_summary,
                "context_window_size": chat_history.context_window_size,
                "enable_context_summary": chat_history.enable_context_summary,
                "context_settings": chat_history.context_settings,
                "messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "created_at": msg.created_at.isoformat(),
                        "context_keywords": msg.context_keywords,
                        "context_relevance_score": msg.context_relevance_score,
                        **({"metadata": msg.message_metadata} if export_request.include_metadata and msg.message_metadata else {})
                    }
                    for msg in messages
                ]
            }
            export_data = json.dumps(data, ensure_ascii=False, indent=2)
            filename = f"chat_{chat_history.url}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
        elif export_request.format == "markdown":
            export_data = f"# {chat_history.title}\n\n"
            export_data += f"**创建时间**: {chat_history.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            export_data += f"**更新时间**: {chat_history.updated_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            export_data += f"**聊天URL**: {chat_history.url}\n"
            
            # 添加上下文信息
            if chat_history.context_summary:
                export_data += f"**上下文摘要**: {chat_history.context_summary}\n"
            export_data += f"**上下文窗口大小**: {chat_history.context_window_size}\n"
            export_data += f"**启用上下文摘要**: {'是' if chat_history.enable_context_summary else '否'}\n"
            
            export_data += "\n---\n\n"
            
            for msg in messages:
                role_emoji = {"user": "👤", "assistant": "🤖", "system": "⚙️"}
                emoji = role_emoji.get(msg.role, "💬")
                export_data += f"## {emoji} {msg.role.title()}\n\n"
                export_data += f"{msg.content}\n\n"
                
                # 添加上下文信息
                if msg.context_keywords:
                    export_data += f"**关键词**: {', '.join(msg.context_keywords)}\n\n"
                if msg.context_relevance_score > 0:
                    export_data += f"**相关性评分**: {msg.context_relevance_score}\n\n"
                
                if export_request.include_metadata and msg.message_metadata:
                    export_data += f"**元数据**:\n```json\n{json.dumps(msg.message_metadata, ensure_ascii=False, indent=2)}\n```\n\n"
                
                export_data += "---\n\n"
            
            filename = f"chat_{chat_history.url}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            
        elif export_request.format == "txt":
            export_data = f"聊天标题: {chat_history.title}\n"
            export_data += f"创建时间: {chat_history.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            export_data += f"更新时间: {chat_history.updated_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
            export_data += f"聊天URL: {chat_history.url}\n"
            
            # 添加上下文信息
            if chat_history.context_summary:
                export_data += f"上下文摘要: {chat_history.context_summary}\n"
            export_data += f"上下文窗口大小: {chat_history.context_window_size}\n"
            export_data += f"启用上下文摘要: {'是' if chat_history.enable_context_summary else '否'}\n"
            
            export_data += "=" * 50 + "\n\n"
            
            for msg in messages:
                export_data += f"[{msg.role.upper()}] {msg.created_at.strftime('%H:%M:%S')}\n"
                export_data += f"{msg.content}\n"
                
                # 添加上下文信息
                if msg.context_keywords:
                    export_data += f"关键词: {', '.join(msg.context_keywords)}\n"
                if msg.context_relevance_score > 0:
                    export_data += f"相关性评分: {msg.context_relevance_score}\n"
                
                if export_request.include_metadata and msg.message_metadata:
                    export_data += f"元数据: {json.dumps(msg.message_metadata, ensure_ascii=False)}\n"
                
                export_data += "\n"
            
            filename = f"chat_{chat_history.url}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不支持的导出格式"
            )
        
        return ChatExportResponse(
            success=True,
            message="导出成功",
            data=export_data,
            filename=filename
        )
        
    except Exception as e:
        return ChatExportResponse(
            success=False,
            message="导出失败",
            error=str(e)
        ) 