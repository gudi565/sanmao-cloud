# Source Search Strategy

The whole skill collapses if you cite sources that don't exist or that you didn't read. This defines what counts as a real source, how to find them, and how to stop hallucinated citations.

## What counts as a source
A real source is one you **retrieved via WebSearch and can point to a URL**. Three tiers:

| Tier | Example | Use |
|---|---|---|
| A — peer-reviewed | Journal article, arXiv preprint, conference paper | Cite freely |
| B — authoritative | .gov, .edu, established think tank, major outlet | Cite, label the type |
| C — secondary | Blog, trade press, Wikipedia | Use only to *find* A/B; don't cite in the paper |

**Every cited claim must trace to a Tier A or B source you actually retrieved.**

## How to search
- Use **WebSearch** with precise queries tied to the chosen research question — not the vague topic.
- Add source qualifiers: `site:arxiv.org`, `site:scholar.google.com`, `"peer-reviewed"`, year ranges.
- Run **2–4 distinct queries per question** (different angles). One search is never enough.
- For each hit, record: title, author(s) if shown, source domain, URL, year, one-line relevance.

## The anti-hallucination rule (most important)
**You cannot cite anything WebSearch did not return.** The failure mode that ruins students: the AI generates a plausible-looking citation (real-sounding author + real journal + plausible title) that **does not exist**. Detectable. Failing offense.

Defenses:
- After search, your source list = **only** what WebSearch returned. No additions from "general knowledge."
- In the Curate step, **WebFetch the URL** to confirm it exists and to read it. If the fetch fails, or the page isn't what the title claimed → drop it, log it as unverifiable.
- **If WebFetch is blocked** by the environment, equivalent verification IS allowed: fetch the URL via `curl` (direct HTTP), or confirm the paper via an authoritative bibliographic API (Crossref `api.crossref.org/works?query=...`, Semantic Scholar `api.semanticscholar.org/graph/v1/paper/search?query=...`). These count as real retrieval — a page returning HTTP 200 with the title/abstract, or an API returning the DOI/authors/year, is a real source. But if all of these fail, treat the source as unverifiable (drop it); **never** invent its contents.
- **Never backfill.** If the lit review needs a source for a claim and you don't have one, write `[needs source]` — don't invent one.
- **Search snippets paraphrase.** The title / author / journal shown in a WebSearch snippet can be a truncation or paraphrase, not the exact publication metadata. In the Curate step, replace any snippet-reported metadata with the **exact values from WebFetch** before the source enters the citation map. Never cite a title or journal name you only saw in a snippet.

## Source-quality red flags
- No author and no date → probably not citable.
- URL is a content farm or SEO page → drop.
- "Study says…" with no link to the study → find the study or drop the claim.
- Preprint with no author affiliation → use cautiously, label as preprint.

## Volume
6–10 strong sources per question is the sweet spot. Fewer = thin; more = you didn't curate.
