import { promises as fs } from "fs";
import path from "path";
import { SKILLS } from "@/lib/skills";

export const runtime = "nodejs";
export const maxDuration = 60;

const ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const MODEL = "glm-4-plus";

async function loadSkillPrompt(slug: string): Promise<string> {
  try {
    const md = await fs.readFile(
      path.join(process.cwd(), "skills", slug, "SKILL.md"),
      "utf8"
    );
    return md.replace(/^---[\s\S]*?---\s*/, "").trim();
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  let slug = "";
  let input = "";
  try {
    const body = await req.json();
    slug = body.slug;
    input = body.input;
  } catch {
    /* ignore */
  }

  const skill = SKILLS.find((s) => s.slug === slug);
  if (!skill) return Response.json({ error: "未知技能" }, { status: 404 });
  if (!input || !input.trim())
    return Response.json({ error: "请填写输入内容" }, { status: 400 });
  if (!process.env.ZHIPU_API_KEY)
    return Response.json(
      { error: "AI 尚未配置(缺少 ZHIPU_API_KEY)" },
      { status: 503 }
    );

  const prompt = await loadSkillPrompt(slug);
  const system = `你是「${skill.name}」,一个封装了成熟方法论的 AI 技能。严格按下面这份《技能说明》行事,直接产出用户需要的结果(中文)。不要复述说明本身,直接给成果。

===== 技能说明 =====
${prompt}`;

  // 直接调智谱(绕开 AI SDK 的流式兼容问题),流式 SSE → 纯文本流
  const upstream = await fetch(ZHIPU_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return Response.json(
      { error: `智谱 API 错误(${upstream.status}):${errText.slice(0, 200)}` },
      { status: 502 }
    );
  }

  // 解析智谱 SSE,提取 content delta,转成纯文本流给前端
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              /* skip malformed */
            }
          }
        }
      } catch {
        /* connection ended */
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
