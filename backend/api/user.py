from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.user import User
from backend.schemas.user import UserUpdate, PasswordChange, ThemePreference, User as UserSchema
from backend.utils.auth import verify_password, get_password_hash, get_current_active_user
from backend.crud.user import get_user_by_username, get_user_by_email, get_user
from typing import Optional
import os
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/user/profile", response_model=UserSchema)
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """获取用户个人资料"""
    return current_user

@router.put("/user/profile", response_model=UserSchema)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新用户个人资料（用户名、邮箱）"""
    try:
        # 检查用户名是否已被其他用户使用
        if user_update.username and user_update.username != current_user.username:
            existing_user = get_user_by_username(db, user_update.username)
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="用户名已被使用"
                )
        
        # 检查邮箱是否已被其他用户使用
        if user_update.email and user_update.email != current_user.email:
            existing_user = get_user_by_email(db, user_update.email)
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱已被使用"
                )
        
        # 验证主题偏好
        if user_update.theme_preference and user_update.theme_preference not in ['light', 'dark', 'system']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Theme preference must be 'light', 'dark', or 'system'"
            )
        
        # 更新用户信息
        if user_update.username is not None:
            current_user.username = user_update.username
        if user_update.email is not None:
            current_user.email = user_update.email
        if user_update.avatar_url is not None:
            current_user.avatar_url = user_update.avatar_url
        if user_update.theme_preference is not None:
            current_user.theme_preference = user_update.theme_preference
        
        current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}"
        )

@router.put("/user/password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """修改用户密码"""
    try:
        # 验证当前密码
        if not verify_password(password_change.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # 检查新密码是否与当前密码相同
        if password_change.current_password == password_change.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password"
            )
        
        # 验证新密码长度
        if len(password_change.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        
        # 更新密码
        current_user.hashed_password = get_password_hash(password_change.new_password)
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password change failed: {str(e)}"
        )

@router.post("/user/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    try:
        # 验证文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # 验证文件大小（限制为5MB）
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 5MB"
            )
        
        # 创建上传目录
        upload_dir = "uploads/avatars"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 更新用户头像URL
        avatar_url = f"/uploads/avatars/{unique_filename}"
        current_user.avatar_url = avatar_url
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Avatar upload failed: {str(e)}"
        )

@router.delete("/user/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除用户头像"""
    try:
        if not current_user.avatar_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No avatar to delete"
            )
        
        # 删除文件
        file_path = current_user.avatar_url.lstrip('/')
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # 清除头像URL
        current_user.avatar_url = None
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {"message": "Avatar deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Avatar deletion failed: {str(e)}"
        )

@router.delete("/user/account")
async def delete_account(
    password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除用户账户"""
    try:
        # 验证密码
        if not verify_password(password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is incorrect"
            )
        
        # 删除头像文件
        if current_user.avatar_url:
            file_path = current_user.avatar_url.lstrip('/')
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # 删除用户
        db.delete(current_user)
        db.commit()
        
        return {"message": "Account deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Account deletion failed: {str(e)}"
        )

@router.put("/user/theme")
async def update_theme_preference(
    theme_data: ThemePreference,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新用户主题偏好"""
    try:
        # 验证主题偏好
        if theme_data.theme_preference not in ['light', 'dark', 'system']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Theme preference must be 'light', 'dark', or 'system'"
            )
        
        # 更新主题偏好
        current_user.theme_preference = theme_data.theme_preference
        current_user.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "message": "Theme preference updated successfully",
            "theme_preference": theme_data.theme_preference
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Theme preference update failed: {str(e)}"
        )

@router.get("/user/theme")
async def get_theme_preference(
    current_user: User = Depends(get_current_active_user)
):
    """获取用户主题偏好"""
    return {
        "theme_preference": current_user.theme_preference or 'system'
    } 