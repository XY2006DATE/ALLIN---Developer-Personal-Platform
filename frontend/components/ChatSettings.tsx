'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Settings as SettingsIcon,
  Thermometer,
  Wifi,
  WifiOff,
  Save,
  RotateCcw,
  Smartphone,
  FileText,
  Target,
  Info,
  Brain
} from 'lucide-react'

// 根据温度计算颜色 (蓝色到红色)
const getTemperatureColor = (temp: number) => {
  if (temp <= 0.5) {
    // 0-0.5: 蓝色到青色
    const ratio = temp / 0.5
    return `rgb(${0}, ${Math.round(255 * ratio)}, ${255})`
  } else if (temp <= 1.0) {
    // 0.5-1.0: 青色到绿色
    const ratio = (temp - 0.5) / 0.5
    return `rgb(${0}, ${255}, ${Math.round(255 * (1 - ratio))})`
  } else if (temp <= 1.5) {
    // 1.0-1.5: 绿色到黄色
    const ratio = (temp - 1.0) / 0.5
    return `rgb(${Math.round(255 * ratio)}, ${255}, ${0})`
  } else {
    // 1.5-2.0: 黄色到红色
    const ratio = (temp - 1.5) / 0.5
    return `rgb(255, ${Math.round(255 * (1 - ratio))}, ${0})`
  }
}

// 动画温度计组件
const AnimatedThermometer = ({ temperature }: { temperature: number }) => {
  // 计算温度百分比 (0-2 映射到 0-100%)
  const temperaturePercentage = (temperature / 2) * 100
  
  const currentColor = getTemperatureColor(temperature)

  return (
    <div className="relative w-4 h-4">
      {/* 温度计外框 */}
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-all duration-300 ${
          temperature > 1.5 ? 'thermometer-glow' : ''
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 14.76V3a2 2 0 0 0-4 0v11.76a4 4 0 1 0 4 0Z" />
        <path d="M10 3v11.76a4 4 0 1 0 4 0V3" />
      </svg>
      
      {/* 温度计液体动画 */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
        >
          {/* 温度计液体填充 - 使用clipPath实现更精确的填充效果 */}
          <defs>
            <clipPath id="thermometer-clip">
              <path d="M14 14.76V3a2 2 0 0 0-4 0v11.76a4 4 0 1 0 4 0Z" />
            </clipPath>
          </defs>
          
          {/* 液体填充区域 */}
          <motion.rect
            x="10"
            y="3"
            width="4"
            height="11.76"
            fill={currentColor}
            clipPath="url(#thermometer-clip)"
            initial={{ y: 14.76, height: 0 }}
            animate={{ 
              y: 14.76 - (temperaturePercentage / 100) * 11.76,
              height: (temperaturePercentage / 100) * 11.76
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              filter: "drop-shadow(0 0 3px rgba(0,0,0,0.4))"
            }}
          />
          
          {/* 温度计底部圆形 */}
          <motion.circle
            cx="12"
            cy="18"
            r="2"
            fill={currentColor}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              filter: "drop-shadow(0 0 3px rgba(0,0,0,0.4))"
            }}
          />
        </svg>
      </div>
      
      {/* 温度计刻度动画 */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.4"
        >
          {/* 刻度线 */}
          <motion.line
            x1="16"
            y1="4"
            x2="18"
            y2="4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: temperature >= 0.2 ? 1 : 0,
              scaleX: temperature >= 0.2 ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.line
            x1="16"
            y1="7"
            x2="18"
            y2="7"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: temperature >= 0.4 ? 1 : 0,
              scaleX: temperature >= 0.4 ? 1 : 0
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
          <motion.line
            x1="16"
            y1="10"
            x2="18"
            y2="10"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: temperature >= 0.6 ? 1 : 0,
              scaleX: temperature >= 0.6 ? 1 : 0
            }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
          <motion.line
            x1="16"
            y1="13"
            x2="18"
            y2="13"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: temperature >= 0.8 ? 1 : 0,
              scaleX: temperature >= 0.8 ? 1 : 0
            }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />
          <motion.line
            x1="16"
            y1="16"
            x2="18"
            y2="16"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: temperature >= 1.0 ? 1 : 0,
              scaleX: temperature >= 1.0 ? 1 : 0
            }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
        </svg>
      </div>
      
      {/* 温度计顶部气泡效果 */}
      <motion.div
        className="absolute top-0 right-0 w-1 h-1 rounded-full"
        style={{ backgroundColor: currentColor }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: temperature > 0 ? 1 : 0,
          opacity: temperature > 0 ? 0.8 : 0
        }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
    </div>
  )
}

