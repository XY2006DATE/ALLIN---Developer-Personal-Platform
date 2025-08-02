from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatHistoryBase(BaseModel):
    """聊天历史基础模型"""
    title: str = Field(..., description="聊天标题")
    config_id: int = Field(..., description="模型配置ID")

class ChatHistoryCreate(ChatHistoryBase):
    """创建聊天历史请求"""
    enable_context: Optional[bool] = Field(None, description="是否启用上下文功能（如果为None，则使用模型配置的默认值）")
    context_window_size: Optional[int] = Field(10, description="上下文窗口大小")
    enable_context_summary: Optional[bool] = Field(True, description="是否启用上下文摘要")
    context_settings: Optional[Dict[str, Any]] = Field({}, description="上下文设置")

class ChatHistoryUpdate(BaseModel):
    """更新聊天历史请求"""
    title: Optional[str] = Field(None, description="聊天标题")
    enable_context: Optional[bool] = Field(None, description="是否启用上下文功能")
    context_window_size: Optional[int] = Field(None, description="上下文窗口大小")
    enable_context_summary: Optional[bool] = Field(None, description="是否启用上下文摘要")
    context_summary: Optional[str] = Field(None, description="上下文摘要")
    context_settings: Optional[Dict[str, Any]] = Field(None, description="上下文设置")

class ChatHistoryResponse(ChatHistoryBase):
    """聊天历史响应"""
    id: int
    url: str
    created_at: datetime
    updated_at: datetime
    user_id: int
    enable_context: bool = True
    context_window_size: int = 10
    enable_context_summary: bool = True
    context_summary: Optional[str] = None
    context_settings: Dict[str, Any] = {}
    
    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    """聊天消息基础模型"""
    role: str = Field(..., description="消息角色：user/assistant/system")
    content: str = Field(..., description="消息内容")

class ChatMessageCreate(ChatMessageBase):
    """创建聊天消息请求"""
    message_metadata: Optional[Dict[str, Any]] = Field(None, description="额外元数据")
    context_relevance_score: Optional[int] = Field(0, description="上下文相关性评分")
    context_keywords: Optional[List[str]] = Field(None, description="提取的关键词")

class ChatMessageResponse(ChatMessageBase):
    """聊天消息响应"""
    id: int
    chat_history_id: int
    created_at: datetime
    message_metadata: Optional[Dict[str, Any]] = None
    context_relevance_score: int = 0
    context_keywords: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class ChatHistoryDetailResponse(ChatHistoryResponse):
    """聊天历史详情响应（包含消息）"""
    messages: List[ChatMessageResponse] = []
    name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChatHistoryListResponse(BaseModel):
    """聊天历史列表响应"""
    chats: List[ChatHistoryResponse]
    total: int
    skip: int
    limit: int

class ChatExportRequest(BaseModel):
    """聊天导出请求"""
    format: str = Field(..., description="导出格式：json/markdown/txt")
    include_metadata: bool = Field(True, description="是否包含元数据")

class ChatExportResponse(BaseModel):
    """聊天导出响应"""
    success: bool
    message: str
    data: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None

class ChatHistoryFilter(BaseModel):
    """聊天历史过滤条件"""
    config_id: Optional[int] = Field(None, description="模型配置ID过滤")
    skip: int = Field(0, ge=0, description="跳过数量")
    limit: int = Field(100, ge=1, le=1000, description="限制数量")

class ContextSettings(BaseModel):
    """上下文设置"""
    window_size: int = Field(10, description="上下文窗口大小")
    enable_summary: bool = Field(True, description="是否启用摘要")
    smart_selection: bool = Field(True, description="是否启用智能选择")
    keyword_filtering: bool = Field(False, description="是否启用关键词过滤")
    max_summary_length: int = Field(200, description="最大摘要长度")

class ContextSummaryRequest(BaseModel):
    """上下文摘要请求"""
    chat_id: int = Field(..., description="聊天ID")
    force_update: bool = Field(False, description="是否强制更新摘要")

class ContextSummaryResponse(BaseModel):
    """上下文摘要响应"""
    success: bool
    summary: Optional[str] = None
    message: str 