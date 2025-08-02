from fastapi import APIRouter, Depends
from backend.utils.auth import get_current_active_user

router = APIRouter()

@router.get("/mcp/tools")
async def list_mcp_tools():
    """查询所有可用 MCP 工具"""
    return {"tools": []}

@router.post("/mcp/invoke")
async def invoke_mcp_tool():
    """调用某个 MCP 工具（传入 prompt）"""
    return {"result": "MCP tool result"}

@router.get("/mcp/logs")
async def get_mcp_logs():
    """查看调用日志"""
    return {"logs": []} 