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
  
  // 分享文案状态
  const [shareText, setShareText] = useState('')
  
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
    if (!posterData.videoUrl) {
      alert('请先输入视频链接')
      return
    }
    
    setIsAnalyzing(true)
    try {
      console.log('开始分析视频:', posterData.videoUrl)
      
      // 调用 API 分析视频
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: posterData.videoUrl }),
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || '分析失败')
      }
      
      console.log('AI 分析结果:', result.data)
      
      // 更新海报数据
      const newData = {
        title: result.data.title,
        tags: result.data.tags,
        description: result.data.description,
        recommendation: result.data.recommendation,
      }
      handleDataChange(newData)
      
      // 自动生成分享文案
      console.log('开始生成分享文案...')
      try {
        const shareResponse = await fetch('/api/generate-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: result.data.title,
            description: result.data.description,
            tags: result.data.tags,
          }),
        })
        
        const shareResult = await shareResponse.json()
        
        if (shareResponse.ok && shareResult.success) {
          console.log('API 返回的分享文案:', shareResult.shareText)
          console.log('分享文案长度:', shareResult.shareText.length)
          
          // 组装最终分享文案
          const finalShareText = `🎬 ${result.data.title}

${shareResult.shareText}

🏷️ ${result.data.tags.join(' · ')}

—— 来自老约翰「周末放映室」精选推荐`
          
          console.log('准备设置分享文案:', finalShareText.substring(0, 50) + '...')
          setShareText(finalShareText)
          console.log('分享文案已设置到 state，完整长度:', finalShareText.length)
        }
      } catch (shareError) {
        console.error('分享文案生成失败:', shareError)
        // 分享文案生成失败不影响主流程
      }
      
    } catch (error) {
      console.error('分析失败:', error)
      alert(`分析失败：${error instanceof Error ? error.message : '请检查网络连接'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  /**
   * 下载海报处理函数
   * 使用 modern-screenshot 将海报导出为高清 PNG
   */
  const handleDownload = async () => {
    if (!posterRef.current) {
      alert('海报未加载完成，请稍后重试')
      return
    }
    
    try {
      console.log('开始生成海报图片...')
      
      // 动态导入 modern-screenshot
      const { domToPng } = await import('modern-screenshot')
      
      // 生成高清图片 (3x 缩放)
      const dataUrl = await domToPng(posterRef.current, {
        scale: 3,
        quality: 1.0,
        backgroundColor: '#F9F9F9',
        style: {
          // 确保字体正确渲染
          fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
        },
      })
      
      console.log('图片生成成功，准备下载...')
      
      // 创建下载链接
      const link = document.createElement('a')
      const fileName = `${posterData.title || '海报'}_周末放映室.png`
      link.download = fileName
      link.href = dataUrl
      link.click()
      
      console.log('下载已触发:', fileName)
    } catch (error) {
      console.error('下载失败:', error)
      alert(`下载失败：${error instanceof Error ? error.message : '未知错误'}，请重试`)
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
              autoGeneratedShareText={shareText}
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
