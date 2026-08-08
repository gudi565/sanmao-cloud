# SQL重写模式库

每条:**模式名 → 原写法 → 改后写法 → 适用条件**。可直接套用。

---

## 模式1:子查询 → JOIN

```sql
-- 原写法
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE vip = 1);

-- 改后写法
SELECT o.* FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.vip = 1;
```

**适用条件**:子查询结果集较大、两表都能走索引。**外层表大、子查询结果小 → 优先用 `IN`**(物化小集合驱动大外表);**外层表小、子查询结果大 → 优先用 `EXISTS`**(少量外层行逐条索引探内层);两者都大时 JOIN 最通用。

---

## 模式2:大偏移分页 → 游标分页

```sql
-- 原写法(深翻页到百万级卡死)
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

-- 改后写法(记住上一页最后一条的id)
SELECT * FROM orders WHERE id > :last_id ORDER BY id LIMIT 20;
```

**适用条件**:
- 连续翻页(上一页/下一页),不需随机跳页。
- 排序字段有唯一性或联合主键保证游标稳定。
- 若必须随机跳页,用延迟关联(见下)。

**失效边界(必须先检查,不满足直接跳模式13)**:`ORDER BY` 的列是**聚合结果**(如 `COUNT(*)` / `SUM(x)` 的别名)时,游标分页失效——聚合值不是物理列,没有索引可依,`WHERE cnt > :last_cnt` 无法走索引反而重复触发全量聚合。此时不要硬套游标,跳到**模式13(聚合结果分页 → 预聚合汇总表)**。

---

## 模式3:大偏移分页 → 延迟关联(需跳页时)

```sql
-- 原写法
SELECT * FROM orders ORDER BY created_at LIMIT 1000000, 20;

-- 改后写法(子查询走覆盖索引取id,再回表)
SELECT o.* FROM orders o
INNER JOIN (
  SELECT id FROM orders ORDER BY created_at LIMIT 1000000, 20
) t ON o.id = t.id;
```

**适用条件**:必须保留随机跳页能力;`id` 和 `created_at` 都有索引。子查询走 `Using index`,大幅减少回表量。

**失效边界(必须先检查,不满足直接跳模式13)**:`ORDER BY` 的列是**聚合结果**(如 `ORDER BY cnt DESC`,`cnt = COUNT(*)`)时,延迟关联只能省"回表取字段"的开销,**内层子查询仍要对全量数据做聚合 + filesort + 大偏移扫描**,核心成本一点没少。此时延迟关联不是答案,跳到**模式13(聚合结果分页 → 预聚合汇总表)**。

---

## 模式4:SELECT * → 指定列

```sql
-- 原写法
SELECT * FROM orders WHERE user_id = 123;

-- 改后写法
SELECT id, amount, status, created_at
FROM orders
WHERE user_id = 123;
```

**适用条件**:任何时候。配合覆盖索引可走 `Using index`。

---

## 模式5:循环单条 → 批量

```sql
-- 原写法(应用层循环,N+1)
for id in ids:
    SELECT * FROM orders WHERE id = ?

-- 改后写法(一次查回)
SELECT * FROM orders WHERE id IN (?, ?, ?, ...);
```

**进阶**:大批量IN可能撑爆SQL长度限制,分批(每批500-1000个):

```sql
-- 分批
SELECT * FROM orders WHERE id IN (?, ...500个...);
```

**适用条件**:任何时候批量优于循环单条。

---

## 模式6:COUNT子查询 → JOIN + GROUP BY 聚合

```sql
-- 原写法(每个用户单独 COUNT)
SELECT u.name,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS cnt
FROM users u;

-- 改后写法(一次聚合)
SELECT u.name, COALESCE(t.cnt, 0) AS cnt
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders
  GROUP BY user_id
) t ON u.id = t.user_id;
```

**适用条件**:一对多关系,需要"父表 + 子表计数"。避免对每行触发一次子查询。

---

## 模式7:OR 跨列 → UNION

```sql
-- 原写法
SELECT * FROM orders WHERE status = 1 OR amount > 10000;

-- 改后写法(各自走各自索引,注意去重)
SELECT * FROM orders WHERE status = 1
UNION
SELECT * FROM orders WHERE amount > 10000 AND status <> 1;
```

**适用条件**:两列各有索引但无合并索引;两条件结果可能重叠时用 `UNION`(去重),确定不重叠用 `UNION ALL`。

---

## 模式8:函数包裹索引列 → 范围条件

```sql
-- 原写法(索引失效)
SELECT * FROM orders WHERE DATE(create_time) = '2024-01-01';

-- 改后写法(走索引范围)
SELECT * FROM orders
WHERE create_time >= '2024-01-01'
  AND create_time <  '2024-01-02';
```

**适用条件**:对索引列做函数/运算的场景。能改范围就改范围;实在改不了,MySQL **8.0.13+** 用函数索引(表达式索引),**5.7** 只能用生成列(generated column)索引——先建生成列再在其上建索引。

---

## 模式9:NOT IN → LEFT JOIN IS NULL

```sql
-- 原写法(NOT IN 在大表上慢)
SELECT * FROM orders
WHERE user_id NOT IN (SELECT id FROM blacklisted_users);

-- 改后写法(LEFT JOIN + IS NULL)
SELECT o.* FROM orders o
LEFT JOIN blacklisted_users b ON o.user_id = b.id
WHERE b.id IS NULL;
```

