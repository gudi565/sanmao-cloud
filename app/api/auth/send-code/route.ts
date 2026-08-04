import { NextRequest } from "next/server";
import { issueCode, ipRateAllow } from "@/lib/auth/codes";
import { isAccount, isEmail } from "@/lib/auth/validation";
import { sendCodeEmail } from "@/lib/auth/email";
import { sendCodeSms } from "@/lib/auth/sms";
import { verifyCaptcha } from "@/lib/auth/captcha";

/** POST /api/auth/send-code { account, captchaId, captcha }
 *  先校验图形验证码，通过才发 6 位验证码（开发模式打印到控制台） */
export async function POST(request: NextRequest) {
  let body: { account?: unknown; captchaId?: unknown; captcha?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const account =
    typeof body.account === "string" ? body.account.trim() : "";
  if (!account) {
    return Response.json({ error: "请输入邮箱或手机号" }, { status: 400 });
  }
  if (!isAccount(account)) {
    return Response.json({ error: "邮箱或手机号格式不正确" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!ipRateAllow(ip)) {
    return Response.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  // 图形验证码：挡脚本批量刷短信/邮件（一次性消费）
  const captchaId =
    typeof body.captchaId === "string" ? body.captchaId : "";
  const captcha = typeof body.captcha === "string" ? body.captcha.trim() : "";
  if (!captcha) {
    return Response.json({ error: "请输入图形验证码" }, { status: 400 });
  }
  if (!verifyCaptcha(captchaId, captcha)) {
    return Response.json({ error: "图形验证码错误或已过期" }, { status: 400 });
  }

  // 不检查账号是否已注册，避免泄露注册情况
  const result = await issueCode(account);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 429 });
  }

  const code = result.devCode;
  // 邮箱→邮件，手机号→短信；任一通道未配置或失败都回退到控制台打印（开发模式）
  let sent = false;
  try {
    sent = isEmail(account)
      ? await sendCodeEmail(account, code)
      : await sendCodeSms(account, code);
  } catch (e) {
    console.error("[验证码] 发送失败，回退控制台打印：", e);
  }
  if (!sent) {
    console.log(`[验证码] ${account} -> ${code}`);
  }

  const isDev = process.env.NODE_ENV !== "production";
  return Response.json({ ok: true, ...(isDev ? { devCode: code } : {}) });
}
