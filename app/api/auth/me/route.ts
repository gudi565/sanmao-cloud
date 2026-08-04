import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

/** GET /api/auth/me —— 读 cookie 校验，返回当前用户或 null */
export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  return Response.json({ user });
}
