import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { promises as fs } from "fs";
import path from "path";
import { SKILLS } from "@/lib/skills";

export const runtime = "nodejs";
export const maxDuration = 60;

// 智谱 GLM(OpenAI 兼容接口)
const zhipu = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
  apiKey: process.env.ZHIPU_API_KEY || "",
});

async function loadSkillPrompt(slug: string): Promise<string> {
  try {
    const md = await fs.readFile(
      path.join(process.cwd(), "skills", slug, "SKILL.md"),
      "utf8"
    );
    return md.replace(/^---[\s\S]*?---\s*/, "").trim(); // 去掉 YAML frontmatter
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
      { error: "AI 尚未配置(缺少 ZHIPU_API_KEY),站长还没填 key" },
      { status: 503 }
    );

  const prompt = await loadSkillPrompt(slug);
  const system = `你是「${skill.name}」,一个封装了成熟方法论的 AI 技能。严格按下面这份《技能说明》行事,直接产出用户需要的结果(中文)。不要复述说明本身,直接给成果。

===== 技能说明 =====
${prompt}`;

  const result = streamText({
    model: zhipu("glm-4-plus"),
    system,
    messages: [{ role: "user", content: input }],
  });
  return result.toTextStreamResponse();
}
