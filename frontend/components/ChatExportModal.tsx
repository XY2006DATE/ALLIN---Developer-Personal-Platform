'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Code, File } from 'lucide-react'
import { chatAPI } from '@/lib/api'

interface ChatExportModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: number
  chatTitle: string
}

export default function ChatExportModal({ isOpen, onClose, chatId, chatTitle }: ChatExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'txt'>('markdown')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const response = await chatAPI.exportChat(chatId, {
        format: exportFormat,
        include_metadata: includeMetadata
      })

      if (response.success && response.data) {
        // 创建下载链接
        const blob = new Blob([response.data], { 
          type: exportFormat === 'json' ? 'application/json' : 'text/plain' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.filename || `${chatTitle}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        onClose()
      } else {
        setExportError(response.error || '导出失败')
      }
    } catch (error: any) {
      console.error('导出失败:', error)
      setExportError(error.response?.data?.detail || '导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    {
      value: 'markdown' as const,
      label: 'Markdown',
      description: '适合阅读和分享的格式',
      icon: FileText
    },
    {
      value: 'json' as const,
      label: 'JSON',
      description: '包含完整数据的结构化格式',
      icon: Code
    },
    {
      value: 'txt' as const,
      label: '纯文本',
      description: '简单的文本格式',
      icon: File
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">导出聊天记录</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-6">
              {/* 聊天标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  聊天标题
                </label>
                <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  {chatTitle}
                </div>
              </div>

              {/* 导出格式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  导出格式
                </label>
                <div className="space-y-2">
                  {formatOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          exportFormat === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={option.value}
                          checked={exportFormat === option.value}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* 包含元数据选项 */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">包含元数据（时间戳、模型信息等）</span>
                </label>
              </div>

              {/* 错误信息 */}
              {exportError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{exportError}</p>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end p-6">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>导出</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 