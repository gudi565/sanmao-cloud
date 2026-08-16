"use client";

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
 * 学习路径 · 垂直卡片区
 * 4 张卡片依次展示，进入视区时由 Reveal 淡入（不再 sticky 堆叠，避免滚动卡顿）。
 */
export default function StackCards() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-6 sm:pt-20">
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
            className="mx-auto w-full max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-[1.5rem] border border-line bg-bg2/70 p-6 sm:p-7">
              {/* 角落辉光 */}
              <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.16),transparent_70%)] blur-2xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-accent">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <span className="text-xs uppercase tracking-[0.25em] text-dim">
                      路径 · {s.no}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-dim">
                    {s.desc}
                  </p>
                </div>
                <span className="font-display text-4rem font-black leading-none text-white/[0.06] sm:text-6rem">
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
