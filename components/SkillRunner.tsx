"use client";

import { useEffect, useState } from "react";
import { type Skill } from "@/lib/skills";

/** localStorage key:记录已免费试用过的付费技能 slug */
const TRIED_KEY = "sanmao_trial_slugs";

function getTried(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TRIED_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * 单个技能的运行器:输入框 → 调 /api/ai/skill → 流式渲染结果。
 * 付费技能(price>0)首次免费试用,第二次弹出注册/付费引导。
 */
export default function SkillRunner({ skill }: { skill: Skill }) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const [err, setErr] = useState("");
  const [tried, setTried] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // 挂载时检查:付费技能是否已试用过
  useEffect(() => {
    if (skill.price > 0) {
      setTried(getTried().includes(skill.slug));
    }
  }, [skill.slug, skill.price]);

  const isPaidAndTried = skill.price > 0 && tried;

  async function run() {
    if (!input.trim() || status === "running") return;

    // 付费技能已试用过 → 弹付费墙
    if (isPaidAndTried) {
      setShowPaywall(true);
      return;
    }

    setStatus("running");
    setOut("");
    setErr("");
    try {
      const res = await fetch("/api/ai/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: skill.slug, input }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setErr(e.error || `请求失败(${res.status})`);
        setStatus("error");
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) {
        setErr("无响应流");
        setStatus("error");
        return;
      }
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setOut(acc);
      }
      setStatus("done");

      // 付费技能成功运行后,标记为已试用
      if (skill.price > 0 && !tried) {
        const list = getTried();
        list.push(skill.slug);
        localStorage.setItem(TRIED_KEY, JSON.stringify(list));
        setTried(true);
      }
    } catch (e) {
      setErr(String((e as Error)?.message || e));
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      {/* 付费技能首次提示 */}
      {skill.price > 0 && !tried && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-accent">
          💡 此技能首次使用免费,体验后如需继续使用可
          <a href="/membership" className="ml-1 font-medium underline hover:no-underline">开通会员</a>
          或单独购买。
        </div>
      )}

      {/* 付费墙 */}
      {showPaywall && (
        <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            免费试用已用完
          </p>
          <p className="mt-2 text-sm text-dim">
            「{skill.name}」为付费技能(¥{skill.price})。
            开通会员可不限次使用全部技能,或单独购买此技能。
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/membership"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              开通会员畅用
            </a>
            <button
              type="button"
              onClick={() => setShowPaywall(false)}
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm text-dim transition-colors hover:text-ink"
            >
              稍后再说
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm text-dim">{skill.inputLabel}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={skill.inputPlaceholder}
          rows={5}
          className="w-full resize-y rounded-2xl border border-line bg-bg/60 p-4 text-sm text-ink placeholder:text-dim/60 focus:border-accent/50 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={run}
        disabled={status === "running" || !input.trim()}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg shadow-[0_0_30px_-8px_rgba(91,240,176,0.7)] transition-opacity disabled:opacity-50"
      >
        {status === "running" ? "生成中…" : isPaidAndTried ? "继续使用(需付费)" : skill.price > 0 && !tried ? "免费试用一次" : "运行技能"}
      </button>

      {err && (
        <div className="rounded-xl border border-[#f48a8a]/40 bg-[#f48a8a]/10 p-4 text-sm text-[#f48a8a]">
          {err}
        </div>
      )}

      {out && (
        <div className="rounded-2xl border border-line bg-bg2/50 p-5">
          <div className="mb-2 text-xs text-dim">结果</div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {out}
            {status === "running" && <span className="animate-pulse">▍</span>}
          </div>
        </div>
      )}
    </div>
  );
}
