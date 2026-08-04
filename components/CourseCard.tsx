import Link from "next/link";
import { type Course } from "@/lib/data";
import Icon from "./Icon";
import { cn } from "@/lib/utils";

type Props = { course: Course; className?: string };

export default function CourseCard({ course, className }: Props) {
  return (
    <Link
      href="/courses"
      data-cursor="hover"
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line bg-bg2/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      <div
        className="relative h-40 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${course.from}, ${course.to})` }}
      >
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg2/90 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-bg/40 px-3 py-1 text-xs text-white backdrop-blur">
          {course.category}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-bg/40 px-3 py-1 text-xs text-white backdrop-blur">
          {course.level}
        </span>
        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-xs text-white/90">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <Icon name="graduation" size={13} />
          </span>
          讲师 · {course.instructor}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-ink">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dim">
          {course.desc}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-dim">
          <Icon name="play" size={13} />
          <span>{course.lessons} 节</span>
          <span className="opacity-40">·</span>
          <Icon name="clock" size={13} />
          <span>{course.hours} 小时</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span
            className={cn(
              "font-display text-base font-semibold",
              course.price === 0 ? "text-accent" : "text-gold"
            )}
          >
            {course.price === 0 ? "免费试听" : `¥${course.price}`}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-ink transition-transform duration-300 group-hover:translate-x-1">
            查看
            <Icon name="arrow" size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
