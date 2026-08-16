import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse } from "@/lib/courses-data";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import MagneticButton from "@/components/MagneticButton";

export function generateStaticParams() {
  return [{ slug: "ai-agent-basics" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return { title: course ? course.title : "课程" };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0
  );

  return (
    <>
      <PageHeader
        eyebrow={`${course.category} · ${course.level}`}
        title={course.title}
        desc={course.desc}
      />

      {/* 课程信息栏 */}
      <section className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-bg2/40 p-5 text-sm text-dim">
            <span className="flex items-center gap-2">
              <Icon name="users" size={16} className="text-accent" />
              讲师:{course.instructor}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="book" size={16} className="text-accent" />
              {course.chapters.length} 章 · {totalLessons} 节
            </span>
            <span className="flex items-center gap-2">
              <Icon name="bolt" size={16} className="text-accent" />
              约 {course.hours} 小时
            </span>
            <span className="ml-auto rounded-full bg-accent/10 px-3 py-1 text-accent">
              {course.price === 0 ? "免费课程" : `¥${course.price}`}
            </span>
          </div>
        </Reveal>
      </section>

      {/* 章节目录 */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        {course.chapters.map((ch, ci) => (
          <Reveal key={ch.title} delay={ci * 0.05} className="mb-8">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              {ch.title}
            </h2>
            <div className="space-y-3">
              {ch.lessons.map((lesson) => (
                <div
                  key={lesson.title}
                  className={
                    "flex items-center justify-between rounded-2xl border p-5 transition-colors " +
                    (lesson.free
                      ? "border-accent/30 bg-accent/5 hover:border-accent/50"
                      : "border-line bg-bg2/30")
                  }
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-xl " +
                        (lesson.free
                          ? "bg-accent/15 text-accent"
                          : "bg-white/5 text-dim")
                      }
                    >
                      <Icon name={lesson.free ? "play" : "lock"} size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs text-dim">
                        {lesson.free ? "免费试听" : "需开通会员"}
                      </p>
                    </div>
                  </div>
                  {lesson.free ? (
                    <Link
                      href={`/courses/${course.slug}/${course.chapters
                        .flatMap((c) => c.lessons)
                        .findIndex((l) => l.title === lesson.title)}`}
                      className="rounded-full bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                    >
                      开始学习
                    </Link>
                  ) : (
                    <Link
                      href="/membership"
                      className="rounded-full border border-line px-4 py-2 text-xs text-dim transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      解锁
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </section>

      {/* 底部 CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-20 text-center">
        <Reveal>
          <MagneticButton
            href="/membership"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-bg shadow-[0_0_40px_-8px_rgba(91,240,176,0.8)]"
          >
            开通会员,解锁全部课程
            <Icon name="arrow" size={16} />
          </MagneticButton>
        </Reveal>
      </section>
    </>
  );
}
