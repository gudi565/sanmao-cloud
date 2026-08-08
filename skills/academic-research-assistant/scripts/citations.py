#!/usr/bin/env python3
"""
citations.py — 把你选定的文章元数据格式化成 BibTeX 和 APA 引用。

零依赖(纯标准库)。

用法:
  TSV 文件(每行:title<TAB>author<TAB>year<TAB>source<TAB>URL):
    python3 citations.py sources.tsv
  命令行直接传(字段用 | 分隔):
    python3 citations.py --inline "The Impact of X|Doe, J.|2024|Journal of Y|https://example.com/x"

输出:sources.bib(BibTeX)+ sources-apa.txt(APA 第 7 版近似),并屏幕预览 APA。
"""
import argparse
import re
import sys
from pathlib import Path


def parse_tsv(path):
    rows = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        while len(parts) < 5:
            parts.append("")
        title, authors, year, source, url = [p.strip() for p in parts[:5]]
        rows.append({"title": title, "authors": authors, "year": year, "source": source, "url": url})
    return rows


def parse_inline(s):
    parts = s.split("|")
    while len(parts) < 5:
        parts.append("")
    return {"title": parts[0].strip(), "authors": parts[1].strip(), "year": parts[2].strip(),
            "source": parts[3].strip(), "url": parts[4].strip()}


def citekey(title, authors, year):
    base = authors.split(",")[0].split()[-1] if authors else "anon"
    base = re.sub(r"[^A-Za-z]", "", base).lower() or "anon"
    word = re.sub(r"[^a-z0-9]", "", title.lower())[:8] or "ref"
    return f"{base}{word}{year or 'nd'}"


def to_bib(rows):
    out = []
    for r in rows:
        key = citekey(r["title"], r["authors"], r["year"])
        out.append("@article{" + key + ",")
        out.append("  title  = {" + r["title"] + "},")
        out.append("  author = {" + r["authors"] + "},")
        out.append("  year   = {" + r["year"] + "},")
        out.append("  journal = {" + r["source"] + "},")
        out.append("  url    = {" + r["url"] + "},")
        out.append("}")
    return "\n".join(out) + "\n"


def to_apa(r):
    a = r["authors"] or "Anonymous"
    y = "(" + r["year"] + ")" if r["year"] else "(n.d.)"
    title = r["title"]
    if title and not title.endswith((".", "?", "!")):
        title += "."
    parts = [a + " " + y + ".", title]
    if r["source"]:
        parts.append("*" + r["source"] + "*.")
    if r["url"]:
        parts.append(r["url"])
    return " ".join(p for p in parts if p)


def main():
    ap = argparse.ArgumentParser(
        description="Format curated sources into BibTeX + APA.",
        epilog=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("tsv", nargs="?", help="TSV file: title<TAB>author<TAB>year<TAB>source<TAB>URL")
    ap.add_argument("--inline", nargs="+", metavar="FIELDS", help="one or more 'title|author|year|source|url' strings")
    args = ap.parse_args()

    if args.inline:
        rows = [parse_inline(s) for s in args.inline]
    elif args.tsv:
        rows = parse_tsv(args.tsv)
    else:
        ap.print_help(sys.stderr)
        return 1

    if not rows:
        print("No sources parsed.", file=sys.stderr)
        return 1

    bib = to_bib(rows)
    apa = "\n".join(to_apa(r) for r in rows) + "\n"

    Path("sources.bib").write_text(bib, encoding="utf-8")
    Path("sources-apa.txt").write_text(apa, encoding="utf-8")

    print("OK " + str(len(rows)) + " sources -> sources.bib + sources-apa.txt\n")
    print("--- APA preview ---")
    print(apa)
    return 0


if __name__ == "__main__":
    sys.exit(main())
