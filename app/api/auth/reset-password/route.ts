import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAccount, isEmail, checkPassword } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { verifyCode } from "@/lib/auth/codes";
import { logAudit } from "@/lib/auth/audit";

/**
 * POST /api/auth/reset-password { account, code, password }
 * 校验验证码 -> 找到用户 -> 用新密码覆盖。
 * 重置成功不自动登录：用户需用新密码手动登录（更安全）。
 * 获取验证码复用 /api/auth/send-code。
 */
export async function POST(request: NextRequest) {
  let body: { account?: unknown; code?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const account =
    typeof body.account === "string" ? body.account.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!account || !isAccount(account)) {
    return Response.json({ error: "邮箱或手机号格式不正确" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(code)) {
    return Response.json({ error: "验证码为 6 位数字" }, { status: 400 });
  }
  const pw = checkPassword(password);
  if (!pw.ok) {
    return Response.json({ error: pw.hint }, { status: 400 });
  }

  const verified = await verifyCode(account, code);
  if (!verified.ok) {
    return Response.json({ error: verified.error }, { status: 400 });
  }

  const where = isEmail(account) ? { email: account } : { phone: account };
  const user = await prisma.user.findUnique({ where, select: { id: true } });
  if (!user) {
    return Response.json({ error: "账号不存在，请先注册" }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      tokenVersion: { increment: 1 }, // 使该账号此前在别处的登录会话立即失效
      failedAttempts: 0, // 顺带解除锁定
      lockedUntil: null,
    },
  });

  await logAudit({ action: "reset_password", userId: user.id, ip });
  return Response.json({ ok: true });
}
