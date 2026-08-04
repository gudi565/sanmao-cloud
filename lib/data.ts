/* ============================================================
   全站占位内容（课程 / 工具 / 会员 / 口碑 / 时间线 等）
   后续接入真实数据时，只需替换本文件。
   ============================================================ */

export type Level = "入门" | "进阶" | "实战" | "职业";

export type Course = {
  slug: string;
  title: string;
  category: string;
  level: Level;
  desc: string;
  lessons: number;
  hours: number;
  price: number; // 0 = 免费
  instructor: string;
  from: string;
  to: string;
};

export const COURSE_CATEGORIES = [
  "全部",
  "入门",
  "进阶",
  "实战",
  "职业",
  "AI 绘画",
  "AI 办公",
];

export const COURSES: Course[] = [
  {
    slug: "ai-start",
    title: "AI 零基础入门",
    category: "入门",
    level: "入门",
    desc: "从认识大模型到写出第一条高质量提示词，0 基础也能 7 天上手 AI。",
    lessons: 24,
    hours: 6,
    price: 0,
    instructor: "林深",
    from: "#0e7c5a",
    to: "#5bf0b0",
  },
  {
    slug: "chatgpt-workflow",
    title: "ChatGPT 实战工作流",
    category: "实战",
    level: "实战",
    desc: "把 AI 嵌入你的日常办公流，写作、总结、数据分析一条龙提效。",
    lessons: 36,
    hours: 10,
    price: 299,
    instructor: "苏野",
    from: "#13a06b",
    to: "#0e7c5a",
  },
  {
    slug: "ai-painting",
    title: "AI 绘画：Midjourney 与 SD",
    category: "AI 绘画",
    level: "进阶",
    desc: "从提示词构图到模型微调，系统掌握主流 AI 绘画工具与商用出图。",
    lessons: 42,
    hours: 14,
    price: 399,
    instructor: "白栀",
    from: "#0a5c36",
    to: "#5bf0b0",
  },
  {
    slug: "ai-office",
    title: "AI 办公效率飞升",
    category: "AI 办公",
    level: "实战",
    desc: "PPT、Excel、文档、邮件——用 AI 把重复劳动压缩成几分钟。",
    lessons: 30,
    hours: 8,
    price: 259,
    instructor: "周牧",
    from: "#0e7c5a",
    to: "#13a06b",
  },
  {
    slug: "ai-video",
    title: "AI 短视频与自媒体",
    category: "实战",
    level: "实战",
    desc: "从脚本到成片，用 AI 工具一个人搞定一条爆款短视频生产线。",
    lessons: 38,
    hours: 12,
    price: 349,
    instructor: "夏萤",
    from: "#13a06b",
    to: "#c9a86a",
  },
  {
    slug: "ai-coding",
    title: "AI 编程助手实战",
    category: "职业",
    level: "职业",
    desc: "Cursor / Copilot 全流程，让 AI 帮你写代码、改 Bug、做项目。",
    lessons: 46,
    hours: 16,
    price: 499,
    instructor: "陈舟",
    from: "#0a5c36",
    to: "#13a06b",
  },
  {
    slug: "ai-agent",
    title: "搭建你的 AI 智能体",
    category: "进阶",
    level: "进阶",
    desc: "从工作流到智能体，零代码搭出能自动做事的私人 AI 助手。",
    lessons: 34,
    hours: 11,
    price: 399,
    instructor: "林深",
    from: "#0e7c5a",
    to: "#5bf0b0",
  },
  {
    slug: "ai-side-income",
    title: "AI 副业变现指南",
    category: "职业",
    level: "职业",
    desc: "拆解 10+ 真实变现路径，把学到的 AI 能力变成持续收入。",
    lessons: 28,
    hours: 9,
    price: 459,
    instructor: "苏野",
    from: "#13a06b",
    to: "#c9a86a",
  },
];

export type Tool = {
  name: string;
  category: string;
  desc: string;
  icon: string;
  hot?: boolean;
  from: string;
  to: string;
};

export const TOOL_CATEGORIES = [
  "全部",
  "写作",
  "图像",
  "办公",
  "学习",
  "视频",
  "编程",
  "音频",
];

export const TOOLS: Tool[] = [
  { name: "AI 写作助手", category: "写作", desc: "公文、文案、邮件一键生成与润色", icon: "pen", hot: true, from: "#0e7c5a", to: "#5bf0b0" },
  { name: "AI 绘画生成", category: "图像", desc: "文字描述秒出高质量插画与设计图", icon: "image", hot: true, from: "#13a06b", to: "#c9a86a" },
  { name: "智能 PPT", category: "办公", desc: "一句话主题，自动生成精美演示文稿", icon: "briefcase", from: "#0a5c36", to: "#13a06b" },
  { name: "AI 学习伙伴", category: "学习", desc: "个性化讲解、 quiz 与知识图谱陪练", icon: "book", hot: true, from: "#0e7c5a", to: "#5bf0b0" },
  { name: "短视频脚本", category: "视频", desc: "爆款选题、分镜与口播文案自动产出", icon: "video", from: "#13a06b", to: "#0e7c5a" },
  { name: "AI 代码助手", category: "编程", desc: "补全、解释、重构、找 Bug 全流程", icon: "code", hot: true, from: "#0a5c36", to: "#5bf0b0" },
  { name: "智能翻译", category: "写作", desc: "保留语境与语气的高质量多语种翻译", icon: "globe", from: "#0e7c5a", to: "#13a06b" },
  { name: "语音转写", category: "音频", desc: "会议、课程实时转文字，自动总结", icon: "mic", from: "#13a06b", to: "#c9a86a" },
  { name: "AI 思维导图", category: "学习", desc: "把任何主题秒拆成结构化思维导图", icon: "layers", from: "#0a5c36", to: "#13a06b" },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  { name: "陈同学", role: "大三学生", rating: 5, quote: "零基础入门课讲得特别清楚，一周后我就能用 AI 帮自己写报告、做 PPT 了，效率翻倍。" },
  { name: "林女士", role: "自媒体博主", rating: 5, quote: "短视频那门课直接改变了我的产出节奏，现在一个人就是一支内容团队。" },
  { name: "王先生", role: "职场新人", rating: 5, quote: "AI 办公课救了我的命，那些重复的表格和文档，现在几分钟就搞定。" },
  { name: "赵女士", role: "设计从业者", rating: 5, quote: "AI 绘画课让我从提示词到出图都心里有数，接单效率明显变高。" },
  { name: "李同学", role: "转行求职者", rating: 5, quote: "跟着编程课做完项目就拿到了面试机会，AI 真的能改变职业路径。" },
  { name: "周先生", role: "小生意主理人", rating: 5, quote: "副业变现课给了我很多可落地的思路，第一个月就回本了。" },
];

