#!/usr/bin/env python3
"""
research_packet.py — Cold Outreach Engine 的 prospect 研究打包器

把散落的 prospect 原始材料(LinkedIn 文本、帖子、公司页、新闻)整理成
SKILL.md 工作流第 1 步要的 research packet,并做启发式信号预检:
告诉你"研究够了没"。不够就列出还要回答的问题。

零依赖(纯 Python 标准库)。这是免费 skill 库不会给你的东西——
它们只给 prompt,这里给一条真实的研究流水线。

用法:
  python3 research_packet.py "Jane Doe" "CTO @ Acme" post.txt about.txt
  echo "粘贴的 LinkedIn 文本" | python3 research_packet.py "Jane Doe" "CTO @ Acme" -
  python3 research_packet.py "Jane Doe" "CTO @ Acme" --guidance

退出码:
  0 = 研究充分(≥3 候选信号 + ≥1 Tier-3)
  1 = 研究不足(先回答输出里的缺口问题,再来)
"""
import sys
import re
import argparse
from pathlib import Path

# --- 启发式信号检测规则 ---

# 第一人称陈述 = prospect 自己说的(Tier-3 强信号的基础)
FIRST_PERSON = re.compile(r"\b(?:i|i'm|i've|we|we're|we've|our|my|mine|us)\b", re.I)
# 引号包裹的原话(英文/中文引号)
QUOTES = re.compile(r'"[^"]{8,}"|"[^"]{8,}"|「[^」]{8,}」')
# 数字/指标
METRICS = re.compile(
    r"\b\d+\s?[%‰]|\$\s?\d[\d,]*(?:\.\d+)?[KMB]?|\b\d+\s?x\b|\b\d+\s?(?:day|week|month|year|hour|minute)s?\b",
    re.I,
)
# 触发事件
TRIGGERS = re.compile(
    r"\b(?:raised|raising|funding|funded|series\s?[abc]|launched|launching|hired|hiring|joined|acquired|acquisition|partnership|seed|round|ipo|expanded|opening)\b",
    re.I,
)
# 痛点词
PAIN = re.compile(
    r"\b(?:problem|struggle|struggling|killing|kills|broken|breaks|leak|leaking|drop-?off|churn|bottleneck|friction|manual|spending\s?too\s?much|hard\s?to|can't|cannot|fail|fails|frustrat)\b",
    re.I,
)

GUIDANCE_QUESTIONS = [
    "What's one thing {name} publicly said or did in the last 90 days?",
    "What's a problem {name} has signaled they have?",
    "What did {name} just launch, raise, or hire for?",
    "Who else on their team would care about your outcome?",
    "What's the cost to them of not solving the problem?",
]


def classify_sentence(s):
    """给单句打分,返回 (tier, markers) 或 None。tier: 3=stated/quoted, 2=event/metric。"""
    has_first = bool(FIRST_PERSON.search(s))
    has_quote = bool(QUOTES.search(s))
    has_pain = bool(PAIN.search(s))
    has_metric = bool(METRICS.search(s))
    has_trigger = bool(TRIGGERS.search(s))

    markers = []
    if has_quote:
        markers.append("quoted")
    if has_first:
        markers.append("first-person")
    if has_pain:
        markers.append("pain")
    if has_metric:
        markers.append("metric")
    if has_trigger:
        markers.append("trigger")

    # Tier-3:原话或第一人称 + (痛点或指标)——这是 prospect 自述的事实
    if (has_quote or has_first) and (has_pain or has_metric):
        return 3, markers
    # Tier-2:触发事件或裸指标/裸痛点
    if has_trigger or has_metric or has_pain or has_first:
        return 2, markers
    # Tier-1 噪声,丢弃
    return None


def classify(text):
    """返回候选信号列表 [(tier, sentence, markers), ...]。"""
    candidates = []
    sentences = re.split(r"(?<=[.!?。!?])\s+|\n+", text)
    for s in sentences:
        s = s.strip()
        if len(s) < 15:
            continue
        result = classify_sentence(s)
        if result:
            tier, markers = result
            candidates.append((tier, s, markers))
    return candidates


