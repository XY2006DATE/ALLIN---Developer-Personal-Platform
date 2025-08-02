"""添加模型参数字段

Revision ID: add_model_parameters
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
import sqlite3
import os

def upgrade():
    """添加新的参数字段到model_configs表"""
    # 数据库文件路径
    import os
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "allin.db")
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件 {db_path} 不存在")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 检查字段是否已存在
        cursor.execute("PRAGMA table_info(model_configs)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        
        # 添加top_p字段
        if 'top_p' not in existing_columns:
            cursor.execute("ALTER TABLE model_configs ADD COLUMN top_p REAL DEFAULT 1.0")
            print("✅ 添加了 top_p 字段")
        
        # 添加frequency_penalty字段
        if 'frequency_penalty' not in existing_columns:
            cursor.execute("ALTER TABLE model_configs ADD COLUMN frequency_penalty REAL DEFAULT 0.0")
            print("✅ 添加了 frequency_penalty 字段")
        
        # 添加presence_penalty字段
        if 'presence_penalty' not in existing_columns:
            cursor.execute("ALTER TABLE model_configs ADD COLUMN presence_penalty REAL DEFAULT 0.0")
            print("✅ 添加了 presence_penalty 字段")
        
        conn.commit()
        print("🎉 所有参数字段添加完成！")
        
    except Exception as e:
        print(f"❌ 添加字段时出错: {e}")
        conn.rollback()
    finally:
        conn.close()

def downgrade():
    """移除新添加的参数字段"""
    import os
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "allin.db")
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件 {db_path} 不存在")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 移除presence_penalty字段
        cursor.execute("ALTER TABLE model_configs DROP COLUMN presence_penalty")
        
        # 移除frequency_penalty字段
        cursor.execute("ALTER TABLE model_configs DROP COLUMN frequency_penalty")
        
        # 移除top_p字段
        cursor.execute("ALTER TABLE model_configs DROP COLUMN top_p")
        
        conn.commit()
        print("🗑️ 所有参数字段已移除")
        
    except Exception as e:
        print(f"❌ 移除字段时出错: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 开始添加模型参数字段...")
    upgrade()
    print("✅ 迁移完成！") 