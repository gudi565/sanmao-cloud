"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  href?: string;
  className?: string;
  /** 磁吸强度 0~1 */
  strength?: number;
  onClick?: () => void;
};

/**
 * 磁性按钮：鼠标靠近时元素被「吸附」朝向光标，离开后回弹。
 * 传入 href 渲染为链接，否则为按钮。桌面启用，触屏降级为普通点击。
 */
export default function MagneticButton({
  children,
  href,
  className,
  strength = 0.35,
  onClick,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      xTo(x * strength);
      yTo(y * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const classes = cn("inline-flex", className);

  if (href) {
    return (
      <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
