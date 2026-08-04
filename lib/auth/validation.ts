/**
 * 账号格式校验 —— 前后端共用，避免规则不一致。
 * 与 AuthModal 原有正则保持一致：邮箱 或 中国大陆手机号。
 */
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export const isPhone = (v: string) => /^1[3-9]\d{9}$/.test(v)

export const isAccount = (v: string) => isEmail(v) || isPhone(v)

/**
 * 密码策略：>=8 位且同时含字母与数字。
 * 返回是否达标、强度分（0–3）与提示文案。前后端共用，规则单一真相源。
 */
export type PwCheck = { ok: boolean; score: 0 | 1 | 2 | 3; hint: string }

const STRENGTH_LABELS = ["太弱", "弱", "一般", "强"] as const

export function checkPassword(pw: string): PwCheck {
  const hasLetter = /[a-zA-Z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasLower = /[a-z]/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  const long = pw.length >= 8

  const ok = long && hasLetter && hasDigit

  let score = 0
  if (long) score += 1
  if (pw.length >= 12) score += 1
  if (hasUpper && hasLower) score += 1
  if (hasSpecial) score += 1
  if (score > 3) score = 3
  if (!ok) score = 0
  const s = score as 0 | 1 | 2 | 3

  if (!ok) {
    const missing: string[] = []
    if (!long) missing.push("至少 8 位")
    if (!hasLetter) missing.push("含字母")
    if (!hasDigit) missing.push("含数字")
    return { ok: false, score: s, hint: `密码需${missing.join("、")}` }
  }
  return { ok: true, score: s, hint: STRENGTH_LABELS[s] }
}
