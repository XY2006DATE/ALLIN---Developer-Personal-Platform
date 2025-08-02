from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Dict, Any
from datetime import datetime

# 用户相关模型
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = None  # 主题偏好：light, dark, system

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ThemePreference(BaseModel):
    theme_preference: str

class User(UserBase):
    id: int
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = None
    last_login: Optional[datetime] = None
    last_logout: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 认证相关模型
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    
    @validator('username', 'email', pre=True)
    def validate_login_field(cls, v, values):
        if 'username' in values and values['username'] and v:
            raise ValueError("Provide either username or email, not both")
        return v
    
    @validator('password')
    def validate_required_fields(cls, v, values):
        if not values.get('username') and not values.get('email'):
            raise ValueError("Either username or email must be provided")
        return v

# 用户状态模型
class UserStatus(BaseModel):
    is_logged_in: bool
    user: Optional[User] = None
    agent_bindings: Optional[Dict[str, Any]] = None 