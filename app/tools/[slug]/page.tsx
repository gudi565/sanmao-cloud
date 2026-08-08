import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SKILLS, getSkill } from "@/lib/skills";
import PageHeader from "@/components/PageHeader";
import SkillRunner from "@/components/SkillRunner";

export function generateStaticParams() {
  return SKILLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkill(slug);
  return { title: skill?.name ?? "技能" };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`${skill.category} · AI 技能`}
        title={skill.name}
        desc={skill.tagline}
      />

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-8 flex items-center justify-between">
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
            付费 · ¥{skill.price}
          </span>
          <a href="/tools" className="text-sm text-dim transition-colors hover:text-accent">
            ← 返回技能列表
          </a>
        </div>

        <SkillRunner skill={skill} />
      </section>
    </>
  );
}
