import { NextRequest } from "next/server";
import { generateCaptcha } from "@/lib/auth/captcha";

/** GET /api/auth/captcha —— 生成一张图形验证码，返回 { id, svg } */
export async function GET(_request: NextRequest) {
  const { id, svg } = generateCaptcha();
  return Response.json({ id, svg });
}
