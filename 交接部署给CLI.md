# 交接任务:把「三猫云」网站部署到腾讯云服务器

> 把下面整段「任务简报」粘贴给 CLI 里的 Claude,它就能接手自主完成部署。
> 接收方 Claude:你没有我们的聊天记录,以下是你需要的全部信息,自主执行到上线为止。

---

## 任务简报(粘贴给 CLI Claude 的内容)

你在帮我部署一个 Next.js 网站到腾讯云服务器。请自主执行直到网站能通过公网 IP 打开。过程中遇到报错自己排查、自己改,不要每步都等我确认(除非是花钱/破坏性的操作)。

### 项目
- 名字:三猫云(面向 C 端的 AI 学习平台,营销站)。
- 技术栈:Next.js 16 App Router + TypeScript + Tailwind v4 + Prisma + SQLite + 自研登录(httpOnly cookie 会话)。
- 代码仓库(已公开):https://github.com/gudi565/sanmao-cloud
- 本地开发路径(我这台 Mac):`/Users/serein/三猫云设计稿/sanmao-cloud`
- 运行方式:Node 长驻进程(`npm run start` = `next start`),SQLite 文件库,生产构建已验证通过(`next build` 绿,15 路由)。

### 目标服务器(腾讯云)
- 公网 IP:**101.35.234.218**
- 系统:Ubuntu 24.04(大陆机房)
- SSH:`ssh root@101.35.234.218`,密码 `sanmao-996`(root 登录被拒就 `ssh ubuntu@...` 同密码再 `sudo -i`)
- 你(CLI Claude)如果已经在服务器 SSH 终端里,就跳过 SSH 这步直接往下做。

### 已经做完的(服务器上)
- 代码已 clone 到 `/opt/sanmao-cloud`(GitHub 直连可用)。
- `/opt/sanmao-cloud/.env` 已写好(只差 EMAIL_*/SMS_*,验证码目前会打印到日志)。
- `/opt/sanmao-cloud/Dockerfile` 已补国内 npm 源(`npm ci --registry=https://registry.npmmirror.com`)。
- `/opt/sanmao-cloud/docker-compose.override.yml` 已写(对外开 80 端口:`0.0.0.0:80:3000`)。
- `/etc/docker/daemon.json` 已写(镜像加速:腾讯内网 + USTC + 百度)——但 **Docker 还没装上**。

### 唯一卡点(重点)
`get.docker.com` 和 `download.docker.com` 在这台大陆服务器上**被墙**(`curl: (35) Connection reset by peer`),所以官方一键脚本装不了 Docker。
**解法**:用 Ubuntu 自带源装:
```bash
apt-get update
apt-get install -y docker.io docker-compose-v2
systemctl enable --now docker
# 让已写好的 daemon.json 镜像加速生效
systemctl restart docker
```
若 `apt install docker.io` 报"找不到包",先加 universe 源:`add-apt-repository universe && apt-get update`(若提示缺命令先 `apt-get install -y software-properties-common`)。

### Docker 装好后,完成部署
```bash
cd /opt/sanmao-cloud
docker compose up -d --build        # 首次构建 5–8 分钟,镜像走国内加速
```
- 容器启动命令是 `npx prisma db push --skip-generate && npm run start`,会自动建表 + 起 Next。
- 数据库 `DATABASE_URL=file:/data/dev.db`(docker-compose 挂的 `./data` 持久卷)。

### 成功标准
浏览器打开 `http://101.35.354.218`(应是 `http://101.35.234.218`)返回网站首页(三猫云首页,暗绿主题)。用 `curl -I http://101.35.234.218` 应得 200。

### 关键环境变量(已写进 .env,供你参考)
- `AUTH_SECRET=rokXPi0bmc9WFrqIA+5MWfdHnYN0N6cQO7WkRGt/WbbvAKmOZV4X8HsEh6mveur0`
- `DATABASE_URL=file:/data/dev.db`（docker-compose 里已用 environment 覆盖成这个绝对路径）

### 国内服务器必须注意的坑
1. **Docker 官方域名(get/download.docker.com)被墙** → 用 Ubuntu apt 装 docker.io,别用官方脚本。
2. **Docker 拉镜像要走国内加速**(node:20-alpine 等)→ daemon.json 已配 `mirror.ccs.tencentyun.com` 等;如果重启后 `docker pull node:20-alpine` 还慢/失败,换/补镜像源(如 `https://docker.m.daocloud.io`)。
3. **npm 包走国内源** → Dockerfile 里 npm ci 已加 `--registry=https://registry.npmmirror.com`;若你重新生成 Dockerfile 记得保留这条。
4. **GitHub 可用**(已验证 clone 成功),不必走代理。
5. **腾讯云安全组/防火墙**已放行 80、443(若访问 80 不通,回控制台确认入站规则有 TCP:80 允许 0.0.0.0/0)。

### 后续(这次先不做,等我发令)
- 绑域名 + HTTPS(nginx + certbot,或 Coolify 面板)。
- 迁 SQLite → Postgres(正式运营前)。
- 课程内容入库(P0-1)。

### 文件归属(若要改代码,别动这些——归另一个 Claude 会话管)
`app/api/auth/**`、`lib/auth/**`、`lib/prisma.ts`、`components/AuthModal.tsx`、`components/AuthProvider.tsx`、`components/Nav.tsx`、`prisma/schema.prisma`(User/VerificationCode/AuditLog)、`.env`、`.env.example`。其余(营销页、UI 组件、lib/data.ts、globals.css)可自由改。

完成后告诉我:网站是否在 `http://101.35.234.218` 打开、构建有没有报错。