import { type ElementType } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** 回声层数 */
  layers?: number;
  /** 每层偏移（px） */
  dx?: number;
  dy?: number;
  /** 回声颜色 rgba 三段；默认品牌薄荷绿 */
  echoRgb?: string;
  /** 主文字软发光 */
  glow?: boolean;
};

/**
 * 回声叠错文字（zlashy 式招牌排版）：主文字身后叠 N 层同字、
 * 逐层偏移与降透明度的绿色回声，营造拖影/回响的纵深感。
 */
export default function EchoText({
  text,
  as: Tag = "span",
  className,
  layers = 2,
  dx = 5,
  dy = 4,
  echoRgb = "91,240,176",
  glow = false,
}: Props) {
  return (
    <Tag className={cn("relative inline-block", className)} data-text={text}>
      {Array.from({ length: layers }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            transform: `translate(${(i + 1) * dx}px, ${(i + 1) * dy}px)`,
            color: `rgba(${echoRgb}, ${0.32 - i * 0.1})`,
          }}
        >
          {text}
        </span>
      ))}
      <span className={cn("relative", glow && "[text-shadow:0_0_30px_rgba(91,240,176,0.5)]")}>
        {text}
      </span>
    </Tag>
  );
}
