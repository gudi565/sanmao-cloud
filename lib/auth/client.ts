import type { AuthUser } from "./types";

/**
 * 客户端 fetch 封装。同源请求，httpOnly cookie 自动随请求携带，
 * 因此登录/登出后的会话状态由 cookie 维持，无需手动存 token。
 */

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return data;
}

export type SendCodeResult = {
  ok?: true;
  devCode?: string;
  error?: string;
};

export type Captcha = { id: string; svg: string };

export async function fetchCaptcha(): Promise<Captcha> {
  const res = await fetch("/api/auth/captcha", { credentials: "same-origin" });
  if (!res.ok) throw new Error("获取图形验证码失败");
  return (await res.json()) as Captcha;
}

export type AuthResult = {
  ok?: true;
  user?: AuthUser;
  error?: string;
};

export type ResetResult = { ok?: true; error?: string };

export function sendCodeRequest(input: {
  account: string;
  captchaId: string;
  captcha: string;
}): Promise<SendCodeResult> {
  return postJSON<SendCodeResult>("/api/auth/send-code", input);
}

export function registerRequest(input: {
  name: string;
  account: string;
  code: string;
  password: string;
}): Promise<AuthResult> {
  return postJSON<AuthResult>("/api/auth/register", input);
}

export function loginRequest(input: {
  account: string;
  password: string;
  remember?: boolean;
}): Promise<AuthResult> {
  return postJSON<AuthResult>("/api/auth/login", input);
}

export function resetPasswordRequest(input: {
  account: string;
  code: string;
  password: string;
}): Promise<ResetResult> {
  return postJSON<ResetResult>("/api/auth/reset-password", input);
}

export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { user?: AuthUser | null };
  return data.user ?? null;
}
