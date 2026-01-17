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
  return `为动画短片生成推荐文案（JSON格式）。

${pageTitle ? `标题：${pageTitle}` : ''}
${pageDescription ? `简介：${pageDescription}` : ''}

要求：
1. **title**: 中文标题，外文作品附原名，如"鹬 (Piper)"

2. **tags**: 2-3个标签
   - 类型：国外动画短片、皮克斯、迪士尼、吉卜力、独立艺术短片等
   - 荣誉：奥斯卡获奖、国际获奖等
   - 主题：成长、友情、勇气等

3. **description** (80字内): 精炼概括核心冲突/亮点，不流水账

4. **recommendation** (60字内): 从艺术风格、情感共鸣、适合年龄三个维度分析。自然口语化，禁用"教育意义"、"培养能力"、"懂得道理"等说教词汇

示例：
{
  "title": "鹬 (Piper)",
  "tags": ["国外动画短片", "皮克斯", "奥斯卡获奖"],
  "description": "小海鸟怕水却要学觅食。海浪一次次打来，它从躲避到观察螃蟹，发现了水下的奇妙世界。",
  "recommendation": "画面像珠宝般精致，每一帧都是壁纸。小鸟从害怕到好奇的转变，3岁孩子都能看懂。6分钟，不需要对白。"
}

返回JSON：`
}

/**
 * 尝试从 URL 获取网页元信息
 */
async function fetchPageMeta(url: string): Promise<{ title?: string; description?: string }> {
  try {
    // 设置超时
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
    
    // 提取 title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined
    
    // 提取 meta description
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
          content: '你是内容推荐专家。文案自然口语化，禁用说教词汇。返回JSON格式。'
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
