'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '@/lib/api'

type Theme = 'light' | 'dark'
type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme | 'system') => void
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [themePreference, setThemePreference] = useState<ThemePreference>('light')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()

  // 根据时间判断应该使用浅色还是深色主题
  const getTimeBasedTheme = useCallback((): Theme => {
    const now = new Date()
    const hour = now.getHours()
    
    // 早上6点到下午6点（18点）为浅色主题
    // 晚上6点（18点）到早上6点为深色主题
    if (hour >= 6 && hour < 18) {
      return 'light'
    } else {
      return 'dark'
    }
  }, [])

  // 从后端获取用户主题偏好
  const fetchUserTheme = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const response = await api.get('/user/theme')
      const userTheme = response.data.theme_preference as ThemePreference
      if (userTheme && ['light', 'dark', 'system'].includes(userTheme)) {
        setThemePreference(userTheme)
        if (userTheme === 'system') {
          // 使用基于时间的主题判断
          const timeBasedTheme = getTimeBasedTheme()
          setThemeState(timeBasedTheme)
        } else {
          setThemeState(userTheme as Theme)
        }
      } else {
        // 如果没有有效的主题偏好，默认使用system
        const timeBasedTheme = getTimeBasedTheme()
        setThemeState(timeBasedTheme)
        setThemePreference('system')
      }
    } catch (error) {
      console.error('获取用户主题偏好失败:', error)
      // 如果获取失败，回退到localStorage
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
        setThemePreference(savedTheme)
      } else {
        const timeBasedTheme = getTimeBasedTheme()
        setThemeState(timeBasedTheme)
        setThemePreference('system')
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getTimeBasedTheme])

  // 保存主题偏好到后端
  const saveUserTheme = useCallback(async (newThemePreference: ThemePreference) => {
    if (!isAuthenticated) {
      // 如果未登录，只保存到localStorage
      if (newThemePreference !== 'system') {
        localStorage.setItem('theme', newThemePreference)
      } else {
        localStorage.removeItem('theme')
      }
      return
    }

    try {
      await api.put('/user/theme', { theme_preference: newThemePreference })
      if (newThemePreference !== 'system') {
        localStorage.setItem('theme', newThemePreference)
      } else {
        localStorage.removeItem('theme')
      }
    } catch (error) {
      console.error('保存主题偏好失败:', error)
      // 如果保存失败，至少保存到localStorage
      if (newThemePreference !== 'system') {
        localStorage.setItem('theme', newThemePreference)
      } else {
        localStorage.removeItem('theme')
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    setMounted(true)
    
    if (isAuthenticated) {
      fetchUserTheme()
    } else {
      // 如果未登录，从localStorage获取
      const savedTheme = localStorage.getItem('theme') as Theme
      if (savedTheme) {
        setThemeState(savedTheme)
        setThemePreference(savedTheme)
      } else {
        const timeBasedTheme = getTimeBasedTheme()
        setThemeState(timeBasedTheme)
        setThemePreference('system')
      }
      setLoading(false)
    }
  }, [isAuthenticated, fetchUserTheme, getTimeBasedTheme])

  useEffect(() => {
    // 当主题改变时，更新document的class
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }, [theme, mounted])

  // 监听时间变化，每分钟检查一次
  useEffect(() => {
    if (themePreference === 'system') {
      const checkTimeBasedTheme = () => {
        const timeBasedTheme = getTimeBasedTheme()
        setThemeState(timeBasedTheme)
      }
      
      // 立即检查一次
      checkTimeBasedTheme()
      
      // 每分钟检查一次
      const interval = setInterval(checkTimeBasedTheme, 60000)
      
      return () => clearInterval(interval)
    }
  }, [themePreference, getTimeBasedTheme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setTheme = useCallback((newTheme: Theme | 'system') => {
    if (newTheme === 'system') {
      const timeBasedTheme = getTimeBasedTheme()
      setThemeState(timeBasedTheme)
      setThemePreference('system')
      if (isAuthenticated) {
        saveUserTheme('system')
      }
    } else {
      setThemeState(newTheme)
      setThemePreference(newTheme)
      if (isAuthenticated) {
        saveUserTheme(newTheme)
      }
    }
  }, [getTimeBasedTheme, isAuthenticated, saveUserTheme])

  // 防止水合不匹配，在客户端渲染前隐藏内容
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 