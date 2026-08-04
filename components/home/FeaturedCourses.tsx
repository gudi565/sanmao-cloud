"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { COURSES } from "@/lib/data";
import CourseCard from "../CourseCard";
import Icon from "../Icon";

/** 精选课程：桌面端固定钉住、随滚动横向展开；移动端原生横滑。 */
export default function FeaturedCourses() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const el = track.current;
      const root = section.current;
      if (!el || !root) return;

      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 48);

      const st = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(el, { x: -distance() * self.progress });
        },
      });

      return () => st.kill();
    },
    { scope: section }
  );

  return (
    <section
      ref={section}
      className="relative min-h-[80vh] overflow-hidden py-28 md:h-screen md:py-0"
    >
      <div className="absolute inset-x-0 top-0 z-10 px-6 pt-28 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent">
            <span className="h-1 w-1 rounded-full bg-accent" />
            精选课程
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            边滚边看，<span className="text-gradient">最受欢迎的课</span>
          </h2>
          <p className="mt-3 max-w-xl text-dim">
            从入门到职业，每一门都经过学员验证。继续向下滚动，课程横向展开。
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center overflow-x-auto md:overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={track} className="flex gap-6 px-6">
          {COURSES.slice(0, 6).map((c) => (
            <div key={c.slug} className="w-[290px] shrink-0 sm:w-[330px]">
              <CourseCard course={c} />
            </div>
          ))}
          <Link
            href="/courses"
            className="group flex w-[260px] shrink-0 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-line bg-bg2/30 p-8 text-center transition-colors hover:border-accent/40 sm:w-[300px]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-accent transition-transform duration-500 group-hover:rotate-45">
              <Icon name="arrow" size={22} />
            </span>
            <span className="font-display text-lg font-medium text-ink">
              查看全部 80+ 课程
            </span>
            <span className="text-sm text-dim">找到最适合你的学习路径</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
