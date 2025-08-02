#!/usr/bin/env python3
"""
聊天历史表数据库迁移脚本
专门用于创建聊天历史相关的表
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings
from backend.database.database import Base
from backend.models.chat import ChatHistory, ChatMessage

def create_chat_tables():
    """创建聊天历史相关的表"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # 创建聊天历史表
        Base.metadata.create_all(bind=engine, tables=[ChatHistory.__table__, ChatMessage.__table__])
        print("✅ 聊天历史表创建成功")
        
        # 验证表是否创建成功
        with engine.connect() as conn:
            # 检查ChatHistory表
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'"))
            if result.fetchone():
                print("✅ chat_history表已创建")
            else:
                print("❌ chat_history表创建失败")
            
            # 检查ChatMessage表
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_messages'"))
            if result.fetchone():
                print("✅ chat_messages表已创建")
            else:
                print("❌ chat_messages表创建失败")
                
    except Exception as e:
        print(f"❌ 创建聊天历史表时出错: {e}")
        return False
    
    return True

def drop_chat_tables():
    """删除聊天历史相关的表"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        print("⚠️  警告：这将删除所有聊天历史数据！")
        confirm = input("确认要删除聊天历史表吗？(y/N): ")
        
        if confirm.lower() != 'y':
            print("❌ 操作已取消")
            return False
        
        # 删除表
        Base.metadata.drop_all(bind=engine, tables=[ChatHistory.__table__, ChatMessage.__table__])
        print("✅ 聊天历史表已删除")
        
        return True
        
    except Exception as e:
        print(f"❌ 删除聊天历史表时出错: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="聊天历史表管理工具")
    parser.add_argument("--create", action="store_true", help="创建聊天历史表")
    parser.add_argument("--drop", action="store_true", help="删除聊天历史表")
    
    args = parser.parse_args()
    
    if args.drop:
        success = drop_chat_tables()
    else:
        # 默认创建表
        success = create_chat_tables()
    
    if success:
        print("🎉 操作完成！")
    else:
        print("💥 操作失败！")
        sys.exit(1) 