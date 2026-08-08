---
name: commit-pr-cn
description: >
  提交信息与PR描述生成器——读取 git diff,自动产出符合 Conventional Commits 规范的提交信息与可直接粘贴的 PR 描述(改动摘要/影响范围/破坏性变更/测试说明/自检清单),中英可选。
  封装变更逻辑分组与破坏性变更识别两套方法论,让一个 PR 拆成多条语义清晰的 commit,reviewer 三十秒看懂改了什么、影响什么、要不要回滚。
  Triggers on: "commit", "提交", "commit message", "PR描述", "pr description", "conventional commits", "变更说明", "pull request", "提交规范".
  适合:中文开发者、外包团队、开源维护者、code review 严格的技术团队、需要自动生成 changelog 的项目。
user-invocable: true
argument-hint: "[zh|en],默认 zh"
allowed-tools: "Read, Edit, Glob, Grep, Bash(git diff*), Bash(git log*), Bash(git status*), Bash(git show*), Bash(git branch*), Bash(git rev-parse*), Bash(git config*), Bash(git stash list*)"
version: "1.0.0"
category: 工程效率/DevOps
---

# 提交信息与 PR 描述生成器

把"写 commit"和"写 PR 描述"这两件最耗心力的沟通工作,从主观判断变成可复用的工程产物。它解决三类典型痛点:commit 散漫语义不清导致 changelog 自动化失败、PR 描述只堆 diff 让 reviewer 反复追问、破坏性变更藏在角落上线后炸雷。

核心价值在于**结构化方法论**:不靠灵光一现的措辞,而是用一套固定的分组规则、模板和清单,把任意 diff 翻译成"机器可消费 + 人类可读"的提交记录。适合在以下场景调用:本地改完代码准备提交、push 前生成多条 commit、写 PR 描述、做发版前的 commit 体检。

## 核心方法论

### 1. Conventional Commits 是契约,不是建议

提交头格式严格遵循 `type(scope): subject`。语义化版本工具(standard-version / semantic-release / release-please)直接消费 type 决定版本号:`feat` → minor,`fix`/`perf` → patch,`BREAKING CHANGE` → major。一个写错的 type 就会让发版机器人误判,代价远比看起来大。所以**type 必须从清单里选,不能自造**;subject 必须祈使句、首字母不大写、结尾无句号、≤50 字符。详见 `templates/conventional-commits.md`。

### 2. 按逻辑变更分组,而不是按文件堆砌

一个 PR 同时改了"新功能 + 顺手修 bug + 格式化"是常态,但压成一条 `chore: update` 等于把信号碾成噪音。正确做法是把 diff 文件按**变更意图**归类成若干逻辑组,每组对应一条独立 commit。例如一个 PR 拆成三条:`feat(auth): 支持企业微信登录`、`fix(auth): 修复 token 过期未刷新`、`style: 统一缩进`。这样 reviewer 可以按 commit review,cherry-pick、revert 都能精确到语义。

分组原则:**同 intent、同影响范围、同回滚粒度**的改动合为一条;一旦混入不同意图就拆开。PR 描述则用一张"改动组表"汇总这些 commit。

### 3. PR 描述是 reviewer 的导航地图,不是 changelog 复述

reviewer 打开 PR 时的三个问题:**这是什么改动 / 影响哪里 / 我该怎么验**。PR 描述必须按这个顺序回答,而不是把 commit 列表再贴一遍。一句话总结在前(让 reviewer 5 秒决定看不看)、影响范围在中(决定要不要叫相关方)、测试说明在后(决定要不要亲自跑)。模板见 `templates/pr-template.md`。

### 4. 破坏性变更必须主动高亮,不能让 reviewer 自己嗅探

任何向后不兼容的改动都要在 commit footer 与 PR 描述顶部双重标记。reviewer 不应靠肉眼对比函数签名去发现破坏。扫描维度固定五类:API 签名、数据结构/字段、配置项、依赖大版本、行为语义。命中即高亮(⚠️ + 加粗),并附**迁移说明**(老用法 → 新用法 + 过渡策略)。详见 `templates/breaking-change-checklist.md`。

