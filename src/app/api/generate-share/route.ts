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
 * 注意：AI 只输出正文主体（问题开头 + 推荐内容），
 * 开场白、片名、标签由前端模板负责拼接
 */
function buildSharePrompt(title: string, description: string, tags: string[]): string {
  return `为动画短片《${title}》写一段微信群推荐正文。

【剧情简介】${description}
【标签】${tags.join('、')}

## 写作要求：
1. 字数：50-70字，简短精炼，必须写完整
2. 开头：用一个引发共鸣的小问题或有趣悬念开头，吸引家长点击
3. 语气：轻松口语化，像和好友聊天推荐
4. 禁止：不要用"教育意义""培养能力""让孩子懂得"等说教词汇
5. 提一个亮点即可（画面或音乐其一），不要面面俱到
6. 观看门槛用委婉方式表达（如"不需要对白""全家都能看"），避免写具体年龄

## 注意：
- 只输出推荐正文本身，不要包含片名、标签、开场白或任何前缀
- 正文必须是完整的一段话，有头有尾，不超过70字

## 参考范例（输出格式示例，约60字）：
在玩具眼里，咱家娃是啥样？这部皮克斯奥斯卡短片就演给你看：崭新小锡兵遇上口水横流的"巨型"宝宝，又好笑又真实，配乐还特别逗。

## 直接输出推荐正文（不要有任何前缀）：`
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
      // gemini-2.5 系列为思考型模型，思考过程与正文共用 token 预算，
      // 需留足空间（思考 + 120字正文），否则会在 finish_reason=length 处截断
      max_tokens: 4096,
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
  
  const fullText = generatedText.trim()
  console.log('API finish_reason:', finishReason, '| 文案长度:', fullText.length)
  console.log('生成的文案:', fullText)
  
  // 检查是否因 token 限制被截断，截断时直接报错让前端提示重试
  if (finishReason === 'length') {
    console.error('文案被截断（finish_reason=length），当前内容:', fullText)
    throw new Error('文案生成不完整，请点击重新生成')
  }
  
  // 检查文案是否以完整句子结尾（应以句号、感叹号、波浪号等结束）
  const lastChar = fullText.slice(-1)
  const validEndings = ['。', '！', '～', '~', '吧', '呢', '啊', '哦', '咯', '嗯', '！', '.', '!']
  if (fullText.length > 0 && !validEndings.includes(lastChar)) {
    console.warn('文案可能不完整，末尾字符:', lastChar, '| 内容:', fullText)
    throw new Error('文案生成不完整，请点击重新生成')
  }
  
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
