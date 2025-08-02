#!/bin/bash

# ALLIN 后端启动脚本
# 功能：启动后端服务器并显示实时API状态

echo "🚀 启动 ALLIN 后端服务器..."
echo "=================================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python3，请先安装 Python3"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "backend/main.py" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ 错误：未找到 requirements.txt 文件"
    exit 1
fi

# 安装依赖（如果需要）
echo "📦 安装/更新依赖..."
pip3 install -r backend/requirements.txt

# 检查数据库
echo "🗄️  检查数据库..."
if [ ! -f "allin.db" ]; then
    echo "⚠️  数据库文件不存在，将自动创建..."
fi

# 启动服务器
echo ""
echo "🌐 启动服务器..."
echo "=================================="
echo "📋 服务信息:"
echo "   - 后端地址: http://localhost:8000"
echo "   - API文档: http://localhost:8000/docs"
echo "   - 前端地址: http://localhost:3000"
echo "=================================="
echo "📊 实时日志 (按 Ctrl+C 停止):"
echo ""

# 使用 uvicorn 启动服务器，启用详细日志
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info 