### 5. body 写 what & why,绝不写 how

commit body 的价值是解释"为什么这么改"和"改了什么效果",而不是复述代码怎么实现——代码本身就是 how 的最佳描述。反例:`修改了 auth.ts 第 42 行`;正例:`企业微信登录走的是 OAuth2 code 换 session,不走原 JWT 流,避免双 token 体系冲突`。why 写清楚,三年后回看依然能读懂决策。

### 6. 自检清单是质量底线,不是装饰

每个 PR 在合并前必须走过这张清单:测试、类型检查、lint、文档、迁移、兼容性。清单的价值不是流程仪式,而是**降低 reviewer 的信任成本**——作者自检过,reviewer 才能把注意力放在逻辑而非机械检查上。清单写在 PR 描述末尾,逐条勾选。

## 工作流程

### Step 0:读取配置约定

优先读取两类配置,避免与团队既有约定冲突:

1. **`CLAUDE.md`**(项目根目录):查找"提交规范""commit convention""commitlint""发版"等关键词,识别团队约定的 type 清单、scope 命名、是否启用 emoji、是否要求关联 issue。
2. **`_config.json`**(项目根目录或用户主目录):读取语言偏好与基线分支。字段说明见下方"配置"小节。用户不提供就不创建该文件,直接走默认。

若两者冲突,以 `CLAUDE.md` 为准(团队约定优先于个人偏好)。配置读取完成后,在 git 仓库内本 skill 会自动执行 `git diff` / `git show` 等只读命令拉取当前改动(详见 Step 1),无需用户手动粘贴 diff;若不在 git 仓库或用户直接提供变更描述,则自动进入"描述驱动模式"(见 Step 1 末尾),按用户描述分组产出 commit 与 PR,同样无需用户手动粘贴 diff。

### Step 1:获取 diff

**先做一次环境探测,决定走哪条路径**(单轮硬 gate,避免逐条试六行命令后才发现全报错):

- 跑 `git rev-parse --is-inside-work-tree 2>/dev/null`(`allowed-tools` 已含 `Bash(git rev-parse*)`,无需额外授权)。
- **输出 `true`(退出码 0)**:在 git 仓库内 → 继续下方命令表读 diff。
- **输出空 / 非 0 退出**:非 git 仓库、git 未安装、或仓库未初始化 → **直接跳到本 Step 末尾"降级路径:描述驱动模式"**,不要再逐条试命令表的六行(它们必然报错,逐条报错会让用户误以为 skill 坏了,也违背 Step 0"无需手动粘贴 diff"的承诺)。

探测只跑一次,结果是"二选一硬分支"——**不是**"试到失败再降级",**而是**"先判定环境,再选路径"。用户主动以文字描述变更意图时,同样直接进描述驱动模式,探测可省。

按改动范围选择合适的读取命令,避免把无关 diff 拉进来(仅在已确认 git 仓库内执行):

| 场景 | 命令 | 说明 |
|---|---|---|
| 已 staged | `git diff --cached` | 最常用,只看将要提交的 |
| 未 staged | `git diff` | 看工作区残留改动 |
| 全量改动 | `git status` + `git diff HEAD` | 看相对最后一次提交 |
| 对比 base 分支 | `git diff <base>...HEAD` | PR 场景,注意是三点 `...` |
| 最近一次提交 | `git show HEAD` | 验证或改写提交 |
| 提交历史 | `git log <base>..HEAD --oneline` | 看 PR 内已有哪些 commit |

base 分支的识别顺序:`_config.json` 的 `base_branch` → `git rev-parse --abbrev-ref origin/HEAD`(远端默认分支)或 `git config init.defaultBranch`(全局默认)推断(main/master/develop)→ 拿不准就直接问用户。读 diff 时,二进制文件(图片/锁文件)只看文件名不读内容。

### 降级路径:描述驱动模式(非 git 仓库 / 用户提供描述)

