import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "./types";

/**
 * 会话：JWT(HS256) 存放在 httpOnly cookie。
 * 注意 cookies() 是异步的、只能在 Route Handler / Server Function 中写。
 */

const COOKIE_NAME = "smc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 默认 7 天（秒）
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 记住我 30 天

// key 惰性生成：把 AUTH_SECRET 缺失的报错推迟到首次运行时，
// 避免 next build 阶段（构建环境可能未配置 secret）直接失败。
let cachedKey: Uint8Array | null = null;
function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET 未设置：请在 .env 配置（生成命令：openssl rand -base64 32）"
    );
  }
  cachedKey = new TextEncoder().encode(secret);
  return cachedKey;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // 开发环境是 http，secure:true 会导致浏览器不存/不回传 cookie，登录"静默失败"
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** 颁发会话：签 JWT 并写入 cookie；remember=true 时有效期延长到 30 天 */
export async function createSession(
  userId: string,
  remember = false
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });
  if (!user) throw new Error("用户不存在，无法创建会话");
  const maxAge = remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
  const token = await new SignJWT({ v: user.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getKey());
  const store = await cookies();
  store.set(COOKIE_NAME, token, cookieOptions(maxAge));
}

/** 注销：清除会话 cookie */
export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", cookieOptions(0));
}

/** 当前登录用户：读 cookie 校验 JWT，并比对 tokenVersion（改密后旧会话即失效） */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  let payload: { sub?: string | number; v?: number };
  try {
    ({ payload } = await jwtVerify(cookie.value, getKey()));
  } catch {
    return null;
  }
  const userId = typeof payload.sub === "string" ? payload.sub : null;
  if (!userId) return null;
  const tokenVersion = typeof payload.v === "number" ? payload.v : 0;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, tokenVersion: true },
  });
  if (!user || user.tokenVersion !== tokenVersion) return null;
  return { id: user.id, name: user.name };
}
