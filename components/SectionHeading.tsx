import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import RevealWords from "./RevealWords";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  desc,
  align = "center",
  className,
}: Props) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span
          data-r
          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs tracking-wide text-accent"
        >
          <span className="h-1 w-1 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      {typeof title === "string" ? (
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.9rem]">
          <RevealWords text={title} />
        </h2>
      ) : (
        <h2
          data-r
          className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-[2.9rem]"
        >
          {title}
        </h2>
      )}
      {desc && (
        <p data-r className="mt-4 text-base leading-relaxed text-dim">
          {desc}
        </p>
      )}
    </Reveal>
  );
}
