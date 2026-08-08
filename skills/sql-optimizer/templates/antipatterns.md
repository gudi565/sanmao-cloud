# 常见SQL反模式清单与修复

每条:【反模式】→【为什么慢】→【修复】。第0条是**语义正确性**问题(查出来的数据就错了),优先级高于一切性能问题,最先检查;其余按命中频率排序。

---

## 0. LEFT JOIN + WHERE 过滤内表字段 → 退化成 INNER JOIN(语义错误)

**为什么错**(不是慢,是结果错):`LEFT JOIN` 的本意是"主表行全保留,没匹配上的内表字段补 NULL"。但只要 `WHERE` 里对内表字段做了非 NULL 过滤(`WHERE o.xxx = ...` / `WHERE o.xxx >= ...` / `WHERE DATE(o.xxx)...`),那些补 NULL 的行就会被过滤条件踢掉——**LEFT JOIN 悄悄退化成 INNER JOIN**,你以为在查"所有用户含0单的",实际只查了"有单的用户"。写法与语义自相矛盾,是隐蔽的取数错误。

```sql
-- ❌ LEFT JOIN 形同虚设:WHERE 过滤 o.created_at,无订单用户全被踢掉
SELECT u.id, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 1 AND DATE(o.created_at) >= '2025-01-01'
GROUP BY u.id;

-- ✅ 修复 A:意图就是"只查有单的" → 改 INNER JOIN,意图明确,优化器计划更优
SELECT u.id, COUNT(o.id) AS cnt
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE u.status = 1 AND o.created_at >= '2025-01-01'
GROUP BY u.id;

-- ✅ 修复 B:意图真是"保留0单用户" → 内表过滤条件移到 ON 子句
SELECT u.id, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
                  AND o.created_at >= '2025-01-01'   -- 移到 ON,不匹配的行 o.* 为 NULL 仍保留
WHERE u.status = 1
GROUP BY u.id;
```

**判别规则**:`LEFT JOIN` 的内表(右表)字段出现在 `WHERE` 中且条件**不容忍 NULL**(等值/范围/函数/ `NOT IN` 等)→ 必退化。唯一例外是 `WHERE o.id IS NULL` 这种**故意**找未匹配行的写法(见重写模式9),不算反模式。

**修复方向**:先问清意图——"要不要保留没匹配上的主表行?"要 → 过滤移到 `ON`;不要 → 改 `INNER JOIN` 让语义和写法一致。

---

## 1. SELECT *

**为什么慢**:拖回所有列(网络、内存、缓冲池浪费),破坏覆盖索引(必然回表),`SELECT *` 还增加表结构变更的脆弱性。

```sql
-- ❌
SELECT * FROM orders WHERE user_id = 123;

-- ✅ 只查需要的列,可走覆盖索引
SELECT id, amount, status FROM orders WHERE user_id = 123;
```

---

## 2. 大偏移分页 LIMIT 1000000, 20

**为什么慢**:`LIMIT offset, n` 会扫描 `offset + n` 行再丢弃前 offset 行。偏移越大越慢,深翻页到百万级直接卡死。

```sql
-- ❌
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

-- ✅ 游标分页(记住上一页最后一条的id)
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 20;

-- ✅ 延迟关联(深翻页但需随机跳页时)
SELECT o.* FROM orders o
INNER JOIN (
  SELECT id FROM orders ORDER BY id LIMIT 1000000, 20
) t ON o.id = t.id;
```

> ⚠️ **套用前先判断 ORDER BY 列的性质**:上面两种修法(游标分页 / 延迟关联)都要求排序字段是表里的**物理列**(`id` / `created_at` 等)。若 `ORDER BY` 的是聚合别名(如 `ORDER BY cnt DESC`,`cnt = COUNT(*)`),游标写不出、延迟关联省不掉聚合本身,两者**都失效**——此时不要在这里硬套,直接跳 [重写模式13:聚合结果分页 → 预聚合汇总表](rewrite-patterns.md)。

---

## 3. 子查询本可改 JOIN

**为什么慢**:`IN (SELECT ...)` 老版本MySQL会物化成临时表,性能差。JOIN让优化器有更多优化空间。

```sql
-- ❌
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE vip = 1);

-- ✅ 改 JOIN(量级接近或两者都大时最通用)
SELECT o.* FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.vip = 1;

-- ✅ 外层表大、子查询结果小 → 用 IN(物化小集合驱动大外表)
SELECT * FROM orders
WHERE user_id IN (SELECT id FROM users WHERE vip = 1);

-- ✅ 外层表小、子查询结果大 → 用 EXISTS(少量外层行逐条索引探内层)
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.vip = 1);
```

> 经验:**外层大、内层(子查询结果)小 → 用 IN**(物化小集合后扫描大外表,如 orders 千万行 + vip 用户 100 行,IN 物化 100 个 id 后扫描远优于 EXISTS 的千万次回查);**外层小、内层大 → 用 EXISTS**(少量外层行逐条走索引探内层);**两者都大改 JOIN**。这是高频面试题,方向别记反。

---

## 4. UNION 用于本无重复的场景

**为什么慢**:`UNION` 要去重(内部排序+临时表);无重复场景纯属浪费。

```sql
-- ❌(两表本就不可能重复)
SELECT id, name FROM active_users
UNION
SELECT id, name FROM trial_users;

-- ✅ 用 UNION ALL,免去重
SELECT id, name FROM active_users
UNION ALL
SELECT id, name FROM trial_users;
```

---

## 5. LIKE '%keyword'(前置通配符)

**为什么慢**:B+树按前缀排序,前置 `%` 无法利用索引,必走全表/全索引扫描。