interface ChatSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChange?: (settings: ChatSettings) => void
  onReloadCurrentChat?: () => void
  initialSettings?: ChatSettings
  selectedModel?: {
    id: number
    name: string
    enable_streaming: boolean
    enable_context: boolean // Added enable_context
  } | null
}

export interface ChatSettings {
  temperature: number
  maxTokens: number
  streaming: boolean
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  timeout: number
  // 上下文设置
  window_size: number
  enable_summary: boolean
  smart_selection: boolean
  keyword_filtering: boolean
  max_summary_length: number
}

const defaultSettings: ChatSettings = {
  temperature: 0.7,
  maxTokens: 2500,
  streaming: true,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  timeout: 30.0,
  // 上下文设置默认值 - 全部关闭
  window_size: 10,
  enable_summary: false,
  smart_selection: false,
  keyword_filtering: false,
  max_summary_length: 200
}

export default function ChatSettings({ 
  isOpen, 
  onClose, 
  onSettingsChange,
  onReloadCurrentChat,
  initialSettings = defaultSettings,
  selectedModel = null
}: ChatSettingsProps) {
  const [settings, setSettings] = useState<ChatSettings>(initialSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'context'>('chat')

  // 当选中模型改变时，自动调整流式传输设置
  useEffect(() => {
    if (selectedModel && !selectedModel.enable_streaming && settings.streaming) {
      setSettings(prev => ({ ...prev, streaming: false }))
      setHasChanges(true)
    }
  }, [selectedModel, settings.streaming])

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings)
      setHasChanges(false)
    }
  }, [isOpen, initialSettings])

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    // 如果模型禁用了流式传输，则不允许启用流式传输
    if (key === 'streaming' && value === true && selectedModel && !selectedModel.enable_streaming) {
      return
    }
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveChatSettings = () => {
    const chatSettings = {
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      streaming: settings.streaming,
      topP: settings.topP,
      frequencyPenalty: settings.frequencyPenalty,
      presencePenalty: settings.presencePenalty,
      timeout: settings.timeout
    }
    onSettingsChange?.({ ...settings, ...chatSettings })
    setHasChanges(false)
    onClose()
    
    // 如果用户当前在一个聊天中，重新加载当前聊天
    onReloadCurrentChat?.()
  }

  const handleSaveContextSettings = () => {
    const contextSettings = {
      window_size: settings.window_size,
      enable_summary: settings.enable_summary,
      smart_selection: settings.smart_selection,
      keyword_filtering: settings.keyword_filtering,
      max_summary_length: settings.max_summary_length
    }
    onSettingsChange?.({ ...settings, ...contextSettings })
    setHasChanges(false)
    onClose()
    
    // 如果用户当前在一个聊天中，重新加载当前聊天
    onReloadCurrentChat?.()
  }

  const handleSave = () => {
    onSettingsChange?.(settings)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  const handleCancel = () => {
    setSettings(initialSettings)
    setHasChanges(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">聊天设置</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            聊天参数
          </button>
          <button
            onClick={() => setActiveTab('context')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'context'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            上下文设置
          </button>
        </div>

        {/* 设置内容 */}
        <div className="overflow-y-auto max-h-[calc(70vh-120px)] p-4">
          {activeTab === 'chat' && (
            <div className="space-y-6">
              {/* 流式传输 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.streaming ? (
                      <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-400" />
                    )}
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      流式传输
                    </label>
                    {selectedModel && !selectedModel.enable_streaming && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                        模型禁用
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSettingChange('streaming', !settings.streaming)}
                    disabled={!!selectedModel && !selectedModel.enable_streaming}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.streaming 
                        ? 'bg-blue-600 dark:bg-blue-500' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    } ${
                      selectedModel && !selectedModel.enable_streaming 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.streaming ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedModel && !selectedModel.enable_streaming 
                    ? `当前模型"${selectedModel.name}"已禁用流式传输，无法启用此功能。`
                    : '启用后，AI回复会实时显示。禁用后，需要等待完整回复。'
                  }
                </p>
              </div>

              {/* 温度设置 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <AnimatedThermometer temperature={settings.temperature} />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    温度 (Temperature)
                  </label>
                  <motion.span 
                    className="text-xs font-medium"
                    style={{ 
                      color: getTemperatureColor(settings.temperature),
                      textShadow: settings.temperature > 1.5 ? '0 0 4px currentColor' : 'none'
                    }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      duration: 0.6,
                      repeat: settings.temperature > 1.5 ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {settings.temperature}
                  </motion.span>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="relative text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>保守 (0.0)</span>
                      <span>创造性 (2.0)</span>
                    </div>
                    <div className="absolute top-0 left-0 right-0">
                      <div className="relative w-full">
                        <span className="absolute left-[35%] transform -translate-x-1/2">平衡 (0.7)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  控制回复的随机性。较低的值使回复更确定，较高的值使回复更创造性。
                </p>
              </div>

              {/* 最大Token数 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    最大Token数
                  </label>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  控制单次回复的最大长度。较大的值允许更长的回复，但会增加响应时间。
                </p>
              </div>

              {/* Top-p 采样 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Top-p 采样
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {settings.topP}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.topP}
                  onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  控制词汇选择的多样性。1.0表示考虑所有词汇，0.1表示只考虑前10%的词汇。
                </p>
              </div>

              {/* 频率惩罚 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    频率惩罚
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {settings.frequencyPenalty}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={settings.frequencyPenalty}
                  onChange={(e) => handleSettingChange('frequencyPenalty', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  减少重复词汇的使用。正值减少重复，负值增加重复。
                </p>
              </div>

              {/* 存在惩罚 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    存在惩罚
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {settings.presencePenalty}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={settings.presencePenalty}
                  onChange={(e) => handleSettingChange('presencePenalty', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  减少重复主题的使用。正值减少重复主题，负值增加重复主题。
                </p>
              </div>

              {/* 超时设置 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    请求超时 (秒)
                  </label>
                </div>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={settings.timeout}
                  onChange={(e) => handleSettingChange('timeout', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  设置请求的最大等待时间。超过此时间将自动取消请求。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'context' && (
            <div className="space-y-6">
              {/* 模型上下文功能状态 */}
              {selectedModel && (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      模型上下文功能状态
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedModel.enable_context ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedModel.name}: {selectedModel.enable_context ? '已启用' : '已禁用'} 上下文功能
                    </span>
                  </div>
                  {!selectedModel.enable_context && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      当前模型已禁用上下文功能，上下文设置将不会生效。
                    </p>
                  )}
                </div>
              )}

              {/* 上下文窗口大小 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    上下文窗口大小
                  </label>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      控制发送给模型的历史消息数量
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={settings.window_size}
                    onChange={(e) => handleSettingChange('window_size', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    disabled={!!selectedModel && !selectedModel.enable_context}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                    {settings.window_size}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  推荐值：10-20，数值越大上下文越完整但响应可能越慢
                </p>
              </div>

              {/* 启用上下文摘要 */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      启用上下文摘要
                    </label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        当历史消息过多时自动生成摘要
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_summary}
                      onChange={(e) => handleSettingChange('enable_summary', e.target.checked)}
                      className="sr-only peer"
                      disabled={!!selectedModel && !selectedModel.enable_context}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!!selectedModel && !selectedModel.enable_context ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
                
                {/* 最大摘要长度 - 仅在启用上下文摘要时显示 */}
                {settings.enable_summary && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        最大摘要长度
                      </label>
                      <div className="relative group">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          控制生成的上下文摘要的最大字符数
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="100"
                        max="500"
                        step="50"
                        value={settings.max_summary_length}
                        onChange={(e) => handleSettingChange('max_summary_length', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        disabled={!!selectedModel && !selectedModel.enable_context}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[4rem]">
                        {settings.max_summary_length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      控制上下文摘要的最大字符数 (100-500)
                    </p>
                  </div>
                )}
              </div>

              {/* 智能选择 */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      智能消息选择
                    </label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        根据相关性智能选择历史消息而不是简单的时间顺序
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smart_selection}
                      onChange={(e) => handleSettingChange('smart_selection', e.target.checked)}
                      className="sr-only peer"
                      disabled={!!selectedModel && !selectedModel.enable_context}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!!selectedModel && !selectedModel.enable_context ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>

              {/* 关键词过滤 */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      关键词过滤
                    </label>
                    <div className="relative group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        根据关键词过滤不相关的历史消息
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.keyword_filtering}
                      onChange={(e) => handleSettingChange('keyword_filtering', e.target.checked)}
                      className="sr-only peer"
                      disabled={!!selectedModel && !selectedModel.enable_context}
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!!selectedModel && !selectedModel.enable_context ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>
              </div>

              {/* 说明 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">上下文功能说明：</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 上下文窗口：控制发送给AI模型的历史消息数量</li>
                      <li>• 智能选择：根据消息相关性而非时间顺序选择历史消息</li>
                      <li>• 上下文摘要：当消息过多时自动生成摘要保持上下文连贯性</li>
                      <li>• 关键词过滤：通过关键词匹配过滤不相关的历史消息</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重置默认</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={activeTab === 'chat' ? handleSaveChatSettings : handleSaveContextSettings}
              className="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4 inline mr-1" />
              保存设置
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 