def main():
    ap = argparse.ArgumentParser(
        description="Pack + pre-screen prospect research for Cold Outreach Engine."
    )
    ap.add_argument("name", nargs="?", default=None, help="Prospect name")
    ap.add_argument("role", nargs="?", default=None, help="Prospect role/company, e.g. 'CTO @ Acme'")
    ap.add_argument("files", nargs="*", help="Material files (use '-' for stdin)")
    ap.add_argument(
        "--guidance",
        action="store_true",
        help="Just print the research guidance questions and exit",
    )
    ap.add_argument(
        "-o",
        "--output",
        default="prospect_packet.md",
        help="Output packet file (default: prospect_packet.md)",
    )
    args = ap.parse_args()

    if args.guidance:
        name = args.name or "(prospect name)"
        role = args.role or "(role / company)"
        print(f"\nResearch guidance for {name} ({role}):\n")
        for i, q in enumerate(GUIDANCE_QUESTIONS, 1):
            print(f"  {i}. {q.format(name=name)}")
        print(
            "\nTier-3 = things they said/did/owned (quote them). "
            "Answer any 2, save to a file, then re-run without --guidance.\n"
        )
        return 0

    # 非 --guidance 模式下 name + role 必填(只有 --guidance 才允许省略)
    if not args.name or not args.role:
        print(
            "error: name and role are required unless using --guidance.\n"
            "  e.g. python3 research_packet.py \"Jane Doe\" \"CTO @ Acme\" material.txt\n"
            "       python3 research_packet.py --guidance",
            file=sys.stderr,
        )
        return 2

    # 读材料
    if not args.files:
        print(
            "No material files given. Use --guidance for the research questions, "
            "or pass files / '-' for stdin.",
            file=sys.stderr,
        )
        return 1

    chunks = []
    for f in args.files:
        if f == "-":
            chunks.append(("stdin", sys.stdin.read()))
        else:
            p = Path(f)
            if not p.exists():
                print(f"warn: {f} not found, skipped", file=sys.stderr)
                continue
            chunks.append((p.name, p.read_text(encoding="utf-8", errors="replace")))

    if not chunks:
        print("No readable material. Aborting.", file=sys.stderr)
        return 1

    all_candidates = []
    per_source = []
    for src, text in chunks:
        cands = classify(text)
        per_source.append((src, len(text), cands))
        all_candidates.extend(cands)

    tier3 = [c for c in all_candidates if c[0] == 3]
    tier2 = [c for c in all_candidates if c[0] == 2]
    sufficient = len(all_candidates) >= 3 and len(tier3) >= 1

    # 输出 packet
    lines = []
    lines.append("# Prospect Research Packet")
    lines.append(f"**{args.name}** — {args.role}\n")
    lines.append("_Generated by research_packet.py_\n")
    lines.append("## Source materials")
    for src, n, cands in per_source:
        lines.append(f"- `{src}` — {n} chars, {len(cands)} candidate signals")
    lines.append("")
    lines.append("## Screening result")
    lines.append(f"- Candidate signals: **{len(all_candidates)}** (need >= 3)")
    lines.append(f"- Tier-3 signals (said/did/owned): **{len(tier3)}** (need >= 1)")
    status = (
        "✅ SUFFICIENT — ready to hand to Cold Outreach Engine"
        if sufficient
        else "❌ INSUFFICIENT — research more first (see gap below)"
    )
    lines.append(f"- Status: {status}\n")

    if tier3:
        lines.append("## Tier-3 signals — use these, quote them")
        for _, s, m in tier3:
            lines.append(f"- _[{', '.join(m)}]_ {s}")
        lines.append("")
    if tier2:
        lines.append("## Tier-2 signals — combine with a Tier-3")
        for _, s, m in tier2[:10]:
            lines.append(f"- _[{', '.join(m)}]_ {s}")
        lines.append("")

    if not sufficient:
        lines.append("## Research gap — answer these, save to a file, re-run")
        for i, q in enumerate(GUIDANCE_QUESTIONS, 1):
            lines.append(f"{i}. {q.format(name=args.name)}")
        lines.append("")

    out = "\n".join(lines)
    Path(args.output).write_text(out, encoding="utf-8")
    print(out)
    print(f"\n(written to {args.output})", file=sys.stderr)
    return 0 if sufficient else 1


if __name__ == "__main__":
    sys.exit(main())
