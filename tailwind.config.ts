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
}
export default config
