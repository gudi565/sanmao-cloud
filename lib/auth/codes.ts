import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * 验证码与限流（开发模式：验证码打印到服务端控制台）。
 * 用 Prisma 表持久化，规避 dev Fast Refresh 重置内存态导致验证码"凭空消失"。
 */

const CODE_TTL_MS = 5 * 60 * 1000; // 验证码有效期 5 分钟
const RESEND_COOLDOWN_MS = 60 * 1000; // 同一账号 60 秒内不可重复发送
const MAX_ATTEMPTS = 5; // 验证码最多尝试 5 次
const IP_WINDOW_MS = 60 * 60 * 1000; // IP 限流窗口 1 小时
const IP_MAX = 10; // 单 IP 每小时最多请求 10 次验证码
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 登录限流窗口 10 分钟
const LOGIN_MAX = 20; // 单 IP 每窗口最多 20 次登录尝试（账号级锁定才是主防线）

function sha256(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

// —— 通用内存限流（按 key） —— 开发模式够用
type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
/** IP 维度验证码请求限流；超限返回 false */
export function ipRateAllow(ip: string): boolean {
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || now > b.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (b.count >= IP_MAX) return false;
  b.count += 1;
  return true;
}

const loginBuckets = new Map<string, Bucket>();
/** 登录尝试限流（按账号+IP 的 key）；超限返回 false */
export function loginRateAllow(key: string): boolean {
  const now = Date.now();
  const b = loginBuckets.get(key);
  if (!b || now > b.resetAt) {
    loginBuckets.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (b.count >= LOGIN_MAX) return false;
  b.count += 1;
  return true;
}

export type IssueResult =
  | { ok: true; devCode: string }
  | { ok: false; error: string };

/** 生成并发送验证码（dev 下返回明文供控制台/接口打印） */
export async function issueCode(account: string): Promise<IssueResult> {
  const recent = await prisma.verificationCode.findFirst({
    where: {
      account,
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    return { ok: false, error: "发送过于频繁，请稍后再试" };
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.verificationCode.create({
    data: {
      account,
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return { ok: true, devCode: code };
}

export type VerifyResult = { ok: true } | { ok: false; error: string };

/** 校验验证码：成功即删除（防重放），失败累计尝试次数 */
export async function verifyCode(
  account: string,
  code: string
): Promise<VerifyResult> {
  const record = await prisma.verificationCode.findFirst({
    where: { account },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "请先获取验证码" };

  if (Date.now() > record.expiresAt.getTime()) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return { ok: false, error: "验证码已过期，请重新获取" };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.delete({ where: { id: record.id } });
    return { ok: false, error: "错误次数过多，请重新获取验证码" };
  }

  if (sha256(code) !== record.codeHash) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "验证码错误" };
  }

  await prisma.verificationCode.delete({ where: { id: record.id } });
  return { ok: true };
}