**适用条件**:排除型查询,`NOT IN` 性能差且对NULL语义有坑。`NOT EXISTS` 也是替代选项。

---

## 模式10:UNION 去重 → DISTINCT 或前置过滤

```sql
-- 原写法(多个查询UNION只为去重)
SELECT user_id FROM vip_orders
UNION
SELECT user_id FROM trial_orders;

-- 若两表本就不重叠,直接 UNION ALL
SELECT user_id FROM vip_orders
UNION ALL
SELECT user_id FROM trial_orders;

-- 若需去重,DISTINCT 往往更清晰
SELECT DISTINCT user_id FROM (
  SELECT user_id FROM vip_orders
  UNION ALL
  SELECT user_id FROM trial_orders
) t;
```

---

## 模式11:多层嵌套子查询 → CTE 或临时表

```sql
-- 原写法(嵌套3层,难读难优化)
SELECT * FROM (
  SELECT * FROM (
    SELECT * FROM orders WHERE status = 1
  ) t1 WHERE amount > 100
) t2 WHERE user_id IN (1,2,3);

-- 改后法(MySQL 8.x / PG 用 CTE)
WITH base AS (
  SELECT * FROM orders WHERE status = 1
), filtered AS (
  SELECT * FROM base WHERE amount > 100
)
SELECT * FROM filtered WHERE user_id IN (1,2,3);
```

**适用条件**:MySQL 8.0+ / PostgreSQL。CTE提升可读性,部分场景优化器能物化复用。MySQL 5.7 没有 CTE,只能用临时表或派生表。

---

## 模式12:ORDER BY RAND() → 预计算随机

```sql
-- 原写法(大表上灾难,每行生成随机数再排序)
SELECT * FROM orders ORDER BY RAND() LIMIT 5;

-- 改后写法(先取随机id,再回表)
SELECT o.* FROM orders o
JOIN (
  SELECT id FROM orders
  WHERE id >= (SELECT FLOOR(RAND() * MAX(id)) FROM orders)
  LIMIT 5
) t ON o.id = t.id;
```

**适用条件**:随机取样的场景。注意主键有空洞时分布略偏,业务可接受即可。

---

## 模式13:聚合结果分页 → 预聚合汇总表

**什么时候走这条**:`ORDER BY` 的列是聚合结果(`COUNT` / `SUM` 的别名,如 `ORDER BY cnt DESC`)且带 `LIMIT` 大偏移。这是模式2/3的共同失效场景——聚合值无索引,游标写不出、延迟关联省不掉聚合本身。**这是排行榜/消费排行/活跃榜类高频场景的终局方案。**

```sql
-- 原写法(对2000万行 orders 聚合 + filesort + 扫10万行丢10万行)
SELECT u.id, u.nickname, COUNT(o.id) AS cnt, SUM(o.amount) AS total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 1 AND o.created_at >= '2025-01-01'
GROUP BY u.id
ORDER BY cnt DESC
LIMIT 100000, 20;
```

**改后写法,完整三段式:**

```sql
-- 第1段:建汇总表(排序键进索引,让翻页 ORDER BY 走索引)
CREATE TABLE user_order_stats (
  user_id BIGINT PRIMARY KEY,
  status TINYINT,
  order_cnt INT,
  amount_total DECIMAL(14,2),
  stat_date DATE,
  updated_at DATETIME,
  INDEX idx_status_cnt (status, order_cnt)   -- 翻页排序走它,免filesort
);

-- 第2段:定时任务刷新(INSERT ... ON DUPLICATE KEY UPDATE,幂等可重跑)
INSERT INTO user_order_stats
SELECT u.id, u.status, COUNT(o.id), COALESCE(SUM(o.amount),0), CURDATE(), NOW()
FROM users u INNER JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= '2025-01-01'
GROUP BY u.id, u.status
ON DUPLICATE KEY UPDATE
  order_cnt=VALUES(order_cnt),
  amount_total=VALUES(amount_total),
  status=VALUES(status),
  updated_at=NOW();

-- 第3段:翻页查询改查汇总表(小表+索引排序,毫秒级)
SELECT s.user_id, s.order_cnt, s.amount_total, u.nickname
FROM user_order_stats s
JOIN users u ON u.id = s.user_id
WHERE s.status = 1 AND s.stat_date = CURDATE()
ORDER BY s.order_cnt DESC
LIMIT 100000, 20;
```

**适用条件**:
- 排序/过滤都打在聚合结果上,原表行数千万级以上。
- 业务能接受 **T+1(或准实时,看刷新频率)** 的时效性——这是必须显式告知用户的权衡,不接受就不能用。
- 汇总表行数 = 聚合后的分组数(用户数级),远小于原表,翻页排序成本降一到两个数量级。

**过渡方案**(用户暂不接受 T+1 时):SQL重写(去函数、改INNER JOIN)+ 联合索引打底,延迟关联省回表(见模式3的失效边界——它只省回表,聚合成本仍在),同时明确告知"深翻页根因未除,终局是预聚合"。

---

## 使用建议

1. **先看反模式清单**(`antipatterns.md`)定位命中哪条,再来这里找对应重写模板。
2. **一次只改一处**:大改容易引入语义错误,逐项改并验证。
3. **重写后必跑EXPLAIN**:确认执行计划真的变好了,别凭感觉。
4. **标注语义变更**:游标分页、去重逻辑变更会改变行为,必须告知用户权衡。