```sql
-- ❌
WHERE name LIKE '%abc'

-- ✅ 改后缀匹配(能走索引)
WHERE name LIKE 'abc%'

-- ✅ 真要模糊全文检索,上全文索引
-- MySQL: FULLTEXT INDEX + MATCH ... AGAINST
-- 或:ES / 类似检索引擎
```

---

## 6. OR 跨列无合并索引

**为什么慢**:`WHERE a=? OR b=?` 若无 `(a,b)` 合并索引,优化器可能放弃索引走全表。

```sql
-- ❌
WHERE status = 1 OR amount > 1000

-- ✅ 改 UNION ALL(各自走各自索引)
SELECT * FROM t WHERE status = 1
UNION ALL
SELECT * FROM t WHERE amount > 1000 AND status <> 1  -- 去重条件

-- ✅ 或用 IN(若是同列等值)
WHERE id IN (1, 2, 3)  -- 比 id=1 OR id=2 OR id=3 更清晰,且走索引
```

---

## 7. 隐式类型转换致索引失效

**为什么慢**:字符串列传数字(或反之),MySQL对列做隐式转换,等价于函数包裹列,索引失效。

```sql
-- ❌(phone 是 VARCHAR)
WHERE phone = 13800000000

-- ✅ 类型对齐
WHERE phone = '13800000000'

-- ❌(id 是字符串)
WHERE id = 100

-- ✅
WHERE id = '100'
```

---

## 8. ORDER BY 非索引列 → filesort

**为什么慢**:排序字段没索引,MySQL要在内存(或磁盘)做额外排序,filesort。

```sql
-- ❌(created_at 无索引)
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at;

-- ✅ 联合索引 (user_id, created_at),排序在索引内完成,免filesort
-- DDL: CREATE INDEX idx_uid_time ON orders(user_id, created_at);
```

---

## 9. 大表 JOIN 无索引

**为什么慢**:JOIN 字段无索引,走嵌套循环连接(MySQL 8.0.18+ 默认 Hash Join,Extra 显示 `Using join buffer (hash join)`;老版本或无法 hash 时退化成 Block Nested Loop),笛卡尔积级别扫描,`Using join buffer` 红灯。

```sql
-- ❌ orders.user_id 和 users.id 没建索引
SELECT * FROM orders o JOIN users u ON o.user_id = u.id;

-- ✅ 驱动表(小)放外,被驱动表(大)JOIN字段必有索引
-- users.id 是主键已有索引;orders.user_id 加索引
-- CREATE INDEX idx_orders_uid ON orders(user_id);
```

> 经验:小表驱动大表;被驱动表的JOIN字段必须有索引。

---

## 10. N+1 查询(应用层)

**为什么慢**:循环里查单条,100条数据=101次查询,网络往返成本远超SQL本身。

```
# ❌ 应用层伪代码
for user in users:
    orders = query("SELECT * FROM orders WHERE user_id = ?", user.id)

# ✅ 一次性批量取,应用层按user_id分组
orders = query("SELECT * FROM orders WHERE user_id IN (?)", user_ids)
# 再用 HashMap 按 user_id 分组
```

> 这个不是SQL优化,是应用架构问题,但往往被误诊为"SQL慢"。

---

## 11. COUNT(*) 用于分页总数(大表)

**为什么慢**:`COUNT(*)` 在无 WHERE 的 InnoDB 大表上无法用缓存行数,必须扫描最小的二级索引做**精确计数**,极慢(MVCC 下行数随事务可见性变化,这正是它不能缓存、必须现算的根本原因);带 WHERE 时更要逐行匹配过滤条件,更慢。若业务允许近似值,改用 `SHOW TABLE STATUS` 的 `Rows` 列(那才是估算值,基于统计信息)。

```sql
-- ❌ 每次翻页都 COUNT(*)
SELECT COUNT(*) FROM orders WHERE status = 1;
SELECT * FROM orders WHERE status = 1 LIMIT 0, 20;

-- ✅ 估算值(业务允许)
SHOW TABLE STATUS LIKE 'orders';  -- Rows 列近似值

-- ✅ 缓存总数,定期刷新
-- ✅ 改游标分页,"下一页"不需要总数
```

---

## 12. 对索引列用 OR + 不同类型条件混合

**为什么慢**:`WHERE indexed_col = ? OR non_indexed_expr` 会让整个条件无法走索引。

```sql
-- ❌
WHERE user_id = 1 OR DATE(create_time) = '2024-01-01'

-- ✅ 拆 UNION ALL
SELECT * FROM t WHERE user_id = 1
UNION ALL
SELECT * FROM t WHERE user_id <> 1 AND create_time >= '2024-01-01' AND create_time < '2024-01-02';
```

---

## 快速扫描清单(贴SQL时逐条对照)

- [ ] 【最先查】LEFT JOIN 的内表字段被 WHERE 过滤了吗?(语义退化,见第0条)
- [ ] 有没有 `SELECT *`?
- [ ] 有没有 `LIMIT 大数, 小数`?
- [ ] 大偏移分页的 `ORDER BY` 列是聚合结果吗?(是 → 游标/延迟关联都失效,走重写模式13预聚合)
- [ ] 子查询能改 JOIN / EXISTS 吗?
- [ ] `UNION` 该是 `UNION ALL` 吗?
- [ ] `LIKE` 有前置 `%` 吗?
- [ ] `OR` 跨列了吗?能改 UNION/IN 吗?
- [ ] 字符串列传了数字吗?(隐式转换)
- [ ] `ORDER BY` 列有索引吗?
- [ ] JOIN 字段两边都有索引吗?
- [ ] 是不是N+1查询(应用层循环)?
- [ ] 大表 `COUNT(*)` 能用估算或缓存吗?
- [ ] 索引列上有函数/运算吗?
