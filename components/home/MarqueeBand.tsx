import Marquee from "../Marquee";

const ROW_A = [
  "提示词工程",
  "AI 绘画",
  "智能写作",
  "效率办公",
  "数据分析",
  "智能体搭建",
];

const ROW_B = [
  "副业变现",
  "求职进阶",
  "AI 短视频",
  "知识管理",
  "自动化工作流",
  "数字分身",
];

/** 双行反向关键词跑马灯：随竖向滚动反向漂移（滚动驱动），首页节奏过场。 */
export default function MarqueeBand() {
  return (
    <section className="relative border-y border-line py-7">
      <Marquee
        items={ROW_A}
        scrollDriven
        itemClassName="font-display text-2xl font-semibold text-ink sm:text-[2rem]"
      />
      <div className="h-4" />
      <Marquee
        items={ROW_B}
        reverse
        scrollDriven
        itemClassName="font-display text-2xl font-light text-dim sm:text-[2rem]"
      />
    </section>
  );
}
