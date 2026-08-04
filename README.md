# 三猫云 · 企业官网

面向个人（C 端）的 AI 学习与生产力平台官网，以「卖课」为核心商业模式，AI 工具 / 个人服务 / 会员订阅为辅。整体采用**暗夜翡翠**高端绿色调，配**滚动驱动动效**与**鼠标跟踪互动**，共 **5 个跳转页**。

技术栈：**Next.js 16（App Router）+ TypeScript + Tailwind CSS v4 + GSAP + Lenis**。

## 本地预览

```bash
npm install
npm run dev      # http://localhost:3000
```

生产构建：

```bash
npm run build
npm start
```

## 页面

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页 | Hero（粒子 + 鼠标视差）、三大入口、精选课程横向钉滚、数据、口碑、CTA |
| `/courses` | 课程 | 分类筛选、课程网格、学习路径、讲师 |
| `/tools` | AI 工具 | 分类筛选、工具网格、使用场景 |
| `/membership` | 会员 | 月/年计费切换、三档套餐、权益、FAQ |
| `/about` | 关于我们 | 使命、数据、发展时间线、企业文化、团队 |

## 设计系统（暗夜翡翠，锁定色值）

```
bg        #06140E  墨绿黑（主背景）     primary   #0E7C5A  翡翠绿
bg2       #0A2118  深翡翠（次背景）     primary2  #13A06B  玉绿
accent    #5BF0B0  荧光薄荷（高光）     gold      #C9A86A  香槟金（克制点缀）
ink       #ECF5EF  暖白（正文）         dim       #8FA89D  弱化灰绿
line      rgba(91,240,176,.14) 描边      surface   rgba(14,124,90,.08) 玻璃面
```

字体：Sora（标题）+ Inter（正文）+ 系统中文（PingFang SC / 鸿蒙 / 微软雅黑）。

色值集中在 `app/globals.css` 的 `@theme`，改一处全站换肤。

## 动效

- **滚动驱动（GSAP ScrollTrigger）**：进场淡入上浮、章节固定 pin + 横向滚动、视差、数字计数、滚动进度条。
- **鼠标跟踪**：全局跟随绿色光晕、自定义光标（拖尾 + 悬停变形）、磁性按钮、Hero 3D 视差、卡片悬停辉光、Canvas 粒子网络（受光标引力）。
- **降级**：尊重系统「减少动态效果」；标签页后台时内容保持可见，回前台自动刷新触发点。

## 目录结构

```
app/
  layout.tsx            # 根布局：字体 / Loader / 光标 / 光晕 / 平滑滚动 / 导航 / 页脚
  page.tsx              # 首页
  courses|tools|membership|about/page.tsx
  globals.css           # 设计 token + 工具类 + 关键帧
components/
  Nav / Footer / Logo / Cursor / Spotlight / ScrollProgress
  SmoothScroll(Lenis) / Loader / Reveal / MagneticButton / Counter
  ParticleField / GlowCard / Icon / CourseCard / ToolCard
  SectionHeading / PageHeader / Timeline / Faq / PricingSection
  CoursesExplorer / ToolsExplorer
  home/ Hero / Entries / FeaturedCourses / Why / StatsBand / Testimonials / FinalCTA
lib/
  gsap.ts   # 集中注册 GSAP 插件
  data.ts   # 全站占位内容（课程/工具/会员/口碑/时间线…）
  site.ts   # 品牌信息 / 导航
  utils.ts
```

## 内容替换

所有课程、工具、价格、口碑、时间线、备案号、联系方式等都是**高质量占位**，集中在 `lib/data.ts` 与 `lib/site.ts`。接入真实信息时，只需改这两个文件（结构已对齐 UI）。Logo 为内联 SVG（`components/Logo.tsx`），可替换为 `public/` 下真实 logo。

## 说明

- 动画依赖浏览器 `requestAnimationFrame`。若预览面板处于后台（非焦点），动画会暂停但内容保持可见；切回前台即恢复并自动刷新。
- 默认图标 Logo 为矢量绘制；如有正式品牌 logo，替换 `Logo.tsx` 或放入 `public/` 即可。
