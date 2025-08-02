from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx
import time
from datetime import datetime

from backend.database.database import get_db
from backend.utils.auth import get_current_active_user
from backend.models.user import User
from backend.crud.model import (
    create_model_config, get_model_config, get_model_configs, update_model_config,
    delete_model_config, get_model_config_by_name
)
from backend.schemas.model import (
    ModelConfigCreate, ModelConfigUpdate, ModelConfigResponse,
    ModelListResponse, ModelConnectionTestRequest, ModelConnectionTestResponse
)

router = APIRouter()

# 模型注册
@router.post("/register", response_model=ModelConfigResponse)
async def register_model(
    model_config: ModelConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """注册新模型"""
    # 检查名称是否已存在（同一用户内）
    existing_config = get_model_config_by_name(db, model_config.name, current_user.id)
    if existing_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模型名称已存在"
        )
    
    return create_model_config(db, model_config, current_user.id)

# 模型列表
@router.get("/list", response_model=ModelListResponse)
async def list_models(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    models = get_model_configs(db, current_user.id, skip=skip, limit=limit, active_only=active_only)
    
    total = len(models)
    active_count = len([m for m in models if m.is_active])
    
    return ModelListResponse(
        models=models,
        total=total,
        active_count=active_count
    )

# 获取特定模型
@router.get("/{model_id}", response_model=ModelConfigResponse)
async def get_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    model_config = get_model_config(db, model_id, current_user.id)
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    return model_config

# 更新模型设置
@router.put("/{model_id}/settings", response_model=ModelConfigResponse)
async def update_model_settings(
    model_id: int,
    model_settings: ModelConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    # 获取更新前的模型配置
    old_model_config = get_model_config(db, model_id, current_user.id)
    if not old_model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    
    # 更新模型配置
    model_config = update_model_config(db, model_id, model_settings, current_user.id)
    if not model_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    
    # 如果上下文功能状态发生了变化，更新相关聊天历史的上下文设置
    if old_model_config.enable_context != model_config.enable_context:
        from backend.crud.chat import get_user_chat_histories, update_chat_history
        from backend.schemas.chat import ChatHistoryUpdate
        
        # 获取使用该模型的所有聊天历史
        chat_histories = get_user_chat_histories(db, current_user.id, config_id=model_id)
        
        for chat in chat_histories:
            # 更新聊天历史的enable_context字段
            chat_update = ChatHistoryUpdate(enable_context=model_config.enable_context)
            update_chat_history(db, chat.id, chat_update, current_user.id)
    
    return model_config

# 删除模型
@router.delete("/{model_id}")
async def delete_model(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除模型配置"""
    success = delete_model_config(db, model_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型配置不存在"
        )
    return {"message": "模型配置已删除"}

# 模型连接测试
@router.post("/test-connection", response_model=ModelConnectionTestResponse)
async def test_model_connection(
    test_request: ModelConnectionTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    
    start_time = time.time()
    
    try:
        headers = {
            "Authorization": f"Bearer {test_request.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": test_request.model_name,
            "messages": [{"role": "user", "content": test_request.test_message}],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        url = f"{test_request.base_url}/v1/chat/completions"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=data)
            
            connection_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                return ModelConnectionTestResponse(
                    success=True,
                    message="模型连接测试成功",
                    response=content,
                    connection_time=connection_time
                )
            else:
                return ModelConnectionTestResponse(
                    success=False,
                    message="模型连接测试失败",
                    error=f"HTTP {response.status_code}: {response.text}",
                    connection_time=connection_time
                )
                
    except Exception as e:
        connection_time = time.time() - start_time
        return ModelConnectionTestResponse(
            success=False,
            message="模型连接测试失败",
            error=str(e),
            connection_time=connection_time
        )



 