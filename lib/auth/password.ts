import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** 明文密码 -> bcrypt 哈希 */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** 校验明文密码与哈希是否匹配 */
export function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// 用于「用户不存在」分支的占位哈希：无论账号是否存在都执行一次 bcrypt.compare，
// 统一响应耗时，避免通过耗时差异枚举账号是否注册。
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword("__smc_timing_dummy__");
  }
  return dummyHashPromise;
}

/** hash 为空（用户不存在）时跑一次 dummy 比较，仍返回 false，但耗时一致 */
export async function verifyPasswordOrDummy(
  plain: string,
  hash: string | null
): Promise<boolean> {
  const reference = hash ?? (await getDummyHash());
  return bcrypt.compare(plain, reference);
}
