"use client";

import { useState } from "react";
import { PLANS } from "@/lib/data";
import MagneticButton from "./MagneticButton";
import Icon from "./Icon";
import { cn } from "@/lib/utils";

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* 计费切换 */}
      <div className="mb-12 flex items-center justify-center gap-3 text-sm">
        <span className={!yearly ? "text-ink" : "text-dim"}>按月</span>
        <button
          type="button"
          onClick={() => setYearly((v) => !v)}
          aria-label="切换计费周期"
          className="relative h-8 w-14 rounded-full border border-line bg-surface"
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-accent shadow-[0_0_12px_rgba(91,240,176,0.8)] transition-all duration-300",
              yearly ? "left-8" : "left-1"
            )}
          />
        </button>
        <span className={yearly ? "text-ink" : "text-dim"}>
          按年 <span className="text-accent">省 25%</span>
        </span>
      </div>

      {/* 套餐 */}
      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((p) => {
          const monthly = yearly ? Math.round(p.yearly / 12) : p.monthly;
          return (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col rounded-3xl border p-7",
                p.highlight
                  ? "border-accent/50 bg-bg2/70 glow-accent"
                  : "border-line bg-bg2/40"
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-bg">
                  最受欢迎
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-dim">{p.tagline}</p>

              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-semibold text-ink">
                  ¥{monthly}
                </span>
                <span className="mb-1 text-sm text-dim">/月</span>
              </div>
              {yearly && p.yearly > 0 && (
                <p className="mt-1 text-xs text-dim">按年付 ¥{p.yearly} / 年</p>
              )}

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink/90"
                  >
                    <span className="mt-0.5 text-accent">
                      <Icon name="check" size={16} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <MagneticButton
                href="/membership"
                className={cn(
                  "mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors",
                  p.highlight
                    ? "bg-accent text-bg hover:bg-accent/90"
                    : "border border-line text-ink hover:border-accent/40"
                )}
              >
                {p.cta}
              </MagneticButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
