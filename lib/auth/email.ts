import nodemailer from "nodemailer";

/**
 * 邮件发送（SMTP）。凭据从环境变量读取：
 *   EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS / EMAIL_FROM
 * 未配置时 isEmailConfigured() 为 false，调用方应回退到开发模式（打印到终端）。
 */

let transporter: nodemailer.Transporter | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
  );
}

function getTransporter(): nodemailer.Transporter | null {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // 465 用 SSL，587/其他用 STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

function codeHtml(code: string): string {
  return `
<div style="max-width:420px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f1f17;background:#ffffff;border:1px solid #e6efe9;border-radius:16px;overflow:hidden">
  <div style="padding:24px 28px;background:linear-gradient(135deg,#0e7c5a,#5bf0b0);color:#04130d">
    <div style="font-size:18px;font-weight:600;letter-spacing:.5px">三猫云</div>
    <div style="font-size:12px;opacity:.85;margin-top:2px">让每个人都能用好 AI</div>
  </div>
  <div style="padding:28px">
    <div style="font-size:15px;color:#1f3a2c;line-height:1.7">你好，这是你的验证码：</div>
    <div style="margin:20px 0;font-size:32px;font-weight:700;letter-spacing:10px;color:#0e7c5a;text-align:center">${code}</div>
    <div style="font-size:13px;color:#5a6b62;line-height:1.7">验证码 5 分钟内有效。如果不是你本人操作，请忽略此邮件。</div>
  </div>
  <div style="padding:16px 28px;background:#f5faf7;font-size:12px;color:#8a9b92;text-align:center">© 三猫云 · 请勿直接回复此邮件</div>
</div>`;
}

/**
 * 发送验证码邮件。未配置 SMTP 时返回 false（调用方回退到开发模式打印）。
 */
export async function sendCodeEmail(
  to: string,
  code: string
): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER!;
  await t.sendMail({
    from,
    to,
    subject: "【三猫云】你的验证码",
    text: `你的验证码是：${code}，5 分钟内有效。如非本人操作请忽略。`,
    html: codeHtml(code),
  });
  return true;
}
