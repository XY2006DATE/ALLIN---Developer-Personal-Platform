'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  TestTube, 
  Trash2, 
  Edit, 
  Check, 
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  MoveVertical,
  ChevronRight,
  ArrowLeft,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  Brain
} from 'lucide-react'
import api from '@/lib/api'

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
  max_summary_length?: number
  created_at: string
  updated_at: string
}

interface ModelManagerProps {
  isOpen: boolean
  onClose: () => void
  onBackToSettings?: () => void
  onModelsChange?: () => void
}

export default function ModelManager({ isOpen, onClose, onBackToSettings, onModelsChange }: ModelManagerProps) {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null)
  const [testingModel, setTestingModel] = useState<number | null>(null)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; response?: string; error?: string } | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    api_key: '',
    model_name: '',
    description: '',
    is_active: true,
    is_default: false,
    enable_streaming: true,
    enable_context: true,
    max_summary_length: 1000
  })

  useEffect(() => {
    if (isOpen) {
      loadModels()
    }
  }, [isOpen])

  const loadModels = async () => {
    try {
      setLoading(true)
      const response = await api.get('/models/list')
      setModels(response.data.models || [])
    } catch (error) {
      console.error('加载模型失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (editingModel) {
        await api.put(`/models/${editingModel.id}/settings`, formData)
      } else {
        await api.post('/models/register', formData)
      }
      
      await loadModels()
      resetForm()
      setShowForm(false)
      setEditingModel(null)
      
      // 通知父组件模型列表已更新
      onModelsChange?.()
    } catch (error) {
      console.error('保存模型失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (model: ModelConfig) => {
    setFormData({
      name: model.name,
      base_url: model.base_url,
      api_key: model.api_key,
      model_name: model.model_name,
      description: model.description || '',
      is_active: model.is_active,
      is_default: model.is_default,
      enable_streaming: model.enable_streaming,
      enable_context: model.enable_context,
      max_summary_length: model.max_summary_length || 1000
    })
    setEditingModel(model)
    setShowForm(true)
  }

  const handleDelete = async (modelId: number) => {
    if (window.confirm('确定要删除这个模型吗？')) {
      try {
        await api.delete(`/models/${modelId}`)
        await loadModels()
        
        // 通知父组件模型列表已更新
        onModelsChange?.()
      } catch (error) {
        console.error('删除模型失败:', error)
      }
    }
  }

  const handleTest = async (modelId: number) => {
    try {
      setTestingModel(modelId)
      setTestResult(null) // 清除之前的测试结果
      
      console.log('开始测试模型:', modelId)
      
      // 获取模型配置信息
      const model = models.find(m => m.id === modelId)
      if (!model) {
        setTestResult({
          success: false,
          message: '测试失败',
          error: '模型配置不存在'
        })
        return
      }
      
      const response = await api.post('/models/test-connection', {
        base_url: model.base_url,
        api_key: model.api_key,
        model_name: model.model_name,
        test_message: 'Hello, this is a test message.'
      })
      
      console.log('测试响应:', response.data)
      setTestResult(response.data)
    } catch (error: any) {
      console.error('模型测试错误:', error)
      setTestResult({
        success: false,
        message: '测试失败',
        error: error.response?.data?.detail || error.message || '未知错误'
      })
    } finally {
      setTestingModel(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      base_url: '',
      api_key: '',
      model_name: '',
      description: '',
      is_active: true,
      is_default: false,
      enable_streaming: true,
      enable_context: true,
      max_summary_length: 1000
    })
    setEditingModel(null)
    setTestResult(null)
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
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToSettings || onClose}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">模型配置</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {showForm ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                  {editingModel ? '编辑模型' : '添加模型'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingModel(null)
                    resetForm()
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  返回列表
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      配置名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="如: 我的GPT配置"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">用于标识此配置的显示名称</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      模型标识符 *
                    </label>
                    <input
                      type="text"
                      value={formData.model_name}
                      onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="如: gpt-3.5-turbo"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API调用时使用的模型名称</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    基础URL *
                  </label>
                  <input
                    type="url"
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="https://api.openai.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    API密钥 *
                  </label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="sk-..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    描述
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="模型描述"
                  />
                </div>

                                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      流式传输
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, enable_streaming: !formData.enable_streaming })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                          formData.enable_streaming 
                            ? 'bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-600/25' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                            formData.enable_streaming ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="flex items-center space-x-2 mt-2">
                        {formData.enable_streaming ? (
                          <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          formData.enable_streaming 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formData.enable_streaming ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      上下文功能
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, enable_context: !formData.enable_context })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                          formData.enable_context 
                            ? 'bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-600/25' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                            formData.enable_context ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="flex items-center space-x-2 mt-2">
                        {formData.enable_context ? (
                          <MoveVertical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          formData.enable_context 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formData.enable_context ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      状态
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                          formData.is_active 
                            ? 'bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-600/25' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-200 ${
                            formData.is_active ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="flex items-center space-x-2 mt-2">
                        {formData.is_active ? (
                          <Power className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          formData.is_active 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formData.is_active ? '激活' : '停用'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>



                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingModel(null)
                      resetForm()
                    }}
                    className="px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-2 py-1 text-gray-700 dark:text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-colors text-sm"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : (editingModel ? '保存' : '添加')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">模型管理</h3>
                <button
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                    setEditingModel(null)
                  }}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  <span>添加模型</span>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {models.map((model) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-base">{model.name}</h4>
                          {model.is_default && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              默认
                            </span>
                          )}
                          {model.is_active ? (
                            <span className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800">
                              <Power className="w-3 h-3" />
                              <span>激活</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                              <PowerOff className="w-3 h-3" />
                              <span>停用</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleTest(model.id)}
                            disabled={testingModel === model.id}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
                            title="测试模型"
                          >
                            {testingModel === model.id ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <TestTube className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(model)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            title="编辑"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(model.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 dark:text-gray-500">配置名称:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{model.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">|</span>
                          <span className="text-gray-400 dark:text-gray-500">模型标识符:</span>
                          <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 px-1 rounded">{model.model_name}</span>
                        </div>
                        <div>URL: {model.base_url}</div>
                        <div className="flex items-center space-x-1">
                          {model.enable_streaming ? (
                            <Wifi className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <WifiOff className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            流式传输: {model.enable_streaming ? '启用' : '禁用'}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500">|</span>
                          {model.enable_context ? (
                            <MoveVertical className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            上下文: {model.enable_context ? '启用' : '禁用'}
                          </span>
                        </div>
                        {model.enable_context && model.max_summary_length && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              最大摘要长度: {model.max_summary_length} 字符
                            </span>
                          </div>
                        )}
                        {model.description && <div className="text-gray-600 dark:text-gray-400">{model.description}</div>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 模型测试结果 */}
              {testResult && (
                <div className="mt-4 p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`font-medium text-sm ${testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {testResult.message}
                    </span>
                  </div>
                  {testResult.response && (
                    <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <strong>响应:</strong> {testResult.response}
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <strong>错误:</strong> {testResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 