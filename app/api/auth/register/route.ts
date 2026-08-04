import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAccount, isEmail, checkPassword } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { verifyCode } from "@/lib/auth/codes";
import { createSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";

/**
 * POST /api/auth/register { name, account, code, password }
 * 校验验证码 -> 账号未占用 -> 建用户 -> 颁发会话
 */
export async function POST(request: NextRequest) {
  let body: {
    name?: unknown;
    account?: unknown;
    code?: unknown;
    password?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const account =
    typeof body.account === "string" ? body.account.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2) {
    return Response.json({ error: "昵称至少 2 个字" }, { status: 400 });
  }
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
  const exists = await prisma.user.findUnique({ where });
  if (exists) {
    return Response.json({ error: "该账号已注册，请直接登录" }, { status: 409 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const user = await prisma.user.create({
    data: {
      name,
      email: isEmail(account) ? account : null,
      phone: isEmail(account) ? null : account,
      password: await hashPassword(password),
    },
    select: { id: true, name: true },
  });

  await logAudit({ action: "register", userId: user.id, ip });
  await createSession(user.id);
  return Response.json({ ok: true, user });
}
