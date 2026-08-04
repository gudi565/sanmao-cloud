import GlowCard from "../GlowCard";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { TESTIMONIALS } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-28">
      <SectionHeading
        eyebrow="学员口碑"
        title={
          <>
            120 万人的选择，<span className="text-gradient">真实可感</span>
          </>
        }
        desc="他们在三猫云把 AI 变成了自己的能力——这是其中一些声音。"
      />

      <Reveal stagger={0.08} className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div data-r key={t.name}>
            <GlowCard className="flex h-full flex-col p-7">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Icon key={i} name="star" size={16} className="fill-accent" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/90">
                “{t.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-semibold text-bg">
                  {t.name.slice(0, 1)}
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">{t.name}</div>
                  <div className="text-xs text-dim">{t.role}</div>
                </div>
              </div>
            </GlowCard>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
