# 技术方案文档:{项目/功能名}

> 套用说明:把方括号占位换成实际内容,每节下面的"必答问题"逐条回答,答不上来的就在 Step 1 澄清阶段补。文档读完应能让评审人独立判断方案是否合理。

## 1. 背景与目标

### 1.1 背景
[1-3 段,讲清楚:解决什么业务问题、现状痛点、为什么现在做]

### 1.2 目标
[用可衡量的指标,不要写"提升用户体验"这种废话]
- 业务目标:[如:下单转化率从 X% 提升到 Y%]
- 技术目标:[如:核心接口 P99 < 200ms,可用性 99.9%]
- 非目标:[明确不做什么,避免范围蔓延]

## 2. 整体架构

### 2.1 分层架构图(ASCII)

```
┌─────────────────────────────────────────────┐
│  接入层  Web/H5/小程序 → API 网关(鉴权/限流)  │
└─────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  应用层  [模块A服务]  [模块B服务]  [模块C服务]  │
└─────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  领域层  订单聚合根 / 用户聚合根 / ...          │
└─────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────┐
│  基础设施  MySQL / Redis / MQ / 第三方 API     │
└─────────────────────────────────────────────┘
```

### 2.2 数据流
[描述一次典型请求的完整路径,如:用户下单 → 网关鉴权 → 订单服务 → 校验库存 → 写库 → 发 MQ → 计费服务消费]

### 2.3 关键架构决策
[为什么这样分层?哪些是过度设计可以砍掉?]

## 3. 模块拆分

| 模块 | 职责(一句话) | 对外接口数 | 依赖模块 |
|------|--------------|-----------|---------|
| [模块A] | [做什么] | N | [依赖] |

## 4. 接口设计
> 详细规范见 `api-design-spec.md`,这里只列核心接口。

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| [创建X] | POST | /api/v1/xx | ... |

## 5. 数据模型
> 表结构 + 索引 + ER 关系。

### 5.1 表结构
```sql
CREATE TABLE `t_xxx` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `xxx_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '名称',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态:0-初始,1-有效,2-失效',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` BIGINT NOT NULL DEFAULT 0 COMMENT '创建人ID',
  `updated_by` BIGINT NOT NULL DEFAULT 0 COMMENT '更新人ID',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_xxx_status` (`xxx_name`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='xxx表';
```

### 5.2 分区表 DDL 硬规则(高增长表必看)

流水/日志/事件类高增长表用 RANGE 分区控单表规模时,**必须含 MAXVALUE 兜底分区,否则超出已建分区范围的插入直接报错(生产事故)**。规则:

1. **必建兜底分区**:`PARTITION pmax VALUES LESS THAN MAXVALUE` 永远是最后一个分区,接住所有未预建月份的写入。没有它,10 月以后的数据无处可落,INSERT 直接失败。
2. **运维闭环**:每月(或每季度)用 `REORGANIZE PARTITION pmax` 从 pmax 中拆分出新的月份分区——pmax 永远不为空、永远兜底,新增分区只是把它变"薄"。这个拆分动作要进上线 checklist 或定时任务,不能靠人记。
3. **禁止写"后续按月加分区"这种注释就当完事**——方案里必须给出"谁、什么时候、用什么语句加分区"。

```sql
CREATE TABLE `t_ledger` (
  `id` BIGINT UNSIGNED NOT NULL COMMENT '主键',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount` BIGINT NOT NULL COMMENT '变动金额(正整数,方向看 direction)',
  `direction` TINYINT NOT NULL COMMENT '1收入 2支出',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`, `created_at`)   -- 分区键必须包含在主键内
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流水表'
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p202608 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p202609 VALUES LESS THAN (TO_DAYS('2026-10-01')),
  PARTITION pmax    VALUES LESS THAN MAXVALUE   -- 兜底分区,必须有,接住 10 月及以后
);

-- 每月加新分区的标准动作(从 pmax 拆出,pmax 继续兜底):
ALTER TABLE `t_ledger` REORGANIZE PARTITION pmax INTO (
  PARTITION p202610 VALUES LESS THAN (TO_DAYS('2026-11-01')),
  PARTITION pmax    VALUES LESS THAN MAXVALUE
);
```