当上述命令全部不可用(目录非 git 仓库、git 未安装、仓库为空)或用户直接以文字描述变更意图时,自动进入**描述驱动模式**——不阻塞产出,只是把输入源从 `git diff` 换成用户描述:

1. **输入形式**:自然语言描述(如"新增了 wecom 登录,修了 token 过期 bug,顺手清了空格")、零散 diff 片段、或"文件清单 + 改动要点"。
2. **不降级的精度**:仍走 Step 2 的变更意图分组、Step 3/4/5 的 commit 与 PR 生成——产物形态与正常模式完全一致,只是输入源不同。
3. **意图不明时**:优先按"同影响范围合并"(避免过度拆分),并在分组表附"推断依据"列,让用户能快速校正(如"`source` 参数归入 feat(auth) 是因同 PR 新增了 wecom,推断为配套")。
4. **明确标注**:Step 6 输出开头用一行提示"本次产出基于用户描述,未读取真实 git diff,请人工核对遗漏文件与 hunk 归属",避免沉默吞掉信息。
5. **回到正常模式**:一旦确认在 git 仓库内,重跑 Step 1 命令表读取真实 diff,覆盖描述驱动模式下的推断。

> 这是 Step 0 承诺"无需用户手动粘贴 diff"的另一面:用户**只能**手动描述时(无 git 环境),skill 仍能产出可用结果,而不是六行命令全报错后卡住。

### Step 2:解析变更并按逻辑分组

把 diff 输出转成"变更意图组"。分组算法:

1. 按**变更意图**初分:新增功能、bug 修复、重构、性能、文档、样式、测试、构建/CI、配置、依赖、回滚。
2. 合并**同意图、同影响范围、同回滚粒度**的文件到一个组。
3. 拆分**同文件多意图**的改动(如一个文件里既有 feat 又有 fix)——按 hunk 级别标注意图。
4. 产出分组表:

   | 组号 | 意图 | 涉及文件 | 影响范围 | 建议 type |
   |---|---|---|---|---|
   | 1 | 新增企业微信登录 | auth/*.ts | 登录模块 | feat |
   | 2 | 修复 token 过期 | auth/refresh.ts | 登录模块 | fix |
   | 3 | 统一缩进 | **/*.ts | 全局 | style |

**合并信号**(同组文件满足以下任一,合并为一条 commit):

- 改动意图相同(都是修同一个 bug、都是同一个功能的不同侧面)。
- 影响范围相同(都落在同一个模块 / 同一个接口)。
- 回滚粒度相同(回滚这一条不会破坏其他改动)。

**意图不明时的归属准则**(描述驱动模式尤其常用):优先按"同影响范围合并"推断归属(宁可少拆不要过拆),且推断必须可校正——在分组表后附一行**推断依据**(如"`source` 参数归入 feat(auth):同 PR 新增 wecom 登录,推断为配套;若不成立请指出,独立成 refactor 组")。用户确认或纠正后再进 Step 3。

**拆分信号**(命中以下任一,必须拆成独立 commit):

- 一个文件里混了多个意图(如既有功能又有格式化):按 hunk 拆(Step 6 有配套的 hunk 级 staging 命令)。
- 改动跨越多个模块且彼此独立(如 auth 与 billing 同时被改):按模块拆。
- 一部分是新增、一部分是修复:即使涉及同一文件也按意图拆。
- 包含破坏性变更:破坏性变更单独成 commit,便于 cherry-pick 或定向 revert。
- 自动生成代码与源改动分离:源改动(如 `.proto`)归 `feat`,生成产物同组并注明。

### Step 3:为每组生成 commit message

套用公式 `type(scope): subject`,逐组生成。规则:

- **type**:严格按 Conventional Commits 清单,详见 `templates/conventional-commits.md`。
- **scope**:可选,用模块/包名;无明确归属时省略而非硬编一个 `app`。
- **subject**:祈使句;中文示例 `支持企业微信登录`,英文示例 `add wecom login`;首字母不大写(英文)、首字不加"了/已";结尾无句号;≤50 字符。
- **body**:换行后写 what & why,每行 ≤72 字符。多段用空行分隔。
- **footer**:放 `BREAKING CHANGE:`、`Closes #123`、`Refs #456`。多个 issue 用逗号。

