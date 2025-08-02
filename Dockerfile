# 使用Python 3.11作为基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 安装Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# 复制后端依赖文件
COPY backend/requirements.txt ./backend/requirements.txt

# 安装Python依赖
RUN pip install --no-cache-dir -r backend/requirements.txt

# 复制前端依赖文件
COPY frontend/package*.json ./frontend/

# 安装Node.js依赖
WORKDIR /app/frontend
RUN npm ci --only=production

# 复制前端源代码
COPY frontend/ ./frontend/

# 构建前端
RUN npm run build

# 返回工作目录
WORKDIR /app

# 复制后端源代码
COPY backend/ ./backend/

# 复制启动脚本
COPY start_backend.sh start_frontend.sh ./
RUN chmod +x start_backend.sh start_frontend.sh

# 创建uploads目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 8000 3000

# 创建启动脚本
RUN echo '#!/bin/bash\n\
echo "🚀 Starting ALLIN application..."\n\
\n\
# 启动后端\n\
./start_backend.sh &\n\
\n\
# 等待后端启动\n\
sleep 5\n\
\n\
# 启动前端\n\
./start_frontend.sh &\n\
\n\
# 等待所有服务启动\n\
sleep 10\n\
\n\
echo "✅ ALLIN is running!"\n\
echo "📋 Service Information:"\n\
echo "   - Frontend: http://localhost:3000"\n\
echo "   - Backend API: http://localhost:8000"\n\
echo "   - API Docs: http://localhost:8000/docs"\n\
echo ""\n\
echo "Press Ctrl+C to stop all services"\n\
\n\
# 保持容器运行\n\
wait\n\
' > /app/start.sh && chmod +x /app/start.sh

# 设置启动命令
CMD ["/app/start.sh"] 