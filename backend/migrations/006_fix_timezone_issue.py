#!/usr/bin/env python3
"""
修复用户注册时间时区问题的迁移脚本
将现有的UTC时间转换为上海时区
"""

import sys
import os
from datetime import datetime, timedelta
import pytz

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings

def fix_timezone_issue():
    """修复用户注册时间的时区问题"""
    print(f"🔧 数据库URL: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        print("🔧 开始修复用户注册时间时区问题...")
        
        with engine.connect() as conn:
            # 获取所有用户记录
            result = conn.execute(text("SELECT id, created_at, updated_at FROM users"))
            users = result.fetchall()
            
            print(f"📊 找到 {len(users)} 个用户记录")
            
            # 上海时区
            shanghai_tz = pytz.timezone('Asia/Shanghai')
            
            for user in users:
                user_id, created_at, updated_at = user
                
                # 修复创建时间
                if created_at:
                    # 将字符串转换为datetime对象
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    # 假设现有时间是UTC时间，需要加8小时转换为上海时间
                    if created_at.tzinfo is None:
                        # 如果没有时区信息，假设是UTC时间
                        utc_time = created_at.replace(tzinfo=pytz.UTC)
                        shanghai_time = utc_time.astimezone(shanghai_tz)
                    else:
                        # 如果有时区信息，直接转换
                        shanghai_time = created_at.astimezone(shanghai_tz)
                    
                    # 更新数据库
                    conn.execute(
                        text("UPDATE users SET created_at = :created_at WHERE id = :user_id"),
                        {"created_at": shanghai_time, "user_id": user_id}
                    )
                    print(f"✅ 用户 {user_id} 创建时间已修复: {created_at} -> {shanghai_time}")
                
                # 修复更新时间
                if updated_at:
                    # 将字符串转换为datetime对象
                    if isinstance(updated_at, str):
                        updated_at = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                    
                    # 假设现有时间是UTC时间，需要加8小时转换为上海时间
                    if updated_at.tzinfo is None:
                        # 如果没有时区信息，假设是UTC时间
                        utc_time = updated_at.replace(tzinfo=pytz.UTC)
                        shanghai_time = utc_time.astimezone(shanghai_tz)
                    else:
                        # 如果有时区信息，直接转换
                        shanghai_time = updated_at.astimezone(shanghai_tz)
                    
                    # 更新数据库
                    conn.execute(
                        text("UPDATE users SET updated_at = :updated_at WHERE id = :user_id"),
                        {"updated_at": shanghai_time, "user_id": user_id}
                    )
                    print(f"✅ 用户 {user_id} 更新时间已修复: {updated_at} -> {shanghai_time}")
            
            # 提交更改
            conn.commit()
            print("✅ 所有用户时间已修复并提交到数据库")
            
            return True
            
    except Exception as e:
        print(f"❌ 修复时区问题时出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_timezone_status():
    """检查时区修复状态"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        print("🔍 检查时区修复状态...")
        
        with engine.connect() as conn:
            # 获取所有用户记录
            result = conn.execute(text("SELECT id, username, created_at, updated_at FROM users"))
            users = result.fetchall()
            
            print(f"📊 用户时间状态:")
            for user in users:
                user_id, username, created_at, updated_at = user
                print(f"  用户 {username} (ID: {user_id}):")
                print(f"    创建时间: {created_at}")
                print(f"    更新时间: {updated_at}")
                if created_at and created_at.tzinfo:
                    print(f"    时区信息: {created_at.tzinfo}")
                else:
                    print(f"    时区信息: 无")
                print()
            
            return True
            
    except Exception as e:
        print(f"❌ 检查时区状态失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="修复用户注册时间时区问题")
    parser.add_argument("--fix", action="store_true", help="修复时区问题")
    parser.add_argument("--check", action="store_true", help="检查时区状态")
    
    args = parser.parse_args()
    
    if args.check:
        success = check_timezone_status()
    else:
        # 默认执行修复
        success = fix_timezone_issue()
    
    if success:
        print("🎉 操作完成！")
    else:
        print("💥 操作失败！")
        sys.exit(1) 