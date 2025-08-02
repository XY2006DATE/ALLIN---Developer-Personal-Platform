'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import UserAvatar from '@/components/UserAvatar'
import ModelManager from '@/components/ModelManager'
import Settings from '@/components/Settings'
import UserProfileSettings from '@/components/UserProfileSettings'
import PasswordSettings from '@/components/PasswordSettings'
import ThemeSettings from '@/components/ThemeSettings'
import ChatExportModal from '@/components/ChatExportModal'
import ChatSearch from '@/components/ChatSearch'
import ChatSettings, { ChatSettings as ChatSettingsType } from '@/components/ChatSettings'
import { useChatHistory } from '@/lib/useChatHistory'
import api, { chatAPI } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isLoading?: boolean // 新增加载状态标记
}

interface ModelConfig {
  id: number
  name: string
  base_url: string
  api_key: string
  model_name: string
  description?: string
  is_active: boolean
  is_default: boolean
  enable_streaming: boolean
  enable_context: boolean
  temperature: number
  created_at: string
  updated_at: string
}

export default function ChatPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const {
    chatHistories,
    currentChat,
    loading: chatHistoryLoading,
    error: chatHistoryError,
    createChatHistory,
    loadChatHistory,
    updateChatTitle,
    updateChatContextSettings,
    deleteChatHistory,
    addMessage,
    generateContextSummary,
    clearCurrentChat,
    loadChatHistories,
  } = useChatHistory()
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [contextEnabled, setContextEnabled] = useState(true)
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showModelManager, setShowModelManager] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserProfileSettings, setShowUserProfileSettings] = useState(false)
  const [showPasswordSettings, setShowPasswordSettings] = useState(false)
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [exportChatId, setExportChatId] = useState<number>(0)
  const [exportChatTitle, setExportChatTitle] = useState('')
  const [models, setModels] = useState<ModelConfig[]>([])
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showChatSettings, setShowChatSettings] = useState(false)
  const [chatSettings, setChatSettings] = useState<ChatSettingsType>({
    maxTokens: 2500,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    streaming: true,
    timeout: 30,
    // 上下文设置 - 默认开启
    window_size: 10,
    enable_summary: true,
    smart_selection: true,
    keyword_filtering: false,
    max_summary_length: 200
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 路由保护
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  // 加载模型列表
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await api.get('/models/list')
        const modelList = response.data.models || []
        // 只显示激活的模型
        const activeModels = modelList.filter((model: ModelConfig) => model.is_active)
        setModels(activeModels)
        
        // 如果有激活的模型，选择第一个
        if (activeModels.length > 0) {
          setSelectedModel(activeModels[0])
        } else {
          setSelectedModel(null)
        }
      } catch (error) {
        console.error('加载模型失败:', error)
      }
    }

    if (isAuthenticated) {
      loadModels()
    }
  }, [isAuthenticated])

  // 重新加载模型列表的函数
  const reloadModels = async () => {
    try {
      const response = await api.get('/models/list')
      const modelList = response.data.models || []
      // 只显示激活的模型
      const activeModels = modelList.filter((model: ModelConfig) => model.is_active)
      setModels(activeModels)
      
      // 如果有激活的模型，选择第一个
      if (activeModels.length > 0) {
        setSelectedModel(activeModels[0])
      } else {
        setSelectedModel(null)
      }
      
      // 如果用户当前在一个聊天中，重新加载当前聊天的最新状态
      if (currentChat?.id) {
        try {
          console.log('模型更新后重新加载当前聊天:', currentChat.id)
          await loadChatHistory(currentChat.id)
        } catch (error) {
          console.error('重新加载当前聊天失败:', error)
        }
      }
    } catch (error) {
      console.error('重新加载模型失败:', error)
    }
  }

  // 当当前聊天改变时，更新消息和上下文状态
  useEffect(() => {
    if (currentChat) {
      // 检查是否是首次加载或消息数量确实发生了变化
      const shouldReloadMessages = messages.length === 0 || messages.length !== currentChat.messages.length
      if (shouldReloadMessages) {
        const formattedMessages: Message[] = currentChat.messages.map(msg => ({
          id: msg.id.toString(),
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: formatMessageTime(msg.created_at)
        }))
        setMessages(formattedMessages)
      }
      
      // 获取当前聊天使用的模型配置
      const currentModel = models.find(model => model.id === currentChat.config_id)
      
      // 根据模型配置和聊天历史中的上下文设置更新状态
      const contextSettings = currentChat.context_settings || {}
      
      // 如果模型禁用了上下文功能，则强制禁用上下文
      const modelContextEnabled = currentModel?.enable_context ?? true
      // 优先使用聊天历史中保存的上下文状态，如果模型禁用了上下文功能则强制禁用
      const finalContextEnabled = modelContextEnabled && currentChat.enable_context
      
      setContextEnabled(finalContextEnabled)
      
      // 同步更新聊天设置
      setChatSettings(prev => ({
        ...prev,
        window_size: contextSettings.window_size || 10,
        enable_summary: finalContextEnabled ? (contextSettings.enable_summary || false) : false,
        smart_selection: finalContextEnabled ? (contextSettings.smart_selection || false) : false,
        keyword_filtering: finalContextEnabled ? (contextSettings.keyword_filtering || false) : false,
        max_summary_length: contextSettings.max_summary_length || 200
      }))
    } else {
      // 新对话时，根据当前选中的模型决定上下文功能状态
      const modelContextEnabled = selectedModel?.enable_context ?? true
      setMessages([])
      setContextEnabled(modelContextEnabled)
      setChatSettings(prev => ({
        ...prev,
        window_size: 10,
        enable_summary: modelContextEnabled,
        smart_selection: modelContextEnabled,
        keyword_filtering: false,
        max_summary_length: 200
      }))
      
      // 调试信息
      console.log('新对话状态设置:')
      console.log('- selectedModel:', selectedModel?.name, selectedModel?.enable_context)
      console.log('- modelContextEnabled:', modelContextEnabled)
      console.log('- setContextEnabled:', modelContextEnabled)
    }
  }, [currentChat, models, selectedModel])

  // 格式化消息时间的函数
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      // 检查是否是有效日期
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('zh-CN', {
          hour12: false,
          timeZone: 'Asia/Shanghai',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('时间格式化错误:', error)
      return new Date().toLocaleTimeString('zh-CN', {
        hour12: false,
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // 自动滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToBottom()
  }, [messages])

  // 如果正在加载或未认证，显示加载状态
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果未认证，不渲染内容
  if (!isAuthenticated) {
    return null
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // 检查是否有选中的模型
    if (!selectedModel) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '请先选择一个可用的模型。您可以在设置中添加和激活模型。',
        timestamp: formatMessageTime(new Date().toISOString())
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: formatMessageTime(new Date().toISOString())
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 检查当前模型是否禁用了上下文功能
      const currentModel = currentChat ? models.find(model => model.id === currentChat.config_id) : selectedModel
      const modelContextEnabled = currentModel?.enable_context ?? true
      
      // 构建对话历史 - 只有在选择了模型且模型启用上下文功能且聊天上下文功能启用时才传递
      // 对于新对话，即使没有消息历史，也要传递上下文设置
      const conversationHistory = selectedModel && modelContextEnabled && contextEnabled && currentChat?.messages && (currentChat.messages.length || 0) > 0
        ? currentChat.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        : []
      
      // 调试信息
      console.log('=== 发送消息时的状态 ===')
      console.log('- contextEnabled:', contextEnabled)
      console.log('- modelContextEnabled:', modelContextEnabled)
      console.log('- selectedModel:', selectedModel?.name, selectedModel?.enable_context)
      console.log('- currentChat:', currentChat?.id)
      console.log('- messages count:', currentChat?.messages?.length || 0)
      console.log('- conversationHistory length:', conversationHistory.length)
      console.log('- chatSettings:', chatSettings)
      console.log('- 条件检查:')
      console.log('  - selectedModel:', !!selectedModel)
      console.log('  - modelContextEnabled:', modelContextEnabled)
      console.log('  - contextEnabled:', contextEnabled)
      console.log('  - currentChat?.messages:', !!currentChat?.messages)
      console.log('  - messages.length > 0:', (currentChat?.messages?.length || 0) > 0)
      console.log('- 最终结果:')
      console.log('  - 是否传递对话历史:', conversationHistory.length > 0)
      console.log('  - 是否传递上下文设置:', true) // 总是传递上下文设置
      console.log('=== 调试信息结束 ===')

      // 根据用户设置决定是否使用流式传输
      const useStreaming = streamingEnabled && selectedModel.enable_streaming

      if (useStreaming) {
        // 使用流式传输
        await handleStreamingChat(content, conversationHistory)
      } else {
        // 使用普通聊天
        await handleNormalChat(content, conversationHistory)
      }

    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发送消息时出现错误，请重试。',
        timestamp: formatMessageTime(new Date().toISOString())
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理普通聊天（非流式）
  const handleNormalChat = async (content: string, conversationHistory: any[]) => {
    // 创建助手消息占位符，显示三个点动画
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // 空内容，将显示加载动画
      timestamp: formatMessageTime(new Date().toISOString()),
      isLoading: true // 添加加载状态标记
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await api.post('/remote/chat', {
        config_id: selectedModel!.id,
        message: content,
        conversation_history: conversationHistory,
        chat_url: currentChat?.url || undefined, // 如果currentChat为null，不传递chat_url
        max_tokens: chatSettings.maxTokens,
        temperature: chatSettings.temperature,
        top_p: chatSettings.topP,
        frequency_penalty: chatSettings.frequencyPenalty,
        presence_penalty: chatSettings.presencePenalty,
        stream: false,
        timeout: chatSettings.timeout,
        // 添加上下文设置，确保新创建的聊天记录有正确的配置
        context_settings: {
          window_size: chatSettings.window_size,
          enable_summary: chatSettings.enable_summary,
          smart_selection: chatSettings.smart_selection,
          keyword_filtering: chatSettings.keyword_filtering,
          max_summary_length: chatSettings.max_summary_length
        }
      })

      if (response.data.success) {
        // 更新助手消息内容，移除加载状态
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: response.data.response || '抱歉，我无法处理您的请求。',
                isLoading: false
              }
            : msg
        ))

        // 如果返回了新的聊天URL，更新当前聊天状态
        if (response.data.chat_url) {
          if (!currentChat) {
            console.log('新聊天已创建，URL:', response.data.chat_url)
            await loadChatHistories()
            // 重新加载聊天历史，然后选择最新的聊天记录
            const updatedHistories = await api.get('/history')
            if (updatedHistories.data.chats && updatedHistories.data.chats.length > 0) {
              const latestChat = updatedHistories.data.chats[0] // 最新的聊天记录
              await loadChatHistory(latestChat.id)
            }
          }
        }
      } else {
        throw new Error(response.data.error || '聊天失败')
      }
    } catch (error) {
      console.error('普通聊天失败:', error)
      // 更新助手消息为错误信息
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: '抱歉，发送消息时出现错误，请重试。',
              isLoading: false
            }
          : msg
      ))
    }
  }

  // 处理流式聊天
  const handleStreamingChat = async (content: string, conversationHistory: any[]) => {
    // 创建助手消息占位符
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '', // 空内容，将显示加载动画
      timestamp: formatMessageTime(new Date().toISOString()),
      isLoading: true // 添加加载状态标记
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('http://localhost:8000/api/remote/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          config_id: selectedModel!.id,  // 使用选中的模型配置ID
          message: content,
          conversation_history: conversationHistory,
          chat_url: currentChat?.url || undefined, // 如果currentChat为null，不传递chat_url
          max_tokens: chatSettings.maxTokens,
          temperature: chatSettings.temperature,
          top_p: chatSettings.topP,
          frequency_penalty: chatSettings.frequencyPenalty,
          presence_penalty: chatSettings.presencePenalty,
          stream: chatSettings.streaming,
          timeout: chatSettings.timeout,
          // 添加上下文设置，确保新创建的聊天记录有正确的配置
          context_settings: {
            window_size: chatSettings.window_size,
            enable_summary: chatSettings.enable_summary,
            smart_selection: chatSettings.smart_selection,
            keyword_filtering: chatSettings.keyword_filtering,
            max_summary_length: chatSettings.max_summary_length
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          console.log('收到原始行:', line) // 调试信息
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log('解析的数据:', data) // 调试信息
              
              if (data.type === 'content') {
                console.log('收到内容块:', data.content) // 调试信息
                // 更新助手消息内容，移除加载状态
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        content: msg.content + data.content,
                        isLoading: false // 一旦开始接收内容，移除加载状态
                      }
                    : msg
                ))
              } else if (data.type === 'done') {
                console.log('流式传输完成:', data) // 调试信息
                // 流式传输完成
                if (data.success && !currentChat) {
                  // 重新加载聊天历史，然后选择最新的聊天记录
                  await loadChatHistories()
                  const updatedHistories = await api.get('/history')
                  if (updatedHistories.data.chats && updatedHistories.data.chats.length > 0) {
                    const latestChat = updatedHistories.data.chats[0] // 最新的聊天记录
                    await loadChatHistory(latestChat.id)
                  }
                }
                return
              } else if (data.type === 'error') {
                console.error('流式传输错误:', data.error) // 调试信息
                throw new Error(data.error || '流式传输失败')
              }
            } catch (e) {
              console.error('解析流式数据失败:', e, '原始行:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('流式传输失败:', error)
      // 更新助手消息为错误信息
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: '抱歉，流式传输时出现错误，请重试。',
              isLoading: false
            }
          : msg
      ))
    }
  }

  const handleNewChat = async () => {
    try {
      console.log('开始创建新对话')
      // 清空当前聊天和消息
      clearCurrentChat()
      setMessages([])
      
      // 使用默认的上下文功能状态（默认开启）
      setContextEnabled(true)
      setChatSettings(prev => ({
        ...prev,
        window_size: 10,
        enable_summary: true,  // 默认开启
        smart_selection: true,  // 默认开启
        keyword_filtering: false,
        max_summary_length: 200
      }))
      
      // 重新加载聊天历史列表以确保显示最新的聊天记录
      await loadChatHistories()
      console.log('新对话创建完成')
    } catch (error) {
      console.error('创建新对话失败:', error)
    }
  }

  const handleSelectChat = async (chatId: number) => {
    try {
      await loadChatHistory(chatId)
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }
  }

  const handleDeleteChat = async (chatId: number) => {
    try {
      console.log('开始删除聊天历史:', chatId)
      console.log('当前聊天ID:', currentChat?.id)
      
      // 调用删除API
      await deleteChatHistory(chatId)
      console.log('删除聊天历史成功:', chatId)
      
      // 如果删除的是当前聊天，清空当前聊天
      if (currentChat?.id === chatId) {
        console.log('删除的是当前聊天，清空当前聊天')
        clearCurrentChat()
      }
      
      // 重新加载聊天历史列表
      console.log('重新加载聊天历史列表')
      await loadChatHistories()
      console.log('聊天历史列表重新加载完成')
      
    } catch (error: any) {
      console.error('删除聊天历史失败:', error)
      console.error('错误详情:', error.response?.data)
      alert('删除失败，请重试')
    }
  }

  const handleUpdateChatTitle = async (chatId: number, title: string) => {
    try {
      await updateChatTitle(chatId, title)
    } catch (error) {
      console.error('更新聊天标题失败:', error)
    }
  }

  const handleCopyMessage = (content: string) => {
    // 复制消息到剪贴板
    navigator.clipboard.writeText(content).catch(err => {
      console.error('复制失败:', err)
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即使失败也要跳转到登录页
      router.push('/')
    }
  }

  const handleSettings = () => {
    setShowSettings(true)
  }

  const handleModelSettings = () => {
    setShowModelManager(true)
  }

  const handleUserProfileSettings = () => {
    setShowUserProfileSettings(true)
  }

  const handlePasswordSettings = () => {
    setShowPasswordSettings(true)
  }

  const handleThemeSettings = () => {
    setShowThemeSettings(true)
  }

  const handleBackToSettings = () => {
    setShowUserProfileSettings(false)
    setShowSettings(true)
  }

  const handleBackToSettingsFromPassword = () => {
    setShowPasswordSettings(false)
    setShowSettings(true)
  }

  const handleBackToSettingsFromModel = () => {
    setShowModelManager(false)
    setShowSettings(true)
  }

  const handleModelSelect = (model: ModelConfig) => {
    setSelectedModel(model)
    setShowModelSelector(false)
  }

  const handleExportChat = (chatId: number, title: string) => {
    setExportChatId(chatId)
    setExportChatTitle(title)
    setShowExportModal(true)
  }

  const handleCloseExportModal = () => {
    setShowExportModal(false)
    setExportChatId(0)
    setExportChatTitle('')
  }

  const handleSearchChat = () => {
    setShowSearchModal(true)
  }

  const handleCloseSearchModal = () => {
    setShowSearchModal(false)
  }

  const handleChatSettings = () => {
    setShowChatSettings(true)
  }

  const handleReloadCurrentChat = async () => {
    if (currentChat?.id) {
      try {
        console.log('聊天设置更新后重新加载当前聊天:', currentChat.id)
        await loadChatHistory(currentChat.id)
      } catch (error) {
        console.error('重新加载当前聊天失败:', error)
      }
    }
  }

  const handleChatSettingsChange = (newSettings: ChatSettingsType) => {
    // 检查当前模型是否禁用了上下文功能
    const currentModel = currentChat ? models.find(model => model.id === currentChat.config_id) : selectedModel
    const modelContextEnabled = currentModel?.enable_context ?? true
    
    // 如果没有选择模型或模型禁用了上下文功能，则强制禁用所有上下文相关设置
    const finalSettings = {
      ...newSettings,
      enable_summary: selectedModel && modelContextEnabled ? newSettings.enable_summary : false,
      smart_selection: selectedModel && modelContextEnabled ? newSettings.smart_selection : false,
      keyword_filtering: selectedModel && modelContextEnabled ? newSettings.keyword_filtering : false
    }
    
    setChatSettings(finalSettings)
    // 更新流式传输状态
    setStreamingEnabled(finalSettings.streaming)
    
    // 更新上下文功能状态 - 考虑模型配置和用户当前选择
    // 如果模型禁用了上下文功能，则强制禁用
    // 否则保持用户当前的上下文功能状态
    const finalContextEnabled = modelContextEnabled ? contextEnabled : false
    setContextEnabled(finalContextEnabled)

    // 更新上下文设置
    if (currentChat?.id) {
      const contextSettings = {
        window_size: finalSettings.window_size,
        enable_summary: finalSettings.enable_summary,
        smart_selection: finalSettings.smart_selection,
        keyword_filtering: finalSettings.keyword_filtering,
        max_summary_length: finalSettings.max_summary_length
      }
      updateChatContextSettings(currentChat.id, contextSettings)
    }
  }

  const handleContextToggle = async () => {
    // 检查当前模型是否禁用了上下文功能
    const currentModel = currentChat ? models.find(model => model.id === currentChat.config_id) : selectedModel
    const modelContextEnabled = currentModel?.enable_context ?? true
    
    // 如果没有选择模型或模型禁用了上下文功能，则不允许切换
    if (!selectedModel || !modelContextEnabled) {
      console.log('没有选择模型或当前模型已禁用上下文功能，无法切换')
      return
    }
  
    const newContextEnabled = !contextEnabled

    setContextEnabled(newContextEnabled)
    
    // 如果禁用上下文功能，禁用所有相关功能
    if (!newContextEnabled) {
      setChatSettings(prev => ({
        ...prev,
        enable_summary: false,
        smart_selection: false,
        keyword_filtering: false
      }))
    } else {
      // 如果启用上下文功能，恢复默认的上下文设置
      setChatSettings(prev => ({
        ...prev,
        enable_summary: true,
        smart_selection: true,
        keyword_filtering: false
      }))
    }
    
    // 如果有当前聊天，更新聊天设置
    if (currentChat?.id) {
      const contextSettings = {
        window_size: chatSettings.window_size,
        enable_summary: newContextEnabled ? true : false,
        smart_selection: newContextEnabled ? true : false,
        keyword_filtering: newContextEnabled ? false : false,
        max_summary_length: chatSettings.max_summary_length
      }
      
      try {
        // 先更新聊天历史的上下文设置和enable_context字段
        await chatAPI.updateChatHistory(currentChat.id, {
          enable_context: newContextEnabled,
          context_window_size: contextSettings.window_size,
          enable_context_summary: contextSettings.enable_summary,
          context_settings: contextSettings
        })
        
        // 等待一小段时间确保更新完成
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 重新加载当前聊天的完整消息列表，确保最新消息不会消失
        const updatedChat = await chatAPI.getChatHistory(currentChat.id)
        if (updatedChat) {
          const formattedMessages: Message[] = updatedChat.messages.map((msg: any) => ({
            id: msg.id.toString(),
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: formatMessageTime(msg.created_at)
          }))
          setMessages(formattedMessages)
          console.log('上下文功能切换后重新加载消息成功，消息数量:', formattedMessages.length)
        }
      } catch (error) {
        console.error('重新加载消息失败:', error)
      }
    } else {
      // 新对话时，只更新本地状态，不更新数据库
      console.log('新对话上下文功能切换:', newContextEnabled)
    }
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onUpdateChatTitle={handleUpdateChatTitle}
        onExportChat={handleExportChat}
        onSearchChat={handleSearchChat}
        chatHistories={chatHistories}
        currentChatId={currentChat?.id}
        loading={chatHistoryLoading}
      />

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-1 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 模型选择器 - 作为主要标题 */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center space-x-3 px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-lg font-semibold text-gray-900 dark:text-white transition-colors"
              >
                <span className="text-xl">{selectedModel?.name || '选择模型'}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${showModelSelector ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 模型选择下拉菜单 */}
              {showModelSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                >
                  <div className="py-1">
                    {models.length > 0 ? (
                      models.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelSelect(model)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            selectedModel?.id === model.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="font-semibold text-base">{model.name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400">模型标识符:</span>
                            <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">{model.model_name}</span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        暂无可用模型
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 当前聊天标题 */}
            {currentChat && (
              <div className="text-gray-600 dark:text-gray-400">
                <span className="text-sm">当前对话：</span>
                <span className="font-medium">{currentChat.title}</span>
              </div>
            )}
          </div>
          
          <UserAvatar
            user={{
              name: user?.name || user?.username || '开发者',
              email: user?.email || 'developer@allin.com',
              avatar_url: user?.avatar_url
            }}
            onLogout={handleLogout}
            onSettings={handleSettings}
          />
        </div>

        {/* 聊天消息区域 */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <div className={`${sidebarCollapsed ? 'max-w-7xl px-8' : 'max-w-4xl px-6'} mx-auto w-full`}>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
                isSidebarCollapsed={sidebarCollapsed}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入框 */}
        <ChatInput
          onSend={handleSendMessage}
          onContextToggle={handleContextToggle}
          onChatSettings={handleChatSettings}
          contextEnabled={contextEnabled}
          isLoading={isLoading}
          isSidebarCollapsed={sidebarCollapsed}
          selectedModel={selectedModel}
          modelContextEnabled={selectedModel?.enable_context ?? true}
        />
      </div>

      {/* 模型管理器 */}
      <ModelManager
        isOpen={showModelManager}
        onClose={() => setShowModelManager(false)}
        onBackToSettings={handleBackToSettingsFromModel}
        onModelsChange={reloadModels}
      />

      {/* 设置面板 */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onModelSettings={handleModelSettings}
        onUserProfileSettings={handleUserProfileSettings}
        onPasswordSettings={handlePasswordSettings}
        onThemeSettings={handleThemeSettings}
      />

      {/* 用户资料设置面板 */}
      <UserProfileSettings
        isOpen={showUserProfileSettings}
        onClose={() => setShowUserProfileSettings(false)}
        onBackToSettings={handleBackToSettings}
      />

      {/* 密码设置面板 */}
      <PasswordSettings
        isOpen={showPasswordSettings}
        onClose={() => setShowPasswordSettings(false)}
        onBackToSettings={handleBackToSettingsFromPassword}
      />

      {/* 主题设置面板 */}
      <ThemeSettings
        isOpen={showThemeSettings}
        onClose={() => setShowThemeSettings(false)}
        onBackToSettings={() => {
          setShowThemeSettings(false)
          setShowSettings(true)
        }}
      />

      {/* 聊天搜索模态框 */}
      <ChatSearch
        chatHistories={chatHistories}
        onSelectChat={handleSelectChat}
        isOpen={showSearchModal}
        onClose={handleCloseSearchModal}
      />

      {/* 聊天导出模态框 */}
      <ChatExportModal
        isOpen={showExportModal}
        onClose={handleCloseExportModal}
        chatId={exportChatId}
        chatTitle={exportChatTitle}
      />

      {/* 聊天设置模态框 */}
      <ChatSettings
        isOpen={showChatSettings}
        onClose={() => setShowChatSettings(false)}
        onSettingsChange={handleChatSettingsChange}
        onReloadCurrentChat={handleReloadCurrentChat}
        initialSettings={chatSettings}
        selectedModel={selectedModel}
      />

      {/* 点击外部关闭模型选择器 */}
      {showModelSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowModelSelector(false)}
        />
      )}
    </div>
  )
} 