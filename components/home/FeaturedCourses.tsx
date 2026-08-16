"use client";

import Link from "next/link";
import { COURSES } from "@/lib/data";
import CourseCard from "../CourseCard";
import Icon from "../Icon";

/**
 * 精选课程:原生横向滑(overflow-x-auto),不再钉住绑定竖向滚动。
 * 之前的 pin+scrub 方案虽然视觉效果好,但会让用户感觉"划不动"。
 */
export default function FeaturedCourses() {
  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent">
          <span className="h-1 w-1 rounded-full bg-accent" />
          精选课程
        </span>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          最受欢迎的课，<span className="text-gradient">左右滑动看看</span>
        </h2>
        <p className="mt-3 max-w-xl text-dim">
          从入门到职业，每一门都经过学员验证。
        </p>
      </div>

      <div className="mt-12 overflow-x-auto pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/50">
        <div className="flex gap-6 px-6 mx-auto max-w-7xl">
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
