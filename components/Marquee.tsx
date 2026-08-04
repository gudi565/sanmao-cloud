"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  items: string[];
  className?: string;
  /** 单个条目样式 */
  itemClassName?: string;
  /** 一圈循环时长（秒，仅自播模式生效） */
  duration?: number;
  /** 反向（自播方向 / 滚动漂移方向） */
  reverse?: boolean;
  /** 分隔符 */
  sep?: string;
  /** 滚动驱动：随竖向滚动横向漂移（关闭则匀速自播） */
  scrollDriven?: boolean;
};

/**
 * 跑马灯。两种模式：
 * - 自播（默认）：内容复制两份，translateX 0 → -50% 匀速循环，两侧渐隐。
 * - 滚动驱动（scrollDriven）：复制三份，随竖向滚动用 ScrollTrigger scrub 横向漂移，
 *   reverse 控制方向。与 Lenis 平滑滚动已接好（lenis.on('scroll', ScrollTrigger.update)）。
 */
export default function Marquee({
  items,
  className,
  itemClassName,
  duration = 36,
  reverse = false,
  sep = "✦",
  scrollDriven = false,
}: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const copies = scrollDriven ? 3 : 2;

  useGSAP(
    () => {
      if (!scrollDriven) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!track.current || !outer.current) return;
      const dir = reverse ? 1 : -1;
      gsap.fromTo(
        track.current,
        { xPercent: 15 * dir },
        {
          xPercent: -15 * dir,
          ease: "none",
          scrollTrigger: {
            trigger: outer.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    },
    { scope: outer }
  );

  const Row = () => (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className={cn("px-6", itemClassName)}>{it}</span>
          <span className="px-2 text-accent/40" aria-hidden>
            {sep}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={outer} className={cn("marquee mask-x flex overflow-hidden", className)} aria-hidden>
      <div
        ref={track}
        className={cn("flex w-max", !scrollDriven && "marquee-inner")}
        style={
          scrollDriven
            ? undefined
            : {
                animationDuration: `${duration}s`,
                animationDirection: reverse ? "reverse" : "normal",
              }
        }
      >
        {Array.from({ length: copies }).map((_, i) => (
          <Row key={i} />
        ))}
      </div>
    </div>
  );
}
