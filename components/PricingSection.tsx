"use client";

import { useState } from "react";
import { PLANS } from "@/lib/data";
import Icon from "./Icon";
import { cn } from "@/lib/utils";

type LeadState = "idle" | "submitting" | "done" | "error";

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadPlan, setLeadPlan] = useState("");
  const [contact, setContact] = useState("");
  const [leadState, setLeadState] = useState<LeadState>("idle");
  const [leadErr, setLeadErr] = useState("");

  async function submitLead() {
    if (!contact.trim() || leadState === "submitting") return;
    setLeadState("submitting");
    setLeadErr("");
    try {
      // 暂用 localStorage 本地暂存(后端 Lead API 待后端那条线加 model 后接入)
      const existing = JSON.parse(localStorage.getItem("sanmao_leads") || "[]");
      existing.push({ plan: leadPlan, contact, at: new Date().toISOString() });
      localStorage.setItem("sanmao_leads", JSON.stringify(existing));
      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, 600));
      setLeadState("done");
    } catch {
      setLeadErr("提交失败,请重试");
      setLeadState("error");
    }
  }

  function openLead(planName: string) {
    setLeadPlan(planName);
    setLeadOpen(true);
    setLeadState("idle");
    setContact("");
    setLeadErr("");
  }

  return (
    <div>
      {/* 计费切换 */}
      <div className="mb-12 flex items-center justify-center gap-3 text-sm">
        <span className={!yearly ? "text-ink" : "text-dim"}>按月</span>
        <button
          type="button"
          onClick={() => setYearly((v) => !v)}
          aria-label="切换计费周期"
          className="relative h-8 w-14 rounded-full border border-line bg-surface"
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-accent shadow-[0_0_12px_rgba(91,240,176,0.8)] transition-all duration-300",
              yearly ? "left-8" : "left-1"
            )}
          />
        </button>
        <span className={yearly ? "text-ink" : "text-dim"}>
          按年 <span className="text-accent">省 25%</span>
        </span>
      </div>

      {/* 套餐 */}
      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((p) => {
          const monthly = yearly ? Math.round(p.yearly / 12) : p.monthly;
          return (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7",
                p.highlight
                  ? "border-accent/50 bg-bg2/70 glow-accent"
                  : "border-line bg-bg2/40"
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-bg">
                  最受欢迎
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-dim">{p.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-semibold text-ink">
                  ¥{monthly}
                </span>
                <span className="mb-1 text-sm text-dim">/月</span>
              </div>
              {yearly && p.yearly > 0 && (
                <p className="mt-1 text-xs text-dim">按年付 ¥{p.yearly} / 年</p>
              )}

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink/90"
                  >
                    <span className="mt-0.5 text-accent">
                      <Icon name="check" size={16} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => openLead(p.name)}
                className={cn(
                  "mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors",
                  p.highlight
                    ? "bg-accent text-bg hover:bg-accent/90 shadow-[0_0_30px_-8px_rgba(91,240,176,0.7)]"
                    : "border border-line text-ink hover:border-accent/40"
                )}
              >
                {p.monthly === 0 ? "免费开始" : "立即开通"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 意向收集弹窗 */}
      {leadOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
            onClick={() => leadState !== "submitting" && setLeadOpen(false)}
          />
          <div className="glass-strong relative w-full max-w-md rounded-3xl border border-line p-7 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.18),transparent_70%)] blur-2xl" />

            <button
              type="button"
              onClick={() => leadState !== "submitting" && setLeadOpen(false)}
              aria-label="关闭"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line text-dim transition-colors hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>

            {leadState === "done" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="mt-4 font-display text-lg font-semibold text-ink">
                  已收到你的意向
                </p>
                <p className="mt-1 text-sm text-dim">
                  「{leadPlan}」支付功能上线时,我们会第一时间通知你。
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-xl font-semibold text-ink">
                  开通{leadPlan}
                </h3>
                <p className="mt-1 text-sm text-dim">
                  在线支付即将上线。留下邮箱或手机号,上线第一时间通知你——
                  <strong className="text-accent">早鸟用户享首月 5 折</strong>。
                </p>

                <div className="mt-5">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="邮箱 或 手机号"
                    className="w-full rounded-xl border border-line bg-bg/60 px-4 py-3 text-sm text-ink placeholder:text-dim/60 focus:border-accent/50 focus:outline-none"
                  />
                  {leadErr && (
                    <p className="mt-2 text-xs text-[#f48a8a]">{leadErr}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={submitLead}
                  disabled={leadState === "submitting" || !contact.trim()}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-bg transition-opacity disabled:opacity-50"
                >
                  {leadState === "submitting" ? "提交中…" : "提交,享早鸟价"}
                </button>

                <p className="mt-3 text-center text-xs text-dim/70">
                  我们不会骚扰你,只在上线时通知一次
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