中文与英文的差异:中文场景 `type` 保留英文(工具兼容),`scope` 与 `subject` 用中文是常见实践;若团队要求全中文,subject 用纯中文动词开头,但 footer 的 `BREAKING CHANGE` 关键字仍保留英文(语义化版本工具依赖它解析)。完整好/坏示例见 `templates/conventional-commits.md`。

### Step 4:生成 PR 描述

套用 `templates/pr-template.md`,字段顺序固定:

1. **一句话总结**:主谓宾,带主语(本 PR)。
2. **改动类型**:多选标签(`feat`/`fix`/`refactor`/...),用 checkbox 或标签语法。
3. **改动组表**:列 Step 2 的分组结果,让 reviewer 按组 review。
4. **影响范围**:模块 / 接口 / 数据 / 配置,任选适用项。
5. **破坏性变更**:无则显式写"无";有则顶部高亮(⚠️ + 加粗)+ 迁移说明(见 Step 5)。
6. **测试说明**:怎么测的(手动 / 自动化)、覆盖哪些路径、结果。
7. **截图占位**:UI 改动必填前后对比;非 UI 改动写"无"。
8. **配置/迁移变更**:环境变量、依赖、数据库迁移;无则写"无"。
9. **自检清单**:固定 checkbox 列表。
10. **关联 issue**:`Closes #123`。

### Step 5:破坏性变更扫描

对每个逻辑组按五维扫描,命中任一即升级处理:

| 维度 | 命中信号 |
|---|---|
| API 签名 | 函数/方法参数增删改、返回值类型变、可见性收紧(public→private) |
| 数据结构/字段 | 数据库表结构、JSON 字段、TypeScript interface/type 变窄、枚举值改 |
| 配置项 | 环境变量改名/删/改默认值、配置文件 schema 变 |
| 依赖大版本 | package.json / requirements.txt / go.mod 等的主版本号变更 |
| 行为语义 | **外部可观察契约**的同输入不同输出(公开接口默认值改、公开错误码改、公开接口鉴权策略改);纯内部 bug 修复不计,详见下方"第 5 维判定纪律" |

命中后:commit footer 加 `BREAKING CHANGE: <说明>`(或在头部用 `!` 简写,二选一);PR 描述顶部加 ⚠️ 高亮提示区块,并写**迁移说明**三段:**老用法 → 新用法 → 过渡策略**(是否保留兼容期、何时移除旧用法)。写法见 `templates/breaking-change-checklist.md`。

#### 第 5 维判定纪律:bug 修复不自动升级为破坏

第 5 维"行为语义"只覆盖**外部可观察契约**——公开接口、公开配置、公开数据格式。任何 fix 都会把行为"从错的改成对的",若按"同输入不同输出"字面执行会把所有 fix 标成 `BREAKING CHANGE`,荒谬。改动落在第 5 维上时按三步走:

1. **落在公开契约上吗?** 内部函数、私有方法、未导出逻辑 → 不标,结束。
2. **老行为是契约还是 bug?** 老行为本身是 bug(边界漏判、条件写反、off-by-one)→ 属 bug 修复,不标 `BREAKING CHANGE`,但**仍要在 PR ⚠️ 区块留一行**"行为有变化但属 bug 修复"(附前后行为对比),让 reviewer 知道此判断已被考虑而非漏扫;老行为是文档承诺或默认值的刻意变更(如公开接口分页默认 100 → 50)→ 按破坏处理。
3. **拿不准一律升级**:标破坏并在迁移说明写"可能属 bug 修复,请 reviewer 确认"——宁多标不漏标。

