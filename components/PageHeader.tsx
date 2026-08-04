import { type ReactNode } from "react";
import Reveal from "./Reveal";
import ParticleField from "./ParticleField";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
};

/** 内页通用页头：顶部留白避开导航，标题逐行进场。 */
export default function PageHeader({ eyebrow, title, desc }: Props) {
  return (
    <header className="relative isolate mx-auto max-w-7xl px-6 pb-12 pt-36 sm:pt-44">
      <ParticleField
        density={0.7}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-35"
      />
      <Reveal className="relative z-10">
        {eyebrow && (
          <span
            data-r
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent"
          >
            <span className="h-1 w-1 rounded-full bg-accent" />
            {eyebrow}
          </span>
        )}
        <h1
          data-r
          className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl"
        >
          {title}
        </h1>
        {desc && (
          <p data-r className="mt-5 max-w-2xl text-base leading-relaxed text-dim sm:text-lg">
            {desc}
          </p>
        )}
      </Reveal>
    </header>
  );
}
