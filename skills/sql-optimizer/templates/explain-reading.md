# EXPLAIN 执行计划字段解读速查表

按字段逐项给"含义 + 红绿灯判断 + 典型场景"。优先级:`type` > `rows` > `Extra` > `key`。

## 一、type(访问类型)——最重要的字段

从左(差)到右(好)排列:

| type | 含义 | 红绿灯 | 典型场景 | 处理建议 |
|------|------|--------|----------|----------|
| `ALL` | 全表扫描 | 🔴 红灯 | 无索引 / 索引失效 / 优化器放弃索引 | 第一优先级优化目标:加索引或修失效写法 |
| `index` | 全索引扫描 | 🟡 黄灯 | 扫描整棵索引树(比ALL好,但仍扫描全部) | 看能否改成range/ref,或用覆盖索引减少回表 |
| `range` | 索引范围扫描 | 🟡 可接受 | `BETWEEN`、`>`、`<`、`IN` | 一般可接受;范围过大仍是问题 |
| `index_merge` | 多个索引合并使用 | 🟡 黄灯 | `WHERE a=? OR b=?` 命中多个单列索引 | 可用但常非最优:考虑改 `UNION` 或建联合索引,合并时有额外开销 |
| `ref` | 非唯一索引等值查找 | 🟢 绿灯 | `WHERE idx_col = ?` | 良好 |
| `eq_ref` | 唯一索引/主键等值 | 🟢 很绿 | JOIN时被驱动表用主键匹配 | 最佳实践级别 |
| `const` | 主键/唯一索引等值(单行) | 🟢 最绿 | `WHERE id = 1` | 已经是最优 |
| `system` | 表只有一行 | 🟢 最绿 | 系统表 | 无需处理 |

> **判断口诀**:看到 `ALL` 就要动手;`index_merge` 可用但常可优化为联合索引;`index` 看具体情况;`range` 起算及格;`ref` 及以上是目标。

## 二、key(实际使用的索引)

| 情况 | 含义 | 判断 |
|------|------|------|
| `key = NULL` | 没走任何索引 | 🔴 检查是否缺索引 / 写法致失效 |
| `possible_keys` 有值,`key` 为空 | 有可用索引但优化器没选 | 🟡 可能统计信息过期(`ANALYZE TABLE`),或写法让索引不可用 |
| `possible_keys` 有多个,`key` 选了非预期的 | 优化器选错索引 | 🟡 用 `FORCE INDEX(idx_xxx)` 强制,或删冗余索引 |
| `key` 走了预期索引 | 正常 | 🟢 |

## 三、rows(扫描行数估算)

成本的核心指标。**注意是估算值,不是精确值。**

| 判断 | 处理 |
|------|------|
| `rows` ≈ 实际返回行数 | 🟢 高效,扫描即所需 |
| `rows` >> 实际返回行数(差一个数量级以上) | 🔴 大量无效扫描,优先优化:加更精准的索引、收紧WHERE条件 |
| `rows` 接近全表行数 | 🔴 基本等同全表扫描,即使type=index |

> **对比公式**:优化效果 ≈ 优化前 rows / 优化后 rows。下降一个数量级(10倍)是合格线,两个数量级是优秀。

## 四、Extra(附加信息)——红灯都在这

| Extra | 含义 | 红绿灯 | 处理 |
|------|------|--------|------|
| `Using index` | 覆盖索引,查询列都在索引里,免回表 | 🟢 绿灯 | 这是目标状态 |
| `Using where` | 在存储引擎返回后用WHERE过滤 | 🟡 普通,通常可接受 | 若rows很大,说明过滤效率低,需更精准索引 |
| `Using filesort` | 额外排序操作(不在索引内完成) | 🔴 红灯 | 给 `ORDER BY` 列加索引,或纳入联合索引末尾 |
| `Using temporary` | 用了临时表(GROUP BY / DISTINCT / UNION常见) | 🔴 红灯 | 优化GROUP BY列加索引;UNION改UNION ALL |
| `Using join buffer` | JOIN 无可用索引,走嵌套循环连接(MySQL 8.0.18+ 默认 Hash Join,Extra 显示 `Using join buffer (hash join)`;老版本或无法 hash 时退化成 Block Nested Loop) | 🔴 红灯 | 给 JOIN 字段加索引 |
| `Using index condition` | 索引下推(ICP),过滤推到存储引擎层 | 🟢 优化器在工作 | 正常,无需处理 |
| `Impossible WHERE` | 条件恒假 | ⚪ 检查逻辑 | 常是写错条件 |
| `No tables used` | 无FROM子句 | ⚪ 正常 | — |

## 五、其他字段(辅助)

| 字段 | 关注点 |
|------|--------|
| `id` | 查询序号,大查询里标识子查询/JOIN的执行顺序;相同时从上往下执行 |
| `select_type` | `SIMPLE`(简单)、`PRIMARY`(最外层)、`SUBQUERY`、`DERIVED`(派生表,常可优化为JOIN) |
| `table` | 涉及的表名或别名 |
| `possible_keys` | 可能用到的索引。空=没合适索引 |
| `key_len` | 实际用到的索引字节数。判断联合索引用了几列:`key_len` 越接近联合索引总长,用的列越全 |
| `ref` | 索引比较的来源:常量(`const`)或另一表的列(`db.t1.col`) |
| `ref_or_null` | 与 `ref` 类似,但还会额外扫描 NULL 行(`WHERE idx_col = ? OR idx_col IS NULL`)。常见于含 `IS NULL` 的查询,比 `ref` 稍慢但仍是索引访问 |
| `filtered` | 过滤后剩余比例。`rows * filtered / 100` ≈ 最终行数。很低说明扫描多丢得也多 |
| `partitions` | 涉及的分区,分区表才看 |

## 六、解读工作流

1. 先看 `type`:有 `ALL` 先盯它。
2. 再看 `rows`:和实际返回行比,差太多就要动。
3. 看 `Extra`:有 `Using filesort` / `Using temporary` / `Using join buffer` 必处理。
4. 看 `key` 和 `possible_keys`:有索引没用上,查失效原因或刷新统计信息。
5. 多表JOIN:从被驱动表(后执行的)看起,它往往是瓶颈。
