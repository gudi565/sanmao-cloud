"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

function format(v: number, decimals: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 滚动进入视区时，数字从 0 滚动到目标值。 */
export default function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const done =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.hidden;
      if (done) {
        el.textContent = `${prefix}${format(to, decimals)}${suffix}`;
        return;
      }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: () => {
          el.textContent = `${prefix}${format(obj.v, decimals)}${suffix}`;
        },
      });
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
