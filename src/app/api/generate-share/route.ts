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
  return `为《${title}》写社群分享文案（100字内）。

剧情：${description}

要求：
1. 轻松口语化，像和朋友聊天
2. 用一个小问题或悬念开头吸引人
3. 禁用"教育意义"、"培养能力"等说教词汇
4. 可提及视觉/情感亮点
5. 必须完整句子

参考：还记得第一次看到大海时那种又怕又想靠近的感觉吗？这部6分钟的皮克斯短片就抓住了这个瞬间。小海鸟从怕水到爱上水下世界，画面美到每一帧都想截屏。适合周末和孩子窝在沙发上一起看。

生成：`
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
          content: '你是文案作者。口语化、感性、自然。100字内，完整句子，禁用说教词汇。'
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