**方向证据义务(硬要求,不可省)**:凡定性"行为收紧 / 鉴权变严 / 行为放宽",必须在 PR ⚠️ 区块贴出**改动前后的真实条件**(代码或 diff 片段)并推导新旧行为,让 reviewer 能亲自验证方向——方向常与直觉相反,只写结论不算数。例:`used < expiry` 改 `<=`,在 `if (used < expiry) valid` 的读法下是**放宽**(边界由过期改有效);只有在"used 为已用时长"的读法下才是收紧。不贴证据的"收紧/放宽"定性一律视为未完成扫描。完整判定流程与常见翻车点见 `templates/breaking-change-checklist.md`。

### Step 6:输出

按语言偏好输出两块可直接复制的内容:

```
# ===== Commit 命令(可直接粘贴到终端)=====
git add ...
git commit -m "type(scope): subject" -m "body..."
# 若有多组,依次列出多条 commit
# ⚠️ 任一文件跨多组(同文件多意图)时,该文件的 git add 必须改用 hunk 级 staging
#    (git add -p / git apply --cached),并在命令上方注释"选哪些 hunk、跳哪些 hunk"
#    ——完整做法见本 Step 后段"Hunk 级 staging",不许用文件级 add 把多意图压成一条

# ===== PR 描述(可直接粘贴到 PR)=====
<markdown 正文>
```

输出顺序固定:先 commit 命令(执行在前),后 PR 描述(粘贴在后)。若用户明确只要其一,则省略另一块。最后用一句话提示**未覆盖的改动**(例如"有 3 个二进制锁文件未纳入语义分析,请人工确认"),避免沉默吞掉信息。

#### Hunk 级 staging(同文件多意图必用)

Step 2 拆分信号一旦命中"同文件多意图按 hunk 拆"(如 `service.py` 里既有 feat 又有 fix),`git add <文件>` 会把整个文件塞进一条 commit,破坏分组——**此时必须用 hunk 级 staging**:

| 手段 | 命令 | 适用场景 |
|---|---|---|
| 交互式选块 | `git add -p <file>`(同 `--patch`) | 首选。git 逐块展示改动,按 `y/n` 取舍;一块含两种意图时按 `s` 拆分(split),仍拆不开按 `e` 手动编辑该块,删掉不属于本 commit 的行(`-` 行改空格、`+` 行删行),保存即完成 staging |
| 精确补丁 | `git diff <file> > /tmp/x.patch`,裁出目标 hunk 后 `git apply --cached /tmp/x.patch` | 自动化 / 非交互环境(add -p 无法交互时)的兜底 |

操作铁律:

1. **每条 commit 的 `git add` 命令上方必须注释**"选哪些 hunk、跳哪些 hunk"(如 `# 只选新增 source 参数的 hunk,跳过 < → <= 那段`),否则用户面对交互提示不知道该按 y 还是 n。
2. **每个 hunk 在全部 commit 中恰好出现一次**——不重复(同一 hunk 进两条 commit 第二次会 add 空)、不遗漏(遗漏的 hunk 留在工作区,最后必须提示用户)。
3. hunk 级 staging 完成、正式 commit 前,用 `git diff --cached` 验证暂存区只含本条意图的 hunk,再执行 `git commit`。

完整算例(承接 Step 2 分组表:组 1 feat 含 `service.py` 的 `source` 参数 hunk,组 2 fix 含 `<` → `<=` hunk):

```bash
# ---------- 组 1: feat(auth) ----------
git add src/auth/wecom.py
git add -p src/auth/service.py   # 只 stage「新增 source 参数」的 hunk,跳过「< → <=」的 hunk
git diff --cached                # 自检:暂存区只有 source 参数改动
git commit -m "feat(auth): 新增企业微信 OAuth 登录" -m "…body…"

# ---------- 组 2: fix(auth) ----------
git add -p src/auth/service.py   # stage 剩余的「< → <=」hunk(此时只剩它)
git diff --cached                # 自检
git commit -m "fix(auth): 修复 token 过期边界漏判的等号" -m "…body…"
```

> 描述驱动模式下没有真实 hunk 可 stage,照旧产出上述命令,但逐条注明"hunk 归属系描述推断,执行前请先 `git status` / `git diff` 核对"。

#### 多条 commit 的排序原则

输出多条 commit 时按以下优先级排序,在命令块顶部用一行注释写清顺序及理由:

