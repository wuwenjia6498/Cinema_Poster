'use client'

import React, { useState, useRef, useEffect } from 'react'
import PosterPreview from '@/components/PosterPreview'
import EditorPanel from '@/components/EditorPanel'
import { PosterData, HistoryRecord, mockPosterData } from '@/types'

// localStorage 键名
const HISTORY_STORAGE_KEY = 'poster_history'
const MAX_HISTORY_COUNT = 20 // 最多保存 20 条记录

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
  
  // 历史记录状态
  const [history, setHistory] = useState<HistoryRecord[]>([])
  
  // 海报 DOM 引用，用于导出图片
  const posterRef = useRef<HTMLDivElement>(null)

  /**
   * 初始化时从 localStorage 加载历史记录
   */
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as HistoryRecord[]
        setHistory(parsed)
        console.log('已加载历史记录:', parsed.length, '条')
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }, [])

  /**
   * 保存历史记录到 localStorage
   */
  const saveHistory = (newHistory: HistoryRecord[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  /**
   * 添加新的历史记录
   */
  const addToHistory = (data: PosterData, shareText?: string) => {
    const newRecord: HistoryRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      data: { ...data },
      shareText,
    }
    
    const newHistory = [newRecord, ...history].slice(0, MAX_HISTORY_COUNT)
    setHistory(newHistory)
    saveHistory(newHistory)
    console.log('已添加历史记录:', newRecord.data.title)
  }

  /**
   * 从历史记录加载
   */
  const loadFromHistory = (record: HistoryRecord) => {
    setPosterData(record.data)
    if (record.shareText) {
      setShareText(record.shareText)
    }
    console.log('已加载历史记录:', record.data.title)
  }

  /**
   * 删除历史记录
   */
  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(record => record.id !== id)
    setHistory(newHistory)
    saveHistory(newHistory)
    console.log('已删除历史记录')
  }

  /**
   * 清空所有历史记录
   */
  const clearAllHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      setHistory([])
      localStorage.removeItem(HISTORY_STORAGE_KEY)
      console.log('已清空历史记录')
    }
  }

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
      let finalShareText = ''
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
          
          // 组装最终分享文案（格式：固定开场白 → 🎬片名 → 🏷️标签 → 正文）
          finalShareText = `各位大朋友、小朋友们，大家晚上好。欢迎大家来到【老约翰周末放映室】。

🎬 ${result.data.title}

🏷️ ${result.data.tags.join('，')}

${shareResult.shareText}`
          
          console.log('准备设置分享文案:', finalShareText.substring(0, 50) + '...')
          setShareText(finalShareText)
          console.log('分享文案已设置到 state，完整长度:', finalShareText.length)
        }
      } catch (shareError) {
        console.error('分享文案生成失败:', shareError)
        // 分享文案生成失败不影响主流程
      }
      
      // 保存到历史记录
      const updatedData = {
        ...posterData,
        ...newData,
      }
      addToHistory(updatedData, finalShareText)
      
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
              history={history}
              onLoadHistory={loadFromHistory}
              onDeleteHistory={deleteFromHistory}
              onClearHistory={clearAllHistory}
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
