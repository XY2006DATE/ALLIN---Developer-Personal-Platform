from fastapi import APIRouter, Depends
from backend.utils.auth import get_current_active_user

router = APIRouter()

@router.post("/agent/start")
async def start_agent():
    """启动某个 Agent"""
    return {"message": "Agent started"}

@router.post("/agent/stop")
async def stop_agent():
    """停止某个 Agent"""
    return {"message": "Agent stopped"}

@router.get("/agent/list")
async def list_agents():
    """查询所有 Agent 状态"""
    return {"agents": []}

@router.post("/agent/bind")
async def bind_agent():
    """绑定模型或 MCP 工具到 Agent"""
    return {"message": "Agent bound"} 