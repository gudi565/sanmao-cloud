"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * 自定义光标：即时跟随的小圆点 + 滞后跟随的描边圆环。
 * 悬停可交互元素时圆环放大高亮；按下时收缩。
 * 仅在精确指针（桌面）启用，触屏不渲染。
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });

    let shown = false;
    const move = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      xDot(e.clientX);
      yDot(e.clientY);
      gsap.set(ring, { x: e.clientX, y: e.clientY });
    };

    const hoverSel =
      'a, button, [data-cursor="hover"], input, textarea, select, summary';
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(hoverSel)) ring.classList.add("is-hover");
    };
    const out = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(hoverSel)) ring.classList.remove("is-hover");
    };
    const down = () => ring.classList.add("is-down");
    const up = () => ring.classList.remove("is-down");
    const leave = () => {
      shown = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mouseout", out, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  );
}
