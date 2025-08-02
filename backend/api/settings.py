from fastapi import APIRouter, Depends
from backend.utils.auth import get_current_active_user

router = APIRouter()

@router.get("/settings/ui")
async def get_ui_settings():
    """获取UI界面布局配置"""
    return {"ui_settings": {}}

@router.post("/settings/ui")
async def save_ui_settings():
    """保存UI界面布局配置"""
    return {"message": "UI settings saved"}

@router.get("/settings/system")
async def get_system_settings():
    """获取系统层面设置"""
    return {"system_settings": {}}

@router.post("/settings/system")
async def save_system_settings():
    """保存系统层面设置"""
    return {"message": "System settings saved"} 