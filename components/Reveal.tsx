"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** 位移距离 */
  y?: number;
  delay?: number;
  /** 对子元素 [data-r] 依次出现的间隔；设为 0 表示整体出现 */
  stagger?: number;
  duration?: number;
  as?: ElementType;
};

/**
 * 进场动画包装器：进入视区时由下方淡入上浮。
 * 用于「首屏以下」的滚动揭示内容（首屏 Hero 用独立入场时间线，避免闪烁）。
 * 子元素若带 data-r 属性，则按 stagger 依次出现。
 */
export default function Reveal({
  children,
  className,
  y = 38,
  delay = 0,
  stagger = 0,
  duration = 0.9,
  as: Tag = "div",
}: RevealProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = container.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // 页面不可见时（如标签页在后台）不隐藏内容，保证始终可见
      if (document.hidden) return;

      const items = root.querySelectorAll<HTMLElement>("[data-r]");
      const targets = items.length ? items : root;
      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: "power3.out",
        stagger: items.length ? stagger : 0,
        scrollTrigger: { trigger: root, start: "top 84%" },
      });
    },
    { scope: container }
  );

  return (
    <Tag ref={container as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
