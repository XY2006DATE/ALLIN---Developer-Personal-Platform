'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Plus, 
  Database, 
  MessageSquare, 
  Settings,
  Menu,
  Trash2,
  MoreVertical,
  Edit3,
  Download,
  Search
} from 'lucide-react'

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

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  onNewChat: () => void | Promise<void>
  onSelectChat: (chatId: number) => void
  onDeleteChat: (chatId: number) => void
  onUpdateChatTitle: (chatId: number, title: string) => void
  onExportChat: (chatId: number, title: string) => void
  onSearchChat: () => void
  chatHistories: ChatHistory[]
  currentChatId?: number
  loading?: boolean
}

export default function Sidebar({ 
  isCollapsed, 
  onToggle, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat,
  onUpdateChatTitle,
  onExportChat,
  onSearchChat,
  chatHistories,
  currentChatId,
  loading = false
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<'chat' | 'database'>('chat')
  const [editingChatId, setEditingChatId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showMenuForChatId, setShowMenuForChatId] = useState<number | null>(null)

  const handleEditChat = (chat: ChatHistory) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
    setShowMenuForChatId(null)
  }

  const handleSaveTitle = () => {
    if (editingChatId && editingTitle.trim()) {
      onUpdateChatTitle(editingChatId, editingTitle.trim())
    }
    setEditingChatId(null)
    setEditingTitle('')
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditingTitle('')
  }

  const handleDeleteChat = (chatId: number) => {
    console.log('侧边栏删除按钮被点击:', chatId)
    console.log('当前菜单状态:', showMenuForChatId)
    
    // 阻止事件冒泡
    event?.stopPropagation()
    
    if (confirm('确定要删除这个聊天记录吗？此操作不可撤销。')) {
      console.log('用户确认删除，调用父组件删除函数')
      try {
        onDeleteChat(chatId)
        console.log('删除函数调用成功')
      } catch (error) {
        console.error('删除函数调用失败:', error)
        alert('删除失败，请重试')
      }
    }
    setShowMenuForChatId(null)
  }

  const handleExportChat = (chat: ChatHistory) => {
    onExportChat(chat.id, chat.title)
    setShowMenuForChatId(null)
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
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
    >
      {/* 顶部区域 */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="relative flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center flex-1"
            >
              <h1 className="text-2xl font-black tech-font-space-grotesk text-gray-900 dark:text-white pl-12 pr-[-18px]">ALLIN</h1>
            </motion.div>
          )}
          <button
            onClick={onToggle}
            className={`p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 新对话按钮 */}
      <div className={`py-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <motion.button
          onClick={onNewChat}
          disabled={loading}
          className={`flex items-center justify-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold ${
            isCollapsed ? 'w-12 h-12 mx-auto' : 'w-full'
          }`}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <AnimatePresence mode="sync">
            {!isCollapsed ? (
              <motion.span
                key="text"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                新对话
              </motion.span>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Plus className="w-6 h-6 text-white dark:text-gray-900 stroke-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* 搜索按钮 */}
      {chatHistories.length > 0 && (
        <div className={`${isCollapsed ? 'px-2' : 'px-4'} mb-2`}>
          <motion.button
            onClick={onSearchChat}
            className={`flex items-center space-x-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${
              isCollapsed ? 'w-12 h-9 mx-auto justify-center' : 'w-full px-3 py-2'
            }`}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Search className="w-4 h-4" />
            <AnimatePresence mode="sync">
              {!isCollapsed && (
                <motion.span
                  key="search-text"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-sm"
                >
                  搜索聊天记录
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}

      {/* 导航菜单 */}
      <div className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <motion.button
          onClick={() => setActiveSection('chat')}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            activeSection === 'chat' 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          } ${isCollapsed ? 'w-12 h-10 mx-auto justify-center' : 'w-full'}`}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <MessageSquare className="w-5 h-5" />
          <AnimatePresence mode="sync">
            {!isCollapsed && (
              <motion.span
                key="chat-text"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                聊天
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        <motion.button
          onClick={() => setActiveSection('database')}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            activeSection === 'database' 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          } ${isCollapsed ? 'w-12 h-10 mx-auto justify-center' : 'w-full'}`}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Database className="w-5 h-5" />
          <AnimatePresence mode="sync">
            {!isCollapsed && (
              <motion.span
                key="database-text"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                数据库
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* 聊天历史记录 */}
      {activeSection === 'chat' && (
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : chatHistories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无聊天记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  className={`relative group rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    currentChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={`text-left p-3 w-full ${
                      isCollapsed ? 'w-12 h-16 mx-auto flex flex-col justify-center items-center' : ''
                    }`}
                  >
                    {!isCollapsed ? (
                      <div>
                        {editingChatId === chat.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle()
                              if (e.key === 'Escape') handleCancelEdit()
                            }}
                            onBlur={handleSaveTitle}
                            className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0"
                            autoFocus
                          />
                        ) : (
                          <div className="font-medium text-gray-900 dark:text-white truncate">{chat.title}</div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500">{formatTime(chat.updated_at)}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1">
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight max-w-[40px] truncate">
                          {chat.title}
                        </div>
                      </div>
                    )}
                  </button>

                  {/* 操作菜单 */}
                  {!isCollapsed && (
                    <div className="absolute right-2 top-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenuForChatId(showMenuForChatId === chat.id ? null : chat.id)
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {showMenuForChatId === chat.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[140px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditChat(chat)
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>重命名</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleExportChat(chat)
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Download className="w-4 h-4" />
                            <span>导出</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              console.log('删除按钮被点击，chatId:', chat.id)
                              handleDeleteChat(chat.id)
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>删除</span>
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {showMenuForChatId && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            console.log('点击外部，关闭菜单')
            setShowMenuForChatId(null)
          }}
        />
      )}
    </motion.div>
  )
} 