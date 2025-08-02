from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from backend.models.chat import ChatHistory, ChatMessage, get_current_time
from backend.schemas.chat import ChatHistoryCreate, ChatHistoryUpdate, ChatMessageCreate
from backend.core.context_manager import ContextManager
from typing import List, Optional
import uuid
from datetime import datetime
from backend.models.model import ModelConfig

# 创建上下文管理器实例
context_manager = ContextManager()

def generate_chat_url() -> str:
    """生成唯一的聊天URL"""
    return f"chat_{uuid.uuid4().hex[:12]}"

def create_chat_history(db: Session, chat_data: ChatHistoryCreate, user_id: int) -> ChatHistory:
    """创建聊天历史"""
    current_time = get_current_time()
    
    # 获取模型配置以确定默认的enable_context值
    model_config = db.query(ModelConfig).filter(ModelConfig.id == chat_data.config_id).first()
    default_enable_context = model_config.enable_context if model_config else True
    
    db_chat = ChatHistory(
        user_id=user_id,
        config_id=chat_data.config_id,
        title=chat_data.title,
        url=generate_chat_url(),
        created_at=current_time,
        updated_at=current_time,
        enable_context=chat_data.enable_context if chat_data.enable_context is not None else default_enable_context,
        context_window_size=chat_data.context_window_size or 10,
        enable_context_summary=chat_data.enable_context_summary if chat_data.enable_context_summary is not None else True,
        context_settings=chat_data.context_settings or {}
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

def get_chat_history(db: Session, chat_id: int, user_id: int) -> Optional[ChatHistory]:
    """根据ID获取聊天历史（用户只能访问自己的聊天）"""
    return db.query(ChatHistory).filter(
        and_(ChatHistory.id == chat_id, ChatHistory.user_id == user_id, ChatHistory.is_deleted == False)
    ).first()

def get_chat_history_by_url(db: Session, url: str, user_id: int) -> Optional[ChatHistory]:
    """根据URL获取聊天历史（用户只能访问自己的聊天）"""
    return db.query(ChatHistory).filter(
        and_(ChatHistory.url == url, ChatHistory.user_id == user_id, ChatHistory.is_deleted == False)
    ).first()

def get_user_chat_histories(
    db: Session, 
    user_id: int,
    skip: int = 0, 
    limit: int = 100,
    config_id: Optional[int] = None
) -> List[ChatHistory]:
    """获取用户的聊天历史列表"""
    query = db.query(ChatHistory).filter(
        and_(ChatHistory.user_id == user_id, ChatHistory.is_deleted == False)
    )
    
    if config_id:
        query = query.filter(ChatHistory.config_id == config_id)
    
    return query.order_by(desc(ChatHistory.updated_at)).offset(skip).limit(limit).all()

def update_chat_history(
    db: Session, 
    chat_id: int, 
    chat_update: ChatHistoryUpdate,
    user_id: int
) -> Optional[ChatHistory]:
    """更新聊天历史（用户只能更新自己的聊天）"""
    db_chat = get_chat_history(db, chat_id, user_id)
    if not db_chat:
        return None
    
    update_data = chat_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_chat, field, value)
    
    db.commit()
    db.refresh(db_chat)
    return db_chat

def delete_chat_history(db: Session, chat_id: int, user_id: int) -> bool:
    """软删除聊天历史（用户只能删除自己的聊天）"""
    db_chat = get_chat_history(db, chat_id, user_id)
    if not db_chat:
        return False
    
    db_chat.is_deleted = True
    db.commit()
    return True

