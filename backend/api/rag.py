from fastapi import APIRouter, Depends
from backend.utils.auth import get_current_active_user

router = APIRouter()

@router.post("/rag/index")
async def index_documents():
    """文档索引"""
    return {"message": "Documents indexed"}

@router.post("/rag/query")
async def query_rag():
    """问答（检索 + 生成）"""
    return {"answer": "RAG answer"}

@router.get("/rag/status")
async def get_rag_status():
    """索引状态"""
    return {"status": "ready"}

@router.post("/rag/config")
async def configure_rag():
    """配置 embedding 模型、chunk size、向量库路径等"""
    return {"message": "RAG configured"} 