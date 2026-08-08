# 实战:3 个慢查询的 EXPLAIN 诊断与优化

> 方言以 MySQL(InnoDB / 8.0+)为主,关键处附 PostgreSQL 注解。所有 EXPLAIN 关键字段均按真实输出格式标注。

---

### 案例 1:状态 + 时间范围筛选分页,全表扫 + filesort

**业务场景**:电商订单后台,运营在 `orders` 表(1200 万行)按"已支付 + 近一个月"筛单,按创建时间倒序翻页。页面加载越来越慢。

**问题 SQL**:
```sql
SELECT id, order_no, user_id, amount, created_at
FROM orders
WHERE status = 'PAID'
  AND created_at >= '2026-07-01'
ORDER BY created_at DESC
LIMIT 20;
```

**EXPLAIN 关键字段**:
| 列 | 值 | 危险信号 |
|---|---|---|
| type | **ALL** | 🔴 全表扫描 |
| key | **NULL** | 🔴 没走任何索引 |
| rows | **12,800,000** | 🔴 预估扫了 1280 万行 |
| Extra | **Using where; Using filesort** | 🔴 排序无法用索引,额外排序 |

**为什么慢**:
1. 表上只有一个 `status` 单列索引。`status='PAID'` 占全表约 40%(已支付是常态状态),选择性极低,优化器算完发现"走索引回表 500 万次"比"直接全表扫"还贵,于是放弃索引。
2. `ORDER BY created_at` 与 `status` 单列索引无关,无法利用索引有序性 → 触发 `Using filesort`。LIMIT 20 也没省,因为得先把 1280 万行扫完排完才能取前 20。
3. 这正是方法论里"等值过滤列在前、范围/排序列在后"要解决的问题——缺的是一个把 `status` 和 `created_at` 串起来的复合索引。

**优化后 SQL**:查询本身不用改,补索引即可。

**配套索引**:
```sql
ALTER TABLE orders ADD INDEX idx_status_created (status, created_at);
```
**列顺序解释**:`status` 等值过滤放最左,`created_at` 兼做范围过滤与排序键紧随其后。这样优化器能先在 `status='PAID'` 上等值定位、再沿 `created_at` 有序扫描(降序),范围扫描天然有序,**filesort 自动消除**。

> 是否做成覆盖索引?`SELECT` 还要 `order_no / user_id / amount`,真要覆盖得把 5 列全塞进索引,对一张写频繁的订单表代价过高。这里只要 LIMIT 20,即便回表也只是 20 次 random read,完全可接受——这是"索引宽度 vs 写成本"的取舍,不是越覆盖越好。

**优化后 EXPLAIN**:
| 列 | 值 | 说明 |
|---|---|---|
| type | **range** | 走索引范围扫描 |
| key | **idx_status_created** | |
| rows | **8,500** | 🟢 从 1280 万降到 8500 |
| Extra | **Using index condition** | 🟢 无 filesort(ICP 下推过滤) |

**量化提升**:扫描行数 **12,800,000 → 8,500**;耗时 **1,180ms → 7ms**(约 **170×**)。filesort 消除后内存占用也从 ~600MB 降到几乎为 0。

> **PostgreSQL 注解**:PG 下看 `EXPLAIN ANALYZE`,改后是 `Index Scan using idx_status_created`(或返回大量行时走 `Bitmap Heap Scan`)。PG 的 `random_page_cost` 默认 4.0,SSD 上可调到 1.1,否则优化器有时会误选 Seq Scan。

---

### 案例 2:后台深分页 OFFSET 100 万,翻到第 5 万页直接卡死

**业务场景**:商户后台查看历史订单,每页 20 条。前几页飞快,翻到第 5 万页(`OFFSET 1000000`)时请求超时。

**问题 SQL**:
```sql
SELECT id, order_no, amount, created_at
FROM orders
WHERE merchant_id = 8821
ORDER BY id DESC
LIMIT 20 OFFSET 1000000;
```

**EXPLAIN 关键字段**:
| 列 | 值 | 危险信号 |
|---|---|---|
| type | ref | (走索引) |
| key | **idx_merchant_id** | |
| rows | **1,000,020** | 🔴 预估扫描 100 万 + 行 |
| Extra | (无 filesort,id 有序) | |

**为什么慢**:
看似走了索引、也没 filesort,却照样卡死。根因是 **OFFSET 的本质**:数据库必须"生成并丢弃"前 100 万行,才能返回第 1,000,001~1,000,020 这 20 行。在 InnoDB 里,二级索引 `idx_merchant_id` 存的是 `(merchant_id, id)`,但要取 `order_no / amount / created_at` 还得**回主键取聚簇索引行**——也就是要白白回表 **100 万次**,把 100 万行整行读出来再扔掉。翻得越深越慢,是 **O(N)** 的线性代价。

