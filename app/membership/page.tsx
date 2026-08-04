import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PricingSection from "@/components/PricingSection";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import Icon from "@/components/Icon";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = { title: "会员" };

const PERKS = [
  { icon: "users", title: "专属社群", desc: "和数万同学一起，导师驻群答疑" },
  { icon: "video", title: "直播答疑", desc: "每月直播，现场解决你的问题" },
  { icon: "bolt", title: "工具畅用", desc: "全部 AI 工具不限次使用" },
  { icon: "graduation", title: "畅学全站", desc: "80+ 课程现在与未来都免费" },
];

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="会员"
        title={
          <>
            一份会员，<span className="text-gradient">解锁全部能力</span>
          </>
        }
        desc="课程畅学 + 工具畅用 + 社群陪伴。选一个适合你的档位，今天就开始。"
      />

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <PricingSection />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal stagger={0.1} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div data-r key={p.title} className="rounded-3xl border border-line bg-bg2/40 p-7 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line text-accent">
                <Icon name={p.icon} size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-dim">{p.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading
          eyebrow="常见问题"
          title={
            <>
              还有疑问？<span className="text-gradient">看这里</span>
            </>
          }
        />
        <div className="mt-12">
          <Faq />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-semibold sm:text-4xl">
            7 天无理由退款，<span className="text-gradient">先试再决定</span>
          </h2>
          <div data-r className="mt-7">
            <MagneticButton
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg"
            >
              立即开通
              <Icon name="arrow" size={15} />
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
