import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Spotlight from "@/components/Spotlight";
import ScrollProgress from "@/components/ScrollProgress";
import Loader from "@/components/Loader";
import { AuthProvider } from "@/components/AuthProvider";
import { BRAND } from "@/lib/site";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sanmao.cloud"),
  title: {
    default: `${BRAND.name} · 让每个人都能用好 AI`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "三猫云是面向个人的 AI 学习与生产力平台，提供系统课程、实用工具与陪伴社群，帮你把 AI 真正变成自己的能力。",
  keywords: ["AI 课程", "AI 学习", "AI 工具", "人工智能", "三猫云"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        <AuthProvider>
          <Loader />
          <SmoothScroll />
          <Cursor />
          <Spotlight />
          <ScrollProgress />
          <Nav />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
