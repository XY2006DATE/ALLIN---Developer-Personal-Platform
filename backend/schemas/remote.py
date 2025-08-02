from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class RemoteChatRequest(BaseModel):
    """远程聊天请求"""
    config_id: int = Field(..., description="模型配置ID")
    message: str = Field(..., description="用户消息")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        None, 
        description="对话历史，格式: [{'role': 'user', 'content': '...'}, {'role': 'assistant', 'content': '...'}]"
    )
    chat_url: Optional[str] = Field(None, description="聊天URL，用于继续现有对话")
    
    # 可选参数
    max_tokens: Optional[int] = Field(None, ge=1, le=10000, description="最大token数")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="温度参数")
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0, description="Top-p采样参数")
    frequency_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0, description="频率惩罚")
    presence_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0, description="存在惩罚")
    stream: Optional[bool] = Field(None, description="是否启用流式传输")
    timeout: Optional[float] = Field(None, ge=1.0, le=300.0, description="请求超时时间（秒）")
    
    # 上下文设置
    context_settings: Optional[Dict[str, Any]] = Field(None, description="上下文设置")

class RemoteChatResponse(BaseModel):
    """远程聊天响应"""
    success: bool
    message: str
    response: Optional[str] = None
    error: Optional[str] = None
    name: Optional[str] = None
    response_time: Optional[float] = None
    usage: Optional[Dict[str, Any]] = None
    finish_reason: Optional[str] = None
    chat_url: Optional[str] = None

class RemoteChatStreamResponse(BaseModel):
    """远程聊天流式响应"""
    success: bool
    message: str
    response: Optional[str] = None
    error: Optional[str] = None
    name: Optional[str] = None
    finish_reason: Optional[str] = None

class RemoteModelListRequest(BaseModel):
    """远程模型列表请求"""
    skip: Optional[int] = Field(0, ge=0, description="跳过数量")
    limit: Optional[int] = Field(100, ge=1, le=1000, description="限制数量")
    active_only: Optional[bool] = Field(False, description="是否只返回激活的模型")

class RemoteModelListResponse(BaseModel):
    """远程模型列表响应"""
    models: List[Any]  # 这里使用Any是因为模型配置的响应类型
    total: int
    active_count: int 