import re
import jieba
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter
import json

class ContextManager:
    """上下文管理器"""
    
    def __init__(self):
        # 停用词列表
        self.stop_words = {
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'
        }
    
    def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """提取文本关键词"""
        # 使用jieba分词
        words = jieba.cut(text)
        
        # 过滤停用词和短词
        keywords = []
        for word in words:
            word = word.strip()
            if (len(word) > 1 and 
                word not in self.stop_words and 
                not re.match(r'^[^\u4e00-\u9fff]+$', word)):  # 排除纯英文/数字
                keywords.append(word)
        
        # 统计词频
        word_count = Counter(keywords)
        
        # 返回频率最高的关键词
        return [word for word, count in word_count.most_common(max_keywords)]
    
    def calculate_relevance_score(self, message_content: str, context_keywords: List[str]) -> int:
        """计算消息与上下文的相关性评分"""
        if not context_keywords:
            return 0
        
        message_keywords = self.extract_keywords(message_content)
        
        # 计算关键词重叠度
        overlap = len(set(message_keywords) & set(context_keywords))
        total_keywords = len(set(message_keywords) | set(context_keywords))
        
        if total_keywords == 0:
            return 0
        
        # 返回0-100的评分
        return int((overlap / total_keywords) * 100)
    
    def select_relevant_messages(self, messages: List[Dict], 
                               window_size: int = 10,
                               smart_selection: bool = True) -> List[Dict]:
        """智能选择相关消息"""
        if len(messages) <= window_size:
            return messages
        
        if not smart_selection:
            # 简单选择最近的N条消息
            return messages[-window_size:]
        
        # 智能选择：结合最近消息和相关消息
        recent_messages = messages[-window_size//2:]  # 最近的一半消息
        
        # 计算所有消息的相关性评分
        all_keywords = []
        for msg in messages:
            if msg.get('context_keywords'):
                all_keywords.extend(msg['context_keywords'])
        
        # 为每条消息计算相关性评分
        scored_messages = []
        for msg in messages[:-window_size//2]:  # 除了最近的消息
            score = self.calculate_relevance_score(msg['content'], all_keywords)
            scored_messages.append((score, msg))
        
        # 选择评分最高的消息
        scored_messages.sort(key=lambda x: x[0], reverse=True)
        relevant_messages = [msg for score, msg in scored_messages[:window_size//2]]
        
        # 合并最近消息和相关消息
        selected_messages = relevant_messages + recent_messages
        
        # 按时间排序
        selected_messages.sort(key=lambda x: x.get('created_at', ''))
        
        return selected_messages
    
    def generate_context_summary(self, messages: List[Dict], max_length: int = 200) -> str:
        """生成上下文摘要"""
        if not messages:
            return ""
        
        # 提取所有关键词
        all_keywords = []
        for msg in messages:
            if msg.get('context_keywords'):
                all_keywords.extend(msg['context_keywords'])
        
        # 统计关键词频率
        keyword_count = Counter(all_keywords)
        
        # 选择最重要的关键词
        top_keywords = [word for word, count in keyword_count.most_common(5)]
        
        # 生成摘要
        summary_parts = []
        
        # 添加主要话题
        if top_keywords:
            summary_parts.append(f"主要话题：{', '.join(top_keywords)}")
        
        # 添加消息统计
        user_messages = [msg for msg in messages if msg.get('role') == 'user']
        assistant_messages = [msg for msg in messages if msg.get('role') == 'assistant']
        
        summary_parts.append(f"用户消息：{len(user_messages)}条")
        summary_parts.append(f"助手回复：{len(assistant_messages)}条")
        
        # 添加时间范围
        if messages:
            first_time = messages[0].get('created_at', '')
            last_time = messages[-1].get('created_at', '')
            if first_time and last_time:
                summary_parts.append(f"时间范围：{first_time[:10]} 至 {last_time[:10]}")
        
        summary = " | ".join(summary_parts)
        
        # 限制长度
        if len(summary) > max_length:
            summary = summary[:max_length-3] + "..."
        
        return summary
    
    def process_message_for_context(self, message: Dict) -> Dict:
        """处理消息以提取上下文信息"""
        content = message.get('content', '')
        
        # 提取关键词
        keywords = self.extract_keywords(content)
        
        # 更新消息
        message['context_keywords'] = keywords
        message['context_relevance_score'] = 0  # 初始评分，后续会更新
        
        return message
    
    def update_context_summary(self, chat_history: Dict, messages: List[Dict]) -> str:
        """更新聊天历史的上下文摘要"""
        if not messages:
            return ""
        
        # 选择相关消息
        window_size = chat_history.get('context_window_size', 10)
        smart_selection = chat_history.get('context_settings', {}).get('smart_selection', True)
        
        relevant_messages = self.select_relevant_messages(
            messages, window_size, smart_selection
        )
        
        # 生成摘要
        max_length = chat_history.get('context_settings', {}).get('max_summary_length', 200)
        summary = self.generate_context_summary(relevant_messages, max_length)
        
        return summary 