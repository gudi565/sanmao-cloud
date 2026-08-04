import { STATS } from "@/lib/data";
import Counter from "../Counter";
import Reveal from "../Reveal";

export default function StatsBand() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-10">
      <Reveal
        stagger={0.1}
        className="grid grid-cols-2 gap-8 rounded-[2rem] border border-line bg-bg2/40 p-10 backdrop-blur md:grid-cols-4"
      >
        {STATS.map((s) => (
          <div data-r key={s.label} className="text-center">
            <div className="text-gradient font-display text-4xl font-semibold sm:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-sm text-dim">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
