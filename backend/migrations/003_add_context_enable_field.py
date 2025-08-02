#!/usr/bin/env python3
"""
为模型配置表和聊天历史表添加enable_context字段
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings

def add_context_enable_field():
    """为模型配置表和聊天历史表添加enable_context字段"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 检查model_configs表是否存在
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='model_configs'
            """))
            
            if not result.fetchone():
                print("❌ model_configs表不存在，请先运行001_init_database.py")
                return False
            
            # 检查model_configs表的字段
            result = conn.execute(text("PRAGMA table_info(model_configs)"))
            existing_columns = [row[1] for row in result.fetchall()]
            
            # 为model_configs表添加enable_context字段
            if "enable_context" not in existing_columns:
                conn.execute(text("ALTER TABLE model_configs ADD COLUMN enable_context BOOLEAN DEFAULT 1"))
                print("✅ 已添加字段: model_configs.enable_context")
            else:
                print("ℹ️  字段已存在: model_configs.enable_context")
            
            # 检查chat_history表是否存在
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='chat_history'
            """))
            
            if not result.fetchone():
                print("❌ chat_history表不存在，请先运行002_create_chat_tables.py")
                return False
            
            # 检查chat_history表的字段
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            existing_columns = [row[1] for row in result.fetchall()]
            
            # 为chat_history表添加enable_context字段
            if "enable_context" not in existing_columns:
                conn.execute(text("ALTER TABLE chat_history ADD COLUMN enable_context BOOLEAN DEFAULT 1"))
                print("✅ 已添加字段: chat_history.enable_context")
            else:
                print("ℹ️  字段已存在: chat_history.enable_context")
            
            conn.commit()
            
            # 验证字段添加结果
            print("\n📋 验证字段添加结果:")
            
            # 检查model_configs表结构
            result = conn.execute(text("PRAGMA table_info(model_configs)"))
            print("model_configs表字段:")
            for row in result.fetchall():
                print(f"  - {row[1]} ({row[2]})")
            
            # 检查chat_history表结构
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            print("\nchat_history表字段:")
            for row in result.fetchall():
                print(f"  - {row[1]} ({row[2]})")
            
            return True
            
    except Exception as e:
        print(f"❌ 添加enable_context字段失败: {e}")
        return False

def check_migration():
    """检查迁移结果"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 检查model_configs表的enable_context字段
            result = conn.execute(text("PRAGMA table_info(model_configs)"))
            columns = [row[1] for row in result.fetchall()]
            
            if "enable_context" in columns:
                print("✅ model_configs.enable_context字段存在")
            else:
                print("❌ model_configs.enable_context字段不存在")
            
            # 检查chat_history表的enable_context字段
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            columns = [row[1] for row in result.fetchall()]
            
            if "enable_context" in columns:
                print("✅ chat_history.enable_context字段存在")
            else:
                print("❌ chat_history.enable_context字段不存在")
            
            return True
            
    except Exception as e:
        print(f"❌ 检查迁移结果失败: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        print("🔍 检查enable_context字段迁移结果...")
        check_migration()
    else:
        print("🚀 开始添加enable_context字段...")
        add_context_enable_field() 