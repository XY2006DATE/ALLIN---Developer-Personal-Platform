'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function TestThemePage() {
  const { theme, toggleTheme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">主题测试页面</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">当前主题状态</h2>
            <p className="text-lg">当前主题: <span className="font-bold text-blue-600 dark:text-blue-400">{theme}</span></p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              localStorage 中的主题: {typeof window !== 'undefined' ? localStorage.getItem('theme') || '未设置' : '服务器端'}
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">主题控制</h2>
            <div className="space-x-4">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                切换主题
              </button>
              <button
                onClick={() => setTheme('light')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                设置为浅色
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
              >
                设置为深色
              </button>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">测试说明</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>点击按钮切换主题</li>
              <li>刷新页面，检查主题是否保持</li>
              <li>关闭浏览器重新打开，检查主题是否保持</li>
              <li>检查 localStorage 中的主题值是否正确</li>
            </ol>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">样式测试</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold mb-2">卡片 1</h3>
                <p className="text-gray-600 dark:text-gray-300">这是一个测试卡片，用于验证深色模式样式。</p>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold mb-2">卡片 2</h3>
                <p className="text-gray-600 dark:text-gray-300">另一个测试卡片，确保所有元素都正确响应主题变化。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 