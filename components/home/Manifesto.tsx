import AnimatedText from "../AnimatedText";

/**
 * 理念宣言段：单句逐字点亮 + 短副文，首页尾段情绪铺垫（接在口碑与最终 CTA 之间）。
 */
export default function Manifesto() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent">
        <span className="h-1 w-1 rounded-full bg-accent animate-pulse-glow" />
        我们的理念
      </span>

      <AnimatedText
        as="h2"
        text="学会用 AI，是这个时代最重要的读写能力。"
        className="font-display text-[clamp(2rem,6vw,4.2rem)] font-semibold leading-[1.15] tracking-tight text-ink"
      />

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-dim sm:text-lg">
        三猫云相信，AI 不该只属于少数技术专家。我们把它拆成听得懂的课、用得顺手的工具、
        和有人陪的社群——让每一个普通人，都能把它变成自己的能力。
      </p>
    </section>
  );
}
