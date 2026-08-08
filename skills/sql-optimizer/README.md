# SQL诊断与优化

> 把一条慢 SQL 从"跑 10 秒"优化到"跑 50 毫秒",靠的是工程方法而不是直觉。

## 这是什么

这个 skill 解决"SQL 慢却不知道怎么改"的问题。它把资深 DBA 和后端老手的排查习惯封装成五块可复用资产——慢查询排查四步法、EXPLAIN 逐字段红绿灯、索引设计决策清单、反模式扫描库、重写模式库。输入一条 SQL(带上表结构和数据量级更准),输出一份能直接落地的诊断报告:问题在哪、加什么索引(给 DDL)、SQL 怎么重写(给改后版本)、优化前后扫描行数差多少、怎么验证。每一条建议都挂着理由和验证路径,不拍脑袋。

## 30秒上手

1. **安装**:把整个 `sql-optimizer/` 文件夹放到 `~/.claude/skills/` 下(或项目级 `.claude/skills/`)
2. **调用**:在 Claude Code 里输入 `/sql-optimizer <SQL语句> [表结构/数据量]`
3. **拿结果**:按 skill 的分步流程产出诊断报告,索引 DDL 和重写后的 SQL 可直接复制使用

调用示例:

```
/sql-optimizer SELECT * FROM orders WHERE user_id=123 ORDER BY created_at DESC LIMIT 1000000,20    orders表1000万行
```

更推荐的做法是连同 DDL 一起贴:`SHOW CREATE TABLE` 的输出 + SQL + 数据量级,诊断准确度会显著提升。

## 它能帮你做什么

- **逐字段解读 EXPLAIN**:`type` / `key` / `rows` / `Extra` 红绿灯判断,一眼定位是全表扫描、filesort 还是临时表在拖慢
- **给出可执行的索引 DDL**:不是"建议加索引",而是带列顺序和理由的 `CREATE INDEX` 语句,并评估对写入的副作用
- **扫描 9 类高频反模式**:`SELECT *`、大偏移分页、`IN (SELECT ...)`、`LIKE '%xxx'`、隐式类型转换、N+1 等,命中即给修复方向
- **套用 12 条重写模式**:子查询→JOIN、大偏移→游标分页、`COUNT` 子查询→JOIN 聚合等,每条给"原写法 → 改后写法 → 适用条件"
- **量化优化前后对比**:扫描行数从多少降到多少、`type`/`Extra` 怎么变,附上可跑的验证命令
- **按成本排序优化顺序**:同时发现多个问题时,用收益公式告诉你先动哪个

## 适合谁

- **后端开发者**:线上慢查询告警来了要快速定位根因,不想凭感觉乱试
- **DBA**:需要一套标准化、可复用的排查流程,减少重复劳动
- **数据分析师 / 报表开发**:报表和导出类查询越来越慢,想知道是该加索引还是该改写
- **面试备战者**:白板手撕 SQL 优化题,需要一套能讲清楚的思路而不是背答案

## 包含什么

- `SKILL.md` — 主文件(246 行):五大核心方法论 + 快速诊断决策树 + 分步工作流 + 10 条避坑要点
- `templates/explain-reading.md` — EXPLAIN 字段逐项红绿灯速查表
- `templates/index-design.md` — 索引设计原则 + "该不该加索引"决策清单
- `templates/antipatterns.md` — 9 类高频反模式扫描清单(含修复方向)
- `templates/rewrite-patterns.md` — 12 条可直接套用的 SQL 重写模板

(`LISTING.md` 是市场上架文案,日常使用可忽略)

## 看看效果

诊断报告里"SQL 重写"和"前后对比"两节长这样(摘自真实模板):

```
原 SQL(深翻页到百万级卡死):
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

优化 SQL(游标分页,记住上一页最后一条 id):
SELECT * FROM orders WHERE id > :last_id ORDER BY id LIMIT 20;

| 指标  | 优化前         | 优化后       |
|-------|----------------|--------------|
| type  | ALL            | range        |
| rows  | 10,000,000     | 20           |
| Extra | Using filesort | Using index  |
```

从扫描 1000 万行丢掉 999,980 行,变成直接从游标位置取 20 行——这就是一次合格的优化该有的量级差距。

## 常见问题

- **要不要联网?** 不需要。skill 不调用任何联网工具。如果你提供了数据库连接方式,可以通过 `mysql` / `psql` / `sqlite3` / `mycli` 命令行实跑 `EXPLAIN`,准确度更高;不连也能基于 SQL 和表结构做经验性预判(会明确标注"需实跑确认")
- **能不能自定义?** 可以。在 skill 目录下放一个 `_config.json` 即可调整数据库类型、报告格式、严重度阈值等(见下节)
- **支持什么数据库?** MySQL(5.7 / 8.x,含函数索引、`EXPLAIN ANALYZE`)、PostgreSQL、SQLite。不同方言的 `EXPLAIN` 输出格式和索引语法都已区分处理,不会套错方言

## 配置(可选)

在 skill 目录下创建 `_config.json` 即可,不配也能开箱即用:

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `db_type` | `"mysql"` | 数据库类型:`mysql` / `postgresql` / `sqlite`,影响 EXPLAIN 输出与索引语法 |
| `default_table_size` | 无 | 未提供数据量级时的默认假设(行数),建议显式提供更准 |
| `report_format` | `"markdown"` | 报告格式:`markdown` / `plain` |
| `include_benchmark` | `true` | 是否在报告中附上可跑的验证命令 |
| `severity_threshold` | `"medium"` | 只报告该级别及以上的问题:`high` / `medium` / `low` |
