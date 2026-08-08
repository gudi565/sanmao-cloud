import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SkillsGrid from "@/components/SkillsGrid";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import MagneticButton from "@/components/MagneticButton";
import { SCENARIOS } from "@/lib/data";

export const metadata: Metadata = { title: "AI 技能" };

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI 技能"
        title={
          <>
            9 个原生中文 AI 技能，<span className="text-gradient">开箱即用</span>
          </>
        }
        desc="每一个都是封装了成熟方法论的 AI 技能——小红书爆款、短视频脚本、公众号长文、代码审查、慢 SQL 急诊……输入需求，直接出成果。"
      />

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <SkillsGrid />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="使用场景"
          title={
            <>
              一个工具箱，<span className="text-gradient">覆盖你的每个需求</span>
            </>
          }
          desc="无论你是学生、职场人、创作者还是小老板，都能找到趁手的 AI 工具。"
        />
        <Reveal stagger={0.1} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((s) => (
            <div data-r key={s.title} className="rounded-3xl border border-line bg-bg2/40 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line text-accent">
                <Icon name={s.icon} size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-dim">{s.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <Reveal>
          <h2 data-r className="font-display text-3xl font-semibold sm:text-4xl">
            工具用得越多，<span className="text-gradient">省下的时间越多</span>
          </h2>
          <p data-r className="mx-auto mt-4 max-w-md text-dim">
            会员可不限次使用全部工具。让你的生产力，再上一个台阶。
          </p>
          <div data-r className="mt-7">
            <MagneticButton
              href="/membership"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg"
            >
              开通会员畅用
              <Icon name="arrow" size={15} />
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
