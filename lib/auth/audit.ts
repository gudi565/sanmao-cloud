import { prisma } from "@/lib/prisma";

/**
 * 审计日志：记录关键安全事件，便于追溯（登录/注册/改密/锁定等）。
 * 写入失败不影响主流程（try/catch 吞掉，仅打印），避免审计故障拖垮请求——
 * 例如 dev server 持有过期 Prisma client（不识别新模型）时也不应让登录 500。
 */

export type AuditAction =
  | "register"
  | "login"
  | "login_failed"
  | "logout"
  | "reset_password"
  | "account_locked";

export async function logAudit(event: {
  action: AuditAction;
  userId?: string | null;
  ip?: string | null;
  detail?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        userId: event.userId ?? null,
        ip: event.ip ?? null,
        detail: event.detail ?? null,
      },
    });
  } catch (e) {
    console.error("[audit] 写入失败：", e);
  }
}
