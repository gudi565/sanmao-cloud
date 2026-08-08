# 需求转技术方案

> 把一份 PRD 或需求描述,在 10 分钟内转成能直接进评审会的完整技术方案——九段式文档 + 骨架代码。

## 这是什么

一个把"需求"变成"可评审技术方案"的 Claude Code skill。它封装了一套资深开发者在脑子里隐式使用的 checklist:九段式文档结构、接口契约规范、WBS 任务拆解法、六类风险识别表、技术选型决策树,强制你在写方案时把架构、接口、数据模型、任务、风险、排期、回滚每一项都想到位。产出是一份别人挑不出大毛病的设计文档,外加一套可落地的目录骨架代码。

## 30 秒上手

1. **安装**:把整个 `prd-to-tech-design/` 文件夹放到 `~/.claude/skills/` 下(或项目级 `.claude/skills/`)
2. **调用**:在 Claude Code 里输入 `/prd-to-tech-design <需求文件路径或需求描述>`
3. **拿结果**:按 Step 0–8 分步流程产出成稿,直接复制进评审文档

**示例一**(直接描述需求):
```
/prd-to-tech-design 用户积分商城:签到攒积分,积分可兑换优惠券和实物奖品
```

**示例二**(传 PRD 文件路径):
```
/prd-to-tech-design ./docs/prd-order-refactor.md
```

## 它能帮你做什么

- **九段式文档一键成稿**:背景/架构/模块/接口/数据模型/WBS/风险/排期/上线回滚,一段不漏
- **锁定接口契约**:统一响应结构、错误码分段、分页鉴权幂等规范,评审时契约不返工
- **数据模型由查询驱动**:先列查询路径再倒推索引,主键/软删除/审计字段一次定到位
- **任务拆到可排期粒度**:每个任务 0.5–2 天,标注依赖与并行,排期准、关键路径清楚
- **六类风险主动识别**:性能/安全/兼容/依赖/容量/一致性,逐类过 checklist,有对策有交代
- **生成骨架代码**:按方案产出目录结构与接口/Model 签名(非完整实现),让人一眼确认能落地

## 适合谁

- **初中级开发者**:第一次独立写方案,不知道评审会被问什么、容易漏项
- **技术 Leader / 架构师**:带新人写方案,要一套统一的九段式标准和 checklist 省口水
- **外包接单团队**:报价前要快速估排期、锁定接口契约,避免返工和扯皮
- **跨团队联调方**:需要把接口、数据模型、上线顺序对齐清楚,减少联调期的来回

## 包含什么

- `SKILL.md`(285 行)— 主文件:核心方法论 + 技术选型决策树 + Step 0–8 工作流 + 评审追问十条 + 输出检查清单
- `templates/tech-design-template.md` — 九段式方案文档骨架,直接套用占位填空
- `templates/api-design-spec.md` — 接口设计规范:响应结构、错误码分段、RESTful 约定、幂等并发
- `templates/wbs-template.md` — 任务拆解表:粒度规则、依赖关系、关键路径、排期汇总
- `templates/risk-checklist.md` — 六类风险识别表(性能/安全/兼容/依赖/容量/一致性)

(`LISTING.md` 是市场上架文案,买家可忽略)

## 看看效果

骨架代码是 Step 8 的典型产出——只到方法签名和一行注释,不写业务逻辑,目的是让评审人确认结构能落地:

```
order-service/
├── controller/
│   └── OrderController.java        // @RestController,挂载 /api/v1/orders
├── service/
│   ├── OrderService.java           // 创建/查询/取消 业务编排
│   └── impl/OrderServiceImpl.java  // 方法签名 + TODO
├── repository/
│   └── OrderRepository.java        // CRUD + 自定义查询
├── model/
│   ├── dto/CreateOrderReq.java     // 入参 + 校验注解
│   └── vo/OrderVO.java             // 出参(脱敏后)
└── client/
    └── InventoryClient.java        // 调库存服务,带超时与降级
```

## 常见问题

- **要不要联网?** 不需要。skill 只用本地文件读写(Read/Write/Edit/Glob/Grep),所有方法论和模板都内置在文件夹里,断网也能跑。
- **能不能自定义?** 可以。在项目根目录放一个 `_config.json` 声明技术栈、鉴权、部署模式等默认值;也可在 `CLAUDE.md` 里写技术栈约定和命名规范,skill 会自动读取(详见下方"配置")。
- **支持什么语言/框架?** 方法与语言无关。骨架代码以 Java/Spring 为示例,SKILL.md 内附 Java/Go/Node.js/Python 四套目录职责映射表,非 Java 项目按等价替换即可。

## 配置(可选)

无需配置即可开箱即用。想定制默认值时,在项目根目录创建 `_config.json`:

| 字段 | 作用 | 缺失时 |
|------|------|--------|
| `tech_stack` | 技术栈,如 "Java/Spring + MySQL + Redis" | 从 CLAUDE.md 推断,否则标注"待确认" |
| `api_style` | 接口风格 `restful` / `rpc` | 默认 restful |
| `id_strategy` | 主键策略 `auto_increment` / `snowflake` | 按并发量推荐 |
| `auth` | 鉴权方式 `jwt` / `session` / `oauth2` | 标注"待定" |
| `deploy_mode` | 部署模式 `k8s` / `vm` / `serverless` | 给出通用方案 |
| `team_size` | 团队人数,影响 WBS 拆分粒度 | 按 2–3 人估排期 |

文件不存在时 skill 会跳过并在方案里标注缺失项,不会凭空臆造配置。
