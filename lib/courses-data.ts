/**
 * 课程目录:真实课程内容。
 * 每门课对应 courses/<slug>/,章节/课时在此定义。
 * 第一节免费试听,后续标 🔒 需会员。
 */

export type Lesson = {
  title: string;
  free: boolean;
  /** 课时正文(markdown) */
  content: string;
};

export type Chapter = {
  title: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  level: "入门" | "进阶" | "实战" | "职业";
  desc: string;
  instructor: string;
  hours: number;
  price: number; // 0=免费
  chapters: Chapter[];
};

export const COURSES: Course[] = [
  {
    slug: "ai-agent-basics",
    title: "AI Agent 入门:从会聊天到会做事",
    category: "智能体",
    level: "入门",
    desc: "什么是 Agent?它和普通 AI 对话有什么区别?这门课用 5 章、11 节课带你从零理解 Agent 的核心原理(规划/记忆/工具调用),并动手搭出你的第一个 Agent。",
    instructor: "林深",
    hours: 4,
    price: 0,
    chapters: [
      {
        title: "第一章:什么是 Agent",
        lessons: [
          {
            title: "1.1 从聊天到做事:Agent 的本质",
            free: true,
            content: `# 从聊天到做事:Agent 的本质

你每天都在和 AI 聊天——问它问题、让它写文案、帮你翻译。但你有没有想过:**为什么 AI 不能像助理一样,自己把一整套事情做完?**

比如你说"帮我调研竞品并写一份报告",普通的 AI 对话只能:
- 你问一步,它答一步
- 你得自己整理、自己决定下一步问什么
- 做到一半上下文太长,AI 忘了前面说过什么

而一个 **Agent(智能体)** 可以:
- 自己把任务拆成子步骤(先搜竞品→再对比功能→再总结→最后写报告)
- 自己决定每一步用什么工具(搜索引擎、文档工具、写作工具)
- 自己检查结果好不好,不好就重新来
- **全程不需要你在旁边逐步指挥**

## Agent 的定义

> Agent = **大脑(LLM)** + **规划(Planning)** + **记忆(Memory)** + **工具使用(Tool Use)**

这是 OpenAI 前研究员 Lilian Weng 在经典文章《LLM Powered Autonomous Agents》中给出的框架,也是业界最广泛引用的 Agent 定义。

我们来拆解这四个部分:

### 🧠 大脑(LLM)
就是大语言模型本身——ChatGPT、Claude、智谱 GLM 等。它负责理解你的需求、推理下一步做什么、生成文字和代码。没有 LLM,就没有 Agent。

### 📋 规划(Planning)
Agent 把大任务拆成小任务的能力。比如"写一份竞品分析报告"被拆成:
1. 搜索目标行业的主要竞品
2. 逐个分析竞品的核心功能
3. 对比优劣势
4. 撰写结构化报告

每完成一步,Agent 会检查结果——如果搜到的竞品不够多,它会自己再搜一轮。

### 💾 记忆(Memory)
- **短期记忆**:当前对话的上下文(有长度限制,聊太久会"忘记"开头)
- **长期记忆**:存在外部数据库或文件里,下次还能调用(比如你上周让 Agent 记住的项目背景)

### 🔧 工具使用(Tool Use)
Agent 调用外部 API 获取它本身不知道的信息:
- 搜索引擎(获取最新资讯)
- 代码执行器(运行 Python、查数据)
- 数据库(查公司内部数据)
- 文件系统(读写文档)

LLM 本身只知道训练数据里的内容,通过工具它才能获取实时信息、执行真实操作。

## 和普通 AI 对话的核心区别

| | 普通 AI 对话 | Agent |
|---|---|---|
| 你说什么 | "帮我写一段文案" | "帮我做一个竞品调研" |
| AI 怎么做 | 直接生成一段文字 | 自主拆解→逐步执行→检查→交付 |
| 需要你盯着吗 | 每一步都要你确认 | 大部分时间不用管,最后看结果 |
| 能用工具吗 | 不能(只有文字) | 能(搜索/代码/文件/API) |
| 出错了怎么办 | 你手动重来 | 自己反思、调整再试 |

## 为什么现在人人都在谈 Agent?

因为 **2023-2026 年,大模型 + 工具调用的技术栈成熟了**:
- OpenAI 推出 Function Calling(2023.6)
- Anthropic 推出 Tool Use
- 开源社区出现 AutoGPT、BabyAGI 等概念验证
- LangChain、CrewAI 等框架降低了开发门槛

这意味着:**不会写代码的普通人,也可以通过"描述需求"来指挥 AI 完成复杂任务**——前提是你理解 Agent 是怎么工作的,才能把指令下对。

## 下一节预告

下一节我们讲 **ReAct 模式**——Agent 最经典的思考框架,几乎所有现代 Agent 都基于它。你会看到 Agent 内部"想一步、做一步"的完整过程。

---
*参考:Lilian Weng,《LLM Powered Autonomous Agents》(2023)*`,
          },
          {
            title: "1.2 ReAct:Agent 是怎么思考的",
            free: true,
            content: `# ReAct:Agent 是怎么思考的

上一节我们说 Agent = 大脑 + 规划 + 记忆 + 工具。这一节我们看 Agent **内部到底怎么运转**——最经典的框架叫 **ReAct**(Reasoning + Acting)。

## ReAct 的核心循环

Agent 的每一次行动都遵循这个循环:

\`\`\`
思考(Reason) → 行动(Act) → 观察(Observe) → 思考 → 行动 → … → 最终回答
\`\`\`

举个例子,你问 Agent:"2026 年最受欢迎的 AI 编程工具是什么?"

**第 1 轮:**
- 🤔 思考:我需要搜索最新信息,因为我的训练数据可能过时了
- 🔧 行动:调用搜索引擎,搜索"2026 AI 编程工具 排名"
- 👁 观察:搜索结果显示 Cursor、GitHub Copilot、Windsurf 是热门

**第 2 轮:**
- 🤔 思考:搜索到了工具名称,但我需要更具体的数据来比较
- 🔧 行动:搜索"Cursor vs Copilot 2026 用户数"
- 👁 观察:Cursor 月活 500 万,Copilot 企业用户 200 万…

**第 3 轮:**
- 🤔 思考:现在信息足够了,可以给出答案
- 💬 最终回答:根据 2026 年的数据,Cursor 是目前最受欢迎的 AI 编程工具…

**这就是 Agent 和普通聊天的本质区别**:普通 AI 只做一步(直接回答),Agent 会多轮"思考→行动→观察"直到信息充分。

## 为什么 ReAct 有效?

1. **可追溯**:每一步思考都写出来,你能看到 Agent 为什么做某个决定
2. **可纠错**:如果观察到结果不对,Agent 会反思并调整策略
3. **可插拔**:工具(行动)可以按需替换——搜索引擎换成数据库,框架不变

## 你已经见过 ReAct 了

如果你用过 ChatGPT 的联网搜索、Claude 的搜索功能、或 Perplexity——它们的底层就是 ReAct:
- AI 决定要不要搜索(思考)
- 搜索并获取结果(行动)
- 根据结果组织回答(观察+回答)

**Claude Code、Cursor 等编程 Agent** 更是 ReAct 的典型:
- 思考:用户要我改这个 bug,我先读一下这个文件
- 行动:读取文件内容
- 观察:发现第 42 行有个空指针
- 思考:修复它,然后跑一下测试确认
- 行动:修改代码、运行测试
- 观察:测试通过,bug 修复了

## 动手试试

在下面用我们的 AI 改写工具,试着给 AI 一个**需要多步思考的任务**,观察它怎么拆解:

比如输入:"我有一段关于 AI Agent 的英文文章,帮我:1) 翻译成中文 2) 总结成 3 个要点 3) 改写成适合发朋友圈的口语化表达"

你会发现 AI 需要连续做多件事才能完成——这正是最简单的"Agent 任务"。

## 下一节预告

下一节我们讲 Agent 的**工具调用**——它是怎么知道该搜索还是该写代码的?Function Calling 的原理是什么?`,
          },
          {
            title: "1.3 工具调用:Agent 怎么知道该用什么",
            free: false,
            content: `# 工具调用:Agent 怎么知道该用什么

## Function Calling 的原理

2023 年 6 月,OpenAI 推出 Function Calling,让 LLM 可以"选择"调用预定义的函数。原理其实很简单:

1. **你告诉 AI 有哪些工具可用**(工具名 + 参数说明)
2. **AI 根据你的问题,选择合适的工具并填好参数**
3. **你的程序执行这个工具,把结果返回给 AI**
4. **AI 根据结果继续回答或调用下一个工具**

举个例子,你定义了一个搜索工具:
\`\`\`json
{
  "name": "search",
  "description": "搜索互联网获取最新信息",
  "parameters": {
    "query": "搜索关键词"
  }
}
\`\`\`

当用户问"今天上海天气怎么样",AI 会输出:
\`\`\`json
{"tool": "search", "parameters": {"query": "上海今天天气"}}
\`\`\`

你的代码收到这个指令,调用真正的搜索 API,把结果(晴,32°C)返回给 AI,AI 再用自然语言回答用户。

**关键**:AI 不是真的在"上网"——它只是在选择该调用哪个工具。工具的执行是你的代码做的。

## 为什么这很伟大?

因为它把 LLM 从"只会说话"变成了"能做事的调度中心":
- 接上搜索工具 → AI 能查最新资讯
- 接上数据库 → AI 能查公司数据
- 接上代码执行器 → AI 能跑数据分析
- 接上邮件 API → AI 能发邮件

**你只需要定义好工具,AI 自己决定什么时候用、怎么用。**

## MCP(Model Context Protocol):工具的 USB 接口

2024 年 Anthropic 推出 MCP,把工具调用标准化了:
- 以前:每个 AI 应用的工具接口都不一样,换一个就要重写
- 现在:MCP 定义了统一协议,工具写一次,所有支持 MCP 的 AI 都能用

类比:MCP 之于 AI 工具 = USB 之于电脑外设。你不需要为每台电脑买不同的鼠标——USB 接口统一了。

## 实际应用场景

| 场景 | Agent 用什么工具 |
|---|---|
| 市场调研 | 搜索引擎 + 网页抓取 + 数据分析 |
| 写代码 | 文件读写 + 代码执行 + 搜索文档 |
| 客服 | 知识库检索 + 订单系统 + 邮件发送 |
| 个人助理 | 日历 + 邮件 + 笔记 + 提醒 |

## 本章小结

- Agent = 大脑(LLM)+ 规划 + 记忆 + 工具
- ReAct 循环:思考→行动→观察,多轮直到答案充分
- 工具调用(Function Calling):AI 选择工具、填参数,代码执行后返回结果
- MCP 让工具接口标准化

下一章我们讲 **记忆系统**——Agent 怎么记住之前的对话和知识,为什么有时候它会"失忆"。`,
          },
        ],
      },
      {
        title: "第二章:Agent 的记忆系统",
        lessons: [
          {
            title: "2.1 短期记忆与长期记忆",
            free: false,
            content: `# 短期记忆与长期记忆

Agent 的记忆和人脑类似,分为短期和长期。

## 短期记忆(Context Window)

就是当前对话的上下文窗口——AI 能"看到"的最大文字量。

- GPT-4:约 128K tokens(~10万字)
- Claude:约 200K tokens(~15万字)
- GLM-4:约 128K tokens

看起来很大,但实际用起来:
- 一次长报告可能就 1-2 万字
- 聊了 50 轮后,早期内容会被"挤出去"
- 所以 Agent 会"忘记"你开头说过什么

## 长期记忆(外部存储)

为了解决"遗忘",Agent 把重要信息存到外部:
- **文件**:把用户偏好、项目背景写到本地文件
- **数据库**:结构化存储对话历史、知识条目
- **向量数据库**:按语义检索相关记忆(而不是精确匹配)

Claude Code 的 Memory 系统、ChatGPT 的 Memory 功能,都是这种方案。

## 向量检索:记忆是怎么被"想起来"的

当你问"我上次说过的那个项目",Agent 需要**从海量记忆里找到相关的那条**。它不是逐条翻找,而是:

1. 把你的问题变成一个向量(一串数字,代表语义)
2. 在向量数据库里找"距离最近"的记忆
3. 把找到的记忆注入当前对话

这就是 **RAG(检索增强生成)** 的核心——先检索,再生成。

## 实用建议

和 Agent 长期工作时:
- ✅ 让它把重要结论写到文件/笔记
- ✅ 新会话开始时,引用之前的记忆文件
- ❌ 不要指望它记住 50 轮前的细节
- ❌ 上下文快满时,主动总结并存储`,
          },
          {
            title: "2.2 RAG:让 AI 拥有你的知识库",
            free: false,
            content: `# RAG:让 AI 拥有你的知识库

RAG(Retrieval-Augmented Generation)是 Agent 最常见的落地场景之一。

## 为什么需要 RAG?

LLM 只知道训练数据里的内容:
- ❌ 不知道你公司的内部文档
- ❌ 不知道你上周做的项目
- ❌ 不知道你个人的笔记

RAG 让 AI 在回答前,先从**你的知识库**里检索相关内容,再基于这些内容回答。

## RAG 的三步流程

1. **索引**:把你的文档切分成小块,每块变成向量存入数据库
2. **检索**:用户提问时,把问题也变成向量,找到最相似的几块
3. **生成**:把找到的内容 + 用户问题一起给 AI,让它基于这些内容回答

## 生活中的例子

- **ChatGPT 的文件上传**:你上传一个 PDF,它基于内容回答——底层就是 RAG
- **企业客服 AI**:从产品手册里找答案再回复
- **Claude Code 读代码**:从项目文件里找到相关代码再分析

## 什么时候用 RAG vs 微调?

| | RAG | 微调(Fine-tuning)|
|---|---|---|
| 成本 | 低(只需建索引)| 高(需要训练)|
| 更新知识 | 随时更新文档 | 需重新训练 |
| 适合 | 动态知识(文档/数据)| 固定风格/格式 |
| 门槛 | 普通人可用 | 需要ML工程师 |

**大多数场景,RAG 就够了。**`,
          },
        ],
      },
      {
        title: "第三章:搭建你的第一个 Agent",
        lessons: [
          {
            title: "3.1 用 Coze/Dify 零代码搭 Agent",
            free: false,
            content: `# 用 Coze/Dify 零代码搭 Agent

不想写代码?你可以用可视化平台快速搭一个 Agent。

## 国内平台:Coze(扣子)

字节跳动出品,免费、中文友好:
1. 打开 coze.cn → 创建 Bot
2. 写"人设与回复逻辑"(系统提示词)
3. 添加插件(搜索/图片生成/代码运行…)
4. 添加知识库(上传你的文档)
5. 发布到微信/飞书/网页

**10 分钟就能搭出一个能搜索、能读文档的 Agent。**

## 海外平台:Dify

开源,可自部署:
- 界面更专业,支持复杂工作流
- 适合团队使用
- GitHub 90k+ star

## 该选哪个?

- 个人试水 → Coze(免费+中文)
- 团队使用 → Dify(可部署到自己的服务器)
- 要深度定制 → 下一节我们讲代码方案`,
          },
          {
            title: "3.2 用 Python 代码搭 Agent(进阶)",
            free: false,
            content: `# 用 Python 代码搭 Agent(进阶)

如果你会一点代码,用 Python 搭 Agent 更灵活。

## 最简 Agent:10 行代码

\`\`\`python
from anthropic import Anthropic

client = Anthropic()

tools = [{
    "name": "calculator",
    "description": "计算数学表达式",
    "input_schema": {
        "type": "object",
        "properties": {"expr": {"type": "string"}},
        "required": ["expr"]
    }
}]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "123 * 456 是多少?"}]
)
# AI 会返回 tool_use:要求调用 calculator(expr="123*456")
# 你的代码执行计算,把结果返回,AI 再给出最终回答
\`\`\`

## 框架选择

| 框架 | 适合 | 特点 |
|---|---|---|
| LangChain | 快速原型 | 生态大,但抽象层多 |
| CrewAI | 多 Agent 协作 | 简单直观 |
| Anthropic SDK | 完全控制 | 无黑盒,适合学习原理 |

**建议初学者**:先用原生 SDK 理解原理,再用框架提效。`,
          },
          {
            title: "3.3 实战:搭一个「日报生成 Agent」",
            free: false,
            content: `# 实战:搭一个"日报生成 Agent"

这节课我们把前面学的串起来,搭一个真正有用的 Agent。

## 需求

每天早上自动:
1. 搜索昨天 AI 领域的重要新闻
2. 从我的 GitHub 拉取昨天的 commit 记录
3. 汇总成一份日报,发到邮箱

## 拆解

| 步骤 | 工具 |
|---|---|
| 搜索新闻 | 搜索 API(Tavily/Brave)|
| 拉取 GitHub | GitHub API |
| 生成日报 | LLM(总结+格式化)|
| 发送邮件 | SMTP |

## 核心代码逻辑

\`\`\`python
# 伪代码
news = search("AI 新闻 昨天")
commits = github_api.get_commits(since="yesterday")
report = llm("根据以下信息生成日报:\\n" + news + commits)
send_email(to="me@company.com", body=report)
\`\`\`

加上定时任务(cron / GitHub Actions),每天自动执行。

## 你的练习

用 Coze 或 Dify 搭一个简化版:
1. 添加搜索插件
2. 提示词:"搜索今日AI新闻,总结成3-5条要点,带标题和一句话摘要"
3. 测试并优化提示词,让日报格式更好看

完成后你就拥有了自己的第一个 **真正有用的 Agent**。`,
          },
        ],
      },
      {
        title: "第四章:Agent 的未来与你的机会",
        lessons: [
          {
            title: "4.1 Agent 会取代人吗?",
            free: false,
            content: `# Agent 会取代人吗?

短回答:**不会取代人,但会取代不会用 Agent 的人。**

## Agent 擅长什么

- ✅ 重复性信息处理(搜索→整理→格式化)
- ✅ 多源数据汇总(从10个地方找信息拼成一份报告)
- ✅ 24/7 不知疲倦
- ✅ 初稿生成(代码/文案/报告的 v1 版)

## Agent 不擅长什么

- ❌ 需要判断力和品味的决策(选哪个方向?)
- ❌ 需要人际信任的场景(谈判/安抚客户)
- ❌ 需要承担责任的拍板(签合同/做投资)
- ❌ 创造性的突破(从 0 到 1 的想法)

## 正确的姿势

把 Agent 当作**能力放大器**:
- 你出想法和方向,Agent 出执行和细节
- 你判断"做什么",Agent 解决"怎么做"
- 你把控质量,Agent 提升速度

**会用 Agent 的人,产出是不会用的人的 5-10 倍。**`,
          },
          {
            title: "4.2 课程总结与下一步",
            free: false,
            content: `# 课程总结与下一步

## 你学到了什么

- ✅ Agent = LLM + 规划 + 记忆 + 工具
- ✅ ReAct 循环:思考→行动→观察
- ✅ Function Calling:AI 怎么调用工具
- ✅ 记忆系统:短期 vs 长期,RAG 原理
- ✅ 动手搭建:零代码(Coze/Dify)和代码方案
- ✅ 实战项目:日报生成 Agent

## 推荐的下一步

1. **用 Coze 搭一个你工作中最需要的 Agent**(本周)
2. **学习提示词工程**(我们有专门课程)
3. **学 Python 基础**(如果想代码方案)
4. **关注 MCP 生态**(工具会越来越丰富)

## 三猫云的后续课程

- 《提示词工程:让 AI 听懂你》
- 《RAG 实战:让 AI 拥有你的知识库》
- 《多 Agent 协作:CrewAI 实战》
- 《AI 编程助手:Cursor 从入门到精通》

**学完这门课,你已经超过了 95% 的 AI 用户。**`,
          },
        ],
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
