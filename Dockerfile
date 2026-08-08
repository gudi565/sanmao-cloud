# 三猫云 Dockerfile —— 多阶段构建 Next.js + Prisma(SQLite)
# 在服务器上 docker compose up 即可;首启自动 prisma db push 建表

# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --registry=https://registry.npmmirror.com

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma 引擎所需
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
EXPOSE 3000
# 启动前建表(SQLite 文件),再 next start
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
