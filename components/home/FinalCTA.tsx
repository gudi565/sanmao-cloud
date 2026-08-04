import MagneticButton from "../MagneticButton";
import Reveal from "../Reveal";
import Icon from "../Icon";

export default function FinalCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
      <Reveal className="noise relative overflow-hidden rounded-[2.5rem] border border-line bg-bg2/60 px-8 py-20 text-center sm:px-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(91,240,176,0.22),transparent_60%)] blur-2xl" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            准备好让 AI，<br className="sm:hidden" />
            <span className="text-gradient">为你所用了吗？</span>
          </h2>
          <p className="mt-5 text-dim">
            从今天的第一节免费课开始。没有基础也没关系，我们陪你一步步来。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg shadow-[0_0_44px_-8px_rgba(91,240,176,0.85)] transition-colors hover:bg-accent/90"
            >
              免费试听课程
              <Icon name="arrow" size={15} />
            </MagneticButton>
            <MagneticButton
              href="/membership"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-7 py-3.5 text-sm font-medium text-ink backdrop-blur transition-colors hover:border-accent/40"
            >
              了解会员
            </MagneticButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