1. **被依赖的先提交**:commit B 引用了 commit A 引入的符号 / 文件 / 配置时,A 必须先提交——保证每次 commit 后代码可编译、可运行,bisect 与 cherry-pick 不出错。
2. 无依赖时,**主意图在前**(`feat` 先于顺手做的 `fix`/`refactor`),reviewer 按序 review 先看到重点。
3. **`style` / 格式化永远最后**:避免格式化产生的行位移干扰前面 commit 的 hunk 匹配(patch 上下文错位导致 `git add -p` 分块异常)。
4. 依赖拿不准时,按分组表组号升序,并在注释中声明"未发现跨组依赖"。

### 输出语言对照(`zh` vs `en`)

同样的改动,两种语言的产出形态差异如下,供参考选择:

| 维度 | `language: "zh"`(默认) | `language: "en"` |
|---|---|---|
| commit 头 | `feat(auth): 支持企业微信登录` | `feat(auth): add wecom login` |
| commit body | 中文,解释 what & why | 英文,同样的结构 |
| PR 描述一句话总结 | 本 PR 支持企业微信登录,替换原 SSO 流程。 | This PR adds WeCom login, replacing the legacy SSO flow. |
| PR 描述字段标题 | 影响范围 / 测试说明 / 自检清单 | Impact / Testing / Checklist |
| footer 关键字 | `BREAKING CHANGE`(英文,工具依赖) | `BREAKING CHANGE` |
| 关联 issue | `Closes #142`(英文关键字) | `Closes #142` |

两种语言都遵循 Conventional Commits;差别只在人类可读部分的语言。中文团队的内部项目用 `zh`,开源 / 国际化项目用 `en`。

## 边界情况与避坑

- **多 base 分支**:`main`/`master`/`develop`/`release/*` 都可能存在,不要假设默认。先 `git branch -a` 列出,再用三点 diff `git diff base...HEAD`(三点只看 merge-base 之后,不会把 base 的新提交算进来)。
- **大型 monorepo**:diff 可能上千行。先按 package/workspace 分组,再在 package 内部按意图细分,避免一条 commit 跨越多个 package。
- **squash merge 团队**:若团队约定 PR squash 成一条 commit,则把多组改动合并成一条 commit,但 PR 描述保留分组表,reviewer 仍可按组 review。
- **merge commit 与 rebase**:识别 `git log` 中的 merge commit,跳过自动生成的合并提交(`Merge branch ...`),只分析真实改动。
- **二进制文件**:图片、字体、压缩包、锁文件(package-lock.json、yarn.lock、pnpm-lock.yaml)只看文件名与变更方向(新增/修改/删除),不读内容。锁文件通常归到对应依赖变更组。
- **首次提交 / init 项目**:没有 base 可对比,用 `git diff --cached` 看暂存区。type 选 `chore`(首次落地、脚手架、初始化配置),scope 省略。如团队确有 `init` 约定,必须通过配置项 `extra_types` 显式声明并在 `CLAUDE.md` 中写明适用场景——不能既说"禁止自造"又自造。
- **pre-commit hook 改动文件**:hook 跑完会修改文件(如 prettier 格式化、lint 自动修),导致 `git diff` 在 commit 前后不一致。以 hook 跑完后的状态为准,重新 `git diff --cached` 再生成。
- **跨平台换行符**:CRLF/LF 混用时 `git diff` 会把整行标红。先用 `git diff --ignore-cr-at-eol` 看真实改动,再决定是否需要 `.gitattributes` 规范化。
- **中文 subject 的工具兼容性**:纯中文 subject 在 release-please、semantic-release 等工具下解析正常,但若团队启用了 commitlint 的 `subject-case` 规则(强制小写英文),纯中文会被拒。读 `CLAUDE.md` 时留意此类约束,必要时用"英文 type + 中文 scope/subject"的混合写法。
- **空 diff / 只改了空格**:空 diff 直接提示用户,不要硬造 commit。纯空格改动归 `style`,并在 body 注明"仅格式化,无逻辑变更"。
- **自动生成代码**:protobuf 生成、ORM 实体生成等自动产物的改动不要单独成 commit,归到触发它的源改动(如 `.proto` 文件)同组,并在 body 注明"含生成代码"。
- **0.x.x / pre-release 项目**:语义化版本对 0.x 阶段放宽——任何改动都可能破坏,因此 `feat`/`fix` 在 0.x 阶段都视为 minor/patch。但**团队内部约定仍可能要求显式标 `BREAKING CHANGE`**,读 `CLAUDE.md` 确认。
- **单仓库多产品(monorepo 多发版线)**:不同 package 可能独立发版,commit 要按 package 分组且 scope 必须带包名(如 `feat(user-api): ...`),避免发版工具把无关 package 的改动也算进去。
- **回滚(revert)的写法**:`revert` type 的 body 必须引用被回滚的 commit hash 与原因,如 `Reverts a1b2c3d: 该改动导致登录超时率上升`。裸 `revert: xxx` 会让 reviewer 不知道为什么回滚。
- **非 git 仓库 / 描述驱动模式**:目录非 git 仓库、git 未安装、或用户直接给文字描述时,Step 1 的命令表全部不可用——此时走"描述驱动模式"(详见 Step 1 末尾),按用户描述分组产出 commit 与 PR,并在输出开头标注"基于描述、未读真实 diff"。不要因 git 命令报错就卡住或硬造空 diff。

