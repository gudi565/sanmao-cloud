"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "../SectionHeading";

/**
 * 产品一览 · 设备框展示
 * 浏览器框（桌面 AI 工作台）+ 手机框（移动学习），鼠标视差 + 倾角 + 呼吸浮动。
 * 屏幕内的 UI 用站点 token 现绘，避免占位图，呈现真实产品质感。
 */
export default function ProductShowcase() {
  const root = useRef<HTMLElement>(null);
  const desktop = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 进场：淡入上浮（标签页后台时跳过，避免留在 opacity:0）
      // 性能优化:砍掉鼠标视差 quickTo(4个/帧是滚动卡顿主因之一)
      if (!reduce && !document.hidden) {
        gsap.from(".showcase-rise", {
          y: 44,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });
      }
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative z-10 mx-auto max-w-7xl overflow-hidden px-6 py-24 sm:py-28">
      <SectionHeading
        eyebrow="产品一览"
        title={
          <>
            把 AI，<span className="text-gradient">装进你的日常</span>
          </>
        }
        desc="课程、工具、社群，都在一个顺手的工作台里——这是它在屏幕里的样子。"
      />

      {/* 背景辉光 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[420px] w-[680px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.10),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto mt-14 max-w-4xl">
        {/* 桌面浏览器框 */}
        <div ref={desktop} className="showcase-rise relative z-10 will-change-transform">
          <div className="animate-float">
            <div className="rotate-[-1deg] sm:rotate-[-1.5deg]">
              <div className="overflow-hidden rounded-2xl border border-line bg-bg2/85 shadow-[0_50px_140px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                {/* 顶栏 */}
                <div className="flex items-center gap-2 border-b border-line bg-bg/60 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
                  <span className="mx-auto flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[10px] text-dim">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    sanmao.cloud / ai
                  </span>
                </div>

                {/* 屏幕内容：AI 工作台 */}
                <div className="flex h-[260px] text-[11px] sm:h-[300px] sm:text-xs">
                  {/* 侧栏 */}
                  <aside className="hidden w-36 shrink-0 flex-col gap-1 border-r border-line p-3 sm:flex">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/15 text-accent">三</span>
                      <span className="font-display text-sm font-semibold text-ink">三猫云</span>
                    </div>
                    {[
                      ["工作台", true],
                      ["我的课程", false],
                      ["AI 工具", false],
                      ["社群", false],
                    ].map(([label, active]) => (
                      <span
                        key={label as string}
                        className={
                          "rounded-lg px-2.5 py-1.5 " +
                          (active ? "bg-surface text-ink" : "text-dim")
                        }
                      >
                        {label as string}
                      </span>
                    ))}
                    <div className="mt-auto rounded-lg border border-line p-2.5">
                      <div className="mb-1 flex items-center justify-between text-dim">
                        <span>用量</span><span>62%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-accent" />
                      </div>
                    </div>
                  </aside>

                  {/* 主区 */}
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-display text-sm font-semibold text-ink">AI 写作助手</span>
                      <span className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[9px] text-accent">
                        <span className="h-1 w-1 rounded-full bg-accent" />在线
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
                      {/* 用户气泡 */}
                      <div className="self-end rounded-2xl rounded-br-sm bg-surface px-3 py-2 text-ink">
                        帮我写一段三猫云的产品介绍，面向零基础用户。
                      </div>
                      {/* 助手回答 */}
                      <div className="rounded-2xl rounded-bl-sm border border-line bg-bg/50 p-3">
                        <p className="leading-relaxed text-dim">
                          <span className="text-ink">三猫云</span> 是面向个人的 AI 学习平台。从零基础到实战，
                          用系统课程、趁手工具和陪伴社群，帮你把 AI 真正变成自己的能力
                          <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-accent" />
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[9px] text-dim">
                          <span className="rounded border border-line px-1.5 py-0.5">复制</span>
                          <span className="rounded border border-line px-1.5 py-0.5">重写</span>
                          <span className="rounded border border-line px-1.5 py-0.5">更详细</span>
                        </div>
                      </div>
                    </div>

                    {/* 输入条 */}
                    <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-2">
                      <span className="flex-1 text-dim">输入指令，或粘贴要改写的文字…</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-bg">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 手机框（前景，视差更强） */}
        <div
          ref={phone}
          className="showcase-rise absolute -bottom-8 right-0 z-20 hidden w-[150px] will-change-transform sm:block sm:w-[180px] md:w-[200px]"
        >
          <div className="animate-float" style={{ animationDelay: "-3.5s" }}>
            <div className="rotate-[6deg]">
              <div className="overflow-hidden rounded-[1.75rem] border-[5px] border-[#0b1410] bg-bg2 shadow-[0_40px_90px_-25px_rgba(0,0,0,0.8)]">
                {/* 刘海 */}
                <div className="flex justify-center pt-1.5">
                  <span className="h-1 w-10 rounded-full bg-white/15" />
                </div>
                {/* 屏幕内容：我的学习 */}
                <div className="p-3 text-[9px]">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[11px] font-semibold text-ink">我的学习</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[8px] text-accent">猫</span>
                  </div>

                  <div className="mt-2.5 rounded-xl border border-line bg-bg/50 p-2.5">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-dim">本周学习</div>
                        <div className="font-display text-base font-bold text-ink">4.2h</div>
                      </div>
                      <div className="text-accent">↑ 18%</div>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg">
                      <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-accent" />
                    </div>
                  </div>

                  <div className="mt-2 overflow-hidden rounded-xl border border-line">
                    <div className="h-12 bg-gradient-to-br from-primary/70 to-accent/60" />
                    <div className="p-2">
                      <div className="text-[10px] font-medium text-ink">AI 零基础入门</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg">
                          <div className="h-full w-[45%] rounded-full bg-accent" />
                        </div>
                        <span className="text-dim">45%</span>
                      </div>
                    </div>
                  </div>

                  {/* 底部 tab */}
                  <div className="mt-2.5 flex items-center justify-between rounded-xl border border-line bg-bg/40 px-2 py-1.5 text-[8px] text-dim">
                    <span className="text-accent">学习</span>
                    <span>课程</span>
                    <span>工具</span>
                    <span>我的</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
