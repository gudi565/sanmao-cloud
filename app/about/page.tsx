import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Timeline from "@/components/Timeline";
import Icon from "@/components/Icon";
import MagneticButton from "@/components/MagneticButton";
import Counter from "@/components/Counter";
import { VALUES, PARTNERS, STATS } from "@/lib/data";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = { title: "关于我们" };

const TEAM = [
  { name: "林深", role: "创始人 · 课程主理" },
  { name: "苏野", role: "联合创始人 · 内容" },
  { name: "白栀", role: "设计学院负责人" },
  { name: "陈舟", role: "技术学院负责人" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="关于三猫云"
        title={
          <>
            让 AI，<span className="text-gradient">属于每一个人</span>
          </>
        }
        desc={`${BRAND.fullName}，一家专注于个人 AI 教育与服务的科技公司。我们相信 AI 不应只是少数人的工具，而应成为每个人能力的一部分。`}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Reveal stagger={0.1} className="grid grid-cols-2 gap-8 rounded-[2rem] border border-line bg-bg2/40 p-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div data-r key={s.label} className="text-center">
              <div className="text-gradient font-display text-4xl font-semibold sm:text-5xl">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-sm text-dim">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="我们的故事"
          title={
            <>
              一路走来，<span className="text-gradient">和用户一起成长</span>
            </>
          }
        />
        <div className="mt-14">
          <Timeline />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="企业文化"
          title={
            <>
              我们相信，<span className="text-gradient">也这样做</span>
            </>
          }
        />
        <Reveal stagger={0.1} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div data-r key={v.title} className="rounded-3xl border border-line bg-bg2/40 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line text-accent">
                <Icon name={v.icon} size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-dim">{v.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="核心团队"
          title={
            <>
              一群<span className="text-gradient">认真做教育</span>的人
            </>
          }
          desc="来自教育、AI 与产品的背景，共同把「学会 AI」这件事做到极致。"
        />
        <Reveal stagger={0.08} className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {TEAM.map((t) => (
            <div data-r key={t.name} className="rounded-3xl border border-line bg-bg2/40 p-7 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xl font-semibold text-bg">
                {t.name.slice(0, 1)}
              </div>
              <div className="mt-4 font-medium text-ink">{t.name}</div>
              <div className="text-xs text-dim">{t.role}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <p data-r className="text-center text-sm text-dim">
            值得信赖的合作伙伴
          </p>
          <div data-r className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
            {PARTNERS.map((p) => (
              <span key={p} className="font-display text-lg text-dim">
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-semibold sm:text-4xl">
            和 120 万人一起，<span className="text-gradient">用好 AI</span>
          </h2>
          <div data-r className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg"
            >
              免费试听
              <Icon name="arrow" size={15} />
            </MagneticButton>
            <MagneticButton
              href="/membership"
              className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-medium text-ink hover:border-accent/40"
            >
              了解会员
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
