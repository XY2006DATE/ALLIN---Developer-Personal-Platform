from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.user import User, get_current_time
from backend.schemas.user import UserCreate, User as UserSchema, Token, LoginRequest
from backend.utils.auth import verify_password, create_access_token, get_current_active_user
from backend.crud.user import get_user_by_username, get_user_by_email, create_user
from typing import Dict, Any
from datetime import datetime

router = APIRouter()

@router.post("/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    try:
        # 检查用户名是否已存在
        db_user = get_user_by_username(db, user.username)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已被注册"
            )
        
        # 检查邮箱是否已存在
        db_user = get_user_by_email(db, user.email)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
        
        # 创建新用户
        new_user = create_user(db=db, user=user)
        
        # 返回用户信息
        return {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "created_at": new_user.created_at,
            "updated_at": new_user.updated_at
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/auth/login")
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """用户登录 - 支持用户名或邮箱登录"""
    try:
        # 根据提供的字段查找用户
        user = None
        login_field = ""
        
        if login_data.username:
            user = get_user_by_username(db, login_data.username)
            login_field = "username"
        elif login_data.email:
            user = get_user_by_email(db, login_data.email)
            login_field = "email"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either username or email must be provided"
            )
        
        # 验证用户是否存在
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User not found. Please register first.",
            )
        
        # 验证密码
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 更新最后登录时间
        user.last_login = get_current_time()
        db.commit()
        
        # 创建访问令牌
        access_token = create_access_token(data={"sub": user.username})
        
        # 返回token和用户信息
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "last_login": user.last_login
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/auth/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return current_user

@router.post("/auth/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """用户登出"""
    try:
        # 更新最后退出时间
        current_user.last_logout = get_current_time()
        db.commit()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        ) 