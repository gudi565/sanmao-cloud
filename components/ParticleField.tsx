"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  /** 主色，rgb 三元组字符串 */
  color?: string;
  /** 少数粒子的点缀色 */
  color2?: string;
  /** 鼠标连线色（默认香槟金） */
  linkRgb?: string;
  /** 粒子密度系数 */
  density?: number;
};

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bx: number; // 家位置（基础）
  by: number;
  r: number; // 核心点半径
  g: number; // 光晕直径
  phase: number;
  tw: number; // 闪烁速度
  big: boolean;
  z: number; // 深度 0..1
  tint: boolean;
};

/**
 * 鼠标引力粒子网络背景（弹簧回家模型，丝滑且无空洞）。
 * - 每颗粒子有「家」：弹簧把它拉回，家自身缓慢呼吸漂移 → 场始终饱满、有生命。
 * - 光标只是临时拨开粒子，离开后弹回原位、自动愈合，不留空洞。
 * - 鼠标交互点用 lerp 缓动跟随 → 柔和无抖动；排斥加在速度上 + 摩擦 + 限速。
 * - 分远近层（z）：近的更大更亮、视差更敏感，构成纵深。
 * - 自带柔光（预渲染贴图）与呼吸闪烁；约 18% 粒子用点缀色。
 */
export default function ParticleField({
  className,
  color = "91,240,176",
  color2 = "150,255,215",
  linkRgb = "201,168,106",
  density = 1,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const makeSprite = (rgb: string) => {
      const SS = 64;
      const c = document.createElement("canvas");
      c.width = c.height = SS;
      const cx = c.getContext("2d");
      if (cx) {
        const grad = cx.createRadialGradient(
          SS / 2,
          SS / 2,
          0,
          SS / 2,
          SS / 2,
          SS / 2
        );
        grad.addColorStop(0, `rgba(${rgb},1)`);
        grad.addColorStop(0.25, `rgba(${rgb},0.55)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        cx.fillStyle = grad;
        cx.fillRect(0, 0, SS, SS);
      }
      return c;
    };
    const sprite = makeSprite(color);
    const sprite2 = makeSprite(color2);

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let parts: P[] = [];
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    const mouse = { x: -9999, y: -9999, sx: 0, sy: 0, has: false };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.floor(((w * h) / 9000) * density));
      parts = Array.from({ length: count }, () => {
        const big = Math.random() < 0.1;
        const z = Math.random();
        const scale = 0.55 + z * 0.9;
        const bx = Math.random() * w;
        const by = Math.random() * h;
        return {
          x: bx,
          y: by,
          vx: 0,
          vy: 0,
          bx,
          by,
          r: (big ? Math.random() * 1.6 + 1.1 : Math.random() * 1.2 + 0.5) * scale,
          g: (big ? Math.random() * 12 + 14 : Math.random() * 5 + 4) * scale,
          phase: Math.random() * Math.PI * 2,
          tw: 0.4 + Math.random() * 1.2,
          big,
          z,
          tint: Math.random() < 0.18,
        };
      });
      px = new Float32Array(count);
      py = new Float32Array(count);
      mouse.sx = w / 2;
      mouse.sy = h / 2;
    };

    const LINK = 110;
    const REPEL = 150;
    const MAXSPEED = 3;

    // 性能优化:滚动时暂停粒子渲染(减少主线程压力)
    let scrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      scrolling = true;
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { scrolling = false; }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const frame = () => {
      t += 0.016;
      if (scrolling) {
        // 滚动中:只清画布不更新,避免和 Lenis/GSAP 抢帧
        ctx.clearRect(0, 0, w, h);
        raf = requestAnimationFrame(frame);
        return;
      }
      ctx.clearRect(0, 0, w, h);

      if (mouse.has) {
        mouse.sx = lerp(mouse.sx, mouse.x, 0.18);
        mouse.sy = lerp(mouse.sy, mouse.y, 0.18);
      }
      const cxC = w / 2;
      const cyC = h / 2;
      const mx = mouse.has ? mouse.sx : cxC;
      const my = mouse.has ? mouse.sy : cyC;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // 家：基础位 + 缓慢呼吸漂移
        const hx = p.bx + Math.sin(t * 0.18 + p.phase) * 14;
        const hy = p.by + Math.cos(t * 0.15 + p.phase * 1.3) * 14;

        // 弹簧回家（场始终愈合、不留空洞）
        p.vx += (hx - p.x) * 0.014;
        p.vy += (hy - p.y) * 0.014;

        // 光标拨开（速度型，柔和）
        if (fine && mouse.has) {
          const dx = p.x - mouse.sx;
          const dy = p.y - mouse.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < REPEL * REPEL) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / REPEL) * 0.6;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // 摩擦 + 微扰动 + 限速
        p.vx *= 0.9;
        p.vy *= 0.9;
        p.vx += (Math.random() - 0.5) * 0.012;
        p.vy += (Math.random() - 0.5) * 0.012;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > MAXSPEED) {
          p.vx = (p.vx / sp) * MAXSPEED;
          p.vy = (p.vy / sp) * MAXSPEED;
        }
        p.x += p.vx;
        p.y += p.vy;

        // 深度视差
        const par = 0.05 * (0.5 - p.z);
        px[i] = p.x + (mx - cxC) * par;
        py[i] = p.y + (my - cyC) * par;
      }

      // 星座连线（翡翠）
      ctx.lineWidth = 0.6;
      for (let i = 0; i < parts.length; i++) {
        const ax = px[i];
        const ay = py[i];
        for (let j = i + 1; j < parts.length; j++) {
          const dx = ax - px[j];
          const dy = ay - py[j];
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const o = (1 - Math.sqrt(d2) / LINK) * 0.22;
            ctx.strokeStyle = `rgba(${color},${o})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(px[j], py[j]);
            ctx.stroke();
          }
        }
      }

      // 鼠标 → 近邻连线（香槟金）
      if (fine && mouse.has) {
        const R = REPEL * 1.4;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < parts.length; i++) {
          const dx = px[i] - mouse.sx;
          const dy = py[i] - mouse.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const o = (1 - Math.sqrt(d2) / R) * 0.45;
            ctx.strokeStyle = `rgba(${linkRgb},${o})`;
            ctx.beginPath();
            ctx.moveTo(mouse.sx, mouse.sy);
            ctx.lineTo(px[i], py[i]);
            ctx.stroke();
          }
        }
      }

      // 粒子：柔光 + 核心
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const tw = 0.6 + 0.4 * Math.sin(t * p.tw + p.phase);
        const gs = p.g * (0.8 + 0.2 * tw);
        const x = px[i];
        const y = py[i];
        const depthA = 0.5 + p.z * 0.5;
        const rgb = p.tint ? color2 : color;
        ctx.globalAlpha = ((p.big ? 0.5 : 0.32) * tw) * depthA;
        ctx.drawImage(p.tint ? sprite2 : sprite, x - gs / 2, y - gs / 2, gs, gs);
        ctx.globalAlpha = tw * depthA;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.95)`;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.has = true;
    };
    const onLeave = () => {
      mouse.has = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onResize = () => build();

    build();
    if (reduce) {
      frame();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", onResize);
    if (fine) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [color, color2, linkRgb, density]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
