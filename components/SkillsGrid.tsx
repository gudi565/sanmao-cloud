"use client";

import { useState } from "react";
import Link from "next/link";
import { SKILLS, SKILL_CATEGORIES, type Skill } from "@/lib/skills";
import GlowCard from "./GlowCard";
import Icon from "./Icon";
import { cn } from "@/lib/utils";

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link href={`/tools/${skill.slug}`} className="block h-full">
      <GlowCard className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-bg"
            style={{
              background: `linear-gradient(135deg, ${skill.from}, ${skill.to})`,
            }}
          >
            <Icon name={skill.icon} size={22} />
          </span>
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold">
            ¥{skill.price}
          </span>
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-ink">
          {skill.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-dim">
          {skill.tagline}
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm text-accent">
          使用技能
          <Icon name="arrow" size={14} />
        </span>
      </GlowCard>
    </Link>
  );
}

/** AI 技能网格:按「内容创作 / 开发者工具」筛选,点卡片进对应技能页。 */
export default function SkillsGrid() {
  const [cat, setCat] = useState<string>("全部");
  const list = SKILLS.filter((s) => cat === "全部" || s.category === cat);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SKILL_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              cat === c
                ? "border-accent/50 bg-accent/10 text-accent"
                : "border-line text-dim hover:text-ink"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div key={cat} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <SkillCard key={s.slug} skill={s} />
        ))}
      </div>
    </div>
  );
}
