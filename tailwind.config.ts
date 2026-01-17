import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 自定义字体族，用于海报推荐语的衬线字体
      fontFamily: {
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
      },
    },
  },
  plugins: [],
  // 禁用 oklch 颜色格式，确保 html2canvas 兼容性
  future: {
    hoverOnlyWhenSupported: true,
  },
  corePlugins: {
    // 不使用现代颜色函数
  },
}
export default config
