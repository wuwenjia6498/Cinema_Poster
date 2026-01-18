/**
 * 视频分析 API 路由
 * 使用 Gemini API 分析视频链接并生成海报文案
 */

import { NextRequest, NextResponse } from 'next/server'

// Gemini API 配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'

/**
 * AI 生成的海报数据接口
 */
interface GeneratedPosterData {
  title: string
  tags: string[]
  description: string
  recommendation: string
}

/**
 * 构建 Gemini API 请求的 Prompt
 */
function buildPrompt(url: string, pageTitle?: string, pageDescription?: string): string {
  // 构建视频信息部分
  const videoInfo = pageTitle 
    ? `【视频标题】${pageTitle}
${pageDescription ? `【视频简介】${pageDescription}` : ''}`
    : `【视频链接】${url}
请根据链接中的关键词推断视频内容。`

  return `你是一位专业的儿童动画推荐官。请为以下动画短片生成推荐文案。

${videoInfo}

## 输出要求（严格遵守）：

### 1. title（标题）
- 中文名称，外文作品附原名
- 格式示例：「父与女 (Father and Daughter)」「鹬 (Piper)」

### 2. tags（2-3个标签）
从以下类型中选择：
- 地区/制作：国外动画短片、国内动画短片、皮克斯、迪士尼、吉卜力、独立艺术短片
- 荣誉：奥斯卡获奖、奥斯卡提名、国际获奖
- 主题：成长、友情、亲情、勇气、生命

### 3. description（视频介绍，80字内）
- 精炼概括故事的核心冲突或情感亮点
- 不要流水账叙述，抓住最打动人的点
- 用画面感强的语言

### 4. recommendation（推荐理由，60字内）
用一段完整的话，包含以下三个方面：
- 艺术风格：画风、色彩、音乐特点
- 情感价值：能引发什么情感共鸣（禁用"教育意义""培养能力""懂得道理"等说教词）
- 观看门槛：用委婉方式表达，如"不需要对白也能看懂""全家都能一起看""大人孩子都会被打动"，避免写具体年龄如"3岁""5岁"
注意：用英文双引号包裹整段推荐语，不要用表情符号

## 输出格式（仅返回JSON）：

{
  "title": "父与女 (Father and Daughter)",
  "tags": ["国外动画短片", "奥斯卡获奖", "亲情"],
  "description": "父亲划船离去，女儿在岸边等待。从小女孩到白发老人，她骑着单车一次次来到海边。时间改变了一切，唯有思念从未停止。",
  "recommendation": "\"极简线条勾勒出一生的等待，配乐温柔得让人心碎。不需要对白，小朋友也能感受到那份想念，大人看完可能更感动。\""
}

请直接返回JSON，不要有其他文字：`
}

/**
 * 从 B站 URL 中提取 BV 号
 */
function extractBVID(url: string): string | null {
  const bvMatch = url.match(/BV[\w]+/)
  return bvMatch ? bvMatch[0] : null
}

/**
 * 通过 B站 API 获取视频信息
 */
async function fetchBilibiliVideoInfo(bvid: string): Promise<{ title?: string; description?: string }> {
  try {
    const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    })
    
    if (!response.ok) {
      console.log('B站 API 请求失败:', response.status)
      return {}
    }
    
    const data = await response.json()
    
    if (data.code === 0 && data.data) {
      console.log('B站视频信息获取成功:', data.data.title)
      return {
        title: data.data.title,
        description: data.data.desc || data.data.dynamic || '',
      }
    }
    
    return {}
  } catch (error) {
    console.log('B站 API 调用失败:', error)
    return {}
  }
}

/**
 * 尝试从 URL 获取网页元信息
 */
async function fetchPageMeta(url: string): Promise<{ title?: string; description?: string }> {
  // 优先尝试 B站 API
  const bvid = extractBVID(url)
  if (bvid) {
    console.log('检测到 B站视频，BV号:', bvid)
    const biliInfo = await fetchBilibiliVideoInfo(bvid)
    if (biliInfo.title) {
      return biliInfo
    }
  }
  
  // 其他平台尝试直接抓取
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      return {}
    }
    
    const html = await response.text()
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : undefined
    
    return { title, description }
  } catch (error) {
    console.log('获取网页元信息失败:', error)
    return {}
  }
}

