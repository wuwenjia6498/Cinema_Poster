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
 * 使用自定义 Logo 图片
 */
const BrandLogo: React.FC = () => (
  <img 
    src="/logo-1.jpg" 
    alt="周末放映室"
    width={36}
    height={36}
    className="flex-shrink-0 rounded-full object-cover"
    style={{ width: '36px', height: '36px' }}
  />
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
      className="poster-container w-[375px] overflow-hidden"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
        backgroundColor: '#ffffff',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* ========== 1. Header: 封面图区域 ========== */}
      <div className="relative">
        {/* 封面图 - 保持 16:9 比例 */}
        <div className="w-full aspect-[4/3] overflow-hidden" style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}>
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
                <div className="w-10 h-16 rounded-t-full" style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}></div>
                <div className="w-8 h-12 rounded-t-full" style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}></div>
                <div className="w-10 h-20 rounded-t-full" style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 悬浮标签 - 绝对定位在图片左下角 */}
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
          {data.tags.map((tag, index) => (
            <span 
              key={index}
              className="tag-pill px-2.5 py-1 text-[11px] text-white bg-black/60 backdrop-blur-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ========== 2. Title Bar: 标题区域 ========== */}
      <div className="bg-[#1a1a1a] px-6 py-4">
        <h1 className="text-white text-xl font-bold tracking-wide">
          {data.title}
        </h1>
      </div>

      {/* ========== 3. Content Body: 正文区域 ========== */}
      <div className="bg-[#F9F9F9] px-6 py-6">
        {/* 视频介绍标题 */}
        <h2 className="text-[10px] mb-2 tracking-wider" style={{ color: '#6b7280' }}>
          视频介绍
        </h2>
        
        {/* 剧情简介 */}
        <p className="text-[12px] leading-loose mb-6" style={{ color: '#374151' }}>
          {data.description}
        </p>

        {/* 推荐理由区块 */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-[#3B5998]">
          {/* 推荐理由标题 */}
          <h3 className="text-[10px] mb-2 tracking-wider" style={{ color: '#9ca3af' }}>
            推荐理由
          </h3>
          {/* 推荐语内容 - 使用衬线字体 */}
          <p 
            className="font-quote text-[13px] leading-loose italic"
            style={{ color: '#1f2937' }}
          >
            {data.recommendation}
          </p>
        </div>
      </div>

      {/* ========== 4. Footer: 品牌区域 ========== */}
      <div className="bg-[#F9F9F9] px-6 py-5">
        {/* 分隔线 */}
        <div className="border-t mb-4" style={{ borderColor: '#d1d5db' }}></div>
        
        {/* 品牌信息与二维码 */}
        <div className="flex items-center justify-between">
          {/* 左侧：品牌信息 */}
          <div className="flex items-center gap-2.5">
            {/* Logo */}
            <BrandLogo />
            
            {/* 品牌文字 */}
            <div>
              <h4 className="font-bold text-sm" style={{ color: '#3B5998' }}>
                {data.brandName}
              </h4>
              <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>
                精选优质儿童动画短片
              </p>
            </div>
          </div>

          {/* 右侧：二维码 */}
          <div className="flex-shrink-0">
            <QRCodeSVG 
              value={data.qrCodeUrl || data.videoUrl}
              size={56}
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
