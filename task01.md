# Role (角色设定)
你是一名精通 Next.js 14 (App Router)、Tailwind CSS 和 AI集成的资深全栈工程师。你需要帮助我开发一款 **“周末放映室海报生成器”**。

# Project Goal (项目目标)
创建一个 Web 应用，允许用户输入视频链接，通过 Google Gemini AI 自动提取信息并生成文案，最后生成一张**严格符合指定设计规范**的海报图片供下载。

# Technical Stack (技术栈)
* **框架**: Next.js 14+ (App Router)
* **样式**: Tailwind CSS (核心要求：必须像素级还原参考设计)
* **AI 模型**: Google Gemini API (`@google/generative-ai`)
* **状态管理**: React Hooks (无需复杂状态库)
* **图片生成**: `html2canvas`
* **图标库**: `lucide-react`
* **二维码**: `qrcode.react`
* **组件库**: 推荐使用原生 Tailwind 或 `shadcn/ui` (如果需要快速搭建表单)

# Data Structure (数据结构)
请基于以下 TypeScript 接口构建应用状态：

```typescript
interface PosterData {
  videoUrl: string;       // 用户输入的原始链接
  coverImage: string;     // 海报顶部大图 (URL 或 Base64)
  title: string;          // 电影/视频标题
  tags: string[];         // 标签数组，如 ["国外动画短片", "奥斯卡获奖"]
  description: string;    // 剧情简介 (约60字)
  recommendation: string; // 推荐语 (约50字，金句风格)
  brandName: string;      // 底部品牌名，默认 "周末放映室"
  qrCodeUrl: string;      // 二维码内容，默认同 videoUrl
}

Visual Requirements (视觉还原重点)
这是最重要的部分。 海报预览区域（Preview Area）必须严格使用 Tailwind CSS 模拟以下设计风格（参考《鹬 Piper》海报）：

布局结构：单列卡片式布局，容器宽度固定（建议 375px 或 400px 用于预览），高度自适应。

Header (顶部区)：

全宽显示 coverImage，保持 16:9 或 4:3 比例。

悬浮标签：在图片区域的左下角（绝对定位），显示 tags。

标签样式：黑色半透明背景 (bg-black/60 或 bg-opacity-60)，白色文字，圆角胶囊状 (rounded-full)，文字较小，内边距适中。

Title Bar (标题区)：

紧接图片下方，纯黑背景 (bg-black)，无缝连接。

白色文字，字体加粗加大，左对齐，padding 适中。

Content Body (正文区)：

背景色为浅灰 (bg-zinc-50 或 #F9F9F9)。

简介：深灰色文字 (text-gray-600)，行高舒适 (leading-relaxed)，上下有 Padding。

推荐语 (Quote)：独立的视觉块。

左侧有一条竖线装饰 (border-l-4 border-gray-300)。

字体采用衬线体 (font-serif) 或斜体 (italic)。

字号略大，颜色较深，体现“金句”感。

Footer (底部品牌区)：

白色背景 (bg-white)。

布局：Flexbox 两端对齐。

左侧：显示品牌 Logo (可用红色圆形 icon 模拟) + 品牌名“周末放映室” (粗体) + Slogan “精选优质儿童动画短片” (小字灰阶，换行或并排)。

右侧：显示 qrCodeUrl 生成的二维码图片，尺寸约 64x64px。

Implementation Steps (分步执行计划)
请按照以下步骤一步步编写代码，每完成一步请等待我确认，不要一次性输出所有代码。

Step 1: 布局与静态UI (Scaffolding)
创建一个双栏布局页面：

左栏 (Editor)：放置表单控件（URL输入框、分析按钮、标题输入、多行文本域、标签管理、上传图片按钮）。

右栏 (Preview)：海报预览区域。

使用 Tailwind CSS 编写右栏的静态海报样式。请先使用硬编码的假数据（Mock Data） 来完美还原视觉设计。确保标签悬浮在图片上，引用语样式正确。

Step 2: Gemini API 集成 (Backend)
创建 API Route (app/api/analyze/route.ts)。

逻辑：

接收 url 参数。

(可选) 简单抓取网页 <title> 和 meta description。

调用 Google Gemini API。

Prompt 策略：告诉 Gemini 它是一个儿童内容专家。基于网页信息，生成一段“剧情简介(summary)”和一段“推荐理由(recommendation)”，并推荐 2-3 个标签。要求返回 JSON 格式。

Step 3: 前端逻辑交互 (Frontend Logic)
在左栏实现“智能分析”按钮的点击事件，调用 Step 2 的 API。

将 API 返回的数据回填到表单中，并更新右栏预览。

核心功能：实现“封面图上传”功能。允许用户点击按钮选择本地图片，读取为 DataURL 并替换海报顶部的默认图片。这是为了保证海报清晰度。

Step 4: 下载功能 (Download)
引入 html2canvas。

实现“下载海报”按钮。

配置重点：设置 scale: 3 以保证导出的 PNG 清晰度足够高；开启 useCORS: true 以防止跨域图片问题。

Execution Instruction (执行指令)
请先从 Step 1 开始，为我生成主页面的 UI 结构代码。 重点是右侧海报预览组件的 Tailwind CSS 样式还原。