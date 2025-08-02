import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 数据库配置 - 使用绝对路径
    DATABASE_URL: str = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'allin.db')}"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 应用配置
    APP_NAME: str = "ALLIN Backend"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings() 