/**
 * 调用 Gemini API（OpenAI 兼容格式，适用于 aihubmix.com 等代理平台）
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  // 使用 OpenAI 兼容的 chat/completions 端点
  const apiUrl = `${GEMINI_BASE_URL}/chat/completions`
  
  // 可选模型：gemini-1.5-pro, gemini-1.5-flash, gemini-pro 等
  // aihubmix.com 推荐使用 gemini-1.5-pro 或 gemini-1.5-flash
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是专业的儿童动画推荐官，熟悉全球优质动画短片。你的文案温暖有感染力，从不说教。严格按要求返回JSON格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API 错误:', errorText)
    throw new Error(`Gemini API 调用失败: ${response.status} - ${errorText}`)
  }
  
  const data = await response.json()
  
  // OpenAI 格式的响应提取
  const generatedText = data.choices?.[0]?.message?.content
  
  if (!generatedText) {
    throw new Error('Gemini API 返回内容为空')
  }
  
  return generatedText
}

/**
 * 解析 AI 返回的 JSON
 */
function parseAIResponse(text: string): GeneratedPosterData {
  console.log('AI 原始返回内容:', text)
  
  try {
    let jsonStr = text.trim()
    
    // 方法1: 移除 markdown 代码块标记
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()
    
    // 方法2: 尝试从文本中提取 JSON 对象
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonStr = jsonMatch[0]
      }
    }
    
    console.log('清理后的 JSON 字符串:', jsonStr)
    
    const parsed = JSON.parse(jsonStr)
    
    return {
      title: parsed.title || '未知标题',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['动画短片'],
      description: parsed.description || parsed.summary || '暂无简介',
      recommendation: parsed.recommendation || parsed.quote || '"这是一部值得观看的作品。"',
    }
  } catch (error) {
    console.error('JSON 解析失败，原始文本:', text)
    console.error('解析错误:', error)
    
    // 尝试从非 JSON 格式中提取信息
    try {
      const titleMatch = text.match(/title["\s:]+["']?([^"'\n,}]+)/i)
      const descMatch = text.match(/description["\s:]+["']?([^"'\n}]+)/i)
      
      if (titleMatch || descMatch) {
        return {
          title: titleMatch?.[1]?.trim() || '未知标题',
          tags: ['动画短片'],
          description: descMatch?.[1]?.trim() || '暂无简介',
          recommendation: '"这是一部值得观看的作品。"',
        }
      }
    } catch {}
    
    throw new Error('AI 返回格式解析失败，请重试')
  }
}

/**
 * POST 请求处理
 */
export async function POST(request: NextRequest) {
  try {
    // 检查 API Key
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未配置 Gemini API Key，请在 .env.local 中设置 GEMINI_API_KEY' },
        { status: 500 }
      )
    }
    
    // 解析请求体
    const body = await request.json()
    const { url } = body
    
    if (!url) {
      return NextResponse.json(
        { error: '请提供视频链接' },
        { status: 400 }
      )
    }
    
    console.log('开始分析视频:', url)
    
    // 1. 尝试获取网页元信息
    const pageMeta = await fetchPageMeta(url)
    console.log('网页元信息:', pageMeta)
    
    // 2. 构建 Prompt
    const prompt = buildPrompt(url, pageMeta.title, pageMeta.description)
    
    // 3. 调用 Gemini API
    const aiResponse = await callGeminiAPI(prompt)
    console.log('AI 原始返回:', aiResponse)
    
    // 4. 解析响应
    const posterData = parseAIResponse(aiResponse)
    console.log('解析后的数据:', posterData)
    
    // 5. 返回结果
    return NextResponse.json({
      success: true,
      data: posterData
    })
    
  } catch (error) {
    console.error('分析失败:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '分析失败，请重试',
        success: false 
      },
      { status: 500 }
    )
  }
}
