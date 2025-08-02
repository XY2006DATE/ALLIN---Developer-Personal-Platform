from sqlalchemy import Column, Integer, String, DateTime
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

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)  # 头像URL
    theme_preference = Column(String, nullable=True, default='system')  # 主题偏好：light, dark, system
    last_login = Column(DateTime(timezone=True), nullable=True)  # 最后登录时间
    last_logout = Column(DateTime(timezone=True), nullable=True)  # 最后退出时间
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    chat_histories = relationship("ChatHistory", back_populates="user")

 