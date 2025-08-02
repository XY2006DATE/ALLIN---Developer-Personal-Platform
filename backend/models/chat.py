from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base
from datetime import datetime
import pytz

# 获取上海时区
shanghai_tz = pytz.timezone('Asia/Shanghai')

def get_current_time():
    """获取当前上海时间"""
    return datetime.now(shanghai_tz)

class ChatHistory(Base):
    """聊天历史表"""
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    config_id = Column(Integer, ForeignKey("model_configs.id"), nullable=False)
    title = Column(String(255), nullable=False, comment="聊天标题")
    url = Column(String(500), unique=True, nullable=False, comment="聊天URL")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")
    is_deleted = Column(Boolean, default=False, comment="是否删除")
    
    # 上下文相关字段
    enable_context = Column(Boolean, default=True, comment="是否启用上下文功能")
    context_window_size = Column(Integer, default=10, comment="上下文窗口大小（消息数量）")
    enable_context_summary = Column(Boolean, default=True, comment="是否启用上下文摘要")
    context_summary = Column(Text, comment="上下文摘要内容")
    context_settings = Column(JSON, default={}, comment="上下文设置，如智能选择、关键词过滤等")
    
    # 关联关系
    user = relationship("User", back_populates="chat_histories")
    model = relationship("ModelConfig", back_populates="chat_histories")
    messages = relationship("ChatMessage", back_populates="chat_history", cascade="all, delete-orphan")


class ChatMessage(Base):
    """聊天消息表"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_history_id = Column(Integer, ForeignKey("chat_history.id"), nullable=False)
    role = Column(String(50), nullable=False, comment="消息角色：user/assistant/system")
    content = Column(Text, nullable=False, comment="消息内容")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    message_metadata = Column(JSON, comment="额外元数据，如模型参数、工具调用等")
    
    # 上下文相关字段
    context_relevance_score = Column(Integer, default=0, comment="上下文相关性评分")
    context_keywords = Column(JSON, comment="提取的关键词")
    
    # 关联关系
    chat_history = relationship("ChatHistory", back_populates="messages") 