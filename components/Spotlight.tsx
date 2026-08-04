"use client";

import { useEffect, useRef } from "react";

/**
 * 全局鼠标跟随光晕：在背景上投出一团跟随光标的柔和绿色辉光，
 * 营造「光在跟着你」的氛围。仅桌面启用。
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const apply = () => {
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.opacity = "1";
      raf = 0;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(560px circle at var(--mx, 50%) var(--my, 50%), rgba(91,240,176,0.08), rgba(14,124,90,0.05) 35%, transparent 68%)",
      }}
    />
  );
}
