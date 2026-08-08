# 代码审查报告模板

套用此模板输出。按严重度分组,critical 在前。开头给总体结论 + 必修项计数,便于快速决策是否合并。可直接整段贴到 PR 评论。

---

## 审查结论

- **审查范围**:`<文件/目录/PR>`
- **审查维度**:`<正确性 / 安全 / 性能 / 可维护 / 全四维>`
- **语言/栈**:`<Java / Go / Python / Node ...>`
- **总体结论**:<1-2 句,如"发现 2 个 critical(支付金额用 double、密钥硬编码),建议修复后再合并">
- **问题计数**:critical `<n>` / major `<n>` / minor `<n>`
- **合并建议**:🔴 阻塞 / 🟡 条件通过 / 🟢 通过

## 待确认清单(可选,集中所有 `<需确认>` 项)

> 所有需要用户拍板/补全的点集中在此,正文不再散落"需确认/未提供"叙述。每条注明"确认后影响哪条结论"。粘贴场景下能用主流约定兜底的,不进本清单(见 SKILL.md Step 5 规则 B/C)。**全报告 `<需确认>` 不超过 5 条**;没有就删掉本节。

- `<需确认: 上层控制器是否已对 create_order 做幂等>` —— 影响 C4 是否降为 note。
- `<需确认: orders.user_id 是否已建索引>` —— 影响 M1 性能结论的严重程度。

## 🔴 Critical(必须修,阻塞合并)

> **同函数多 critical 合并**:若多条 critical 命中同一函数(如 create_order 同时有 SQL 注入 + float + 缺幂等),**禁止各给一份互斥签名的修复**,也**禁止在正文贴可独立替换的函数级补丁**(不含其他修复的"完整函数"贴片即第二份互斥落地版)。正文各条只贴"带变化行锚点的 diff 片段(1-3 行,仅作定位)" + 写"采用下方「统一修复后的 create_order」";唯一可直接替换的代码只允许出现在报告末尾「统一修复后的完整函数」节(见 SKILL.md Step 5 规则 A)。**改该函数签名/参数/返回值的 major/minor 也一并并入合并组**(规则 A step 2),在统一版里修复并标注贡献,不得另起一份冲突签名。

### C1. `<问题标题,如:支付金额计算使用 double 存在精度丢失>`

- **位置**:`src/order/Price.java:42`(文件:行号)
- **维度**:正确性 / 安全 / ...
- **严重度**:critical
- **问题**:<2-4 句:为什么是 critical、会怎么出错、能否给出出错/利用路径>
- **修复建议**(附可用代码,可直接粘贴):

```java
// 修复前
double total = price * qty;

// 修复后:金额统一用分(int)或 BigDecimal
// 禁用 new BigDecimal(double)——它会把 double 的二进制误差原样带进来
// (new BigDecimal(0.1) 会得到 0.1000000000000000055...),必须用 BigDecimal.valueOf(double) 走字符串中间态,
// 或直接 new BigDecimal("0.10") 字符串构造。源头最好直接把金额存成 int(分),从根上避开 double。
// 注:driver/框架写法按实际项目约定调整(粘贴场景默认走主流约定)
BigDecimal total = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(qty));
```

> 若本条与 Cx 共同命中同一函数(合并组):**本条只贴「带变化行锚点的 diff 片段(1-3 行)」作定位,不贴可独立替换的函数级补丁**;再写"采用下方「统一修复后的 xxx」+ 本条贡献:<一句话,如"amount 改 int(分)、删 *1.0">",统一落地版见末节「统一修复后的完整函数」。

### C2. `<问题标题>`
(同上格式)

## 🟡 Major(应修,建议本 PR 处理)

### M1. `<问题标题,如:用户列表接口存在 N+1 查询>`

- **位置**:`src/user/Service.java:78`
- **维度**:性能
- **严重度**:major
- **问题**:<说明 + 潜在风险,如"循环内逐条查角色,用户量上千时会显著变慢">
- **修复建议**:<方向 + 关键代码行,如改 JOIN 查询或批量 IN 查询,不强制完整 diff>

## 🟢 Minor(建议修,不阻塞)

- **m1**. `src/x.java:12` — 命名建议:`data2` 改为 `pendingOrders`,达意。
- **m2**. `src/y.java:30` — 魔法数字 `86400` 抽常量 `SECONDS_PER_DAY`。

(minor 用列表即可,无需展开成块)

---

## 统一修复后的完整函数(当多条 critical 命中同一函数时必给)

> 当 ≥2 条 critical 命中同一函数(如 create_order),正文各条只贴本条 diff;**最终可落地的合并版放这里**,签名 = 所有修复(含 SKILL.md 规则 A step 2 并入的同函数 major/minor)的并集,内部自洽、覆盖组内每条 critical 及并入项的修复点。只有一条 critical 命中该函数时无需本节。开发者复制这一份即可同时修掉 C1/C3/C4(+ m5),不再面对互斥签名。

### `create_order`(合并 C1 SQL 注入 + C3 金额 float + C4 幂等 + m5 返回值)

```python
# 统一修复:参数化 + 金额用分(int) + 幂等键 + 返回 order_id,一次覆盖 C1/C3/C4/m5
# driver/占位符按实际项目调整(粘贴场景默认 %s / psycopg2 风格)
from decimal import Decimal

def create_order(amount_yuan, user_id: int, nonce: str) -> int:
    # C3 贡献:金额改 int(分),从根上避开 float;Decimal 必须字符串构造
    if not isinstance(amount_yuan, Decimal):
        amount_yuan = Decimal(str(amount_yuan))
    amount_cents = int((amount_yuan * 100).to_integral_value())
    # C4 贡献:key 模板固定(粘贴场景不猜上层、不写"需确认/若上层已有";上层幂等判断走待确认清单)。
    # 模板语法按该语言默认(f-string / 模板字符串 / Sprintf),不含确认叙述,直接可粘。
    idem_key = f"create_order:{user_id}:{amount_cents}:{nonce}"
    try:
        # C1 贡献:参数化,SQL 与数据分离;C4 贡献:写 idem_key;m5 贡献:RETURNING id 拿回主键
        db.execute(
            "INSERT INTO orders (amount_cents, user_id, status, idem_key) "
            "VALUES (%s, %s, %s, %s) RETURNING id",
            (amount_cents, user_id, OrderStatus.INIT.value, idem_key),
        )
        return db.lastrowid  # m5 贡献:返回 order_id 而非 total,调用方能拿单号去支付/查单
    except UniqueViolation:
        # C4 贡献:命中幂等返回既有订单,不重复下单;DB 唯一约束兜底(仅业务判重不算修复)
        row = db.query("SELECT id FROM orders WHERE idem_key = %s", (idem_key,))
        return row["id"]
# 配套 DDL:ALTER TABLE orders ADD UNIQUE KEY uk_idem (idem_key);
```

---

## 跳过项(可选)

- 已跳过:`<生成代码 / 第三方 / 测试 mock 路径>`,原因:`<约定 / 生成物 / 测试需要>`。
- 误报过滤:`<看起来有问题但实则是框架约定的项,已确认不报>`。

## 附注

- 本次未实测性能,性能类问题标注为"风险",需 benchmark 确认。
- 业务规则正确性不在本次审查范围,建议对照需求文档复核。
- 并发类结论已确认临界区内容;若仍有疑虑,建议补充并发测试。
