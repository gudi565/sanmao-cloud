"use client";

import { useState } from "react";
import { FAQ } from "@/lib/data";
import Icon from "./Icon";
import { cn } from "@/lib/utils";

export default function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="mx-auto max-w-3xl border-y border-line">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-ink">{f.q}</span>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-accent transition-transform duration-300",
                  isOpen && "rotate-45 bg-accent/10"
                )}
              >
                <Icon name="plus" size={14} />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden text-sm leading-relaxed text-dim">
                {f.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
