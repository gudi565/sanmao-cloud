"use client";

import { useState } from "react";
import { type Skill } from "@/lib/skills";

/** 单个技能的运行器:输入框 → 调 /api/ai/skill → 流式渲染结果。 */
export default function SkillRunner({ skill }: { skill: Skill }) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle"
  );
  const [err, setErr] = useState("");

  async function run() {
    if (!input.trim() || status === "running") return;
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
    } catch (e) {
      setErr(String((e as Error)?.message || e));
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
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
        {status === "running" ? "生成中…" : "运行技能"}
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

      <p className="text-xs text-dim">
        提示:结果由 AI 实时生成。付费门槛与额度系统即将上线,现为开放体验期。
      </p>
    </div>
  );
}
