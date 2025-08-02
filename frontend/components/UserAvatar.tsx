'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, ChevronDown, AlertTriangle } from 'lucide-react'

interface UserAvatarProps {
  user?: {
    name: string
    email: string
    avatar?: string
    avatar_url?: string
  }
  onLogout: () => void
  onSettings: () => void
}

export default function UserAvatar({ user, onLogout, onSettings }: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowLogoutConfirm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 获取用户名的第一个字
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  // 获取邮箱的前5位
  const getEmailPrefix = (email: string) => {
    return email.substring(0, 5)
  }

  // 获取头像URL
  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return `http://localhost:8000${avatarUrl}`
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
    setIsOpen(false)
  }

  const handleConfirmLogout = () => {
    onLogout()
    setShowLogoutConfirm(false)
  }

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  // 获取头像URL，优先使用avatar_url，然后是avatar
  const avatarUrl = getAvatarUrl(user?.avatar_url || user?.avatar)
  
  // 当头像URL改变时，重置错误状态
  useEffect(() => {
    setAvatarError(false)
  }, [avatarUrl])

  // 处理头像加载错误
  const handleAvatarError = () => {
    setAvatarError(true)
  }

  // 判断是否应该显示头像
  const shouldShowAvatar = avatarUrl && !avatarError

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
            {shouldShowAvatar ? (
              <img 
                src={avatarUrl} 
                alt={user?.name || '用户头像'} 
                className="w-8 h-8 rounded-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <span className="text-white font-medium text-sm">
                {getInitials(user?.name || user?.email || 'U')}
              </span>
            )}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || '用户'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{getEmailPrefix(user?.email || 'user@example.com')}</div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <button
                onClick={() => {
                  onSettings()
                  setIsOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </button>
              
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 退出登录确认对话框 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xs w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">您确定要退出登录吗？</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 