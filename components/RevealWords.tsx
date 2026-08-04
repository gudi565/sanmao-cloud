"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  as?: ElementType;
  stagger?: number;
  duration?: number;
  /** true=进入视区触发；false=挂载即播放 */
  scroll?: boolean;
  delay?: number;
};

/**
 * 逐字/逐词遮罩揭示：每个字包在 overflow-hidden 的遮罩里，
 * 内层从下方 120% 推上。中文按字符拆，英文按词拆。
 * 进入视区（或挂载）时播放，编辑式高级感。
 */
export default function RevealWords({
  text,
  className,
  as: Tag = "span",
  stagger = 0.045,
  duration = 0.9,
  scroll = true,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const isCJK = /[一-鿿]/.test(text);
  const units = isCJK ? Array.from(text) : text.split(/(\s+)/);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (document.hidden) return;
      const words = root.querySelectorAll<HTMLElement>(".rwx-word");
      gsap.from(words, {
        yPercent: 120,
        duration,
        ease: "power4.out",
        stagger,
        delay,
        scrollTrigger: scroll ? { trigger: root, start: "top 86%" } : undefined,
      });
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref as never} className={cn("inline-block", className)}>
      {units.map((u, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom [padding-bottom:0.18em] [margin-bottom:-0.18em]"
        >
          <span className="rwx-word inline-block will-change-transform">
            {/^\s+$/.test(u) ? " " : u}
          </span>
        </span>
      ))}
    </Tag>
  );
}
