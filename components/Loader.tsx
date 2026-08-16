"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import Logo from "./Logo";

/** 首屏加载动画：进度条填充后整体上移揭幕。减少动效下直接跳过。 */
export default function Loader() {
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    const finish = () => setDone(true);

    const tl = gsap.timeline();
    tl.fromTo(
      bar.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: "power2.inOut" }
    );
    tl.to(
      ".loader-content",
      { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" },
      "+=0.1"
    );
    tl.to(
      overlay.current,
      {
        yPercent: -100,
        duration: 0.8,
        ease: "power3.inOut",
        onComplete: finish,
      },
      "-=0.1"
    );

    // 安全兜底：无论动画是否推进（如标签页被切到后台），最长 2.6s 后必须揭幕
    const fallback = window.setTimeout(finish, 2600);

    return () => {
      tl.kill();
      window.clearTimeout(fallback);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlay}
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
    >
      <div className="loader-content flex flex-col items-center gap-8">
        <div className="scale-125">
          <Logo showText={false} />
        </div>
        <div className="h-px w-44 overflow-hidden bg-line">
          <div
            ref={bar}
            className="h-full w-full origin-left bg-gradient-to-r from-primary to-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
