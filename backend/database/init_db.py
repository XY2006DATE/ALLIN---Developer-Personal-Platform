#!/usr/bin/env python3
"""
数据库初始化脚本包装器
"""

import sys
import os
import subprocess

def main():
    """调用上级目录的init_db.py"""
    script_path = os.path.join(os.path.dirname(__file__), '..', 'init_db.py')
    
    # 构建命令行参数
    args = sys.argv[1:] if len(sys.argv) > 1 else []
    
    # 调用主脚本
    result = subprocess.run([sys.executable, script_path] + args)
    return result.returncode

if __name__ == "__main__":
    sys.exit(main()) 