"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import MagneticButton from "./MagneticButton";
import AuthModal from "./AuthModal";
import { useAuth } from "@/components/AuthProvider";

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2.5" : "py-4 sm:py-5"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
            scrolled
              ? "glass shadow-[0_10px_40px_-12px_rgba(0,0,0,0.65)]"
              : "border border-transparent"
          )}
        >
          <Logo />

          {/* 桌面导航 */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
                  isActive(l.href) ? "text-accent" : "text-dim hover:text-ink"
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-0 -z-10 rounded-full border border-line bg-accent/10" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
                  {user.name.slice(0, 1)}
                </span>
                <span className="max-w-[8rem] truncate text-sm text-ink">{user.name}</span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-full border border-line px-3 py-2 text-xs text-dim transition-colors hover:border-[#f48a8a]/40 hover:text-[#f48a8a]"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="hidden rounded-full border border-line px-4 py-2.5 text-sm text-ink transition-colors duration-300 hover:border-accent/40 hover:text-accent md:inline-flex"
              >
                登录
              </button>
            )}
            <MagneticButton
              href="/courses"
              className="hidden items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg shadow-[0_0_30px_-6px_rgba(91,240,176,0.7)] transition-colors duration-300 hover:bg-accent/90 sm:inline-flex"
            >
              免费试听
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>

            {/* 移动端汉堡 */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="打开菜单"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink md:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-all duration-300",
                    open && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
                    open ? "top-1.5 -rotate-45" : "top-3"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* 移动端展开面板 */}
      <div
        className={cn(
          "mx-4 overflow-hidden rounded-3xl transition-all duration-500 md:hidden",
          open ? "mt-2 max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="glass-strong flex flex-col gap-1 p-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-2xl px-4 py-3 text-base transition-colors",
                isActive(l.href)
                  ? "bg-accent/10 text-accent"
                  : "text-ink hover:bg-white/5"
              )}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-line px-4 py-3">
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
                  {user.name.slice(0, 1)}
                </span>
                <span className="truncate text-base text-ink">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-line px-3 py-1.5 text-sm text-dim"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setAuthOpen(true);
              }}
              className="rounded-2xl border border-line px-4 py-3 text-center text-base text-ink"
            >
              登录
            </button>
          )}
          <Link
            href="/courses"
            className="rounded-2xl bg-accent px-4 py-3 text-center text-base font-medium text-bg"
          >
            免费试听
          </Link>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
