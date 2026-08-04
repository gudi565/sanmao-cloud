"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { isAccount, checkPassword } from "@/lib/auth/validation";
import { useAuth } from "@/components/AuthProvider";
import { fetchCaptcha, type Captcha } from "@/lib/auth/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Tab = "login" | "signup" | "forgot";

const EMPTY = { name: "", account: "", code: "", password: "", agree: false };

/**
 * 登录 / 注册 / 忘记密码弹窗：多视图、表单校验、验证码倒计时。
 * 通过 AuthProvider 调用真实后端（/api/auth/*）；成功后由 Provider 更新登录态并关闭。
 */
export default function AuthModal({ open, onClose }: Props) {
  const { login, register, resetPassword, sendCode: requestCode } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [count, setCount] = useState(0);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [remember, setRemember] = useState(false);
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPw, setShowPw] = useState(false);

  // 打开时重置；Esc 关闭；锁定背景滚动
  useEffect(() => {
    if (!open) return;
    setTab("login");
    setForm(EMPTY);
    setErrors({});
    setFormError("");
    setNotice("");
    setRemember(false);
    setCaptcha(null);
    setCaptchaInput("");
    setShowPw(false);
    setStatus("idle");
    setCount(0);
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (count <= 0) return;
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [count]);

  // 进入需要发码的视图时拉取一张图形验证码
  useEffect(() => {
    if (open && (tab === "signup" || tab === "forgot")) {
      setCaptchaInput("");
      fetchCaptcha().then(setCaptcha).catch(() => setCaptcha(null));
    }
  }, [open, tab]);

  const refreshCaptcha = () => {
    setCaptchaInput("");
    fetchCaptcha().then(setCaptcha).catch(() => {});
  };

  const set = (k: keyof typeof EMPTY, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.account) e.account = "请输入邮箱或手机号";
    else if (!isAccount(form.account)) e.account = "邮箱或手机号格式不正确";
    if (!form.password) e.password = "请输入密码";
    else if (tab !== "login") {
      const pw = checkPassword(form.password);
      if (!pw.ok) e.password = pw.hint;
    }
    if (tab === "signup") {
      if (!form.name.trim()) e.name = "请输入昵称";
      else if (form.name.trim().length < 2) e.name = "昵称至少 2 个字";
      if (!form.code) e.code = "请输入验证码";
      else if (!/^\d{6}$/.test(form.code)) e.code = "验证码为 6 位数字";
      if (!form.agree) e.agree = "请先同意用户协议";
    }
    if (tab === "forgot") {
      if (!form.code) e.code = "请输入验证码";
      else if (!/^\d{6}$/.test(form.code)) e.code = "验证码为 6 位数字";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const sendCode = async () => {
    if (count > 0) return;
    if (!form.account) {
      setErrors((e) => ({ ...e, account: "请先填写邮箱或手机号" }));
      return;
    }
    if (!isAccount(form.account)) {
      setErrors((e) => ({ ...e, account: "邮箱或手机号格式不正确" }));
      return;
    }
    if (!captchaInput) {
      setErrors((e) => ({ ...e, captcha: "请输入图形验证码" }));
      return;
    }
    if (!captcha) {
      refreshCaptcha();
      setErrors((e) => ({ ...e, captcha: "图形验证码已过期，已为你刷新" }));
      return;
    }
    const res = await requestCode({
      account: form.account,
      captchaId: captcha.id,
      captcha: captchaInput,
    });
    if (res.error) {
      const isCaptchaErr = res.error.includes("图形验证码");
      if (isCaptchaErr) refreshCaptcha();
      const msg = res.error;
      setErrors((e) => ({
        ...e,
        [isCaptchaErr ? "captcha" : "account"]: msg,
      }));
      return;
    }
    setCount(60);
    // 开发模式：后端回传验证码，自动填入便于联调（生产环境无此字段）
    if (res.devCode) {
      const code = res.devCode;
      setForm((f) => ({ ...f, code }));
    }
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status !== "idle") return;
    setFormError("");
    setNotice("");
    if (!validate()) return;
    setStatus("loading");

    if (tab === "forgot") {
      const res = await resetPassword({
        account: form.account,
        code: form.code,
        password: form.password,
      });
      if (res.error) {
        setStatus("idle");
        setFormError(res.error);
        return;
      }
      setStatus("idle");
      setNotice("密码重置成功，请用新密码登录");
      window.setTimeout(() => {
        setNotice("");
        setTab("login");
        setForm((f) => ({ ...f, code: "", password: "" }));
      }, 1600);
      return;
    }

    const res =
      tab === "login"
        ? await login({
            account: form.account,
            password: form.password,
            remember,
          })
        : await register({
            name: form.name.trim(),
            account: form.account,
            code: form.code,
            password: form.password,
          });
    if (res.error) {
      setStatus("idle");
      setFormError(res.error);
      return;
    }
    setStatus("done");
    window.setTimeout(() => onClose(), 1200);
  };

  const done = useMemo(() => status === "done", [status]);
  const pwCheck = useMemo(() => checkPassword(form.password), [form.password]);

  // 挂到 body，跳出可能带 transform/backdrop-filter 的祖先，确保 fixed 以视口为基准
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4 transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-md" onClick={onClose} />

      <div
        className={cn(
          "relative w-full max-w-md transition-all duration-300",
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        )}
      >
        <div className="glass-strong relative overflow-hidden rounded-3xl border border-line p-7 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
          {/* 辉光 */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.18),transparent_70%)] blur-2xl" />

          {/* 关闭 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim transition-colors hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>

          {done ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                {tab === "login" ? "登录成功" : "注册成功"}
              </p>
              <p className="mt-1 text-sm text-dim">
                {tab === "login" ? "欢迎回来，三猫云" : "已为你登录，开始学习吧"}
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <h2 className="font-display text-xl font-semibold text-ink">
                  {tab === "login" ? "欢迎回来" : tab === "signup" ? "创建账号" : "重置密码"}
                </h2>
                <p className="mt-1 text-sm text-dim">
                  {tab === "login"
                    ? "登录三猫云，继续你的学习"
                    : tab === "signup"
                    ? "几秒注册，开启 AI 学习之旅"
                    : "输入验证码与新密码即可重置"}
                </p>
              </div>

              {tab === "forgot" ? (
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setErrors({});
                    setFormError("");
                  }}
                  className="relative mt-5 inline-flex items-center gap-1 text-xs text-dim transition-colors hover:text-accent"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  返回登录
                </button>
              ) : (
                /* Tab */
                <div className="relative mt-5 flex rounded-full border border-line bg-bg/50 p-1 text-sm">
                  {(["login", "signup"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTab(t);
                        setErrors({});
                      }}
                      className={cn(
                        "relative flex-1 rounded-full px-4 py-2 transition-colors",
                        tab === t ? "text-bg" : "text-dim hover:text-ink"
                      )}
                    >
                      {tab === t && (
                        <span className="absolute inset-0 -z-0 rounded-full bg-accent" />
                      )}
                      <span className="relative z-10">{t === "login" ? "登录" : "注册"}</span>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={submit} className="relative mt-5 flex flex-col gap-3" noValidate>
                  {formError && (
                    <div className="rounded-xl border border-[#f48a8a]/40 bg-[#f48a8a]/10 px-3 py-2 text-xs text-[#f48a8a]">
                      {formError}
                    </div>
                  )}
                  {notice && (
                    <div className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
                      {notice}
                    </div>
                  )}
                  {tab === "signup" && (
                    <Field label="昵称" error={errors.name}>
                      <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="你想被怎么称呼"
                        className={inputCls}
                      />
                    </Field>
                  )}

                  <Field label="邮箱或手机号" error={errors.account}>
                    <input
                      value={form.account}
                      onChange={(e) => set("account", e.target.value)}
                      placeholder="name@example.com / 13800000000"
                      className={inputCls}
                    />
                  </Field>

                  {(tab === "signup" || tab === "forgot") && (
                    <Field label="图形验证码" error={errors.captcha}>
                      <div className="flex gap-2">
                        <input
                          value={captchaInput}
                          onChange={(e) => {
                            setCaptchaInput(e.target.value);
                            setErrors((er) => ({ ...er, captcha: "" }));
                          }}
                          placeholder="输入图中字符"
                          autoCapitalize="none"
                          autoCorrect="off"
                          className={cn(inputCls, "flex-1")}
                        />
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          title="看不清？换一张"
                          aria-label="刷新图形验证码"
                          className="flex h-[46px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-bg/60 transition-colors hover:border-accent/40"
                          dangerouslySetInnerHTML={{
                            __html:
                              captcha?.svg ??
                              "<span class='text-dim text-xs'>加载中…</span>",
                          }}
                        />
                      </div>
                    </Field>
                  )}

                  {(tab === "signup" || tab === "forgot") && (
                    <Field label="验证码" error={errors.code}>
                      <div className="flex gap-2">
                        <input
                          value={form.code}
                          onChange={(e) => set("code", e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6 位验证码"
                          inputMode="numeric"
                          className={cn(inputCls, "flex-1")}
                        />
                        <button
                          type="button"
                          onClick={sendCode}
                          disabled={count > 0}
                          className={cn(
                            "shrink-0 rounded-xl border border-line px-3 text-xs transition-colors",
                            count > 0 ? "text-dim" : "text-accent hover:border-accent/40"
                          )}
                        >
                          {count > 0 ? `重新获取 ${count}s` : "获取验证码"}
                        </button>
                      </div>
                    </Field>
                  )}

                  <Field label={tab === "forgot" ? "新密码" : "密码"} error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder={tab === "login" ? "请输入密码" : "至少 8 位，含字母和数字"}
                        className={cn(inputCls, "pr-10")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "隐藏密码" : "显示密码"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dim transition-colors hover:text-ink"
                      >
                        {showPw ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 9 7 0 1-.7 2.3-2 3.5M6.2 6.2C3.9 7.5 3 9.6 3 12c0 2.5 4 7 9 7 1.3 0 2.5-.3 3.6-.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {tab !== "login" && form.password && (
                      <StrengthBar score={pwCheck.score} hint={pwCheck.hint} />
                    )}
                  </Field>

                  {tab === "signup" ? (
                    <label className="flex items-start gap-2 text-xs text-dim">
                      <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => set("agree", e.target.checked)}
                        className="mt-0.5 accent-[var(--color-accent)]"
                      />
                      <span>
                        我已阅读并同意
                        <span className="text-accent">《用户协议》</span>与
                        <span className="text-accent">《隐私政策》</span>
                        {errors.agree && <span className="block text-[#f48a8a]">{errors.agree}</span>}
                      </span>
                    </label>
                  ) : tab === "login" ? (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-dim">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="accent-[var(--color-accent)]"
                        />
                        记住我
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTab("forgot");
                          setErrors({});
                          setFormError("");
                        }}
                        className="text-xs text-dim transition-colors hover:text-accent"
                      >
                        忘记密码？
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-bg shadow-[0_0_30px_-8px_rgba(91,240,176,0.8)] transition-all hover:bg-accent/90 disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
                        处理中…
                      </>
                    ) : tab === "login" ? (
                      "登录"
                    ) : tab === "signup" ? (
                      "注册"
                    ) : (
                      "重置密码"
                    )}
                  </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-bg/60 px-4 py-3 text-sm text-ink placeholder:text-dim/70 transition-colors focus:border-accent/50 focus:outline-none";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-dim">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[#f48a8a]">{error}</p>}
    </div>
  );
}

const STRENGTH_COLORS = ["#f48a8a", "#f4b78a", "#e6d98a", "#7ee0b0"];

function StrengthBar({ score, hint }: { score: number; hint: string }) {
  const color = STRENGTH_COLORS[score] ?? STRENGTH_COLORS[0];
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < score ? color : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <span className="text-[10px]" style={{ color }}>
        {hint}
      </span>
    </div>
  );
}
