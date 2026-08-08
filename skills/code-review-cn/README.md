# 中文代码审查

> 按四维扫描 + 严重度分级的深度代码审查,产出可直接贴进 PR 评论的中文报告。

## 这是什么

这是一份针对国内技术栈与业务场景的代码审查 skill。它不是"读一遍代码挑毛病",而是按 **四维扫描 → 严重度分级 → 误报过滤 → 修复导向** 的固定流程产出报告,确保每条意见都可执行、可定级、可追溯。封装了六条核心方法论(四维 checklist、三档分级、中文项目常见坑、误报过滤、修复导向、分组报告),最终交付一份带 critical/major/minor 分组、附修复代码的审查报告。

## 30 秒上手

1. **安装**:把整个 `code-review-cn/` 文件夹放到 `~/.claude/skills/` 下(或项目级 `.claude/skills/`)
2. **调用**:在 Claude Code 里输入 `/code-review-cn <代码文件或路径> [重点维度]`
3. **拿结果**:按 skill 的六步工作流扫描,产出分组报告,复制即用

调用示例:

```
/code-review-cn src/order/ 安全
/code-review-cn src/auth/Service.java
```

也支持直接粘贴代码片段而不给路径。

## 它能帮你做什么

- **四维独立扫描**:正确性、安全、性能、可维护性逐维过 checklist,避免凭印象漏掉某一维
- **三档严重度分级**:critical/major/minor 有客观判定标准,附"定级三问"防主观
- **中文项目高频坑专项**:金额用 double、时区硬编码、密钥写进 git、无幂等、无超时降级——六类国内必踩坑单独扫一遍
- **误报过滤**:框架约定、生成代码、测试 mock 默认不报,让真正的 critical 更显眼
- **修复导向**:critical 附可直接替换的修复代码,major 给方向与关键代码行
- **报告直发 PR**:按严重度分组、带位置与合并建议(阻塞/条件通过/通过),贴进 PR 评论即可

## 适合谁

- **提交前自检的开发者**:不想被 PR 评审反复打回,先自己扫一遍
- **技术 Leader / 代码把关人**:需要一份结构化、可追溯的审查报告做评审依据
- **外包项目验收方**:需要客观的严重度分级判断交付质量,而非主观挑刺
- **国内电商 / 金融 / SaaS 团队**:通用英文审查抓不到的支付、并发、i18n、合规坑,这里有专项 checklist

## 包含什么

- `SKILL.md` — 主文件(241 行):六条核心方法论 + 六步工作流 + 边界避坑 + 配置说明
- `templates/review-checklist.md` — 四维审查 checklist,含 MySQL `EXPLAIN` 红绿灯与索引失效清单
- `templates/severity-rubric.md` — 严重度判定标准与定级三问,含临界情况示例
- `templates/cn-pitfalls.md` — 中文项目六类高频坑(i18n/支付/并发/配置/依赖/日志)
- `templates/review-report.md` — 报告模板,按严重度分组,可直接贴 PR 评论
- `LISTING.md` — 市场上架文案,可忽略

## 看看效果

报告产出形如(摘自 `templates/review-report.md`):

```markdown
## 审查结论
- **审查范围**:`src/order/`
- **总体结论**:发现 2 个 critical(支付金额用 double、密钥硬编码),建议修复后再合并
- **问题计数**:critical 2 / major 3 / minor 4
- **合并建议**:🔴 阻塞

## 🔴 Critical(必须修,阻塞合并)
### C1. 支付金额计算使用 double 存在精度丢失
- **位置**:`src/order/Price.java:42`
- **维度**:正确性
- **严重度**:critical
- **修复建议**(附可用代码):
  BigDecimal total = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(qty));
```

## 常见问题

- **要不要联网?** 不需要。skill 仅用 `Read`/`Glob`/`Grep` 与只读 git 命令(`git diff`/`git log`/`git show`)做本地静态分析,不调用 WebSearch。
- **能不能自定义?** 可以。在项目根 `CLAUDE.md` 的 `## code-review` 小节写字段即可,无需专用配置文件。
- **支持什么语言/平台?** 与语言无关,适用于 Java/Go/Python/Node 等主流栈;运行环境需要 Claude Code。业务场景聚焦国内电商、金融、SaaS 的高频坑。
- **能查业务规则对不对吗?** 不能。skill 查"代码是否符合逻辑",不查"业务规则本身对不对"——后者要靠需求文档与产品确认。

## 配置

无需配置,开箱即用。所有偏好均为可选,在 `CLAUDE.md` 的 `## code-review` 小节按下表写字段即可,不写走默认:

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `focusDimensions` | string[] | 全四维 | 限制本次只审某几维,如 `["安全"]` |
| `severityFloor` | string | `minor` | 报告下限,设 `major` 则只报 major 及以上 |
| `skipGenerated` | boolean | true | 是否跳过生成代码目录 |
| `customPitfalls` | string[] | [] | 项目特有坑,追加到 cn-pitfalls 之后扫 |

找不到任何配置来源时不报错,默默走默认。
