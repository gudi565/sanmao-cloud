# Conventional Commits 完整规范

## 提交头格式

```
type(scope): subject

body(可选)

footer(可选)
```

- 整条提交由**头 + body + footer**三段组成,段与段之间用**空行**分隔。
- 头只有一行,且必须符合 `type(scope): subject`。
- `scope` 可省略(连括号一起去掉),写成 `type: subject`。

## type 完整清单(固定 11 个,禁止自造)

| type | 用途 | 是否影响版本号 |
|---|---|---|
| `feat` | 新功能 / 新能力 | minor(+) |
| `fix` | 修复 bug | patch |
| `docs` | 文档、注释、README 改动 | 不发版 |
| `style` | 代码格式(空格/分号/缩进),不影响逻辑 | 不发版 |
| `refactor` | 重构,既不加功能也不修 bug | 不发版 |
| `perf` | 提升性能的改动 | patch |
| `test` | 新增或修改测试 | 不发版 |
| `build` | 构建系统、依赖(package.json、go.mod 等) | 不发版(默认) |
| `ci` | CI 配置(.github/workflows、.gitlab-ci.yml) | 不发版 |
| `chore` | 杂项(脚本、工具、琐碎事务) | 不发版 |
| `revert` | 回滚之前的提交 | 按被回滚提交还原 |

> `feat` 与 `fix` 触发发版;带 `BREAKING CHANGE` 的任一 type 触发 major。`build` 默认不触发发版——`build(deps): bump xxx` 这类依赖升级若要触发 patch,需在 semantic-release / commit-analyzer 的 `releaseRules` 里显式配置(如 `{ type: "build", release: "patch" }`),默认不 bump。

## subject 五条铁律

1. **祈使句**:用动词原形,不用过去式、不用进行时。
2. **首字母不大写**(英文)/ **首字不加"了/已"**(中文)。
3. **结尾无句号**。
4. **≤50 字符**(中文 ≤25 字)。
5. **现在时态**:描述"这个提交让代码变成什么样",不是"我做了什么"。

## scope 命名建议

- 用模块名 / 包名 / 组件名:`(auth)`、`(user-api)`、`(header)`。
- 多层级用连字符:`(user-api)` 而非 `(UserAPI)`。
- 无明确归属时**省略 scope**,不要硬编 `(app)`、`(misc)`。

## body 写法

- 解释 **what**(改了什么效果)与 **why**(为什么这么改),不写 how。
- 每行 ≤72 字符(终端默认宽度),长段落用空行分段。
- 用列表(`-`)罗列要点比散文更易读。

## footer 写法

- `BREAKING CHANGE: <说明>`(全大写、冒号、空格),触发 major 版本。
- `Closes #123` / `Fixes #123` / `Resolves #123`:关闭 issue。
- `Refs #456` / `See #456`:关联但不关闭。
- 多个 footer 用空行分隔。

## `!` 简写(Conventional Commits 1.0+)

除 footer 形式外,规范 1.0+ 还支持在提交头用 `!` 标记破坏性变更,与 footer `BREAKING CHANGE:` 等价:

```
feat(api)!: 用户接口字段从 snake_case 改为 camelCase

feat!: 移除 legacy SSO 登录流
```

- `type(scope)!:` 或 `type!:`——`!` 紧贴冒号左侧,scope 与 `!` 的相对位置是 `scope` 在前、`!` 在后(即 `feat(api)!:` 而非 `feat!(api):`)。
- **二选一,不要同时用**:要么头部 `!`,要么 footer `BREAKING CHANGE:`。同时写不会报错,但语义重复,工具(semantic-release、release-please、commit-analyzer)都按一次 major 处理。
- 头部 `!` 适合**破坏性变更本身就是这条 commit 的核心信息**的场景(如移除某功能);footer `BREAKING CHANGE:` 适合**需要写较长迁移说明**的场景。简写省空间,footer 适合长文。
- 仅头部 `!` 时仍建议在 body 里补充迁移说明,reviewer 与下游用户需要细节。

## 好/坏示例对比

### 坏示例

```
update

修改了一些东西
```

问题:type 缺失、subject 模糊、body 复述"我做了什么"。

### 好示例

```
feat(auth): 支持企业微信登录

- 新增 /auth/wecom/callback 端点,走 OAuth2 code 换 session
- 不复用原 JWT 流,避免双 token 体系冲突
- 登录成功后下发与原体系一致的 session cookie

Closes #142
```

### 坏示例

```
Fixed the bug where users couldn't login.
```

问题:subject 大写、带句号、type 缺失、没有 scope。

### 好示例

```
fix(auth): 修复 token 过期未自动刷新的问题

refresh-token 拦截器在 401 响应后才触发,但 axios 在响应拦截前
已抛出错误,导致刷新逻辑从未执行。改为在请求拦截器中预判过期
时间提前刷新。

Fixes #98
```

### 坏示例

```
chore: 改了点东西

升级了 react 到 18.3,改了登录逻辑,顺手修了个 bug
```

问题:三个意图混在一条 commit 里,reviewer 无法按 commit review,cherry-pick 也会带毒。应拆成三条:`build(deps): 升级 react 至 18.3`、`feat(auth): ...`、`fix(...): ...`。

### 带破坏性变更的好示例

```
feat(api): 用户接口返回字段从 snake_case 改为 camelCase

与前端既有的 camelCase 约定保持一致,减少前后端转换层。

BREAKING CHANGE: UserResponse.name_first → UserResponse.firstName,
UserResponse.avatar_url → UserResponse.avatarUrl。前端需同步改造,
过渡期 7 天内接口同时返回两套字段,见 migration guide。

Closes #201
```

## 中英文混用的实践

| 场景 | 推荐写法 |
|---|---|
| 中文团队,启用 commitlint | `feat(auth): 支持企业微信登录` |
| 中文团队,无 commitlint 约束 | 同上,或全中文 `新增: 企业微信登录功能` |
| 国际化 / 开源项目 | `feat(auth): add wecom login` |
| Footer 关键字 | 永远英文 `BREAKING CHANGE`、`Closes`(工具依赖) |

## 检查清单(提交前自问)

- [ ] type 是清单里的 11 个之一?
- [ ] scope 是真实模块名(或省略)?
- [ ] subject 祈使句、首字母不大写、无句号、≤50 字符?
- [ ] body 写了 why 而非 how?
- [ ] 破坏性变更是否已用 `!` 简写或 `BREAKING CHANGE` footer 标记(二选一)?
- [ ] 这条 commit 是否只包含一个意图?若多个,是否该拆?
