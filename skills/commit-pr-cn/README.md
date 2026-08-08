# 提交信息与 PR 描述生成器

> 读取 git diff,自动产出符合 Conventional Commits 规范的提交信息与可直接粘贴的 PR 描述。

## 这是什么

一个把"写 commit"和"写 PR 描述"这两件最耗心力的沟通工作变成工程产物的 skill。它封装了两套方法论——按变更意图对 diff 做逻辑分组、五维度破坏性变更识别——读入你当前的改动,产出语义清晰的分条 commit 命令和一份结构化的 PR 描述,reviewer 三十秒就能看懂改了什么、影响什么、要不要回滚。中英可选,开箱即用。

## 30 秒上手

1. **安装**:把整个 `commit-pr-cn/` 文件夹放到 `~/.claude/skills/` 下(或项目级 `.claude/skills/`)
2. **调用**:在 Claude Code 里输入 `/commit-pr-cn`(默认中文),或 `/commit-pr-cn en` 切英文
3. **拿结果**:skill 自动跑 `git diff` 读取改动,按分步流程产出 commit 命令 + PR 描述,复制即用

调用示例:在已 stage 改动的仓库里输入

```
/commit-pr-cn
```

skill 会读 `git diff --cached`,输出多条 `git commit` 命令和一段 PR 描述正文。

## 它能帮你做什么

- **按变更意图自动分组**:把"新功能 + 顺手修 bug + 格式化"这类混杂 diff 拆成语义清晰的多条 commit,而不是压成一条 `chore: update`
- **生成合规提交头**:严格套用 `type(scope): subject`,type 锁定 11 个标准值,subject 祈使句、≤50 字符,发版机器人不会误判
- **写 what & why 的 body**:解释决策而非复述代码,三年后回看依然能读懂
- **产出 reviewer 友好的 PR 描述**:一句话总结 → 改动组表 → 影响范围 → 测试说明 → 自检清单,字段顺序固定
- **主动高亮破坏性变更**:按 API / 数据结构 / 配置 / 依赖 / 行为五维扫描,命中即加 footer 标记 + PR 顶部警示 + 迁移说明
- **尊重团队既有约定**:优先读 `CLAUDE.md` 的提交规范,团队约定优先于个人偏好

## 适合谁

- **中文开发团队**——想要规范的中文 commit + 英文 type,但不想自己逐字抠格式
- **外包 / 乙方团队**——PR 描述需要让甲方 reviewer 快速看懂改动与影响
- **开源维护者**——需要英文 Conventional Commits 配合 semantic-release / release-please 自动发版
- **code review 严格的技术团队**——希望作者自检到位、reviewer 把注意力放在逻辑而非机械检查上

## 包含什么

- `SKILL.md`(227 行)——主文件:核心方法论(6 条)+ 分步工作流(Step 0–6)+ 边界避坑 14 条 + type 决策树 + 配置说明
- `templates/conventional-commits.md`(161 行)——Conventional Commits 完整规范:type 清单、subject 五条铁律、body/footer 写法、好坏示例对照
- `templates/pr-template.md`(130 行)——PR 描述完整模板(含简化版):字段顺序固定,直接复制填充
- `templates/breaking-change-checklist.md`(133 行)——破坏性变更五维扫描清单与迁移说明写法

(`LISTING.md` 是市场上架文案,日常使用可忽略。)

## 看看效果

输入 `/commit-pr-cn` 后,对"新增企业微信登录 + 修 token 刷新 + 统一缩进"的混合改动,产出形如:

```
# ===== Commit 命令(可直接粘贴到终端)=====
git add auth/wecom.ts auth/routes.ts
git commit -m "feat(auth): 支持企业微信登录" -m "走 OAuth2 code 换 session,不走原 JWT 流,避免双 token 体系冲突"

git add auth/refresh.ts
git commit -m "fix(auth): 修复 token 过期未刷新" -m "刷新窗口从 60s 提前到 300s,覆盖网络抖动场景"
```

PR 描述则产出固定字段顺序的正文:一句话总结、改动组表(type/scope/说明/涉及文件)、影响范围、测试说明、自检清单。完整模板见 `templates/pr-template.md`。

## 常见问题

- **要不要联网?** 不要。skill 只调用本地只读 git 命令(`git diff`/`log`/`status`/`show`/`branch`),不触发 WebSearch。
- **能不能自定义?** 能。在项目根放 `_config.json` 调语言/基线分支/scope 风格等(见下节);在 `CLAUDE.md` 里写提交规范,团队约定优先于个人偏好。
- **支持什么平台/语言?** 任何 git 仓库都能用。输出语言支持中文(默认,中文 subject + 英文 type)和英文(全英文);纯中文 subject 在启用 commitlint `subject-case` 规则的团队需改用混合写法,详见 SKILL.md 边界说明。

## 配置(可选)

无需配置即可开箱即用。若想微调,在项目根或用户主目录放一个 `_config.json`,常用字段:

| 字段 | 默认 | 作用 |
|---|---|---|
| `language` | `"zh"` | 输出语言,`"zh"` 或 `"en"` |
| `base_branch` | 自动推断 | PR 对比基线,如 `"main"`、`"develop"` |
| `commit_scope_style` | `"module"` | scope 风格:`module`/`package`/`none` |
| `squash_pr` | `false` | 是否合并成单条 commit(适配 squash-merge 团队) |
| `breaking_change_highlight` | `"emoji"` | 破坏性变更高亮:`emoji`/`bold`/`none` |
| `extra_types` | `[]` | 标准之外的额外 type,需在 `CLAUDE.md` 写明适用场景 |

不提供该文件就全部走默认。完整字段说明见 `SKILL.md` 的“配置”小节。

---

## 我的更多 Claude Skill

- [sql-helper](https://github.com/gudi565/sql-helper) — 把 DBA 的 SQL 纪律固化进每次回答
- [creator-skills-bundle](https://github.com/gudi565/creator-skills-bundle) — cold outreach + academic research(英文向)
- [claude-skills](https://github.com/gudi565/claude-skills) — 全集索引

原生中文店铺:小红书爆款 · 短视频脚本 · 公众号爆款 · 选题日历 · IP 定位 · 中文代码审查 · 慢 SQL · 技术方案
