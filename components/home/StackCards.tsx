"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Icon from "../Icon";
import SectionHeading from "../SectionHeading";

const STEPS = [
  {
    no: "01",
    icon: "sparkles",
    title: "零基础起步",
    desc: "认识 AI，写出第一条高质量提示词。我们假设你什么都不会，从打开第一个工具开始，7 天即可上手。",
  },
  {
    no: "02",
    icon: "bolt",
    title: "工具上手",
    desc: "绘画、写作、办公——把主流 AI 工具逐个练熟，每个都来自真实场景，学完立刻能落在自己的工作里。",
  },
  {
    no: "03",
    icon: "target",
    title: "项目实战",
    desc: "用 AI 完成真实任务与作品集，边学边产出，沉淀一份能拿得出手、能讲得出的成果。",
  },
  {
    no: "04",
    icon: "rocket",
    title: "职业进阶",
    desc: "副业变现、求职加分、搭建私人智能体，把 AI 变成你的长期竞争力与第二份收入。",
  },
];

/**
 * 学习路径 · Sticky 堆叠卡片
 * 每张卡片 sticky 钉在屏幕上方、z 逐级抬升，下一张滑入时
 * 前一张随滚动平滑缩小，形成层层堆叠的展开节奏。
 */
export default function StackCards() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      const total = cards.length;
      // 前一张在「下一张滑入覆盖」的过程中缩到目标尺寸
      cards.forEach((card, i) => {
        if (i === total - 1) return;
        const target = 1 - (total - 1 - i) * 0.05;
        gsap.to(card, {
          scale: target,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-24">
      <SectionHeading
        eyebrow="学习路径"
        title={
          <>
            四步走，<span className="text-gradient">稳步进阶</span>
          </>
        }
        desc="不用纠结从哪儿开始——跟着路径，每一步都有对应的课程与实战。"
      />

      <div className="mt-12 flex flex-col gap-5">
        {STEPS.map((s, i) => (
          <div
            key={s.no}
            className="stack-card sticky top-[var(--ctop)] z-[var(--cz)] mx-auto w-full max-w-5xl will-change-transform"
            style={
              {
                ["--ctop" as string]: `${84 + i * 24}px`,
                ["--cz" as string]: `${i + 1}`,
              } as React.CSSProperties
            }
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-bg2/70 p-7 backdrop-blur-xl sm:p-10">
              {/* 角落辉光 */}
              <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.16),transparent_70%)] blur-2xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-accent">
                      <Icon name={s.icon} size={24} />
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-dim">
                      路径 · {s.no}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-dim sm:text-lg">
                    {s.desc}
                  </p>
                </div>
                <span className="font-display text-[5.5rem] font-black leading-none text-white/[0.06] sm:text-[9rem]">
                  {s.no}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
