/**
 * 技能(Skill)目录:9 个真实在售的 AI 技能。
 * 每个 skill 对应 skills/<slug>/SKILL.md(技能说明/方法论),由后端 /api/ai/skill 调 LLM 运行。
 */
export type Skill = {
  slug: string;
  name: string;
  category: "内容创作" | "开发者工具";
  tagline: string;
  price: number;
  inputLabel: string;
  inputPlaceholder: string;
  icon: string;
  from: string;
  to: string;
};

export const SKILL_CATEGORIES = ["全部", "内容创作", "开发者工具"] as const;

export const SKILLS: Skill[] = [
  {
    slug: "xiaohongshu-hit",
    name: "小红书爆款生产线",
    category: "内容创作",
    tagline: "7 公式 + 限流词自检,主题进去、成稿出来",
    price: 59,
    inputLabel: "笔记主题 / 产品",
    inputPlaceholder: "例:敏感肌平价防晒,适合学生党,夏天军训用",
    icon: "image",
    from: "#0e7c5a",
    to: "#5bf0b0",
  },
  {
    slug: "short-video-script",
    name: "短视频脚本工厂",
    category: "内容创作",
    tagline: "3 秒留人、完播带货,照着就能拍",
    price: 69,
    inputLabel: "视频主题 / 产品",
    inputPlaceholder: "例:30 秒种草一款平价蓝牙耳机",
    icon: "video",
    from: "#13a06b",
    to: "#c9a86a",
  },
  {
    slug: "wechat-viral-article",
    name: "公众号爆款长文",
    category: "内容创作",
    tagline: "输入主题,直接出可发布的成稿",
    price: 49,
    inputLabel: "文章主题",
    inputPlaceholder: "例:普通人如何用 AI 做副业,月入 5000",
    icon: "pen",
    from: "#0a5c36",
    to: "#13a06b",
  },
  {
    slug: "content-calendar",
    name: "选题永动机日历",
    category: "内容创作",
    tagline: "一周 7 篇选题一次排完,复制进表格就能用",
    price: 49,
    inputLabel: "账号定位 / 行业",
    inputPlaceholder: "例:做宝妈辅食赛道的小红书号",
    icon: "book",
    from: "#0e7c5a",
    to: "#5bf0b0",
  },
  {
    slug: "ip-persona-builder",
    name: "IP 锚点 · 个人 IP 定位",
    category: "内容创作",
    tagline: "先拆定位,再谈涨粉变现",
    price: 99,
    inputLabel: "你的情况 / 想做什么",
    inputPlaceholder: "例:我是做财务的,想做个副业个人 IP 但不知道定位",
    icon: "users",
    from: "#0e7c5a",
    to: "#c9a86a",
  },
  {
    slug: "commit-pr-cn",
    name: "commit-pr-cn · 中文提交与 PR",
    category: "开发者工具",
    tagline: "把 diff 拆成 30 秒看懂的中文提交和 PR",
    price: 19,
    inputLabel: "git diff / 改动说明",
    inputPlaceholder: "把你的 git diff 粘进来(或描述改了啥)",
    icon: "code",
    from: "#0a5c36",
    to: "#13a06b",
  },
  {
    slug: "code-review-cn",
    name: "中文代码审查官 · 代码挑刺师",
    category: "开发者工具",
    tagline: "四维扫描,专挑英文 review 抓不到的中文坑",
    price: 39,
    inputLabel: "要审查的代码",
    inputPlaceholder: "把要 review 的代码粘进来",
    icon: "sparkles",
    from: "#0e7c5a",
    to: "#5bf0b0",
  },
  {
    slug: "sql-optimizer",
    name: "慢 SQL 急诊室",
    category: "开发者工具",
    tagline: "把慢 SQL 从 10 秒降到 50 毫秒",
    price: 39,
    inputLabel: "慢 SQL 语句",
    inputPlaceholder: "把跑得慢的 SQL 粘进来(附表结构更佳)",
    icon: "layers",
    from: "#13a06b",
    to: "#0e7c5a",
  },
  {
    slug: "prd-to-tech-design",
    name: "方案九段 · 需求转技术设计",
    category: "开发者工具",
    tagline: "10 分钟出评审一次过的技术方案",
    price: 99,
    inputLabel: "需求描述",
    inputPlaceholder: "例:做一个用户积分系统,签到/任务/兑换",
    icon: "target",
    from: "#0e7c5a",
    to: "#c9a86a",
  },
];

export function getSkill(slug: string): Skill | undefined {
  return SKILLS.find((s) => s.slug === slug);
}
