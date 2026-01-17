'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PosterData } from '@/types'

/**
 * 海报预览组件 Props
 */
interface PosterPreviewProps {
  data: PosterData
  posterRef?: React.RefObject<HTMLDivElement>
}

/**
 * 品牌 Logo 组件
 * 红色圆形背景 + 白色中心图案
 */
const BrandLogo: React.FC = () => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    {/* 红色圆形背景 */}
    <circle cx="20" cy="20" r="20" fill="#E74C3C" />
    {/* 内部白色圆环 */}
    <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="2" fill="none" />
    {/* 中心播放图标 */}
    <polygon points="17,13 17,27 28,20" fill="white" />
  </svg>
)

/**
 * 海报预览组件
 * 严格按照参考设计实现视觉效果
 * 
 * 布局结构：
 * 1. Header - 封面图区域（含悬浮标签）
 * 2. Title Bar - 标题区域（黑色背景）
 * 3. Content Body - 正文区域（浅灰背景）
 * 4. Footer - 品牌区域（白色背景）
 */
const PosterPreview: React.FC<PosterPreviewProps> = ({ data, posterRef }) => {
  return (
    <div 
      ref={posterRef}
      className="poster-container w-[375px] bg-white shadow-2xl overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif' }}
    >
      {/* ========== 1. Header: 封面图区域 ========== */}
      <div className="relative">
        {/* 封面图 - 保持 16:9 比例 */}
        <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
          {data.coverImage && data.coverImage !== '/mock-cover.jpg' ? (
            // 用户上传的真实图片
            <img 
              src={data.coverImage} 
              alt={data.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            // 占位图 - 模拟 La Luna 海报的星空背景
            <div className="w-full h-full relative bg-gradient-to-b from-[#1a2a4a] via-[#0f1a2e] to-[#0a1020]">
              {/* 星星点缀 */}
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-60"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60}%`,
                    }}
                  />
                ))}
              </div>
              {/* 模拟电影标题文字 */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <span 
                  className="text-4xl font-light tracking-wider"
                  style={{ 
                    color: '#FFD93D',
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    textShadow: '0 0 20px rgba(255, 217, 61, 0.5)'
                  }}
                >
                  La Luna
                </span>
              </div>
              {/* 底部人物剪影提示 */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-6 items-end">
                {/* 人物剪影 */}
                <div className="w-10 h-16 bg-slate-700/50 rounded-t-full"></div>
                <div className="w-8 h-12 bg-slate-700/50 rounded-t-full"></div>
                <div className="w-10 h-20 bg-slate-700/50 rounded-t-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* 悬浮标签 - 绝对定位在图片左下角 */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {data.tags.map((tag, index) => (
            <span 
              key={index}
              className="tag-pill px-3 py-1.5 text-xs text-white bg-black/60 backdrop-blur-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ========== 2. Title Bar: 标题区域 ========== */}
      <div className="bg-[#1a1a1a] px-5 py-4">
        <h1 className="text-white text-2xl font-bold tracking-wide">
          {data.title}
        </h1>
      </div>

      {/* ========== 3. Content Body: 正文区域 ========== */}
      <div className="bg-[#F9F9F9] px-5 py-5">
        {/* 视频介绍标题 */}
        <h2 className="text-sm text-gray-500 mb-3 tracking-wider">
          视频介绍
        </h2>
        
        {/* 剧情简介 */}
        <p className="text-gray-700 text-[15px] leading-relaxed mb-6">
          {data.description}
        </p>

        {/* 推荐理由区块 */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-[#3B5998]">
          {/* 推荐理由标题 */}
          <h3 className="text-xs text-gray-400 mb-2 tracking-wider">
            推荐理由
          </h3>
          {/* 推荐语内容 - 使用衬线字体 */}
          <p 
            className="font-quote text-gray-800 text-[15px] leading-loose italic"
          >
            {data.recommendation}
          </p>
        </div>
      </div>

      {/* ========== 4. Footer: 品牌区域 ========== */}
      <div className="bg-white px-5 py-4">
        {/* 分隔线 */}
        <div className="border-t border-gray-200 mb-4"></div>
        
        {/* 品牌信息与二维码 */}
        <div className="flex items-center justify-between">
          {/* 左侧：品牌信息 */}
          <div className="flex items-center gap-3">
            {/* Logo */}
            <BrandLogo />
            
            {/* 品牌文字 */}
            <div>
              <h4 className="text-[#3B5998] font-bold text-base">
                {data.brandName}
              </h4>
              <p className="text-gray-400 text-xs mt-0.5">
                精选优质儿童动画短片
              </p>
            </div>
          </div>

          {/* 右侧：二维码 */}
          <div className="flex-shrink-0">
            <QRCodeSVG 
              value={data.qrCodeUrl || data.videoUrl}
              size={64}
              level="M"
              includeMargin={false}
              fgColor="#3B5998"
              bgColor="transparent"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PosterPreview
