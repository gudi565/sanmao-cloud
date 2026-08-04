import Link from "next/link";
import GlowCard from "../GlowCard";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const ITEMS = [
  {
    icon: "graduation",
    title: "学课程",
    desc: "从零基础到职业进阶，80+ 门系统课程，陪你一步步把 AI 用起来。",
    href: "/courses",
    from: "#0e7c5a",
    to: "#5bf0b0",
    cta: "浏览课程",
  },
  {
    icon: "bolt",
    title: "用工具",
    desc: "30+ 实用 AI 工具一站式集合，写作、绘画、办公、视频开箱即用。",
    href: "/tools",
    from: "#13a06b",
    to: "#c9a86a",
    cta: "体验工具",
  },
  {
    icon: "star",
    title: "开会员",
    desc: "畅学全站 + 工具不限次 + 导师社群，一个人也能拥有 AI 后援团。",
    href: "/membership",
    from: "#0a5c36",
    to: "#5bf0b0",
    cta: "查看权益",
  },
];

export default function Entries() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-28">
      <SectionHeading
        eyebrow="三件事"
        title={
          <>
            一个平台，<span className="text-gradient">搞定你的 AI 全流程</span>
          </>
        }
        desc="学习、工具、社群——三猫云把个人用 AI 需要的一切，都放进一个地方。"
      />

      <Reveal stagger={0.12} className="mt-14 grid gap-5 md:grid-cols-3">
        {ITEMS.map((it, i) => (
          <div data-r key={it.title}>
            <Link href={it.href}>
              <GlowCard className="flex h-full flex-col p-7">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-bg"
                    style={{ background: `linear-gradient(135deg, ${it.from}, ${it.to})` }}
                  >
                    <Icon name={it.icon} size={22} />
                  </span>
                  <span className="font-display text-4xl font-semibold text-white/10">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink">
                  {it.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-dim">
                  {it.desc}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-accent">
                  {it.cta}
                  <Icon name="arrow" size={15} />
                </span>
              </GlowCard>
            </Link>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
