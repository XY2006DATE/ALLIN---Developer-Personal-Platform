'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Mic, 
  Paperclip, 
  Settings,
  MoveVertical
} from 'lucide-react'

// 扩展 Window 接口以支持 Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface ChatInputProps {
  onSend: (message: string) => void
  onContextToggle: () => void
  onChatSettings: () => void
  contextEnabled: boolean
  isLoading?: boolean
  isSidebarCollapsed?: boolean
  selectedModel?: any
  modelContextEnabled?: boolean
}

export default function ChatInput({ 
  onSend, 
  onContextToggle,
  onChatSettings,
  contextEnabled,
  isLoading = false,
  isSidebarCollapsed = false,
  selectedModel = null,
  modelContextEnabled = true
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // 开始录音
  const startRecording = async () => {
    try {
      // 检查浏览器是否支持语音识别
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别功能')
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      
      // 配置语音识别
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN' // 设置为中文
      
      let finalTranscript = ''
      
      recognition.onstart = () => {
        setIsRecording(true)
        setRecordingTime(0)
        
        // 开始计时
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      }
      
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // 实时更新文本框内容
        setMessage(finalTranscript + interimTranscript)
      }
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error)
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
        setRecordingTime(0)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
        setRecordingTime(0)
      }
      
      // 开始语音识别
      recognition.start()
      
    } catch (error) {
      console.error('无法访问麦克风:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (isRecording && recognitionRef.current) {
      // 停止语音识别
      recognitionRef.current.stop()
      
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      
      setRecordingTime(0)
    }
  }

  // 处理录音按钮点击
  const handleRecordingToggle = () => {
    // 如果没有选择模型，不允许录音
    if (!selectedModel) {
      return
    }
    
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // 格式化录音时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // 组件卸载时清理录音
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (isRecording && recognitionRef.current) {
        // 停止语音识别
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* 功能按钮栏 */}
      <div className={`flex items-center justify-start mb-3 ${
        isSidebarCollapsed ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'
      }`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onContextToggle}
            disabled={!modelContextEnabled || !selectedModel || isLoading}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !modelContextEnabled || !selectedModel
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                : contextEnabled 
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${isLoading ? 'cursor-not-allowed' : ''}`}
            title={!selectedModel ? "请先选择模型" : !modelContextEnabled ? "当前模型已禁用上下文功能" : isLoading ? "模型输出中，请稍候" : "上下文功能"}
          >
            <MoveVertical className="w-4 h-4" />
            <span>上下文</span>
          </button>
        </div>
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className={`${
        isSidebarCollapsed ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'
      }`}>
        <div className="relative bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-3 shadow-sm">
          {/* 文本输入区域 */}
          <div className="mb-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="询问任何问题"
              className="w-full resize-none bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-base leading-relaxed"
              rows={1}
              maxLength={4000}
              disabled={isLoading}
            />
          </div>
          
          {/* 底部图标栏 */}
          <div className="flex items-center justify-between">
            {/* 左侧图标组 */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                disabled={!selectedModel}
                className={`transition-colors ${
                  !selectedModel
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={!selectedModel ? "请先选择模型" : "添加附件"}
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onChatSettings}
                disabled={!selectedModel || isLoading}
                className={`transition-colors ${
                  !selectedModel || isLoading
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={!selectedModel ? "请先选择模型" : isLoading ? "模型输出中，请稍候" : "聊天设置"}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            {/* 右侧图标组 */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleRecordingToggle}
                disabled={!selectedModel}
                className={`transition-colors ${
                  !selectedModel
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : isRecording 
                      ? 'text-blue-500' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title={!selectedModel ? "请先选择模型" : isRecording ? "停止录音" : "语音输入"}
              >
                <Mic className="w-4 h-4" />
              </button>
              
              <button
                type="submit"
                disabled={!message.trim() || isLoading || !selectedModel}
                className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
} 