'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  User, 
  Trash2,
  Save,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Upload,
  ArrowLeft,
  Camera,
  Image as ImageIcon
} from 'lucide-react'
import { userAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfileSettingsProps {
  isOpen: boolean
  onClose: () => void
  onBackToSettings?: () => void
}

interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at?: string
}

export default function UserProfileSettings({ isOpen, onClose, onBackToSettings }: UserProfileSettingsProps) {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: '',
    email: ''
  })

  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 自动清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 3000) // 3秒后自动清除

      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await userAPI.getProfile()
      setProfile(data)
      setEditData({
        username: data.username,
        email: data.email
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || '获取用户资料失败'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      const updatedProfile = await userAPI.updateProfile(editData)
      setProfile(updatedProfile)
      setIsEditing(false)
      setMessage({
        type: 'success',
        text: '用户资料更新成功'
      })
      
      if (user) {
        login(localStorage.getItem('token') || '', {
          ...user,
          username: updatedProfile.username,
          email: updatedProfile.email
        })
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || '更新用户资料失败'
      
      setMessage({
        type: 'error',
        text: errorMessage
      })
      
      // 出错时自动退出编辑模式
      setIsEditing(false)
      // 恢复原始数据
      if (profile) {
        setEditData({
          username: profile.username,
          email: profile.email
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('开始上传头像:', file.name, file.type, file.size)

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: '请选择图片文件'
      })
      return
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: '图片大小不能超过5MB'
      })
      return
    }

    try {
      setAvatarLoading(true)
      console.log('调用userAPI.uploadAvatar...')
      const result = await userAPI.uploadAvatar(file)
      console.log('头像上传成功:', result)
      setProfile(prev => prev ? { ...prev, avatar_url: result.avatar_url } : null)
      setMessage({
        type: 'success',
        text: '头像上传成功'
      })
      
      if (user) {
        login(localStorage.getItem('token') || '', {
          ...user,
          avatar_url: result.avatar_url
        })
      }
    } catch (error: any) {
      console.error('头像上传失败:', error)
      console.error('错误详情:', error.response?.data)
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || '头像上传失败'
      })
    } finally {
      setAvatarLoading(false)
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarDelete = async () => {
    try {
      setAvatarLoading(true)
      await userAPI.deleteAvatar()
      setProfile(prev => prev ? { ...prev, avatar_url: undefined } : null)
      setMessage({
        type: 'success',
        text: '头像删除成功'
      })
      
      if (user) {
        login(localStorage.getItem('token') || '', {
          ...user,
          avatar_url: undefined
        })
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || '头像删除失败'
      })
    } finally {
      setAvatarLoading(false)
    }
  }

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null
    if (avatarUrl.startsWith('http')) return avatarUrl
    return `http://localhost:8000${avatarUrl}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToSettings || onClose}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">用户资料设置</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-4 mt-4 p-3 rounded-lg flex items-center justify-between ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* 头像设置区域 */}
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">头像设置</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img
                          src={getAvatarUrl(profile.avatar_url)}
                          alt="用户头像"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      {!profile.avatar_url && (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      {avatarLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarLoading}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>上传头像</span>
                      </button>
                      
                      {profile.avatar_url && (
                        <button
                          onClick={handleAvatarDelete}
                          disabled={avatarLoading}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>删除头像</span>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      支持 JPG、PNG、GIF 格式，文件大小不超过 5MB
                    </p>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* 个人信息设置区域 */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">个人信息</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">编辑</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleUpdateProfile}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span className="text-sm">保存</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditData({
                            username: profile.username,
                            email: profile.email
                          })
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      用户名
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                        {profile.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      邮箱
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                        {profile.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      注册时间
                    </label>
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {profile.created_at ? new Date(profile.created_at).toLocaleString('zh-CN') : '未知'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              加载用户资料中...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
