#!/bin/bash

echo "🚀 开始设置 ALLIN 前端项目..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建环境变量文件
echo "🔧 创建环境变量文件..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
EOF

echo "✅ 环境变量文件创建成功"

echo ""
echo "🎉 前端项目设置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 确保后端服务器正在运行 (python main.py)"
echo "2. 启动前端开发服务器："
echo "   npm run dev"
echo "3. 打开浏览器访问：http://localhost:3000"
echo ""
echo "💡 提示："
echo "- 前端将在 http://localhost:3000 运行"
echo "- 后端API地址：http://localhost:8000"
echo "- 如果端口被占用，请修改相应的配置文件" 