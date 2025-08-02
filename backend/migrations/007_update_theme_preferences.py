#!/usr/bin/env python3
"""
更新现有用户的主题偏好为system
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import create_engine, text
from backend.core.config import settings

def update_theme_preferences():
    """更新现有用户的主题偏好为system"""
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # 更新所有用户的theme_preference为system（如果为NULL或'light'）
            result = conn.execute(text("""
                UPDATE users 
                SET theme_preference = 'system' 
                WHERE theme_preference IS NULL OR theme_preference = 'light'
            """))
            
            conn.commit()
            
            print(f"✅ 已更新 {result.rowcount} 个用户的主题偏好为system")
            
            # 验证更新结果
            result = conn.execute(text("SELECT theme_preference, COUNT(*) FROM users GROUP BY theme_preference"))
            for row in result.fetchall():
                theme_pref, count = row
                print(f"  - {theme_pref or 'NULL'}: {count} 个用户")
                
    except Exception as e:
        print(f"❌ 更新主题偏好失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🔄 更新用户主题偏好...")
    success = update_theme_preferences()
    
    if success:
        print("🎉 主题偏好更新完成！")
    else:
        print("💥 主题偏好更新失败！")
        sys.exit(1) 