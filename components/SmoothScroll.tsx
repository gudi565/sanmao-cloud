"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * 全站丝滑滚动：Lenis 与 GSAP ScrollTrigger 同步。
 * 触屏 / 减少动效场景自动跳过，回退到原生滚动。
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // 在路由/字体加载后刷新触发点
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 600);

    // 标签页从后台切回时，重新计算触发点（后台时 RAF 暂停会导致动画冻结）
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      gsap.ticker.remove(ticker);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
      lenis.destroy();
    };
  }, []);

  return null;
}
