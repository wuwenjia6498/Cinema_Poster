/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允许外部图片域名（用于海报封面图）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
