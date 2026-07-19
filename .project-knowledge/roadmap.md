# Roadmap

> Part of odysseus/.project-knowledge/ | Last updated: 2026-07-19
> Forward-looking only. Check this before starting any task — know what's in flight.

## Current Goal

`dev` is now in sync with upstream (merged 2026-07-19, see [[sessions]] and [[history]]). No standing merge work — next up is picking from the backlog below, or whatever the user directs.

---

## Known Bugs / Issues

(Detected from ROADMAP.md and code analysis, 2026-06-08)
- [ ] Fresh install smoke tests across Linux, macOS, Windows, Docker, WSL
- [ ] Integration audit — which integrations actually work vs. need setup docs
- [ ] Cookbook reliability across different machines, GPUs, shells
- [ ] Agent prompt/context bloat for smaller local models
- [ ] Skill/tool prompt-injection audit needed
- [ ] Email performance: IMAP folder select/fetch, cache invalidation bottlenecks
- [ ] CSS cleanup (single monolithic style.css)
- [ ] Tour/tutorial scaffolding needs shared helper
- [ ] Accessibility pass: keyboard nav, focus, contrast, reduced motion
- [ ] Better degraded-state reporting for ChromaDB, SearXNG, email, ntfy
- [ ] Dead code pass for old routes, stale feature flags, unused UI states
- [ ] Provider setup/probing audit for all LLM providers
- [ ] Offline/CDN vendor asset bundling

**Search & Deep Research improvements** *(planned 2026-06-09, partially fixed 2026-06-12)*
- [ ] **Surface the actually-used search provider in the UI** — a key-requiring provider (e.g. Exa) with no API key returns `[]` *silently* (not an error), so `_build_provider_chain` falls through to the fallback (default DuckDuckGo) on every query. Today the only signal is logs + the report's stats `Search:` field. Add a visible cue (warn/badge when the selected provider can't run; show which provider actually carried the run). Refs: `services/search/core.py:91-116`, `services/search/providers.py`, `src/deep_research.py:575-582,920`.
- [ ] **Expose / raise the deep-research length cap** — `research_max_tokens` (default 16384) caps report length and forces the synthesis step to compress; conflicts with "zero compression / fully developed" requests. Surface in the research UI with a note on the depth trade-off. Refs: `src/settings.py:90`, `src/deep_research.py:746`.
- [ ] **Chat auto web-search uses the whole message as one query** — `comprehensive_web_search(message, ...)` passes the raw user message verbatim as the query, so long/structured prompts search badly. Derive a focused (LLM-condensed) query, or skip auto-search for long messages and rely on the agent `web_search` tool (model-written queries). Refs: `src/chat_processor.py:277-285`.
- [ ] **Add server-side "Export to PDF"** for research reports / documents / chat answers — today PDF export is browser-print only (`window.print()`), and `/api/document/{id}/export-pdf` is form-fill only (requires a linked source PDF). No server-side markdown/HTML→PDF engine exists. Add a real report→PDF download. Refs: `src/visual_report.py:897`, `routes/document_routes.py:1384-1423`.
- [ ] **In-product guidance: chat vs deep research** — users conflate the two. Deep research = web-grounded summarizer pipeline (own template + token cap); chat/agent + `web_search` tool = model-led (like Perplexity/Opus). Add a tooltip/hint clarifying when to use each.

**RSS Feed Reader** *(added 2026-06-11)*
- [ ] **TTS button relies on `window.aiTTSManager`** — hidden if absent; needs existing TTS module reference wired in
- [ ] **Per-feed fetch interval** — `fetch_interval` column exists but not exposed in UI or scheduler
- [ ] **Auto-refresh** — need to wire into existing `task_scheduler` for background polling
- [ ] **Keyboard shortcuts** — j/k navigate articles, m read/unread, s star
- [ ] **Infinite scroll** — article list is paginated (offset/limit) but no scroll trigger for next page
- [ ] **MCP server** — expose feed read/search/subscribe to the AI agent via MCP
- [ ] **Dedup UI** — `feedparser` returns empty content/summary for YouTube entries, resulting in empty snippets
- [ ] **CSP scoped to HTTPS-images** — `img-src ... https:` allows all HTTPS origins, which is broad. Could scope to known CDNs (`i*.ytimg.com`, `*.ytimg.com`) for stricter policy
- [ ] **YouTube embed video Error 153 persists** — in-page overlay embed (`www.youtube.com/embed/VIDEO_ID?autoplay=1`) gives YouTube's internal "Video player configuration error" for at least some videos (Diego Woods channel, possibly shorts). Workaround: "Watch on YouTube" link below the embed opens video directly on YouTube (counts views, new tab). Root cause is YouTube-side (embedding disabled per-video or per-channel), not CSP or origin.

---

**Post-merge structural changes to be aware of** *(discovered 2026-07-19, see [[history]])*
- [ ] **Two parallel search modules exist** — `services/search/` (our 10-provider registry, actively used by deep research and chat) and a new upstream `src/search/` package (`core.py`, `providers.py`, `query.py`, `ranking.py`, `cache.py`, `analytics.py`) appeared in the merge. Not yet confirmed whether `src/search/` is wired up anywhere or dead/in-progress upstream code. Needs a quick `grep -r "from src.search\|import src.search"` audit before touching search code.

---

## Active TODOs

- [ ] Verify whether `src/search/` (new in the 2026-07-19 merge) is actually used anywhere, or if it's upstream work-in-progress that duplicates `services/search/`. *(added 2026-07-19)*
