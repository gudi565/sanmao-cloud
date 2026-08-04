"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
};

/**
 * 逐字滚动透明度揭示：文本整体淡（opacity 0.15），随滚动逐字亮到 1，
 * 像聚光灯扫过。中文按字、英文按词拆。与 RevealWords（遮罩上推）质感互补。
 */
export default function AnimatedText({ text, as: Tag = "p", className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const cjk = /[一-鿿]/.test(text);
  const units = cjk ? Array.from(text) : text.split(/(\s+)/);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (document.hidden) return;
      const chars = root.querySelectorAll<HTMLElement>(".at-char");
      gsap.fromTo(
        chars,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.02,
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            end: "bottom 35%",
            scrub: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as never} className={cn("inline-block", className)}>
      {units.map((u, i) => (
        <span
          key={i}
          className="at-char inline-block whitespace-pre will-change-[opacity]"
        >
          {u}
        </span>
      ))}
    </Tag>
  );
}
