"use client";

import { useState } from "react";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/data";
import ToolCard from "./ToolCard";
import { cn } from "@/lib/utils";

/** 工具分类筛选 + 网格。 */
export default function ToolsExplorer() {
  const [cat, setCat] = useState("全部");
  const list = TOOLS.filter((t) => cat === "全部" || t.category === cat);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TOOL_CATEGORIES.map((c) => (
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
        {list.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="mt-10 text-center text-dim">该分类下暂无工具。</p>
      )}
    </div>
  );
}
