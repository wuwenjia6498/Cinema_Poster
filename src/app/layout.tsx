import type { Metadata } from 'next'
import './globals.css'

/**
 * 网站元数据配置
 */
export const metadata: Metadata = {
  title: '周末放映室 - 海报生成器',
  description: '输入视频链接，AI 自动生成精美电影海报',
}

/**
 * 根布局组件
 * 包裹整个应用，提供全局样式和结构
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  )
}