**优化后 SQL**(keyset / 游标分页):
```sql
-- 第一页:多取 1 条用于算下一页游标
SELECT id, order_no, amount, created_at
FROM orders
WHERE merchant_id = 8821
ORDER BY id DESC
LIMIT 21;

-- 第 N 页:已知上一页最后一条 id = :last_id
SELECT id, order_no, amount, created_at
FROM orders
WHERE merchant_id = 8821 AND id < :last_id
ORDER BY id DESC
LIMIT 21;
```

**配套索引**:
```sql
-- 原有单列索引即可,InnoDB 二级索引已隐式含主键:
--   idx_merchant_id (merchant_id)  实际存储为 (merchant_id, id)
-- 因此 WHERE merchant_id=? AND id<?  ORDER BY id DESC 能直接走该索引,
-- 范围扫描且天然有序,无需新建索引。
```

**列顺序解释**:InnoDB 每个二级索引的叶子节点都自动带上主键 `id` 做行定位符,所以 `(merchant_id)` 物理上等价于 `(merchant_id, id)`——keyset 分页踩中了这个"免费"的复合前缀,`merchant_id` 等值定位后沿 `id` 降序范围扫,直接命中目标行,不需要任何额外索引。

> **进阶**:若排序键不是主键而是 `created_at`,则 InnoDB 不会白送,必须显式建 `(merchant_id, created_at, id)`;若查询列很多想避免回表,可用**延迟关联**:先走覆盖索引子查询取出 20 个主键,再 JOIN 回表取其他列,把回表次数从"OFFSET + LIMIT"降到"LIMIT"。
> ```sql
> SELECT o.* FROM orders o
> JOIN (
>   SELECT id FROM orders
>   WHERE merchant_id = 8821 AND id < :last_id
>   ORDER BY id DESC LIMIT 20
> ) t ON t.id = o.id;
> ```

**优化后 EXPLAIN**(第 N 页):
| 列 | 值 | 说明 |
|---|---|---|
| type | **range** | `id < :last_id` 范围扫描 |
| key | **idx_merchant_id** | |
| rows | **21** | 🟢 恒定 21 行 |
| Extra | **Using index condition** | 🟢 |

**量化提升**:扫描行数 **1,000,020 → 21**;翻到第 5 万页 **2,340ms → 3ms**(约 **780×**),且**无论翻到第几页耗时恒定**(从 O(N) 降到 O(1))。

> **PostgreSQL 注解**:PG 同理用 keyset(`WHERE (merchant_id, id) < (?, ?)`行比较或 `id < :last_id`)。PG 没有"聚簇索引回表"的概念,但原理一致——OFFSET 仍要物化丢弃。注意 PG 的 keyset 用行比较时需建 `(merchant_id, id)` 复合索引才能高效。

---

### 案例 3:三表 join 一对多扇出,聚合不仅慢、数字还翻倍错了

**业务场景**:用户消费报表,要统计每个用户的「订单数 / 订单总金额 / 收货地址数」。三张表:`orders`(订单)、`order_items`(订单明细,每单多条)、`user_addresses`(收货地址,每用户多条)。

**问题 SQL**:
```sql
SELECT
  o.user_id,
  COUNT(*)                  AS order_cnt,
  SUM(o.amount)             AS total_amount,
  COUNT(DISTINCT ua.id)     AS addr_cnt
FROM orders o
JOIN order_items    oi ON oi.order_id  = o.id
JOIN user_addresses ua ON ua.user_id   = o.user_id
WHERE o.created_at >= '2026-07-01'
GROUP BY o.user_id;
```

**EXPLAIN 关键字段**:这个案例的危险信号不在单步的 `type`,而在 **join 后行数逐级膨胀**——这正是最隐蔽、最体现"懂行"的一类 bug:SQL 能跑出结果,但结果是**错的**,还顺带慢得要命。

| 步骤 | type | key | rows(每行驱动) | 说明 |
|---|---|---|---|---|
| o | range | idx_created | 12,000 | 7 月以来的订单 |
| oi | ref | idx_order_id | **3** | 每单 3 条明细 |
| ua | ref | idx_user_id | **2** | 每用户 2 个地址 |
| 最终 | — | — | **~72,000 组合行** | 🔴 12,000 × 3 × 2 膨胀 |
| Extra(聚合步) | — | — | — | 🔴 **Using temporary; Using filesort** |

