# PR 描述模板

> 直接复制下方代码块到 PR,按提示替换占位。字段顺序固定,无内容的写"无"或勾掉对应区块,不要删标题(让 reviewer 知道你考虑过)。

## 完整模板

```markdown
## 一句话总结

本 PR <用一句话说清做了什么、为什么>。

## 改动类型

- [x] feat(新功能)
- [ ] fix(bug 修复)
- [ ] refactor(重构)
- [ ] perf(性能)
- [ ] docs(文档)
- [ ] style(格式)
- [ ] test(测试)
- [ ] build(构建/依赖)
- [ ] ci(CI)
- [ ] chore(杂项)
- [ ] revert(回滚)

## 改动组表

| # | type | scope | 说明 | 涉及文件 |
|---|---|---|---|---|
| 1 | feat | auth | 支持企业微信登录 | auth/wecom.ts, auth/routes.ts |
| 2 | fix | auth | 修复 token 过期未刷新 | auth/refresh.ts |
| 3 | style | - | 统一缩进 | **/*.ts |

> **hunk 级拆分的规范写法**:一组只涉及文件的部分 hunk 时,涉及文件列写 `文件路径(hunk 描述)`,如 `src/auth/service.py(新增 source 参数 hunk)`。hunk 描述用意图短语,不写行号(hunk 拆 commit 后行号会漂移)。

## 影响范围

- **模块**:<受影响的模块/包,如 auth、user>
- **接口**:<受影响的 API/路由,如 POST /auth/wecom/callback>
- **数据**:<受影响的表/字段/缓存键>
- **配置**:<受影响的环境变量/配置项>

## ⚠️ 破坏性变更

<!-- 无则写"无",有则保留下方区块,不要删 -->

**本 PR 包含破坏性变更**。

**老用法 → 新用法 → 过渡策略**:

| 维度 | 老用法 | 新用法 | 迁移说明 |
|---|---|---|---|
| API 字段 | `name_first` | `firstName` | 过渡期 7 天同时返回两套字段 |
| 配置项 | `AUTH_JWT_SECRET` | `AUTH_SESSION_SECRET` | 启动时读取老变量并打 deprecation 日志 |

<!-- 作者:破坏性变更完整写法见 skill 的 templates/breaking-change-checklist.md -->

## 测试说明

- **测试方式**:<手动 / 单元测试 / 集成测试 / E2E>
- **覆盖路径**:
  - <路径 1,例如:企业微信登录回调成功流程>
  - <路径 2,例如:code 无效时返回 401>
  - <路径 3,例如:token 过期自动刷新>
- **测试结果**:<全绿 / 有 X 个已知失败,原因>
- **新测试**:<列出新增的测试用例,如 `auth.test.ts: should refresh token before expiry`>

## 截图(UI 改动必填)

| Before | After |
|---|---|
| <!-- 截图或 GIF --> | <!-- 截图或 GIF --> |

> 非 UI 改动写"无"。

## 配置 / 迁移变更

- **新增环境变量**:`WECOM_CLIENT_ID`、`WECOM_CLIENT_SECRET`
- **依赖变更**:新增 `axios-retry@^4.0.0`
- **数据库迁移**:`migrations/20260730_add_wecom_id.sql`(新增 `users.wecom_id` 字段)
- **无变更时写**:无

## 自检清单

- [ ] 已运行测试套件且全绿
- [ ] 已运行类型检查(`tsc --noEmit` / `mypy` / 等价命令)
- [ ] 已运行 lint 且无错误
- [ ] 已更新相关文档(README / API 文档 / 注释)
- [ ] 已考虑向后兼容性(或已显式标注破坏性变更)
- [ ] 已添加 / 更新测试覆盖新逻辑
- [ ] 已在本地手动验证核心路径
- [ ] commit 信息符合 Conventional Commits 规范

## 关联 issue

Closes #142, #201
Refs #98
```

## 使用要点

1. **一句话总结是必填项**,且要带主语(本 PR),不要用"标题党"或省略主语。
2. **改动组表来自 SKILL.md Step 2 的分组结果**,直接复用,不要重新归类。
3. **影响范围四项选填**,适用的留下,不适用的删掉整行而非留空。
4. **破坏性变更区块不要删标题**:即使无破坏性变更也保留区块写"无",让 reviewer 确认你考虑过。
5. **截图占位**:UI 改动填 Before/After 对比图,reviewer 最关心视觉变化;非 UI 改动写"无"。
6. **自检清单不可省略**:它是 reviewer 判断"这个 PR 值不值得深读"的快速信号。

## 简化版模板(适合小改动)

```markdown
## 总结

<一句话>。

## 改动

- <要点 1>
- <要点 2>

## 测试

<怎么测的>。

## 自检

- [x] 测试通过
- [x] lint 无错
- [x] 无破坏性变更
```

> 小改动用简化版,中大型改动用完整版。判断标准:diff 行数 < 50 行、单意图、无破坏性变更。
