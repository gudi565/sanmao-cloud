import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CoursesExplorer from "@/components/CoursesExplorer";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = { title: "课程" };

const PATHS = [
  { stage: "01", title: "零基础起步", desc: "认识 AI，写出第一条高质量提示词", icon: "sparkles" },
  { stage: "02", title: "工具上手", desc: "绘画、写作、办公工具实战操作", icon: "bolt" },
  { stage: "03", title: "项目实战", desc: "用 AI 完成真实工作任务与作品", icon: "target" },
  { stage: "04", title: "职业进阶", desc: "副业变现、求职、智能体搭建", icon: "rocket" },
];

const INSTRUCTORS = ["林深", "苏野", "白栀", "周牧", "夏萤", "陈舟"];

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="课程"
        title={
          <>
            系统学 AI，<span className="text-gradient">从入门到职业</span>
          </>
        }
        desc="80+ 门实战课程，按学习路径循序渐进。零基础也能跟着学会，学完直接用得上。"
      />

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <CoursesExplorer />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="学习路径"
          title={
            <>
              四步走，<span className="text-gradient">稳步进阶</span>
            </>
          }
          desc="不知道从哪开始？跟着路径走，每一步都有对应的课程。"
        />
        <Reveal stagger={0.1} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PATHS.map((p) => (
            <div data-r key={p.stage} className="rounded-3xl border border-line bg-bg2/40 p-7">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line text-accent">
                  <Icon name={p.icon} size={20} />
                </span>
                <span className="font-display text-2xl font-semibold text-white/10">
                  {p.stage}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-dim">{p.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="讲师"
          title={
            <>
              懂 AI，<span className="text-gradient">更懂怎么教会你</span>
            </>
          }
          desc="一线实战派讲师，把真本事拆解成你能立刻上手的步骤。"
        />
        <Reveal stagger={0.08} className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {INSTRUCTORS.map((n) => (
            <div data-r key={n} className="rounded-3xl border border-line bg-bg2/40 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xl font-semibold text-bg">
                {n.slice(0, 1)}
              </div>
              <div className="mt-3 text-sm font-medium text-ink">{n}</div>
              <div className="text-xs text-dim">资深讲师</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-semibold sm:text-4xl">
            还在等什么？<span className="text-gradient">先免费试听</span>
          </h2>
          <p data-r className="mx-auto mt-4 max-w-md text-dim">
            第一节免费，不满意随时停。让 AI 成为你的下一个技能。
          </p>
          <div data-r className="mt-7">
            <MagneticButton
              href="/membership"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg"
            >
              查看会员畅学
              <Icon name="arrow" size={15} />
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
