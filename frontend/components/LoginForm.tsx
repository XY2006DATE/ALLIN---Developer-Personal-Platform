'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface LoginFormProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordError, setPasswordError] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [usernameError, setUsernameError] = useState<string>('')
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const usernameInputRef = useRef<HTMLInputElement>(null)

  // 检测输入是用户名还是邮箱
  const isEmail = (input: string) => {
    return input.includes('@') && input.includes('.')
  }

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 验证密码格式
  const validatePassword = (password: string) => {
    const errors = []
    
    if (password.length < 6) {
      errors.push('密码长度至少6位')
    }
    
    if (password.length > 50) {
      errors.push('密码长度不能超过50位')
    }
    
    // 检查是否包含空格
    if (password.includes(' ')) {
      errors.push('密码不能包含空格')
    }
    
    return errors
  }



  // 验证表单
  const validateForm = () => {
    setPasswordError('')
    setEmailError('')
    setUsernameError('')
    
    if (isLogin) {
      // 登录验证
      if (!formData.username.trim()) {
        setMessage({ type: 'error', text: '请输入用户名或邮箱' })
        return false
      }
      if (!formData.password.trim()) {
        setPasswordError('请输入密码')
        passwordInputRef.current?.focus()
        return false
      }
    } else {
      // 注册验证
      if (!formData.username.trim()) {
        setMessage({ type: 'error', text: '请输入用户名' })
        return false
      }
      if (!formData.email.trim()) {
        setEmailError('请填写邮箱')
        emailInputRef.current?.focus()
        return false
      }
      if (!validateEmail(formData.email.trim())) {
        setEmailError('请填写正确的邮箱格式')
        emailInputRef.current?.focus()
        return false
      }
      if (!formData.password.trim()) {
        setPasswordError('请输入密码')
        passwordInputRef.current?.focus()
        return false
      }
      
      // 密码格式验证
      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        // 只显示第一个错误，其他作为建议
        const firstError = passwordErrors[0]
        const suggestions = passwordErrors.slice(1)
        const errorMessage = suggestions.length > 0 
          ? `${firstError}（${suggestions.join('、')}）`
          : firstError
        setPasswordError(errorMessage)
        passwordInputRef.current?.focus()
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('两次输入的密码不一致')
        confirmPasswordInputRef.current?.focus()
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage(null)
    setPasswordError('')

    try {
      let response
      
      if (isLogin) {
        // 登录 - 智能判断是用户名还是邮箱
        const input = formData.username.trim()
        const loginData = isEmail(input)
          ? { email: input, password: formData.password }
          : { username: input, password: formData.password }
        
        response = await authAPI.login(loginData)
        
        // 使用认证上下文处理登录，使用后端返回的真实用户信息
        login(response.access_token, {
          id: response.user?.id || '1',
          username: response.user?.username || formData.username,
          email: response.user?.email || 'user@allin.com',
          name: response.user?.username || formData.username,
          avatar_url: response.user?.avatar_url
        })
        
        setMessage({ type: 'success', text: '登录成功！正在跳转...' })
        // 延迟调用onSuccess，让用户看到成功消息
        setTimeout(() => {
          onSuccess?.(response)
        }, 1000)
      } else {
        // 注册
        response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
        
        setMessage({ type: 'success', text: '注册成功！已自动填充登录信息，请点击登录按钮。' })
        setIsLogin(true) // 注册成功后切换到登录
        // 注册成功后自动填充用户名和密码
        setFormData({ 
          username: formData.username, 
          email: formData.email, 
          password: formData.password, 
          confirmPassword: '' 
        })
        // 延迟聚焦到密码字段，让用户可以立即点击登录
        setTimeout(() => {
          passwordInputRef.current?.focus()
        }, 100)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || '操作失败，请重试'
      const statusCode = error.response?.status
      
      if (isLogin && statusCode === 404) {
        // 用户不存在，提示注册
        // 保留用户名，清空密码
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
        setPasswordError('用户不存在，请先注册')
        passwordInputRef.current?.focus()
      } else if (isLogin && statusCode === 401) {
        // 密码错误
        // 只清空密码，保留用户名
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
        setPasswordError('密码错误，请重新输入')
        passwordInputRef.current?.focus()
      } else {
        // 其他错误（包括注册错误）
        if (!isLogin) {
          // 注册错误处理
          if (errorMessage.includes('用户名已被注册')) {
            setUsernameError('用户名已被注册')
            usernameInputRef.current?.focus()
          } else if (errorMessage.includes('邮箱已被注册')) {
            setEmailError('邮箱已被注册')
            emailInputRef.current?.focus()
          } else {
            setMessage({ type: 'error', text: errorMessage })
          }
        } else {
          setMessage({ type: 'error', text: errorMessage })
        }
        // 注册失败时不清空表单，让用户可以修改后重试
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除消息和错误
    if (message) setMessage(null)
    if (passwordError) setPasswordError('')
    if (emailError) setEmailError('')
    if (usernameError) setUsernameError('')
  }

  return (
    <div className="w-full max-w-md">
      {/* 消息提示 */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
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
          

        </motion.div>
      )}

      {/* 标题 - 只在登录模式显示 */}
      {isLogin && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            登录
          </h2>
        </div>
      )}

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 用户名/邮箱输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isLogin ? '用户名或邮箱' : '用户名'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              ref={usernameInputRef}
              type="text"
              value={isLogin ? formData.username : formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                usernameError 
                  ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{
                backgroundColor: 'var(--tw-bg-opacity, 1) * rgb(55 65 81)',
                color: 'var(--tw-text-opacity, 1) * rgb(255 255 255)',
                borderColor: 'var(--tw-border-opacity, 1) * rgb(75 85 99)'
              }}
              placeholder={isLogin ? '请输入用户名或邮箱' : '请输入用户名'}
              required
            />
          </div>
          {/* 用户名错误提示 */}
          {usernameError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{usernameError}</span>
            </motion.div>
          )}
        </motion.div>

        {/* 邮箱输入（注册时） */}
        {!isLogin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                ref={emailInputRef}
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  emailError 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="请输入邮箱"
                required
              />
            </div>
            {/* 邮箱错误提示 */}
            {emailError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{emailError}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 密码输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                passwordError 
                  ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="请输入密码"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
              )}
            </button>
          </div>
        </motion.div>

        {/* 确认密码输入（注册时） */}
        {!isLogin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                ref={confirmPasswordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                  passwordError 
                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="请再次输入密码"
                required
              />
            </div>
          </motion.div>
        )}

        {/* 密码错误提示 */}
        {passwordError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </motion.div>
        )}

        {/* 提交按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isLogin ? 0.4 : 0.5 }}
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
            />
          ) : (
            isLogin ? '登录' : '注册'
          )}
        </motion.button>
      </form>

      {/* 底部链接 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        {isLogin ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {passwordError && passwordError.includes('用户不存在') ? (
              <button
                onClick={() => {
                  setIsLogin(false)
                  setMessage(null)
                  setPasswordError('')
                }}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                立即注册
              </button>
            ) : (
              <>
                还没有账号？
                <button
                  onClick={() => {
                    setIsLogin(false)
                    setMessage(null)
                    setPasswordError('')
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  立即注册
                </button>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            已有账号？
            <button
              onClick={() => {
                setIsLogin(true)
                setMessage(null)
                setPasswordError('')
              }}
              className="ml-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              返回登录
            </button>
          </p>
        )}
      </motion.div>
    </div>
  )
} 