export type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  tagline: string;
  highlight?: boolean;
  features: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    name: "体验版",
    monthly: 0,
    yearly: 0,
    tagline: "先免费体验，再决定升级",
    features: ["每月 3 门试听课", "基础 AI 工具 5 次/天", "社区只读权限", "学习进度记录"],
    cta: "免费开始",
  },
  {
    name: "进阶版",
    monthly: 39,
    yearly: 348,
    tagline: "系统学习 + 工具畅用，最受欢迎",
    highlight: true,
    features: ["全部 80+ 课程畅学", "AI 工具不限次使用", "专属学习社群", "每月 2 场直播答疑", "学习路径定制", "课程证书"],
    cta: "立即升级",
  },
  {
    name: "旗舰版",
    monthly: 99,
    yearly: 888,
    tagline: "1 对 1 陪伴，把 AI 用到极致",
    features: ["进阶版全部权益", "1 对 1 导师辅导", "定制智能体搭建", "新品工具优先体验", "线下沙龙名额", "商用授权许可"],
    cta: "申请旗舰",
  },
];

export type Milestone = { year: string; title: string; desc: string };

export const MILESTONES: Milestone[] = [
  { year: "2021", title: "三猫云成立", desc: "几个相信「AI 应该属于每个人」的人，从一门免费公开课开始。" },
  { year: "2022", title: "工具平台上线", desc: "把课程里用到的 AI 工具整合成一站式平台，学员累计突破 1 万。" },
  { year: "2023", title: "系统课程体系", desc: "建成覆盖入门到职业的完整学习路径，付费学员超过 5 万。" },
  { year: "2024", title: "AI 智能体生态", desc: "推出个人智能体搭建能力，让每个人拥有专属 AI 助手。" },
  { year: "2025", title: "服务百万用户", desc: "累计服务超 120 万个人用户，成为中国主流的 AI 学习平台之一。" },
];

export const VALUES = [
  { icon: "sparkles", title: "普惠", desc: "抹平技术门槛，让普通人也能用上最前沿的 AI。" },
  { icon: "target", title: "实战", desc: "不讲空话，每一节课都能马上用在工作与生活里。" },
  { icon: "users", title: "陪伴", desc: "社群与导师一路同行，学到一半放弃的事不会发生。" },
  { icon: "globe", title: "开放", desc: "拥抱开源与生态，和用户一起把平台越做越好。" },
];

export type Scenario = { title: string; desc: string; icon: string };

export const SCENARIOS: Scenario[] = [
  { title: "学习充电", desc: "知识图谱、个性讲解、自动 quiz，把 AI 变成你的私教。", icon: "book" },
  { title: "内容创作", desc: "图文、短视频、播客脚本，一个人就是一支创作团队。", icon: "pen" },
  { title: "办公提效", desc: "PPT、文档、表格、会议纪要，告别加班的重复劳动。", icon: "briefcase" },
  { title: "副业变现", desc: "把 AI 能力打包成服务与产品，开启第二份收入。", icon: "bolt" },
];

export const STATS = [
  { to: 120, suffix: "万+", label: "累计个人用户" },
  { to: 80, suffix: "+", label: "精品课程" },
  { to: 30, suffix: "+", label: "实用 AI 工具" },
  { to: 96, suffix: "%", label: "学员好评率" },
];

export const FAQ = [
  { q: "零基础能学会吗？", a: "完全可以。我们有专门的零基础入门课，从「AI 是什么」讲起，配合实操练习，7 天即可上手。" },
  { q: "课程是怎么更新的？", a: "AI 进展很快，我们的课程每月迭代，会员可免费学习所有新增与更新内容。" },
  { q: "会员和单买课程有什么区别？", a: "会员可畅学全部课程并无限使用 AI 工具，性价比远高于单买；单买适合只想学某一门的同学。" },
  { q: "学完有证书吗？", a: "进阶版及以上会员完成课程后可获得学习证书，部分课程提供项目作品集指导。" },
  { q: "可以退款吗？", a: "我们提供 7 天无理由退款保障，先试学，不满意全额退。" },
];

export const PARTNERS = ["云栖教育", "智算中心", "开源中国", "极客时间", "图灵课堂", "掘金"];
