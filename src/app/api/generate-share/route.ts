/**
 * 生成分享文案 API 路由
 * 使用 Gemini API 生成适合社群分享的文案
 */

import { NextRequest, NextResponse } from 'next/server'

// Gemini API 配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'

/**
 * 构建分享文案生成 Prompt
 */
function buildSharePrompt(title: string, description: string, tags: string[]): string {
  return `为动画短片《${title}》写一段微信群分享文案。

【剧情简介】${description}
【标签】${tags.join('、')}

## 写作要求：
1. 字数：80-100字
2. 开头：用一个引发共鸣的小问题或悬念开头，吸引家长点击
3. 语气：轻松口语化，像和闺蜜/好友聊天推荐
4. 禁止：不要用"教育意义""培养能力""让孩子懂得"等说教词汇
5. 包含：提及画面/音乐特色
6. 观看门槛：用委婉方式表达，如"不需要对白""全家都能看""大人孩子都会喜欢"，避免写具体年龄如"3岁""5岁"
7. 结尾：自然收尾，可以号召一起看

## 参考范例：
"你家孩子怕黑吗？这部8分钟的奥斯卡短片太治愈了！小男孩跟着爸爸和爷爷去月亮上扫星星，画风梦幻得像在看一幅会动的油画。没有对白，小朋友也能看懂，但大人看完可能比孩子还感动。这周末找个安静的晚上，全家一起窝在沙发上看吧～"

## 直接输出文案（不要有任何前缀说明）：`
}

/**
 * 调用 Gemini API
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiUrl = `${GEMINI_BASE_URL}/chat/completions`
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
          content: '你是一位温暖的妈妈社群博主，擅长给家长朋友推荐优质动画。你的文案亲切自然，像和朋友聊天，从不说教。直接输出文案内容，不要有任何前缀。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      stop: null, // 不设置停止词，让模型自然结束
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API 错误:', errorText)
    throw new Error(`Gemini API 调用失败: ${response.status}`)
  }
  
  const data = await response.json()
  const choice = data.choices?.[0]
  const generatedText = choice?.message?.content
  const finishReason = choice?.finish_reason
  
  console.log('API finish_reason:', finishReason)
  
  if (!generatedText) {
    throw new Error('Gemini API 返回内容为空')
  }
  
  // 检查是否因为 token 限制被截断
  if (finishReason === 'length') {
    console.warn('警告：文案可能因 token 限制被截断')
  }
  
  // 确保返回完整内容，不截断
  const fullText = generatedText.trim()
  console.log('生成的完整文案长度:', fullText.length)
  console.log('生成的完整文案:', fullText)
  
  return fullText
}

/**
 * POST 请求处理
 */
export async function POST(request: NextRequest) {
  try {
    // 检查 API Key
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未配置 Gemini API Key' },
        { status: 500 }
      )
    }
    
    // 解析请求体
    const body = await request.json()
    const { title, description, tags } = body
    
    if (!title || !description) {
      return NextResponse.json(
        { error: '请提供标题和简介' },
        { status: 400 }
      )
    }
    
    console.log('开始生成分享文案:', title)
    
    // 构建 Prompt
    const prompt = buildSharePrompt(title, description, tags || [])
    
    // 调用 Gemini API
    const shareText = await callGeminiAPI(prompt)
    console.log('生成的分享文案:', shareText)
    
    // 返回结果
    return NextResponse.json({
      success: true,
      shareText: shareText
    })
    
  } catch (error) {
    console.error('生成分享文案失败:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '生成失败，请重试',
        success: false 
      },
      { status: 500 }
    )
  }
}
