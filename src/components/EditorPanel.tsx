'use client'

import React from 'react'
import { Link, Sparkles, Image, Type, Tag, FileText, Quote, Download } from 'lucide-react'
import { PosterData } from '@/types'

/**
 * 编辑器面板 Props
 */
interface EditorPanelProps {
  data: PosterData
  onChange: (data: Partial<PosterData>) => void
  onAnalyze: () => void
  onDownload: () => void
  isAnalyzing?: boolean
}

/**
 * 表单输入框组件
 */
const FormInput: React.FC<{
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'url'
}> = ({ label, icon, value, onChange, placeholder, type = 'text' }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                 transition-all duration-200"
    />
  </div>
)

/**
 * 表单文本域组件
 */
const FormTextarea: React.FC<{
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}> = ({ label, icon, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      {icon}
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                 focus:border-blue-500 transition-all duration-200"
    />
  </div>
)

/**
 * 编辑器面板组件
 * 提供表单控件用于编辑海报数据
 */
const EditorPanel: React.FC<EditorPanelProps> = ({
  data,
  onChange,
  onAnalyze,
  onDownload,
  isAnalyzing = false,
}) => {
  /**
   * 处理标签输入变化
   * 将逗号分隔的字符串转换为数组
   */
  const handleTagsChange = (value: string) => {
    const tags = value.split(/[,，]/).map(tag => tag.trim()).filter(Boolean)
    onChange({ tags })
  }

  /**
   * 处理封面图上传
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onChange({ coverImage: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 面板标题 */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">海报编辑器</h2>
        <p className="text-sm text-gray-500 mt-1">输入视频链接，AI 帮你生成精美文案</p>
      </div>

      {/* 表单内容区 - 可滚动 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* 视频链接输入 */}
        <FormInput
          label="视频链接"
          icon={<Link size={16} className="text-gray-400" />}
          value={data.videoUrl}
          onChange={(value) => onChange({ videoUrl: value, qrCodeUrl: value })}
          placeholder="粘贴 B站、YouTube 等视频链接"
          type="url"
        />

        {/* AI 智能分析按钮 */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !data.videoUrl}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                     rounded-lg font-medium text-sm shadow-lg shadow-blue-500/25
                     hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     transition-all duration-200"
        >
          <Sparkles size={18} />
          {isAnalyzing ? '正在分析中...' : 'AI 智能分析'}
        </button>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400">手动编辑</span>
          </div>
        </div>

        {/* 封面图上传 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Image size={16} className="text-gray-400" />
            封面图片
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed 
                            border-gray-200 rounded-lg text-gray-500 text-sm
                            hover:border-blue-400 hover:text-blue-500 transition-colors">
              <Image size={18} />
              点击上传封面图片
            </div>
          </div>
          {data.coverImage && data.coverImage !== '/mock-cover.jpg' && (
            <p className="text-xs text-green-600">✓ 已上传封面图</p>
          )}
        </div>

        {/* 标题输入 */}
        <FormInput
          label="视频标题"
          icon={<Type size={16} className="text-gray-400" />}
          value={data.title}
          onChange={(value) => onChange({ title: value })}
          placeholder="输入视频标题"
        />

        {/* 标签输入 */}
        <FormInput
          label="标签（逗号分隔）"
          icon={<Tag size={16} className="text-gray-400" />}
          value={data.tags.join('，')}
          onChange={handleTagsChange}
          placeholder="如：国外动画，奥斯卡获奖"
        />

        {/* 视频简介 */}
        <FormTextarea
          label="视频简介"
          icon={<FileText size={16} className="text-gray-400" />}
          value={data.description}
          onChange={(value) => onChange({ description: value })}
          placeholder="简要描述视频内容，约 60 字"
          rows={3}
        />

        {/* 推荐理由 */}
        <FormTextarea
          label="推荐理由"
          icon={<Quote size={16} className="text-gray-400" />}
          value={data.recommendation}
          onChange={(value) => onChange({ recommendation: value })}
          placeholder="写一段走心的推荐语，约 50 字"
          rows={4}
        />
      </div>

      {/* 底部下载按钮 */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-gray-900 text-white rounded-lg font-medium text-sm
                     hover:bg-gray-800 transition-colors duration-200"
        >
          <Download size={18} />
          下载海报
        </button>
      </div>
    </div>
  )
}

export default EditorPanel
