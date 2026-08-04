"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** 顶部滚动进度条，随页面滚动填充。 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.to(el, { scaleX: self.progress, duration: 0.1, overwrite: true });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-primary via-accent to-primary2"
        style={{ transform: "scaleX(0)", boxShadow: "0 0 12px rgba(91,240,176,0.7)" }}
      />
    </div>
  );
}
