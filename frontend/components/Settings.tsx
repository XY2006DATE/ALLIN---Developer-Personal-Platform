'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  User, 
  Key, 
  Palette, 
  Globe, 
  Settings as SettingsIcon,
  Brain
} from 'lucide-react'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  onModelSettings: () => void
  onUserProfileSettings: () => void
  onPasswordSettings: () => void
  onThemeSettings: () => void
}

// 使用React.memo优化单个设置项组件
const SettingsItem = React.memo(({ 
  item, 
  onAction 
}: { 
  item: {
    id: string
    name: string
    description: string
    icon: any
    action: () => void
  }
  onAction: () => void
}) => {
  const ItemIcon = item.icon
  
  const handleClick = React.useCallback(() => {
    item.action()
    onAction()
  }, [item.action, onAction])

  return (
    <button
      onClick={handleClick}
      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-150 ease-out"
    >
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-colors duration-150">
          <ItemIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="text-left">
          <div className="font-medium text-base text-gray-900 dark:text-white">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
        </div>
      </div>
    </button>
  )
})

SettingsItem.displayName = 'SettingsItem'

export default function Settings({ isOpen, onClose, onModelSettings, onUserProfileSettings, onPasswordSettings, onThemeSettings }: SettingsProps) {
  if (!isOpen) return null

  const settingsItems = React.useMemo(() => [
    {
      section: '用户',
      icon: User,
      items: [
        {
          id: 'profile',
          name: '个人信息',
          description: '更新您的个人信息和头像',
          icon: User,
          action: () => {
            onUserProfileSettings()
            onClose()
          }
        },
        {
          id: 'password',
          name: '密码重置',
          description: '修改账户密码',
          icon: Key,
          action: () => {
            onPasswordSettings()
            onClose()
          }
        }
      ]
    },
    {
      section: '模型',
      icon: Brain,
      items: [
        {
          id: 'model-config',
          name: '模型配置',
          description: '添加、编辑和管理AI模型',
          icon: Brain,
          action: () => {
            onModelSettings()
            onClose()
          }
        }
      ]
    },
    {
      section: '外观',
      icon: Palette,
      items: [
        {
          id: 'theme',
          name: '主题设置',
          description: '选择浅色或深色主题',
          icon: Palette,
          action: () => {
            onThemeSettings()
            onClose()
          }
        },
        {
          id: 'language',
          name: '语言设置',
          description: '选择界面语言',
          icon: Globe,
          action: () => console.log('语言设置')
        }
      ]
    }
  ], [onClose, onModelSettings, onUserProfileSettings, onPasswordSettings, onThemeSettings])

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
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 设置列表 */}
        <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
          {settingsItems.map((section, sectionIndex) => {
            const SectionIcon = section.icon
            return (
              <div key={section.section} className="last:border-b-0">
                {/* 分组标题 */}
                <div className="px-3 py-2 bg-white dark:bg-gray-800">
                  <h3 className="font-medium text-base text-gray-900 dark:text-white">{section.section}</h3>
                </div>

                {/* 分组项目 */}
                <div className="bg-white dark:bg-gray-800">
                  {section.items.map((item, itemIndex) => (
                    <SettingsItem 
                      key={item.id} 
                      item={item} 
                      onAction={() => {}} 
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
} 