> 注意:分区键(`created_at`)必须出现在主键/唯一键中,这是 MySQL 的硬约束,设计主键时就要把分区策略想好。

### 5.3 涉钱/积分账户的硬规则(账户 + 流水模型必守)

凡设计"余额 + 流水"类账户模型(积分、钱包、库存都适用),以下三条写死在方案里,评审必查:

1. **流水 `amount` 恒为正整数,方向只看 `direction` 字段**。禁止用负数流水表达扣减——负数在 UNSIGNED 余额 schema 下无处落,且对账 SQL(`SUM` 时漏乘方向)极易算错。流水表固定两字段:`amount BIGINT NOT NULL`(>0)+ `direction TINYINT NOT NULL`(1收入/2支出/3冻结转入/4冻结转出),`change_type` 记业务语义(签到/发放/扣减/退款冲销/过期)。
2. **退款/冲正金额超过可用余额时,走"挂账"字段,禁止"记负流水"**。可用余额是 `UNSIGNED`(>=0),退款扣回超出余额的部分没有负数可记,必须有正经落点。推荐在账户表加欠款字段:

   ```sql
   ALTER TABLE `point_account`
     ADD COLUMN `arrears` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '挂账欠款:退款应扣回但余额不足的部分,后续收入优先冲抵';
   ```

   (交易量大、需独立审计的场景也可拆独立 `point_arrears` 表:`id / user_id / order_id / amount / remaining / status(1挂账中 2已冲抵完)`,字段语义相同。)
3. **挂账 → 冲抵的完整流程**:
   - **挂账发生**:退款需扣回 R 积分,先冲销未释放部分,再扣可用余额(扣到 0 为止),仍差的差额 D 写入 `arrears += D`,同时落一条 `change_type=退款冲销, direction=支出, amount=D` 的流水。账户实际可花余额 = `available_balance`(arrears 只影响后续入账,不影响当前展示)。
   - **后续冲抵**:该账户任何一笔入账(签到/发放/释放)到达时,先扣抵 arrears:`offset = min(arrears, 入账额)`,`arrears -= offset`,实际进余额 = `入账额 - offset`,落两条流水(收入全额 + 冲抵支出 offset)。冲抵在同一事务内完成,与入账乐观锁同一把锁。
   - **风控防线(可选但推荐)**:`arrears > 阈值` 的账户限制"积分抵扣下单",防止恶意退款套利。
   - **对账口径**:恒等式 = `SUM(direction=收入 amount) - SUM(direction=支出 amount) = available_balance + frozen_balance + arrears`,每日对账跑批校验。

### 5.4 ER 关系
[文字描述:模块A的 t_a 表与模块B的 t_b 表是一对多,通过 a_id 关联]

## 6. 任务 WBS 拆解
> 详见 `wbs-template.md`。此处贴汇总表。

## 7. 风险与对策
> 详见 `risk-checklist.md`。此处列 Top 3 风险。

| 风险 | 影响 | 对策 |
|------|------|------|
| [风险1] | [高/中/低] | [对策] |

## 8. 排期估算

| 阶段 | 工时(人天) | 负责人 | 说明 |
|------|-----------|--------|------|
| 开发 | [合计] | | |
| 联调 | | | 开发 × 30% |
| 测试 | | | |
| 灰度+上线 | | | |
| **合计** | | | |

## 9. 上线与回滚方案

### 9.1 上线步骤
1. [DB 迁移:先执行向后兼容的 DDL]
2. [发版顺序:先发消费方还是先发生产方?]
3. [灰度策略:按用户 id 取模灰度 / 按机房灰度]

### 9.2 回滚方案
- 代码回滚:[发上一版本镜像]
- 数据回滚:[本次 DDL 是否可回滚?备份策略?]
- 配置回滚:[开关默认值]

## 附录:配置概览
- 技术栈:[来自 _config.json]
- 鉴权:[...]
- 主键策略:[...]
