# SQL 优化 & 索引策略 & 方言差异

## 一、索引策略

### 什么时候加索引
- `WHERE` 频繁过滤的列。
- `JOIN ON` 的连接列(被驱动表的连接列必须有索引)。
- `ORDER BY` / `GROUP BY` 的列。
- 唯一性约束列(天然索引)。

### 复合索引列顺序(关键)
复合索引 `(a, b, c)` 遵循**最左前缀**:
- 能服务:`WHERE a`、`WHERE a AND b`、`WHERE a AND b AND c`、`ORDER BY a,b,c`。
- 不能服务:`WHERE b`、`WHERE c`(缺最左 a)。
- **顺序原则**:等值过滤列在前,范围过滤列在后,排序列最后。
  - 例:`WHERE status='active' AND created_at > '2026-01-01' ORDER BY id`
  - 索引:`(status, created_at, id)`。

### 索引失效的常见写法
| 写法 | 问题 | 改法 |
|---|---|---|
| `WHERE DATE(col) = '2026-08-03'` | 函数包列,索引失效 | `WHERE col >= '2026-08-03' AND col < '2026-08-04'` |
| `WHERE col + 1 = 5` | 列上运算 | `WHERE col = 4` |
| `WHERE col LIKE '%abc'` | 前缀通配 | 改全文索引或预计算;前缀 `'abc%'` 可用索引 |
| `WHERE col IS NOT NULL`(部分引擎) | — | 看执行计划 |
| 隐式类型转换 | `WHERE varchar_col = 123` | 统一类型:`= '123'` |
| `OR` 两边一列无索引 | 可能全表 | 拆 `UNION` 或确保两边都有索引 |

### 覆盖索引
查询的列全在索引里,不用回表:
- `SELECT id, name FROM users WHERE status='active'` + 索引 `(status, name, id)` → 覆盖,快。

## 二、各方言语法/函数差异(高频)

| 功能 | PostgreSQL | MySQL | SQLite | SQL Server | BigQuery |
|---|---|---|---|---|---|
| 空值替换 | `COALESCE(a,b)` | `COALESCE`/`IFNULL` | `COALESCE`/`IFNULL` | `ISNULL` | `COALESCE` |
| 分页 | `LIMIT n OFFSET m` | `LIMIT m,n` 或 `OFFSET` | `LIMIT n OFFSET m` | `OFFSET .. FETCH NEXT` | `LIMIT` |
| 字符串拼接 | `\|\|` 或 `CONCAT` | `CONCAT` | `\|\|` | `+` | `CONCAT` |
| 当前时间 | `NOW()` | `NOW()` | `datetime('now')` | `GETDATE()` | `CURRENT_TIMESTAMP` |
| 日期差 | `col - col`(interval) | `DATEDIFF` | `julianday()` 差 | `DATEDIFF` | `DATE_DIFF` |
| 大小写 | `ILIKE` | `LIKE`(默认不区分) | `LIKE` | `LIKE` | `LIKE` |
| 布尔 | `TRUE/FALSE` | `1/0` | `1/0` | `1/0` | `TRUE/FALSE` |
| 取模 | `%` | `%`/`MOD` | `%` | `%` | `MOD` |

**窗口函数**(大多现代库支持):`ROW_NUMBER() OVER(PARTITION BY .. ORDER BY ..)`、`RANK()`、`DENSE_RANK()`、`LAG()`、`LEAD()`、`SUM() OVER(..)`。

## 三、窗口函数速查

```sql
-- 每个部门薪水最高的人
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER(PARTITION BY dept ORDER BY salary DESC) rn
  FROM employees
) t WHERE rn = 1;

-- 累计求和(按日期)
SELECT date, SUM(amount) OVER(ORDER BY date) running_total FROM sales;

-- 环比(和上一行比)
SELECT date, amount,
       LAG(amount) OVER(ORDER BY date) prev_amount,
       amount - LAG(amount) OVER(ORDER BY date) AS diff
FROM sales;

-- 每组占比
SELECT user, amount,
       amount * 1.0 / SUM(amount) OVER(PARTITION BY user) AS share
FROM orders;
```

## 四、常见慢查询模式与改写

| 慢模式 | 改写 |
|---|---|
| `SELECT *` | 只取需要的列(走覆盖索引) |
| 深分页 `OFFSET 100000 LIMIT 20` | keyset 分页:`WHERE id > last_id LIMIT 20` |
| `COUNT(*)` 大表 | 维护计数表 / 近似计数 |
| `IN (子查询)` 大集 | 改 `JOIN` 或 `EXISTS` |
| 关联子查询逐行执行 | 改 join 或派生表 |
| 多次相似查询 | 一次查询 + 窗口函数/聚合 |
| join 前不预聚合 → 扇出 | 子表先聚合再 join |
| `DISTINCT` 巨大结果集 | 改 `GROUP BY` 或优化 join 消除重复根因 |
| OR 全表扫 | 拆 `UNION ALL`(去重用 UNION) |

## 五、EXPLAIN 解读要点

通用看这几列:
- **type/access**:ALL=全表扫(危险),index=全索引扫,range=范围,idx_eq/ref=索引查找,const=常量(最优)。
- **rows**:预估扫描行数,越少越好。
- **key**:实际用的索引;NULL=没用上索引。
- **Extra**:`Using index`=覆盖索引(好);`Using filesort`=额外排序(可能慢);`Using temporary`=临时表(可能慢)。

**MySQL**:`EXPLAIN ANALYZE`(8.0+)给真实执行时间和行数。
**PostgreSQL**:`EXPLAIN ANALYZE` 给真实统计;`EXPLAIN (ANALYZE, BUFFERS)`。
**BigQuery**:`EXPLAIN` 看执行计划;Query Plan 解释 stage。

## 六、防扇出(join 膨胀)

join 一对多关系再聚合,主表数字会翻倍:
```sql
-- 错:订单 join 明细后,订单金额被放大
SELECT user, SUM(order_amount) FROM orders o JOIN items i ON i.order_id=o.id GROUP BY user;

-- 对:先聚合明细,或分步
SELECT user, SUM(amount) FROM orders WHERE user=? ;  -- 订单总额单独查
```
自检:join 后行数比主表多 = 扇出了,聚合前先确认粒度。

## 七、安全与正确性

- **永远参数化查询**,不要字符串拼 SQL(SQL 注入 + 计划缓存失效)。
- 写操作给 `WHERE` 兜底(`UPDATE ... WHERE id=?`),防误全表更新。
- 危险操作前 `SELECT` 一遍看影响范围。
- 事务覆盖多步写;大事务拆小避免锁久。
