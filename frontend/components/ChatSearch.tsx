'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MessageSquare } from 'lucide-react'

interface ChatHistory {
  id: number
  title: string
  url: string
  config_id: number
  name?: string
  created_at: string
  updated_at: string
  user_id: number
}

interface ChatSearchProps {
  chatHistories: ChatHistory[]
  onSelectChat: (chatId: number) => void
  isOpen: boolean
  onClose: () => void
}

export default function ChatSearch({ chatHistories, onSelectChat, isOpen, onClose }: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState<ChatHistory[]>([])

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && filteredChats.length > 0) {
        e.preventDefault()
        handleSelectChat(filteredChats[0].id)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredChats, onClose])

  // 过滤聊天历史
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chatHistories)
    } else {
      const filtered = chatHistories.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredChats(filtered)
    }
  }, [searchQuery, chatHistories])

  const handleSelectChat = (chatId: number) => {
    onSelectChat(chatId)
    onClose()
    setSearchQuery('')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    // 加8小时转换为上海时区
    const shanghaiDate = new Date(date.getTime() + 8 * 60 * 60 * 1000)
    const now = new Date()
    const diffInMs = now.getTime() - shanghaiDate.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
    
    if (diffInHours < 1) {
      return '刚刚'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}天前`
    } else {
      return shanghaiDate.toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai'
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* 搜索模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col"
          >
            {/* 搜索输入框 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索聊天记录..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 搜索结果 */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {searchQuery ? '未找到匹配的聊天记录' : '暂无聊天记录'}
                  </p>
                  <p className="text-sm">
                    {searchQuery ? '尝试使用不同的关键词搜索' : '开始新的对话来创建聊天记录'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {filteredChats.map((chat) => (
                    <motion.button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className="w-full text-left p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {chat.title}
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatTime(chat.updated_at)}</span>
                            {chat.name && (
                              <>
                                <span>•</span>
                                <span>{chat.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* 底部信息 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>
                  找到 {filteredChats.length} 个聊天记录
                  {searchQuery && ` (共 ${chatHistories.length} 个)`}
                </span>
                <div className="flex items-center space-x-4">
                  <span>按 Enter 选择第一个</span>
                  <span>按 Esc 关闭</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 