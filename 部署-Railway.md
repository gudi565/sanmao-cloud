# 三猫云 · Railway 上架指南

> 代码已推到私有仓库 `github.com/gudi565/sanmao-cloud`。下面把它在 Railway 上跑起来，得到一个公开网址。
> 保留 SQLite、免迁移；首次启动会自动 `prisma db push` 建表。

## 你要做的（约 5 分钟）

### 1. 登录 Railway
打开 https://railway.com → 右上角 **Login** → 用 **GitHub 登录**(最快，一会要授权它读你的仓库)。

### 2. 新建项目，从 GitHub 部署
- 进 Dashboard → **New Project** → **Deploy from GitHub repo**
- 第一次会让你授权 Railway 访问 GitHub：选 **Only select repositories** → 勾选 `sanmao-cloud` → Install & Authorize
- 回到 Railway → 选择 `gudi565/sanmao-cloud` → **Deploy**

Railway 会自动识别 Next.js，跑 `npm install`（含 `prisma generate`）+ `npm run build`，然后用本仓库里的 `railway.json` 启动：
`npx prisma db push && npm run start` —— 这一步会自动建好数据库表。

### 3. 设置环境变量（必填 1 个，其余选填）
进你的 service → **Variables** 标签 → New Variable，逐条加：

| 变量名 | 值 | 说明 |
|---|---|---|
| `AUTH_SECRET` | `rokXPi0bmc9WFrqIA+5MWfdHnYN0N6cQO7WkRGt/WbbvAKmOZV4X8HsEh6mveur0` | **必填**。登录会话签名密钥（已为你生成） |
| `DATABASE_URL` | `file:./dev.db` | SQLite 文件路径；Railway 服务文件系统会持久保留 |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | 你的邮箱 SMTP | 选填；**不填则验证码打印到 Railway 日志**（演示够用） |
| `SMS_*`（ACCESS_KEY_ID / SECRET / SIGN_NAME / TEMPLATE_CODE） | 阿里云短信 | 选填；不填同样打印到日志 |

> 邮箱常用：QQ 邮箱 `smtp.qq.com:465`、163 `smtp.163.com:465`，`EMAIL_PASS` 是**邮箱授权码**（不是登录密码）。

### 4. 拿公开网址
进 service → **Settings** → **Networking** → **Generate Domain** → 得到一个 `xxx.up.railway.app` 的公开网址。打开就是你的站。

### 5. 验收
- 首页能开 → ✅
- 注册：填邮箱/手机 → 提交 → 去 Railway 的 **Logs** 标签找一行类似 `devCode: 123456` 的打印 → 用它完成注册/登录（没配邮箱/短信时这样测）
- 配了邮箱/短信的话，直接去收码即可

## 费用
Railway 有免费试用（需绑卡，但小流量 Next 应用月消耗远低于起步额，基本不会扣到）。长期约 **~$5/月**。

## 已知限制（演示阶段）
- **SQLite**：Railway 服务文件系统持久，注册数据会保留；但若删除/重建服务则丢数据。正式运营前建议迁 **Postgres**（Neon 免费档），改动很小：`schema.prisma` 的 `provider` 改 `postgresql` + 换 `DATABASE_URL` + `prisma migrate deploy`。
- **验证码**：未配邮箱/短信时打印到日志，访客自己收不到——开放公开注册前必须配 SMTP/SMS。
- 课程/工具等"内容"目前写死在 `lib/data.ts`（未入数据库），展示没问题，后台可改内容是后续 P0-1。

## 之后改了代码怎么更新
本地改完 → `git push` → Railway 自动重新部署（因为连了 GitHub）。无需手动操作。

---
**遇到报错**：把 Railway service 的 **Deploy Logs / Logs** 最后几十行贴回来，我来定位。
