"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ParticleField from "../ParticleField";
import MagneticButton from "../MagneticButton";
import Counter from "../Counter";
import EchoText from "../EchoText";

function Stat({ to, suffix, label }: { to: number; suffix: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        <Counter to={to} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-dim">{label}</div>
    </div>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const orb = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!reduce && !document.hidden) {
        const tl = gsap.timeline({ delay: 0.35 });
        tl.from(".hero-rise", {
          y: 42,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
        });
      }

      // 性能优化:砍掉辉光球/文案的鼠标视差(4个quickTo/帧是卡顿主因)
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="noise relative flex min-h-[100svh] items-center overflow-hidden pt-28"
    >
      {/* 网格底纹 */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />

      {/* 漂浮辉光球：外层定位、中层 GSAP 视差、内层 CSS 呼吸 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0">
        <div ref={orb} className="relative">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_32%_30%,rgba(91,240,176,0.22),rgba(14,124,90,0.08)_45%,transparent_70%)] blur-2xl animate-pulse-glow" />
        </div>
      </div>

      {/* 粒子网络 */}
      <ParticleField
        density={1.4}
        className="absolute inset-0 z-0 h-full w-full opacity-85"
      />

      {/* 文案 */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
        <div ref={content} className="flex flex-col items-center">
          <span className="hero-rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
            面向个人的 AI 学习与生产力平台
          </span>

          <h1 className="hero-rise mt-7 font-display text-[clamp(2.8rem,8.5vw,6rem)] leading-[1.04] tracking-tight">
            <EchoText
              text="让每个人都能"
              className="font-light text-ink"
              layers={2}
              dx={4}
              dy={3}
            />
            <br />
            <EchoText
              text="用好 AI"
              className="font-bold text-accent"
              layers={3}
              dx={6}
              dy={5}
              glow
            />
          </h1>

          <p className="hero-rise mt-6 max-w-xl text-base leading-relaxed text-dim sm:text-lg">
            从零基础到 AI 实战，三猫云用系统课程、趁手工具和陪伴社群，
            帮你把 AI 真正变成自己的能力。
          </p>

          <div className="hero-rise mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <MagneticButton
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg shadow-[0_0_44px_-8px_rgba(91,240,176,0.85)] transition-colors hover:bg-accent/90"
            >
              免费试听课程
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>
            <MagneticButton
              href="/tools"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink backdrop-blur transition-colors hover:border-accent/40"
            >
              探索 AI 工具
            </MagneticButton>
          </div>

          <div className="hero-rise mt-14 flex items-center gap-8 sm:gap-14">
            <Stat to={12} suffix="万+" label="学员选择" />
            <span className="h-8 w-px bg-line" />
            <Stat to={80} suffix="+" label="精品课程" />
            <span className="h-8 w-px bg-line" />
            <Stat to={30} suffix="+" label="AI 工具" />
          </div>
        </div>
      </div>

      {/* 滚动提示 */}
      <div className="hero-rise pointer-events-none absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-dim">
        <span className="text-[11px] tracking-[0.2em] uppercase">scroll</span>
        <span className="relative h-9 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-3 animate-[float_1.8s_ease-in-out_infinite] bg-accent" />
        </span>
      </div>
    </section>
  );
}
