from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class ModelConfigBase(BaseModel):
    name: str = Field(..., description="模型名称")
    base_url: str = Field(..., description="API基础URL")
    api_key: str = Field(..., description="API密钥")
    model_name: str = Field(..., description="具体的模型名称")
    description: Optional[str] = Field(None, description="模型描述")
    is_active: bool = Field(True, description="是否激活")
    
    # 模型设置
    enable_streaming: bool = Field(True, description="是否启用流式传输")
    enable_context: bool = Field(True, description="是否启用上下文功能")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="温度参数 (0.0-2.0)")
    top_p: float = Field(1.0, ge=0.0, le=1.0, description="Top-p采样参数 (0.0-1.0)")
    frequency_penalty: float = Field(0.0, ge=-2.0, le=2.0, description="频率惩罚 (-2.0-2.0)")
    presence_penalty: float = Field(0.0, ge=-2.0, le=2.0, description="存在惩罚 (-2.0-2.0)")
    
    class Config:
        protected_namespaces = ()

class ModelConfigCreate(ModelConfigBase):
    pass

class ModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    enable_streaming: Optional[bool] = None
    enable_context: Optional[bool] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(None, ge=0.0, le=1.0)
    frequency_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0)
    presence_penalty: Optional[float] = Field(None, ge=-2.0, le=2.0)
    
    class Config:
        protected_namespaces = ()

class ModelConfigResponse(ModelConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ModelListResponse(BaseModel):
    models: List[ModelConfigResponse]
    total: int
    active_count: int

class ModelTestRequest(BaseModel):
    config_id: int = Field(..., description="要测试的模型配置ID")
    test_message: str = Field(..., description="测试消息")

class ModelTestResponse(BaseModel):
    success: bool
    message: str
    response: Optional[str] = None
    error: Optional[str] = None

class ModelConnectionTestRequest(BaseModel):
    """模型连接测试请求"""
    base_url: str = Field(..., description="API基础URL")
    api_key: str = Field(..., description="API密钥")
    model_name: str = Field(..., description="模型名称")
    test_message: str = Field("你好，请回复一个简单的问候。", description="测试消息")
    
    class Config:
        protected_namespaces = ()

class ModelConnectionTestResponse(BaseModel):
    """模型连接测试响应"""
    success: bool
    message: str
    response: Optional[str] = None
    error: Optional[str] = None
    connection_time: Optional[float] = None  # 连接耗时（秒） 