## 配置

读取 `_config.json`(项目根或用户主目录)。**用户不提供就不创建该文件**,直接走默认值。字段如下:

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `language` | `"zh"` \| `"en"` | `"zh"` | 输出语言。`zh` 中文 subject + 英文 type;`en` 全英文 |
| `base_branch` | string | 自动推断 | PR 对比的基线分支,如 `"main"`、`"develop"` |
| `commit_scope_style` | `"module"` \| `"package"` \| `"none"` | `"module"` | scope 命名风格。`none` 表示省略 scope |
| `link_issue` | boolean | `false` | 是否在 footer 自动关联 issue(需配合 issue 号参数) |
| `emoji_prefix` | boolean | `false` | 是否启用 gitmoji 风格 emoji 前缀(如 `✨ feat:`)。非 Conventional Commits 标准,默认关 |
| `squash_pr` | boolean | `false` | 是否把多组合并为单条 commit(适配 squash-merge 团队) |
| `breaking_change_highlight` | `"emoji"` \| `"bold"` \| `"none"` | `"emoji"` | PR 描述中破坏性变更区块的高亮样式。`emoji` = ⚠️ + 加粗标题(对应模板默认);`bold` = 仅加粗,不加 emoji;`none` = 纯文本不高亮。GitHub/标准 Markdown 不支持字面红色文字,故不提供 `red` 取值 |
| `extra_types` | string[] | `[]` | 团队在 11 个标准 type 之外额外允许的 type(如 `["init"]`)。需在 `CLAUDE.md` 中明确约定每个额外 type 的适用场景与是否触发发版。慎用——扩展越多,Conventional Commits 的自动化收益越低 |

读取顺序:`./_config.json` → `~/_config.json` → 默认值。前者的同名键覆盖后者。

## 速查:type 选择决策树

```
改动是为了?
├─ 新功能 / 新能力 ───────────────────→ feat
├─ 修复 bug ─────────────────────────→ fix
├─ 改格式化 / 空格 / 分号 ────────────→ style
├─ 重构(不改外部行为) ──────────────→ refactor
├─ 提升性能 ─────────────────────────→ perf
├─ 改文档 / 注释 / README ───────────→ docs
├─ 加/改测试 ────────────────────────→ test
├─ 改构建系统 / 依赖 ────────────────→ build
├─ 改 CI 配置 ───────────────────────→ ci
├─ 杂项(脚本/工具/琐碎) ────────────→ chore
└─ 回滚之前的提交 ───────────────────→ revert
```

记住:拿不准就用更窄的 type。`chore` 是最后选项,不是万能抽屉。
