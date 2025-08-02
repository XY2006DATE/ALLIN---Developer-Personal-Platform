#!/usr/bin/env python3
"""
为聊天历史表添加上下文功能相关字段
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings

def add_context_features():
    """为聊天历史表添加上下文功能相关字段"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 检查chat_history表是否存在
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='chat_history'
            """))
            
            if not result.fetchone():
                print("❌ chat_history表不存在，请先运行002_create_chat_tables.py")
                return False
            
            # 检查字段是否已存在
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            existing_columns = [row[1] for row in result.fetchall()]
            
            # 为chat_history表添加上下文相关字段
            context_columns = [
                ("context_window_size", "INTEGER DEFAULT 10"),
                ("enable_context_summary", "BOOLEAN DEFAULT 1"),
                ("context_summary", "TEXT"),
                ("context_settings", "JSON DEFAULT '{}'")
            ]
            
            for column_name, column_def in context_columns:
                if column_name not in existing_columns:
                    conn.execute(text(f"ALTER TABLE chat_history ADD COLUMN {column_name} {column_def}"))
                    print(f"✅ 已添加字段: chat_history.{column_name}")
                else:
                    print(f"ℹ️  字段已存在: chat_history.{column_name}")
            
            # 检查chat_messages表是否存在
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='chat_messages'
            """))
            
            if not result.fetchone():
                print("❌ chat_messages表不存在，请先运行002_create_chat_tables.py")
                return False
            
            # 检查chat_messages表的字段
            result = conn.execute(text("PRAGMA table_info(chat_messages)"))
            existing_columns = [row[1] for row in result.fetchall()]
            
            # 为chat_messages表添加上下文相关字段
            message_context_columns = [
                ("context_relevance_score", "INTEGER DEFAULT 0"),
                ("context_keywords", "JSON")
            ]
            
            for column_name, column_def in message_context_columns:
                if column_name not in existing_columns:
                    conn.execute(text(f"ALTER TABLE chat_messages ADD COLUMN {column_name} {column_def}"))
                    print(f"✅ 已添加字段: chat_messages.{column_name}")
                else:
                    print(f"ℹ️  字段已存在: chat_messages.{column_name}")
            
            conn.commit()
            
            # 验证字段添加结果
            print("\n📋 验证字段添加结果:")
            
            # 检查chat_history表结构
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            print("chat_history表字段:")
            for row in result.fetchall():
                print(f"  - {row[1]} ({row[2]})")
            
            # 检查chat_messages表结构
            result = conn.execute(text("PRAGMA table_info(chat_messages)"))
            print("\nchat_messages表字段:")
            for row in result.fetchall():
                print(f"  - {row[1]} ({row[2]})")
            
            return True
            
    except Exception as e:
        print(f"❌ 添加上下文功能字段失败: {e}")
        return False

def check_context_features():
    """检查上下文功能字段是否存在"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 检查chat_history表的上下文字段
            result = conn.execute(text("PRAGMA table_info(chat_history)"))
            columns = [row[1] for row in result.fetchall()]
            
            context_columns = [
                "context_window_size",
                "enable_context_summary", 
                "context_summary",
                "context_settings"
            ]
            
            print("📋 chat_history表上下文字段检查:")
            for col in context_columns:
                if col in columns:
                    print(f"  ✅ {col}")
                else:
                    print(f"  ❌ {col}")
            
            # 检查chat_messages表的上下文字段
            result = conn.execute(text("PRAGMA table_info(chat_messages)"))
            columns = [row[1] for row in result.fetchall()]
            
            message_context_columns = [
                "context_relevance_score",
                "context_keywords"
            ]
            
            print("\n📋 chat_messages表上下文字段检查:")
            for col in message_context_columns:
                if col in columns:
                    print(f"  ✅ {col}")
                else:
                    print(f"  ❌ {col}")
            
            return True
            
    except Exception as e:
        print(f"❌ 检查上下文功能字段失败: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        print("🔍 检查上下文功能字段...")
        check_context_features()
    else:
        print("🔄 为聊天历史表添加上下文功能字段...")
        success = add_context_features()
        
        if success:
            print("\n🎉 上下文功能字段添加完成！")
            print("💡 现在您可以:")
            print("  - 使用上下文窗口管理功能")
            print("  - 启用智能消息选择")
            print("  - 生成上下文摘要")
            print("  - 使用关键词过滤")
        else:
            print("💥 上下文功能字段添加失败！")
            sys.exit(1) 