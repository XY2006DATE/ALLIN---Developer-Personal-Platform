#!/bin/bash

# ALLIN 前端启动脚本
# 功能：启动前端开发服务器并显示实时状态

echo "🎨 启动 ALLIN 前端服务器..."
echo "=================================="

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到 npm，请先安装 npm"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "frontend/package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 进入前端目录
cd frontend

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

# 启动开发服务器
echo ""
echo "🌐 启动前端开发服务器..."
echo "=================================="
echo "📋 服务信息:"
echo "   - 前端地址: http://localhost:3000"
echo "   - 后端地址: http://localhost:8000"
echo "=================================="
echo "📊 实时日志 (按 Ctrl+C 停止):"
echo ""

# 启动Next.js开发服务器
npm run dev 