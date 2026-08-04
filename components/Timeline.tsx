import Reveal from "./Reveal";
import { MILESTONES } from "@/lib/data";

/** 公司发展时间线：单侧竖向，节点逐条进场。 */
export default function Timeline() {
  return (
    <div className="relative mx-auto max-w-2xl pl-8">
      <div className="absolute bottom-2 left-[6px] top-2 w-px bg-line" />
      <div className="space-y-12">
        {MILESTONES.map((m) => (
          <Reveal key={m.year} y={28} className="relative">
            <span className="absolute -left-8 top-1.5 flex h-3 w-3 items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_14px_rgba(91,240,176,0.9)]" />
            </span>
            <div data-r className="font-display text-sm tracking-wide text-accent">
              {m.year}
            </div>
            <h3 data-r className="mt-1 font-display text-xl font-semibold text-ink">
              {m.title}
            </h3>
            <p data-r className="mt-2 text-sm leading-relaxed text-dim">
              {m.desc}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
