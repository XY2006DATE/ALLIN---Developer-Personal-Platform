from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "message": "ALLIN Backend is running"}

@router.post("/debug/echo")
async def debug_echo(message: str = "Hello World"):
    """测试通信"""
    return {"echo": message, "timestamp": "2024-01-01T00:00:00Z"} 