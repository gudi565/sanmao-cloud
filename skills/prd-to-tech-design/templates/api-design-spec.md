# 接口设计规范

> 所有对外接口必须遵守本规范。评审时按此逐条对照。

## 1. 统一响应结构

所有接口(成功/失败)返回同一结构,禁止成功返回 data、失败返回裸字符串。

```json
{
  "code": 0,
  "message": "success",
  "data": { },
  "trace_id": "a1b2c3d4"
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 0 表示成功,非 0 表示错误,见错误码表 |
| message | string | 面向调用方的可读提示,禁止透传 SQL 等敏感信息 |
| data | object/array | 业务数据,失败时可为 null |
| trace_id | string | 链路追踪 ID,便于排查 |

## 2. 错误码分段

错误码分段管理,避免冲突:

| 区间 | 含义 | 示例 |
|------|------|------|
| 0 | 成功 | 0 |
| 10000-19999 | 客户端参数/业务校验错误 | 10001 参数缺失 |
| 20000-29999 | 鉴权/权限错误 | 20001 未登录、20002 无权限 |
| 30000-39999 | 业务流程错误 | 30001 余额不足 |
| 50000-59999 | 系统/第三方错误 | 50001 DB 异常、50002 三方超时 |

> **40000-49999 段刻意预留**,避免与 HTTP 4xx 状态码联想混淆;业务错误一律走 1xxxx/3xxxx 段(即 10000-19999 与 30000-39999)。若未来需要细分限流/降级等网关层错误,统一下沉到 50000 段。

命名建议:错误码用常量枚举集中定义,禁止散落在代码各处硬编码。

## 3. RESTful 风格约定

| 操作 | 方法 | URL | 示例 |
|------|------|-----|------|
| 列表 | GET | /api/v1/resources | GET /api/v1/orders |
| 详情 | GET | /api/v1/resources/{id} | GET /api/v1/orders/123 |
| 创建 | POST | /api/v1/resources | POST /api/v1/orders |
| 全量更新 | PUT | /api/v1/resources/{id} | PUT /api/v1/orders/123 |
| 部分更新 | PATCH | /api/v1/resources/{id} | PATCH /api/v1/orders/123 |
| 删除 | DELETE | /api/v1/resources/{id} | DELETE /api/v1/orders/123 |
| 动作型接口(非 CRUD) | POST | /api/v1/resources/{id}/{action} | POST /api/v1/orders/123/cancel |

补充约定:
- 资源名用名词复数,小写,中划线分词(`order-items` 不用 `orderItems`)
- 版本号放 URL 路径(`/v1/`),不放 header
- 动作型接口直接把动词作为子资源,如 `/cancel`、`/refund`,不另建 `/actions` 集合

## 4. 分页 / 排序 / 过滤

| 参数 | 说明 | 示例 |
|------|------|------|
| page | 页码,从 1 开始 | page=1 |
| page_size | 每页条数,上限 100 | page_size=20 |
| sort | 排序字段,`-` 前缀表降序 | sort=-created_at, name |
| 过滤 | 字段名=值,多值用逗号 | status=1,2 |

列表响应固定结构:
```json
{
  "code": 0, "message": "success",
  "data": {
    "list": [ ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

> 深翻页(页码 > 100)改用游标分页:`cursor=xxx&page_size=20`,返回 `next_cursor`。
>
> **适用边界**:游标分页不支持随机跳页,仅适合无限流/时间线/消息列表这类"只往下刷"的场景;管理后台、报表这类需要跳页/导出的场景仍用 offset 分页,并通过限制最大页数或按时间收敛来解决深翻页性能问题。

## 5. 鉴权

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| JWT | 前后端分离、移动端 | Header: `Authorization: Bearer <token>` |
| Session | 传统 Web | Cookie + SessionID |
| API Key / 签名 | 服务间调用 | app_id + timestamp + sign,防重放 |

所有接口默认标注鉴权要求:`public` / `login` / `permission:xxx`。

## 6. 幂等与并发(写接口必答)

| 场景 | 方案 |
|------|------|
| 幂等 | 写接口接收 `Idempotency-Key`(建议 UUID),服务端 24h 内去重 |
| 并发更新 | 乐观锁:`UPDATE ... SET version=version+1 WHERE id=? AND version=?`,影响行数=0 即冲突 |
| 库存扣减 | 乐观锁或分布式锁,禁止先查后减 |
| 状态流转 | 状态机校验,非法跃迁直接拒绝 |

## 7. 接口文档模板(单接口)

```
POST /api/v1/orders
鉴权: login
幂等: 支持(Idempotency-Key)
描述: 创建订单

请求体:
  user_id     int64   必填  下单用户
  sku_id      int64   必填  商品 SKU
  quantity    int     必填  数量,>=1
  address_id  int64   必填  收货地址

响应 data:
  order_id    int64   订单 ID
  status      int     初始状态

错误码:
  30001  余额不足
  30002  库存不足
  30003  地址不存在
```
