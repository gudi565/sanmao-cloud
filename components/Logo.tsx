import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showText?: boolean;
};

/** 三猫云品牌标识：三点（三猫）聚合成云的抽象图形 + 文字。 */
export default function Logo({ className, showText = true }: Props) {
  return (
    <Link
      href="/"
      aria-label="三猫云 · 首页"
      className={cn("group relative flex items-center gap-2.5", className)}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
        >
          <defs>
            <linearGradient
              id="smc-grad"
              x1="2"
              y1="4"
              x2="34"
              y2="32"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#5BF0B0" />
              <stop offset="1" stopColor="#0E7C5A" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="11" r="6.5" fill="url(#smc-grad)" />
          <circle cx="9.5" cy="23.5" r="6.5" fill="url(#smc-grad)" fillOpacity="0.7" />
          <circle cx="26.5" cy="23.5" r="6.5" fill="url(#smc-grad)" fillOpacity="0.5" />
        </svg>
        <span className="absolute inset-1 -z-0 rounded-full bg-accent/50 opacity-50 blur-lg transition-opacity duration-500 group-hover:opacity-90" />
      </span>
      {showText && (
        <span className="font-display text-[19px] font-semibold tracking-tight text-ink">
          三猫云<span className="text-accent">.</span>
        </span>
      )}
    </Link>
  );
}
