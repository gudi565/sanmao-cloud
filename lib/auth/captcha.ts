import { randomUUID } from "node:crypto";
import { create as createSvgCaptcha } from "svg-captcha";

/**
 * 图形验证码：挡住脚本批量刷短信/邮件验证码（避免短信费被刷爆）。
 * 答案存内存——它短命（5 分钟）高频、丢了用户重刷一次即可，
 * 性质不同于"已发到用户手机的验证码"，所以不必进数据库。
 */

type Entry = { text: string; expiresAt: number };
const store = new Map<string, Entry>();
const TTL_MS = 5 * 60 * 1000;

export type GeneratedCaptcha = { id: string; svg: string };

/** 生成一张图形验证码，返回 id（给前端回传校验）与 svg（前端直接渲染） */
export function generateCaptcha(): GeneratedCaptcha {
  const c = createSvgCaptcha({
    size: 4,
    ignoreChars: "0o1ilI", // 去掉易混字符
    noise: 2,
    color: true,
    background: "#0e2419", // 深翡翠，贴合站点暗色
    width: 120,
    height: 44,
    fontSize: 44,
  });
  const id = randomUUID();
  store.set(id, { text: c.text.toLowerCase(), expiresAt: Date.now() + TTL_MS });
  // 开发模式打印答案，便于本地联调（生产不输出）
  if (process.env.NODE_ENV !== "production") {
    console.log(`[captcha] ${id} -> ${c.text}`);
  }
  return { id, svg: c.data };
}

/** 校验：一次性消费（用完即删），不区分大小写，过期判失败 */
export function verifyCaptcha(id: string, input: string): boolean {
  const entry = store.get(id);
  if (!entry) return false;
  store.delete(id);
  if (Date.now() > entry.expiresAt) return false;
  return entry.text === input.trim().toLowerCase();
}
