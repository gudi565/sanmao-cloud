import Dysmsapi20170525, { SendSmsRequest } from "@alicloud/dysmsapi20170525";
import { Config } from "@alicloud/openapi-client";
import { RuntimeOptions } from "@alicloud/tea-util";

/**
 * 阿里云短信发送。凭据从环境变量读取：
 *   SMS_ACCESS_KEY_ID / SMS_ACCESS_KEY_SECRET / SMS_SIGN_NAME / SMS_TEMPLATE_CODE
 * 未配置时 isSmsConfigured() 为 false，调用方回退到开发模式（打印到终端）。
 * 模板变量名约定为 ${code}（即 templateParam = {"code":"xxxxxx"}）。
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.SMS_ACCESS_KEY_ID &&
      process.env.SMS_ACCESS_KEY_SECRET &&
      process.env.SMS_SIGN_NAME &&
      process.env.SMS_TEMPLATE_CODE
  );
}

let client: Dysmsapi20170525 | null = null;

function getClient(): Dysmsapi20170525 | null {
  if (!isSmsConfigured()) return null;
  if (!client) {
    const config = new Config({
      accessKeyId: process.env.SMS_ACCESS_KEY_ID,
      accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET,
    });
    config.endpoint = "dysmsapi.aliyuncs.com";
    client = new Dysmsapi20170525(config);
  }
  return client;
}

/**
 * 发送验证码短信。未配置凭据返回 false（调用方回退到开发模式打印）。
 * 阿里云返回 body.code === "OK" 视为成功，否则抛错。
 */
export async function sendCodeSms(phone: string, code: string): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  const req = new SendSmsRequest({
    phoneNumbers: phone,
    signName: process.env.SMS_SIGN_NAME,
    templateCode: process.env.SMS_TEMPLATE_CODE,
    templateParam: JSON.stringify({ code }),
  });
  const resp = await c.sendSmsWithOptions(req, new RuntimeOptions({}));
  if (resp.body?.code !== "OK") {
    throw new Error(`短信发送失败：${resp.body?.code} ${resp.body?.message ?? ""}`);
  }
  return true;
}
