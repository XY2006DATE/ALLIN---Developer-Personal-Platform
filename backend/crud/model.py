from sqlalchemy.orm import Session
from sqlalchemy import and_
from backend.models.model import ModelConfig
from backend.schemas.model import ModelConfigCreate, ModelConfigUpdate
from typing import List, Optional

def create_model_config(db: Session, model_config: ModelConfigCreate, user_id: int) -> ModelConfig:
    """创建模型配置"""
    db_model = ModelConfig(**model_config.model_dump(), user_id=user_id)
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_model_config(db: Session, model_config_id: int, user_id: int) -> Optional[ModelConfig]:
    """根据ID获取模型配置（用户只能访问自己的模型）"""
    return db.query(ModelConfig).filter(
        and_(ModelConfig.id == model_config_id, ModelConfig.user_id == user_id)
    ).first()

def get_model_config_by_name(db: Session, name: str, user_id: int) -> Optional[ModelConfig]:
    """根据名称获取模型配置（用户只能访问自己的模型）"""
    return db.query(ModelConfig).filter(
        and_(ModelConfig.name == name, ModelConfig.user_id == user_id)
    ).first()

def get_model_configs(
    db: Session, 
    user_id: int,
    skip: int = 0, 
    limit: int = 100,
    active_only: bool = False
) -> List[ModelConfig]:
    """获取模型配置列表（用户只能看到自己的模型）"""
    query = db.query(ModelConfig).filter(ModelConfig.user_id == user_id)
    
    if active_only:
        query = query.filter(ModelConfig.is_active == True)
    
    return query.offset(skip).limit(limit).all()

def update_model_config(
    db: Session, 
    model_config_id: int, 
    model_config_update: ModelConfigUpdate,
    user_id: int
) -> Optional[ModelConfig]:
    """更新模型配置（用户只能更新自己的模型）"""
    db_model = get_model_config(db, model_config_id, user_id)
    if not db_model:
        return None
    
    update_data = model_config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_model, field, value)
    
    db.commit()
    db.refresh(db_model)
    return db_model

def delete_model_config(db: Session, model_config_id: int, user_id: int) -> bool:
    """删除模型配置（用户只能删除自己的模型）"""
    db_model = get_model_config(db, model_config_id, user_id)
    if not db_model:
        return False
    
    db.delete(db_model)
    db.commit()
    return True 