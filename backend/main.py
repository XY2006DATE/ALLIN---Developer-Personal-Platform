#!/usr/bin/env python3
"""
ALLIN 后端主程序
"""

import sys
import os
import time

# 设置时区为 Asia/Shanghai
os.environ['TZ'] = 'Asia/Shanghai'
time.tzset()

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.api import auth, agent, model, mcp, rag, settings, debug, remote, user, history

app = FastAPI(
    title="ALLIN Backend API",
    description="ALLIN系统后端API",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该指定具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 注册路由
app.include_router(auth.router, prefix="/api", tags=["认证"])
app.include_router(agent.router, prefix="/api", tags=["Agent"])
app.include_router(model.router, prefix="/api/models", tags=["模型"])
app.include_router(mcp.router, prefix="/api", tags=["MCP"])
app.include_router(rag.router, prefix="/api", tags=["RAG"])
app.include_router(settings.router, prefix="/api", tags=["设置"])
app.include_router(debug.router, prefix="/api", tags=["调试"])
app.include_router(remote.router, prefix="/api/remote", tags=["远程聊天"])
app.include_router(history.router, prefix="/api/history", tags=["聊天历史"])
app.include_router(user.router, prefix="/api", tags=["用户"])

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动 ALLIN 后端服务器...")
    print("📋 服务信息:")
    print("   - 地址: http://localhost:8000")
    print("   - API文档: http://localhost:8000/docs")
    print("   - 前端地址: http://localhost:3000")
    print("")
    uvicorn.run(app, host="0.0.0.0", port=8000) 