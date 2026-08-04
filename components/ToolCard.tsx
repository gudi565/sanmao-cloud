import Link from "next/link";
import { type Tool } from "@/lib/data";
import GlowCard from "./GlowCard";
import Icon from "./Icon";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href="/tools" className="block h-full">
      <GlowCard className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-bg"
            style={{ background: `linear-gradient(135deg, ${tool.from}, ${tool.to})` }}
          >
            <Icon name={tool.icon} size={22} />
          </span>
          {tool.hot && (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
              热门
            </span>
          )}
        </div>
        <h3 className="mt-5 font-display text-lg font-semibold text-ink">
          {tool.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-dim">
          {tool.desc}
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm text-accent">
          立即体验
          <Icon name="arrow" size={14} />
        </span>
      </GlowCard>
    </Link>
  );
}
