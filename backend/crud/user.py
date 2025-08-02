from sqlalchemy.orm import Session
from backend.models.user import User, get_current_time
from backend.schemas.user import UserCreate
from backend.utils.auth import get_password_hash

def get_user(db: Session, user_id: int):
    """根据ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """获取用户列表"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """创建新用户"""
    hashed_password = get_password_hash(user.password)
    current_time = get_current_time()
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        created_at=current_time,
        updated_at=current_time
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update):
    """更新用户信息"""
    db_user = get_user(db, user_id)
    if db_user:
        for field, value in user_update.dict(exclude_unset=True).items():
            if field == "password":
                value = get_password_hash(value)
            setattr(db_user, field, value)
        
        # 更新更新时间
        db_user.updated_at = get_current_time()
        
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """删除用户"""
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

 