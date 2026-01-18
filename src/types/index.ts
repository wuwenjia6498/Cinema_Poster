/**
 * 海报数据接口定义
 * 用于存储和传递海报生成所需的所有信息
 */
export interface PosterData {
  videoUrl: string;       // 用户输入的原始视频链接
  coverImage: string;     // 海报顶部大图 (URL 或 Base64)
  title: string;          // 电影/视频标题
  tags: string[];         // 标签数组，如 ["国外动画短片", "奥斯卡获奖"]
  description: string;    // 剧情简介 (约60字)
  recommendation: string; // 推荐语 (约50字，金句风格)
  brandName: string;      // 底部品牌名，默认 "周末放映室"
  qrCodeUrl: string;      // 二维码内容，默认同 videoUrl
}

/**
 * 历史记录接口定义
 * 用于存储生成过的海报记录
 */
export interface HistoryRecord {
  id: string;             // 唯一标识符
  timestamp: number;      // 创建时间戳
  data: PosterData;       // 海报数据
  shareText?: string;     // 分享文案（可选）
}

/**
 * 海报默认/模拟数据
 * 用于开发阶段的静态展示
 */
export const mockPosterData: PosterData = {
  videoUrl: 'https://www.bilibili.com/video/BV1example',
  coverImage: '/mock-cover.jpg', // 将使用占位图
  title: '鹬 (Piper)',
  tags: ['国外动画短片', '奥斯卡/国际获奖'],
  description: '皮克斯奥斯卡获奖佳作。记录了一只恐水的小海鸟，在妈妈的引导下从畏惧海浪到勇敢探索，最终学会独立觅食的成长故事。',
  recommendation: '"面对未知的恐惧，往往藏着成长的惊喜。那份尝试的勇气，是童年最闪亮的光芒。细腻真实的画面展现了成长的阵痛与喜悦。"',
  brandName: '周末放映室',
  qrCodeUrl: 'https://www.bilibili.com/video/BV1example',
}
