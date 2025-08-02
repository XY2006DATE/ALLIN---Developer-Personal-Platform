'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = (data: any) => {
    // 登录成功后跳转到聊天页面
    router.push('/chat')
  }

  const handleLoginError = (error: string) => {
    // 这里可以添加错误处理逻辑
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* 背景动效 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100/30 dark:bg-purple-900/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* 主容器 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo区域 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl tech-font-space-grotesk text-gray-900 dark:text-white mb-2">ALLIN</h1>
          <p className="text-gray-600 dark:text-gray-400">开发者个人平台</p>
        </motion.div>

        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-effect rounded-2xl p-8 shadow-2xl"
        >
          {/* 登录表单 */}
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </motion.div>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 ALLIN. 开发者个人使用平台
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 