**为什么慢 + 为什么错**:
1. `order_items` 与 `user_addresses` **两者都跟 `orders` 一对多**,它们之间彼此做笛卡尔积。一个订单有 3 条明细 + 该用户有 2 个地址 → join 后这一条订单变成 **3 × 2 = 6 行**。
2. `COUNT(*)` 直接变 6 倍(把 1 个订单数成了 6 个);`SUM(o.amount)` 把订单金额累加了 6 次(**金额翻 6 倍!**)。这不是慢的问题,是**数据错误,且报表上看不出来**。
3. `COUNT(DISTINCT ua.id)` 表面结果"对"(=2),但这是在一个已经膨胀到 6 倍的笛卡尔积上做去重,DISTINCT 的内存/排序代价随膨胀行数暴涨。
4. 这就是方法论"防扇出"那条:join 一对多再聚合,主表数字会翻倍。**自检方法:`SELECT COUNT(*) FROM (上面去掉 GROUP BY 的 join) t` 和 `SELECT COUNT(*) FROM orders WHERE ...` 对比,前者远大于后者 = 扇出了。**

**优化后 SQL**(子表预聚合,消除笛卡尔):
```sql
SELECT
  o.user_id,
  COUNT(*)                  AS order_cnt,   -- 现在 1 订单 = 1 行,正确
  SUM(o.amount)             AS total_amount, -- 不再翻倍
  ua_stat.addr_cnt
FROM orders o
LEFT JOIN (
  SELECT user_id, COUNT(*) AS addr_cnt
  FROM user_addresses
  GROUP BY user_id
) ua_stat ON ua_stat.user_id = o.user_id
WHERE o.created_at >= '2026-07-01'
GROUP BY o.user_id;
```

> 关键判断:`order_items` 在本需求里**根本不需要 join**——订单金额 `amount` 已经在 `orders` 上,明细是另一个粒度。如果确实要明细维度(如总件数、明细总额),必须在子查询里**先按 `order_id` 聚合**,让每个订单在 join 前收缩成 1 行:
> ```sql
> WITH item_stat AS (
>   SELECT order_id, SUM(qty) AS item_qty
>   FROM order_items
>   GROUP BY order_id        -- 预聚合:每单 1 行
> )
> SELECT o.user_id,
>        COUNT(*)            AS order_cnt,
>        SUM(o.amount)       AS total_amount,
>        SUM(item_stat.item_qty) AS total_qty
> FROM orders o
> LEFT JOIN item_stat ON item_stat.order_id = o.id   -- 1:1 join,不扇出
> WHERE o.created_at >= '2026-07-01'
> GROUP BY o.user_id;
> ```

**配套索引**:
```sql
-- 子查询预聚合需要(连接列建索引):
ALTER TABLE order_items    ADD INDEX idx_order_id (order_id);
ALTER TABLE user_addresses ADD INDEX idx_user_id  (user_id);
-- orders 过滤 + 分组:
ALTER TABLE orders ADD INDEX idx_created_user (created_at, user_id);
```
**列顺序解释**:预聚合子查询走 `idx_order_id` / `idx_user_id` 做覆盖扫描(只读连接列计数,`Using index`),`orders` 用 `(created_at, user_id)` 让范围过滤与 GROUP BY 都受益。

**优化后 EXPLAIN**:
| 步骤 | type | Extra | 说明 |
|---|---|---|---|
| orders | range | Using index condition | 12,000 行 |
| ua_stat(派生表) | index | **Using index** | 🟢 覆盖索引,只数连接列 |
| join | eq_ref / ref | — | 🟢 1:1,不再膨胀 |
| 聚合 | — | (临时表更小) | 🟢 行数从 7.2 万降到 ~1.2 万 |

**量化提升**:join 组合行数 **72,000 → 12,000**;耗时 **3,820ms → 115ms**(约 **33×**)。**更重要的是 `COUNT(*)` / `SUM(amount)` 从"错"变"对"**——这种 bug 不会报错、只会让报表数字虚高,往往要等对账才发现。

> **PostgreSQL 注解**:PG 同样会在 join 后产生膨胀的行数(看 `EXPLAIN ANALYZE` 里每个节点 `actual rows` vs `loops`)。PG 推荐用 CTE(如本例 `WITH`)或 LATERAL 预聚合;注意 PG 12+ 前 CTE 是优化屏障(inlining 关闭),反而能保证预聚合先执行。

---

这些案例对应 sql-helper 的索引策略与慢查询改写规则,装上后 Claude 会主动按这套思路给你建议。