'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    isLoading?: boolean // 新增加载状态标记
  }
  onCopy?: (content: string) => void
  isSidebarCollapsed?: boolean
}

export default function ChatMessage({ message, onCopy, isSidebarCollapsed }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    onCopy?.(message.content)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} py-4`}
    >
      <div className={`${isSidebarCollapsed ? (isUser ? 'max-w-[600px]' : 'max-w-[1600px]') : 'max-w-[600px]'} ${isUser ? 'order-2' : 'order-1'}`}>
        {/* 消息内容 - 纯文字，无边框 */}
        <div className={`text-base leading-relaxed ${
          isUser ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
        }`}>
          {isUser ? (
            // 用户消息：纯文本显示
            <div className="whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            // AI消息：Markdown渲染或加载动画
            message.isLoading ? (
              // 加载状态：显示三个点动画
              <div className="flex items-center space-x-1">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
                />
              </div>
            ) : (
              // 正常内容：Markdown渲染
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // 自定义Markdown样式
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-900 dark:text-white">{children}</li>,
                  code: ({ children, className }) => (
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto mb-3">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-900 dark:text-white">{children}</em>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-3">
                      <table className="min-w-full border border-gray-300 dark:border-gray-600">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )
          )}
        </div>
        
        {/* 时间戳和复制按钮 */}
        <div className={`flex items-center justify-between mt-3 ${
          isUser ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="text-sm">{message.timestamp}</span>
          {!isUser && !message.isLoading && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="复制消息"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
} 