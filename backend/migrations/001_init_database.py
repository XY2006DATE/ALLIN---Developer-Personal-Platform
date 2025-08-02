#!/usr/bin/env python3
"""
ALLIN 数据库初始化脚本
用于创建所有必要的数据库表
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings
from backend.database.database import Base
from backend.models.user import User
from backend.models.model import ModelConfig, ModelInstance, UserModelPreference
from backend.models.chat import ChatHistory, ChatMessage

def init_database():
    """初始化数据库，创建所有表"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("✅ 所有数据库表创建成功")
        
        # 验证表是否创建成功
        with engine.connect() as conn:
            # 检查所有表
            tables = [
                "users", "model_configs", "model_instances", 
                "user_model_preferences", "chat_history", "chat_messages"
            ]
            
            for table in tables:
                result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'"))
                if result.fetchone():
                    print(f"✅ {table}表已创建")
                else:
                    print(f"❌ {table}表创建失败")
                    
    except Exception as e:
        print(f"❌ 创建数据库表时出错: {e}")
        return False
    
    return True

def reset_database():
    """重置数据库（删除所有表并重新创建）"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        print("⚠️  警告：这将删除所有现有数据！")
        confirm = input("确认要重置数据库吗？(y/N): ")
        
        if confirm.lower() != 'y':
            print("❌ 操作已取消")
            return False
        
        print("🗑️  删除所有表...")
        Base.metadata.drop_all(bind=engine)
        print("✅ 所有表已删除")
        
        print("🔄 重新创建表...")
        Base.metadata.create_all(bind=engine)
        print("✅ 表重新创建成功")
        
        return True
        
    except Exception as e:
        print(f"❌ 数据库重置失败: {e}")
        return False

def check_database_status():
    """检查数据库状态"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        print("🔍 检查数据库状态...")
        
        with engine.connect() as conn:
            # 获取所有表
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result.fetchall()]
            
            expected_tables = [
                "users", "model_configs", "model_instances", 
                "user_model_preferences", "chat_history", "chat_messages"
            ]
            
            print(f"📊 数据库状态:")
            print(f"  - 总表数: {len(tables)}")
            print(f"  - 预期表数: {len(expected_tables)}")
            
            missing_tables = [table for table in expected_tables if table not in tables]
            extra_tables = [table for table in tables if table not in expected_tables]
            
            if missing_tables:
                print(f"  ❌ 缺失表: {missing_tables}")
            else:
                print("  ✅ 所有必需表都存在")
                
            if extra_tables:
                print(f"  ⚠️  额外表: {extra_tables}")
            
            return len(missing_tables) == 0
            
    except Exception as e:
        print(f"❌ 数据库状态检查失败: {e}")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="ALLIN 数据库管理工具")
    parser.add_argument("--init", action="store_true", help="初始化数据库")
    parser.add_argument("--reset", action="store_true", help="重置数据库（删除所有数据）")
    parser.add_argument("--check", action="store_true", help="检查数据库状态")
    
    args = parser.parse_args()
    
    if args.reset:
        success = reset_database()
    elif args.check:
        success = check_database_status()
    else:
        # 默认执行初始化
        success = init_database()
    
    if success:
        print("🎉 操作完成！")
    else:
        print("💥 操作失败！")
        sys.exit(1) 