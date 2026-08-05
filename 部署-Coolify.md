# 三猫云 · Coolify 上架指南(自有阿里云服务器)

> 适合:阿里云 4核8G 香港 Ubuntu,自己服务器 + `git push` 自动部署。一次配好,之后只管 push。
> Coolify = 装在你自己服务器上的"私人 Railway/Vercel",有 Web 面板。

---

## 0. 前置(服务器到手后)
- 阿里云安全组放行:**22(SSH)、80、443、8000**(8000 是 Coolify 面板,配完域名后可关)
- 系统:Ubuntu 22.04,用 root 登录(`ssh root@你的服务器IP`)
- 代码已在 GitHub 私有仓库:`github.com/gudi565/sanmao-cloud`

## 1. 装 Coolify(一行,约 5–10 分钟)
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```
它会自动装好 Docker + Coolify。装完访问 **http://服务器IP:8000** → 注册管理员账号。

## 2. 连接 GitHub(私有仓库需要)
面板里:**Sources → Add → GitHub → "Install Coolify GitHub App"**
→ 跳到 GitHub,授权到你的账号,**Only select repositories 勾选 `sanmao-cloud`** → Install。
回 Coolify 就能看到这个 source 已连上。

## 3. 新建资源(从你的仓库)
**Project → Add New Resource → 选刚连的 GitHub source → 选 `sanmao-cloud` 仓库 → main 分支**
Coolify 会自动识别 `Dockerfile`。确认这几项:
- **Build Pack = Dockerfile**(若它识别成 docker-compose,手动改成 Dockerfile)
- **Port = 3000**(Coolify 靠这个把域名转发到你的容器)
- **Base Directory / Dockerfile Location** 留默认(`/` 和 `Dockerfile`)

## 4. 环境变量(在资源的 Environment 里逐条加)
| 变量 | 值 |
|---|---|
| `AUTH_SECRET` | `rokXPi0bmc9WFrqIA+5MWfdHnYN0N6cQO7WkRGt/WbbvAKmOZV4X8HsEh6mveur0`(已生成,或自己 `openssl rand -base64 48`) |
| `DATABASE_URL` | `file:/data/dev.db`(SQLite 落到持久卷,见下一步) |
| `EMAIL_*` / `SMS_*` | 选填,先留空(验证码打印到日志);正式开放注册前再填 SMTP/阿里云短信 |

## 5. 持久存储(SQLite 不丢)
资源的 **Storages / Persistent Storage → Add Volume**:
- **Mount Path**:`/data`
- 类型选 Local Volume,Coolify 自动建。
这样容器重建后 `/data/dev.db` 不丢,注册数据保留。

## 6. 绑域名 + HTTPS
- 先到域名 DNS:加一条 **A 记录** `@ → 你的服务器IP`(等个 1–2 分钟生效)。
- 回 Coolify 资源的 **Domains**:填 `https://你的域名.com`(带 https),保存。
- Coolify 自带反代 + Let's Encrypt,自动签证书、自动续期。

## 7. 部署
点 **Deploy**。看 **Logs**:首次会跑 `next build`(几分钟)+ 容器启动时 `prisma db push` 建表 + `next start`。
看到 "Starting" / 健康检查通过 → 打开 `https://你的域名.com`,就是你的站。

---

## 之后改代码怎么更新
本地改完 → `git push origin main`(记得开 Clash)→ Coolify **自动**拉取、重新 build、上线。不用碰服务器。  
(Coolify 默认开了 push 自动部署;没开的话在资源设置里开 "Auto Deploy"。)

## 验证码测试(没配邮箱/短信时)
注册/登录填完 → Coolify 该资源的 **Logs** 里找 `devCode: 123456` 一类打印 → 拿它完成验证。配了 SMTP/SMS 后直接收码。

## 小贴士
- **Coolify 面板访问**:配完域名后,建议把安全组 8000 端口关掉(只留 22/80/443),面板改成只走内网或加 IP 白名单更安全。
- **SQLite 够用多久**:几千到几万用户、单机没问题;真要起量再迁 Postgres(Coolify 里也能一键起一个 Postgres 服务,然后改 `DATABASE_URL` + `provider`)。
- **OOM**:4核8G 跑 Next build 没问题;若临时紧张,Coolify 服务器里加个 swap。

**任何一步卡住**:把 Coolify 那一步的 **Logs / 截图**贴我,我直接帮你定位。
