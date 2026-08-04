import Link from "next/link";
import { BRAND, FOOTER_LINKS } from "@/lib/site";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-32 border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-dim">
              面向个人的 AI 学习与生产力平台。让每一门课、每一个工具，都为你所用。
            </p>
            <p className="mt-6 text-xs text-dim/70">{BRAND.fullName}</p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-medium text-ink">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className="text-sm text-dim transition-colors hover:text-accent"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-dim/70 sm:flex-row">
          <p>
            © {year} {BRAND.name} · {BRAND.beian}
          </p>
          <p className="tracking-wide">让每个人都能用好 AI</p>
        </div>
      </div>
    </footer>
  );
}
