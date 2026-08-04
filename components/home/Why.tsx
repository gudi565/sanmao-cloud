import GlowCard from "../GlowCard";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

const FEATURES = [
  { icon: "graduation", title: "学得会", desc: "零基础友好的系统课程，按学习路径循序渐进，听得懂也跟得上。" },
  { icon: "bolt", title: "用得上", desc: "每个工具都来自真实场景，学完立刻能落在自己的工作与生活里。" },
  { icon: "users", title: "有人陪", desc: "专属社群 + 导师答疑，遇到卡点随时有人帮你打通，不让你放弃。" },
  { icon: "sparkles", title: "持续新", desc: "AI 月月迭代，我们的课程与工具也跟着一起更新，永远不过时。" },
];

export default function Why() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-28">
      <SectionHeading
        eyebrow="为什么是三猫云"
        title={
          <>
            不只是教你 AI，<span className="text-gradient">更是陪你用起来</span>
          </>
        }
        desc="我们相信 AI 应该属于每个人，所以把门槛、内容、陪伴都做到了极致。"
      />

      <Reveal stagger={0.1} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div data-r key={f.title}>
            <GlowCard className="h-full p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-accent">
                <Icon name={f.icon} size={22} />
              </span>
              <h3 className="mt-6 font-display text-lg font-semibold text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{f.desc}</p>
            </GlowCard>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
