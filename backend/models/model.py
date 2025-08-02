from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database.database import Base

class ModelConfig(Base):
    """模型配置表"""
    __tablename__ = "model_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 用户ID
    name = Column(String, nullable=False, index=True)  # 模型名称（每个用户内唯一）
    base_url = Column(String, nullable=False)  # API基础URL
    api_key = Column(String, nullable=False)  # API密钥
    model_name = Column(String, nullable=False)  # 具体的模型名称
    description = Column(Text, nullable=True)  # 模型描述
    is_active = Column(Boolean, default=True)  # 是否激活
    
    # 模型设置
    enable_streaming = Column(Boolean, default=True)  # 是否启用流式传输
    enable_context = Column(Boolean, default=True)  # 是否启用上下文功能
    temperature = Column(Float, default=0.7)  # 温度参数 (0.0-2.0)
    top_p = Column(Float, default=1.0)  # Top-p采样参数 (0.0-1.0)
    frequency_penalty = Column(Float, default=0.0)  # 频率惩罚 (-2.0-2.0)
    presence_penalty = Column(Float, default=0.0)  # 存在惩罚 (-2.0-2.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关联关系
    chat_histories = relationship("ChatHistory", back_populates="model")

class ModelInstance(Base):
    """模型实例表 - 用于记录模型加载状态"""
    __tablename__ = "model_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, nullable=False)  # 关联的模型配置ID
    instance_name = Column(String, nullable=False)  # 实例名称
    status = Column(String, nullable=False, default="stopped")  # running, stopped, error
    loaded_at = Column(DateTime(timezone=True), nullable=True)  # 加载时间
    last_used = Column(DateTime(timezone=True), nullable=True)  # 最后使用时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserModelPreference(Base):
    """用户模型偏好表"""
    __tablename__ = "user_model_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)  # 用户ID
    model_config_id = Column(Integer, nullable=False)  # 模型配置ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 