from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings
import os

# 设置时区环境变量
os.environ['TZ'] = 'Asia/Shanghai'

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={
        "check_same_thread": False,
        "timeout": 20,
        "isolation_level": None  # 启用自动提交模式
    } if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 