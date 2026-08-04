import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAccount, isEmail } from "@/lib/auth/validation";
import { verifyPasswordOrDummy } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginRateAllow } from "@/lib/auth/codes";
import { logAudit } from "@/lib/auth/audit";

/**
 * POST /api/auth/login { account, password }
 * 统一错误"账号或密码错误"；用户不存在也跑一次 dummy bcrypt 比较，避免时序枚举账号。
 * 连续失败 LOCK_MAX 次锁定账号 LOCK_MINUTES 分钟。
 */
const LOCK_MAX = 5;
const LOCK_MINUTES = 10;
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

export async function POST(request: NextRequest) {
  let body: { account?: unknown; password?: unknown; remember?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 });
  }

  const account =
    typeof body.account === "string" ? body.account.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  if (!account || !isAccount(account)) {
    return Response.json({ error: "邮箱或手机号格式不正确" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!loginRateAllow(ip)) {
    return Response.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
  }

  const where = isEmail(account) ? { email: account } : { phone: account };
  const user = await prisma.user.findUnique({
    where,
    select: {
      id: true,
      name: true,
      password: true,
      failedAttempts: true,
      lockedUntil: true,
    },
  });

  // 账号锁定：失败次数过多，冷却期内直接拒绝
  if (user?.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return Response.json(
      { error: `账号已锁定，请约 ${mins} 分钟后再试` },
      { status: 429 }
    );
  }

  const matched = await verifyPasswordOrDummy(password, user?.password ?? null);
  if (!user || !matched) {
    if (user) {
      const attempts = user.failedAttempts + 1;
      const lockNow = attempts >= LOCK_MAX;
      await prisma.user.update({
        where: { id: user.id },
        data: lockNow
          ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MS) }
          : { failedAttempts: attempts },
      });
      if (lockNow) {
        await logAudit({
          action: "account_locked",
          userId: user.id,
          ip,
          detail: `连续错误 ${LOCK_MAX} 次`,
        });
        return Response.json(
          {
            error: `密码连续错误 ${LOCK_MAX} 次，账号已锁定 ${LOCK_MINUTES} 分钟`,
          },
          { status: 429 }
        );
      }
    }
    await logAudit({
      action: "login_failed",
      userId: user?.id ?? null,
      ip,
      detail: "账号或密码错误",
    });
    return Response.json({ error: "账号或密码错误" }, { status: 401 });
  }

  // 成功：清零失败计数与锁定状态
  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }
  await logAudit({ action: "login", userId: user.id, ip });
  await createSession(user.id, remember);
  return Response.json({ ok: true, user: { id: user.id, name: user.name } });
}
