'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Sun, Moon, Monitor, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'

interface ThemeSettingsProps {
  isOpen: boolean
  onClose: () => void
  onBackToSettings?: () => void
}

export default function ThemeSettings({ isOpen, onClose, onBackToSettings }: ThemeSettingsProps) {
  const { theme, setTheme, loading } = useTheme()
  const { isAuthenticated } = useAuth()
  const [themePreference, setThemePreference] = React.useState<'light' | 'dark' | 'system'>('system')
  const [isInitialized, setIsInitialized] = React.useState(false)

  // 从后端获取当前主题偏好
  React.useEffect(() => {
    const fetchThemePreference = async () => {
      if (!isAuthenticated) {
        // 如果未登录，从localStorage获取
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
        if (savedTheme) {
          setThemePreference(savedTheme)
        } else {
          setThemePreference('system')
        }
        setIsInitialized(true)
        return
      }
      
      try {
        const response = await api.get('/user/theme')
        const userTheme = response.data.theme_preference as 'light' | 'dark' | 'system'
        if (userTheme && ['light', 'dark', 'system'].includes(userTheme)) {
          setThemePreference(userTheme)
        } else {
          // 如果没有有效的主题偏好，检查localStorage
          const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
          if (savedTheme) {
            setThemePreference(savedTheme)
          } else {
            setThemePreference('system')
          }
        }
      } catch (error) {
        console.error('获取主题偏好失败:', error)
        // 如果获取失败，检查localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
        if (savedTheme) {
          setThemePreference(savedTheme)
        } else {
          setThemePreference('system')
        }
      } finally {
        setIsInitialized(true)
      }
    }

    if (isOpen) {
      fetchThemePreference()
    }
  }, [isAuthenticated, isOpen])

  if (!isOpen) return null

  const themeOptions = [
    {
      id: 'light',
      name: '浅色主题',
      description: '明亮清晰的界面',
      icon: Sun,
      value: 'light' as const
    },
    {
      id: 'dark',
      name: '深色主题',
      description: '护眼舒适的界面',
      icon: Moon,
      value: 'dark' as const
    },
    {
      id: 'system',
      name: '跟随时间',
      description: '根据时间自动切换：白天浅色，夜晚深色',
      icon: Monitor,
      value: 'system' as const
    }
  ]

  const handleThemeChange = async (selectedTheme: 'light' | 'dark' | 'system') => {
    if (loading) return

    // 立即更新本地状态，避免闪动
    setThemePreference(selectedTheme)

    try {
      if (isAuthenticated) {
        // 如果已登录，保存到后端
        await api.put('/user/theme', { theme_preference: selectedTheme })
      }
      
      if (selectedTheme === 'system') {
        localStorage.removeItem('theme')
        setTheme('system')
      } else {
        localStorage.setItem('theme', selectedTheme)
        setTheme(selectedTheme)
      }
    } catch (error) {
      console.error('主题设置失败:', error)
      // 如果后端保存失败，至少在前端设置
      if (selectedTheme === 'system') {
        localStorage.removeItem('theme')
        setTheme('system')
      } else {
        localStorage.setItem('theme', selectedTheme)
        setTheme(selectedTheme)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {onBackToSettings && (
              <button
                onClick={onBackToSettings}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">返回</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">主题设置</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {(!isInitialized || loading) && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">加载主题设置...</p>
            </div>
          )}
          
          {isInitialized && !loading && (
            <div className="space-y-3">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = option.value === themePreference
              
              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleThemeChange(option.value)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-base ${
                        isSelected
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {option.name}
                      </div>
                      <div className={`text-sm mt-1 ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 