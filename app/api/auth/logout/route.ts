import { NextRequest } from "next/server";
import { deleteSession, getCurrentUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";

/** POST /api/auth/logout —— 清除会话 cookie（用 POST，避免 CSRF），并记录审计 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  await deleteSession();
  if (user) {
    await logAudit({ action: "logout", userId: user.id, ip });
  }
  return Response.json({ ok: true });
}