def add_chat_message(db: Session, chat_id: int, message_data: ChatMessageCreate, user_id: int) -> Optional[ChatMessage]:
    """添加聊天消息"""
    # 验证聊天历史是否存在且属于当前用户
    chat_history = get_chat_history(db, chat_id, user_id)
    if not chat_history:
        return None
    
    current_time = get_current_time()
    
    # 处理消息的上下文信息
    message_dict = {
        'content': message_data.content,
        'role': message_data.role,
        'created_at': current_time.isoformat()
    }
    
    # 提取关键词和计算相关性
    processed_message = context_manager.process_message_for_context(message_dict)
    
    db_message = ChatMessage(
        chat_history_id=chat_id,
        role=message_data.role,
        content=message_data.content,
        created_at=current_time,
        message_metadata=message_data.message_metadata,
        context_keywords=processed_message.get('context_keywords'),
        context_relevance_score=processed_message.get('context_relevance_score', 0)
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # 更新聊天历史的上下文摘要
    if chat_history.enable_context_summary:
        update_context_summary(db, chat_id, user_id)
    
    return db_message

def get_chat_messages(db: Session, chat_id: int, user_id: int) -> List[ChatMessage]:
    """获取聊天消息列表（用户只能访问自己的聊天消息）"""
    chat_history = get_chat_history(db, chat_id, user_id)
    if not chat_history:
        return []
    
    return db.query(ChatMessage).filter(
        ChatMessage.chat_history_id == chat_id
    ).order_by(ChatMessage.created_at).all()

def get_context_aware_messages(db: Session, chat_id: int, user_id: int) -> List[ChatMessage]:
    """获取上下文感知的消息列表（智能选择相关消息）"""
    chat_history = get_chat_history(db, chat_id, user_id)
    if not chat_history:
        return []
    
    all_messages = get_chat_messages(db, chat_id, user_id)
    
    # 转换为字典格式
    messages_dict = []
    for msg in all_messages:
        msg_dict = {
            'id': msg.id,
            'role': msg.role,
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
            'context_keywords': msg.context_keywords,
            'context_relevance_score': msg.context_relevance_score
        }
        messages_dict.append(msg_dict)
    
    # 使用上下文管理器选择相关消息
    selected_messages = context_manager.select_relevant_messages(
        messages_dict,
        chat_history.context_window_size,
        chat_history.context_settings.get('smart_selection', True)
    )
    
    # 转换回ChatMessage对象
    selected_ids = [msg['id'] for msg in selected_messages]
    return [msg for msg in all_messages if msg.id in selected_ids]

def update_context_summary(db: Session, chat_id: int, user_id: int) -> Optional[str]:
    """更新聊天历史的上下文摘要"""
    chat_history = get_chat_history(db, chat_id, user_id)
    if not chat_history or not chat_history.enable_context_summary:
        return None
    
    messages = get_chat_messages(db, chat_id, user_id)
    
    # 转换为字典格式
    messages_dict = []
    for msg in messages:
        msg_dict = {
            'role': msg.role,
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
            'context_keywords': msg.context_keywords
        }
        messages_dict.append(msg_dict)
    
    # 生成摘要
    chat_dict = {
        'context_window_size': chat_history.context_window_size,
        'context_settings': chat_history.context_settings
    }
    
    summary = context_manager.update_context_summary(chat_dict, messages_dict)
    
    # 更新数据库
    chat_history.context_summary = summary
    db.commit()
    
    return summary

def get_chat_history_count(db: Session, user_id: int, config_id: Optional[int] = None) -> int:
    """获取用户聊天历史总数"""
    query = db.query(ChatHistory).filter(
        and_(ChatHistory.user_id == user_id, ChatHistory.is_deleted == False)
    )
    
    if config_id:
        query = query.filter(ChatHistory.config_id == config_id)
    
    return query.count()

def get_user_latest_chat_history(db: Session, user_id: int, config_id: int) -> Optional[ChatHistory]:
    """获取用户指定模型配置的最近聊天历史"""
    return db.query(ChatHistory).filter(
        and_(
            ChatHistory.user_id == user_id, 
            ChatHistory.config_id == config_id, 
            ChatHistory.is_deleted == False
        )
    ).order_by(desc(ChatHistory.updated_at)).first() 