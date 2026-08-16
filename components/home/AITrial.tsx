"use client";

import { useRef, useState } from "react";
import Reveal from "../Reveal";

/**
 * 首页「30秒免费体验 AI」:大输入框 + 预设快捷按钮 → 调免费技能流式渲染。
 * 答完显示转化引导(注册解锁更多)。这是全站转化漏斗的入口。
 */
const PRESETS = [
  { label: "改写润色", skill: "rewrite", placeholder: "把要改写的文字粘进来,我来帮你润色", example: "AI 正在改变我们的工作方式。它可以帮助我们写代码、做设计、处理数据,让效率大大提升。但很多人还不知道怎么用好它。" },
  { label: "总结提炼", skill: "summarize", placeholder: "把长文章/会议内容粘进来,我来帮你总结", example: "人工智能(Artificial Intelligence,简称AI)是计算机科学的一个分支,致力于开发能够模拟人类智能的系统。近年来,随着深度学习、大语言模型等技术突破,AI在自然语言处理、计算机视觉、语音识别等领域取得了巨大进展。ChatGPT等对话式AI工具的出现,让普通用户也能直接使用AI完成写作、翻译、编程等任务。据研究机构预测,到2030年全球AI市场规模将超过1.5万亿美元,AI相关技能将成为职场竞争力的重要组成部分。" },
  { label: "中英互译", skill: "translate", placeholder: "把要翻译的文字粘进来(说明方向,如:中→英)", example: "三猫云是一个面向个人的AI学习平台,我们相信每个人都应该掌握AI技能,让工作和生活更高效。我们的使命是:让每个人都能用好AI。" },
];

export default function AITrial() {
  const [input, setInput] = useState("");
  const [skill, setSkill] = useState(PRESETS[0]);
  const [out, setOut] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(0);
  const outRef = useRef<HTMLDivElement>(null);

  async function run(text?: string) {
    const val = (text ?? input).trim();
    if (!val || status === "running") return;
    if (tries >= 2) return; // 前端限2次,超过弹引导
    setStatus("running");
    setOut("");
    setErr("");
    setTries((n) => n + 1);
    try {
      const res = await fetch("/api/ai/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: skill.skill, input: val }),
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
      setTimeout(() => {
        outRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (e) {
      setErr(String((e as Error)?.message || e));
      setStatus("error");
    }
  }

  function pick(preset: (typeof PRESETS)[number]) {
    setSkill(preset);
    setInput("");
    setOut("");
    setStatus("idle");
    setErr("");
  }

  function useExample() {
    setInput(skill.example);
    setStatus("idle");
    setOut("");
  }

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pt-16 pb-8 sm:pt-20">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent">
            <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
            免费体验 · 无需注册
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            30 秒,感受 <span className="text-gradient">AI 的能力</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-dim sm:text-base">
            选一个场景,粘一段文字,看看 AI 能帮你做什么。
          </p>
        </div>
      </Reveal>

      {/* 快捷按钮 */}
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.skill}
              type="button"
              onClick={() => pick(p)}
              className={
                "rounded-full border px-5 py-2.5 text-sm transition-all " +
                (skill.skill === p.skill
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line text-dim hover:border-accent/30 hover:text-ink")
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* 输入区 */}
      <Reveal delay={0.15}>
        <div className="relative mt-6">
          <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(91,240,176,0.12),transparent_70%)] blur-xl" />
          <div className="relative rounded-[1.75rem] border border-line bg-bg2/70 p-5 sm:p-7">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={skill.placeholder}
              rows={4}
              className="w-full resize-y rounded-2xl border border-line bg-bg/60 p-4 text-sm leading-relaxed text-ink placeholder:text-dim/60 focus:border-accent/50 focus:outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={useExample}
                className="text-xs text-dim transition-colors hover:text-accent"
              >
                没有内容?插入一段示例 →
              </button>
              <button
                type="button"
                onClick={() => run()}
                disabled={status === "running" || !input.trim() || tries >= 2}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-bg shadow-[0_0_40px_-8px_rgba(91,240,176,0.8)] transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {status === "running" ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
                    AI 正在生成…
                  </>
                ) : (
                  <>开始体验</>
                )}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 结果 */}
      <div ref={outRef}>
        {err && (
          <div className="mt-4 rounded-xl border border-[#f48a8a]/40 bg-[#f48a8a]/10 p-4 text-sm text-[#f48a8a]">
            {err}
          </div>
        )}
        {out && (
          <div className="mt-4 rounded-2xl border border-accent/20 bg-bg2/50 p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-xs text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              AI 结果
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {out}
              {status === "running" && <span className="animate-pulse">▍</span>}
            </div>
          </div>
        )}
      </div>

      {/* 转化引导 */}
      {(status === "done" || tries >= 2) && (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-center sm:p-6">
          {tries < 2 ? (
            <>
              <p className="text-sm text-dim">
                这是免费体验。你还可以再试 <strong className="text-ink">{2 - tries}</strong> 次。
              </p>
              <p className="mt-1 text-sm text-dim">
                注册后每天免费 <strong className="text-ink">3</strong> 次,
                <a href="/membership" className="text-accent hover:underline">开通会员</a>
                不限次使用。
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-ink">
                免费体验已用完
              </p>
              <p className="mt-2 text-sm text-dim">
                注册即送每天 3 次免费额度,会员不限次畅用全部 AI 技能。
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
                >
                  开通会员
                </a>
                <span className="text-xs text-dim">或</span>
                <a
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm text-ink transition-colors hover:border-accent/40"
                >
                  浏览更多技能
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* 底部小提示 */}
      <p className="mt-4 text-center text-xs text-dim/70">
        结果由 AI 实时生成 · 由智谱 GLM 驱动 · 免费体验无需注册
      </p>
    </section>
  );
}
