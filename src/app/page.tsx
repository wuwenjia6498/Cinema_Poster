'use client'

import React, { useState, useRef } from 'react'
import PosterPreview from '@/components/PosterPreview'
import EditorPanel from '@/components/EditorPanel'
import { PosterData, mockPosterData } from '@/types'

/**
 * 主页面组件
 * 
 * 布局结构：
 * - 左栏 (Editor): 表单编辑区
 * - 右栏 (Preview): 海报预览区
 */
export default function HomePage() {
  // 海报数据状态 - 使用模拟数据初始化
  const [posterData, setPosterData] = useState<PosterData>(mockPosterData)
  
  // AI 分析加载状态
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // 海报 DOM 引用，用于导出图片
  const posterRef = useRef<HTMLDivElement>(null)

  /**
   * 更新海报数据的处理函数
   * 支持部分更新
   */
  const handleDataChange = (newData: Partial<PosterData>) => {
    setPosterData(prev => ({ ...prev, ...newData }))
  }

  /**
   * AI 智能分析处理函数
   * 调用后端 API 获取视频信息和 AI 生成的文案
   */
  const handleAnalyze = async () => {
    if (!posterData.videoUrl) return
    
    setIsAnalyzing(true)
    try {
      // TODO: Step 2 中实现 API 调用
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: posterData.videoUrl }),
      // })
      // const result = await response.json()
      // handleDataChange(result)
      
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('AI 分析功能将在 Step 2 中实现')
    } catch (error) {
      console.error('分析失败:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  /**
   * 下载海报处理函数
   * 使用 html2canvas 将海报导出为高清 PNG
   */
  const handleDownload = async () => {
    if (!posterRef.current) return
    
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      // 生成高清图片 (3x 缩放)
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })
      
      // 创建下载链接
      const link = document.createElement('a')
      link.download = `${posterData.title || '海报'}_周末放映室.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      {/* 页面容器 */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* 页面标题 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎬 周末放映室 · 海报生成器
          </h1>
          <p className="text-gray-500">
            输入视频链接，AI 自动生成精美电影海报
          </p>
        </header>

        {/* 双栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* 左栏：编辑器面板 */}
          <div className="order-2 lg:order-1">
            <EditorPanel
              data={posterData}
              onChange={handleDataChange}
              onAnalyze={handleAnalyze}
              onDownload={handleDownload}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* 右栏：海报预览区 */}
          <div className="order-1 lg:order-2 flex justify-center lg:sticky lg:top-8">
            <div className="relative">
              {/* 背景装饰 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
              
              {/* 海报预览组件 */}
              <div className="relative">
                <PosterPreview 
                  data={posterData} 
                  posterRef={posterRef as React.RefObject<HTMLDivElement>}
                />
              </div>
              
              {/* 预览标签 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 
                              bg-white rounded-full shadow-md text-xs text-gray-500 font-medium">
                实时预览
              </div>
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>周末放映室 © 2024 · 精选优质儿童动画短片</p>
        </footer>
      </div>
    </main>
  )
}
