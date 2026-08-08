# 中文提交信息与 PR 描述生成器 · commit-pr-cn
> 把 diff 拆成 reviewer 30 秒看懂的提交和 PR

## 🎯 一句话介绍

读你的 `git diff`,自动产出符合 Conventional Commits 规范的提交信息 + 可直接粘贴的 PR 描述(改动摘要 / 影响范围 / 破坏性变更 / 测试说明 / 自检清单)。比"让 AI 自由发挥"强在:它封装了一套固定的分组算法、破坏性变更五维扫描和 type 决策树——同一个 PR 会被拆成语义清晰的多条 commit,reviewer 能按组 review、精确 cherry-pick 或 revert,发版机器人也不会因为 type 写错而误判版本号。

## 👤 谁该买

- **中文开发者 / 个人独立开发**:每天写完代码最烦的就是想"commit message 该怎么写",这套直接喂 diff 出成稿,省下反复纠结的时间。
- **外包 / 乙方团队**:客户要求"提交规范、PR 要有说明",但又没人带教;用它交出去的东西第一眼就显得专业,减少返工。
- **开源维护者**:PR 描述太糙会被 contributor 反复追问,这套模板自带影响范围、测试说明、破坏性变更迁移三段,降低沟通成本。
- **code review 严格的技术团队**:新人提交质量参差,用它统一提交与 PR 的"出厂标准",reviewer 把注意力放在逻辑而不是机械检查。
- **需要自动 changelog / 语义化发版的项目**:type 写错一次,release-please / semantic-release 就会误判版本号;这套把 type 选择固化成决策树,杜绝自造 type。

## 📦 你会得到什么

- **`SKILL.md` 主文件**:6 章核心方法论 + 7 步工作流程(Step 0–6) + 14 条边界避坑(覆盖 monorepo、squash merge、pre-commit hook、CRLF、0.x 发版等真实坑)。读完即懂,不读也能用。
- **`templates/conventional-commits.md`**:Conventional Commits 完整规范,固定 11 个 type 清单 + subject 五条铁律 + 好/坏示例对比 + `!` 简写写法。一份给团队当规范文档都够用。
- **`templates/pr-template.md`**:10 段式 PR 描述模板(完整版 + 小改动简化版),字段顺序固定,复制即填。
- **`templates/breaking-change-checklist.md`**:破坏性变更五维扫描清单 + 双重标记规范 + 迁移说明"老用法→新用法→过渡策略"三段写法 + 5 个常见翻车点。

## ✨ 核心卖点

- **中文优先,本土场景**:默认中文 subject + 英文 type(工具兼容),举例全是企业微信登录、auth 模块、用户接口这种中文团队真实场景。市面上同类 skill 绝大多数是英文导向,这个为中文开发者调校。
- **按"变更意图"分组,而非按文件堆砌**:一个 PR 同时改了功能 + 顺手修 bug + 格式化,它会拆成 `feat(auth): 支持企业微信登录`、`fix(auth): 修复 token 过期`、`style: 统一缩进` 三条独立 commit。你可以按组 review、按组 cherry-pick——这点比"堆 diff"的写法高一个段位。
- **破坏性变更主动高亮**:固定五维扫描(API 签名 / 数据结构 / 配置 / 依赖大版本 / 行为语义),命中就在 commit footer + PR 描述顶部双重标记,并附"老用法→新用法→过渡策略"迁移表。漏标一次,下游用户升级就炸雷——这是它最值钱的能力。
- **读团队约定,不与现状冲突**:会优先读项目 `CLAUDE.md` 里的提交规范和 `_config.json` 的语言 / 基线分支配置,而不是强加一套风格。团队用 squash merge、用 gitmoji、用 `init` type,都能配置适配。
- **type 决策树,杜绝"chore 万能抽屉"**:内置一张"改动是为了?"决策树,拿不准就用更窄的 type。这对依赖自动发版的项目是刚需——type 写错,版本号就错。
- **覆盖真实工程边界**:monorepo 多 package 发版、pre-commit hook 改文件、CRLF/LF 混用、纯中文 subject 在 commitlint 下的兼容性、0.x.x 阶段的放宽规则——14 条避坑都是踩过坑才写得出来的。

## 📝 真实产出示例

把你的 diff 喂进去,出来的东西长这样(可直接复制粘贴):

**Commit 命令(粘到终端)**:

```bash
git add auth/wecom.ts auth/routes.ts
git commit -m "feat(auth): 支持企业微信登录" -m "走 OAuth2 code 换 session,不走原 JWT 流,避免双 token 体系冲突。企业微信回调新增 POST /auth/wecom/callback。"

git add auth/refresh.ts
git commit -m "fix(auth): 修复 token 过期未刷新" -m "拦截器原先只在 401 时刷新,401 前的过期窗口未覆盖。改为根据 expiresIn 主动预刷新。"
```

**PR 描述(粘到 PR)**:

```markdown
## 一句话总结
本 PR 支持企业微信登录,并修复 token 过期未主动刷新的问题。

## 改动组表
| # | type | scope | 说明 | 涉及文件 |
|---|---|---|---|---|
| 1 | feat | auth | 支持企业微信登录 | auth/wecom.ts, auth/routes.ts |
| 2 | fix | auth | 修复 token 过期未刷新 | auth/refresh.ts |

## 影响范围
- **接口**:POST /auth/wecom/callback(新增)
- **配置**:WECOM_CLIENT_ID、WECOM_CLIENT_SECRET(新增)

## ⚠️ 破坏性变更
**老用法 → 新用法 → 过渡策略**:
| 维度 | 老用法 | 新用法 | 迁移说明 |
|---|---|---|---|
| 配置项 | `AUTH_JWT_SECRET` | `AUTH_SESSION_SECRET` | 启动时读老变量并打 deprecation 日志,7 天后移除 |

## 自检清单
- [x] 已运行测试套件且全绿
- [x] 已运行类型检查
- [x] commit 信息符合 Conventional Commits 规范
```

(以上示例摘自 skill 内置的企业微信登录场景,买完你产出的就是这种成稿。)

## 🚀 怎么用

1. 把 `commit-pr-cn` 整个文件夹放到 `~/.claude/skills/` 下。
2. 在 Claude Code 里本地改完代码后,输入 `/commit-pr-cn`(可选参数 `zh` 或 `en`,默认中文)。
3. 拿到两块可直接复制的内容:上面是 commit 命令粘到终端,下面是 PR 描述粘到 GitHub / GitLab。

## 💰 价格建议:¥19

理由:一顿外卖的钱,换的是你以后每一次提交、每一个 PR 都不用从零想措辞——按一个开发者每周写 5 次 commit message、每次省 3 分钟算,一周回本,长期纯赚。同时它不像重型 skill 动辄百元,¥19 落在"闭眼可买"的心理区间,适合作为店铺引流款让你先体验质量。

## 🏷️ 搜索标签

`提交规范` · `commit message` · `PR 描述` · `Conventional Commits` · `中文开发` · `code review` · `git 工作流` · `语义化版本`
