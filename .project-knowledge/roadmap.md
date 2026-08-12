# Roadmap

> Part of odysseus/.project-knowledge/ | Last updated: 2026-08-02
> Forward-looking only. Check this before starting any task — know what's in flight.

## Current Goal

2026-08-11/12: closed out a run of UI-correctness work and **committed + pushed the whole multi-day batch** (see [[sessions]] / [[history]]). Highlights: a real `--on-accent` WCAG-contrast token replacing 51 hardcoded white-on-accent sites (gotham exposed it; navyseal/terminal/cute were silently broken too); the Email settings page being impossible to close (gear wasn't a toggle; Escape closed the whole window — and the first Escape fix was wrong, since `ui.js`'s document-capture handler pre-empts any module-level Escape branch); and two account-chip bugs (unread styling overriding `.active` by declaration order, and a dead click zone where the set-default dot covers the chip's right edge). Everything from 2026-08-09 onward is now verified live in the browser rather than inferred from code.

2026-08-11: fixed a real, systemic contrast bug the gotham theme exposed — 46 CSS rules plus 5 JS-inline-style sites across the app hardcode white text on a `--red`-colored background, which fails badly for any theme with a light accent (gotham's amber, but also navyseal/terminal/cute). Fixed properly: a `--on-accent` token computed from `--red`'s actual WCAG relative luminance (not naive HSL lightness — the two disagree for saturated colors), swapped every hardcoded site to reference it. Verified live for the first time this session (the user logged in) — measured real contrast ratios and element bounding rects via injected JS rather than guessing from screenshots. That live access also surfaced two real Email-panel bugs invisible from code alone: the tags-toggle button overlapping the search placeholder (root cause was a *second*, higher-priority `!important` rule I'd missed on the first pass) and the "Last updated" text clipping (a stray 4px relative offset). Also resolved PR #3's 6 merge-conflict hunks across 4 files (CI green, not yet merged — see below) and wrote `.claude/launch.json` for `preview_start`. Full write-up in [[history]]. ~~**Nothing in this session is committed yet**~~ — superseded: committed and pushed 2026-08-12 (see the current goal above).

**PR #3** (upstream-sync, 8 commits) is open with all CI checks green (including the real pytest suite) after resolving its 6 conflict hunks by hand — not yet merged; merge when ready, same as PR #2's flow.

2026-08-09/10: fixed PR #2's 3 failing CI gates (upstream-sync PR title/description checks weren't actually skipping bot-equivalent PRs; Dependency graph was disabled repo-wide) and merged it (`c70a2b0`); added minimal branch protection on `dev` (blocks force-push/deletion only). Then built a `gotham` (Batman) theme at explicit user request, plus — because it exposed a real design gap — a proper independent speed/opacity/count system across all 14 background patterns (previously "Intensity" meant different, inconsistent things per effect) and a 14th pattern (`bats`).

Sidebar categorization and the Email 3-pane redesign are committed and pushed (`b205f82`, `236ef91`). Two follow-up polish rounds since: 2026-07-25 (icon-rail collapse, Theme layout overflow, new-mail pulse banner) and 2026-07-26 (folder-badge readability, modal font-family, reader action row down to 4 icon-only buttons with a consolidated Reply dropdown). 2026-07-27/28: agent shell execution is now actually reliable — `sudo` prompts for a password in the UI and feeds it over stdin (with a real-pty fallback for wrapper scripts like `garuda-update` that call sudo internally), shell tools use the real `HOME`, `tool_progress` SSE events reach the browser, `bash`/`python` are unconditionally available instead of depending on keyword matching against a downed ChromaDB, and pty output is stripped of ANSI escape codes. The systemd service is confirmed installed, enabled, and running (`systemctl status odysseus-ui`). 2026-08-02: email notifications are now real-time (server-side SSE push instead of client polling gaps), with a numbered unread badge in both the expanded sidebar and the collapsed icon-rail, a notification chime with a mute toggle, and a collapse animation on the pulse banner. `upstream` remote fixed to `odysseus-dev/odysseus` (was pointing at the maintainer's pre-rename username). See Active TODOs below for what's still open. See [[sessions]] and [[history]] for the full write-up.

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

**RSS Feed Reader** *(added 2026-06-11, updated 2026-07-20)*
- [ ] **MCP server** — expose feed read/search/subscribe to the AI agent via MCP
- [ ] **YouTube embed video Error 153 persists** — in-page overlay embed (`www.youtube.com/embed/VIDEO_ID?autoplay=1`) gives YouTube's internal "Video player configuration error" for at least some videos (Diego Woods channel, possibly shorts). Workaround: "Watch on YouTube" link below the embed opens video directly on YouTube (counts views, new tab). Root cause is YouTube-side (embedding disabled per-video or per-channel), not CSP or origin.
- [x] ~~Keyboard shortcuts — j/k navigate articles, m read/unread, s star~~ — done 2026-07-20, see [[history]]
- [x] ~~Dedup UI — feedparser returns empty content/summary for YouTube entries~~ — done 2026-07-20, see [[history]]
- [x] ~~Group deletion — no UI for it~~ — done 2026-07-20, see [[history]]
- [x] ~~Drag-and-drop reorder feeds / move between groups~~ — done 2026-07-20, see [[history]]
- [x] ~~Can't drop a feed directly onto a collapsed group~~ — done 2026-07-20, see [[history]]
- [x] ~~TTS button relies on `window.aiTTSManager`~~ — done 2026-07-20, see [[history]]
- [x] ~~Per-feed fetch interval — `fetch_interval` column exists but not exposed in UI~~ — done 2026-07-20, see [[history]]
- [x] ~~Auto-refresh — need to wire into existing `task_scheduler`~~ — done 2026-07-20, see [[history]]
- [x] ~~Infinite scroll — article list is paginated but no scroll trigger~~ — done 2026-07-20, see [[history]]
- [x] ~~CSP scoped to HTTPS-images~~ — investigated 2026-07-20, closed as not safely implementable, see [[history]]

**One-shot LLM calls and reasoning-model leakage** *(added 2026-07-20)*
- [ ] **`query_llm()` has no generic reasoning-output handling** — only `routes/feed_routes.py`'s two RSS summarize endpoints call it today, and both now carry an explicit "no reasoning/commentary" system-prompt instruction as a workaround (see [[history]]). The underlying gap is in `llm_call()` itself: `_THINKING_MODEL_PATTERNS` (`src/llm_core.py:1233`) is a fixed name-list used to decide when to parse structured/`<think>`-tagged reasoning out of a response; a model outside that list (e.g. a hosted alias like `big-pickle` on OpenCode Zen) that reasons in plain prose with no separating tag/field will leak its full chain-of-thought into any *non-streaming* caller's result. Any future one-shot `query_llm()` consumer needs the same prompt-level workaround, or `llm_call()` needs a real fix (e.g. a "no visible reasoning" request-level flag, or a heuristic strip pass) so callers don't have to know about this per-model quirk themselves.

---

**Security (`THREAT_MODEL.md` "Known Gaps", cross-referenced to real issues)** *(added 2026-07-19)*
- [ ] **No shell/filesystem sandbox** for the agent's `bash`/`read`/`write` tools — see #1058 sandbox proposal.
- [x] ~~SSRF via `base_url` param on `/api/v1/chat` for chat-scoped tokens~~ — confirmed fixed 2026-07-20, see [[history]]. PR #1039 itself closed unmerged, but equivalent hardening landed via a different commit path (`validate_public_http_url()`, `src/url_security.py:81`).
- [ ] **`src/search/` vs `services/search/` — partially answered.** THREAT_MODEL.md confirms `core.py`/`providers.py` under `src/search/` alias `services/search` via `sys.modules` (not dead code), **but** `analytics.py`/`cache.py`/`content.py`/`query.py`/`ranking.py` are still independent copies that can drift from the real `services/search/` implementation. Tracked as #1058. (This replaces the earlier "fully unconfirmed" note — the aliasing is real, the drift risk on the 5 non-aliased files is the remaining gap.)
- [ ] **Coarse token scopes** — only `chat`/`admin` scope tiers exist, no per-capability grant. See [[schema]] access rules.

**Refactor plan** (`specs/architecture-runtime-inventory.md`, 2026-06-16 snapshot for #4082/#4071 — priorities 1–2 already executed, see [[structure]]) *(added 2026-07-19)*
- [ ] Priority 3: split `src/agent_loop.py` (2,961 lines) → `src/agent/loop.py` + submodules (#3266)
- [ ] Priority 4: layer `src/` into `pkg/domain/infra/api` — after routes/tools are stable
- [ ] Priority 6: split `core/database.py` (2,265 lines, 28 classes, 102 importers) — **explicitly planned last**, highest blast radius
- [ ] Priority 7/8: modularize `static/style.css` (36,653 lines, #2617) and `static/js/document.js` (9,776 lines) — not yet started
- [ ] Fix the documented cross-layer smell: 8 function-body imports inside `src/tool_implementations.py` reach into `routes/*.py`
- [ ] Open questions (unresolved): is #2538 the canonical behavior-map baseline; should compat shims (`__init__.py` re-exports from the 2026-07-19 split) be temporary or permanent; should an ADR track these refactor decisions

**Test suite refactor** (issue #2523, in progress — see [[systems]] for what's already built) *(added 2026-07-19)*
- [ ] Move CLI tests (28 files, listed in `tests/LAYOUT_INVENTORY.md`, issue #3712) into `tests/cli/` — not yet executed
- [ ] Split oversized test files (issue #3983, `tests/OVERSIZED_TEST_SPLIT_PLAN.md`): `test_model_routes.py` (1,778 lines / 139 tests) and `test_security_regressions.py` (1,224 / 92) are top candidates but deferred as high-risk; safer first targets are `test_provider_classification.py`, `test_provider_endpoints.py`, `test_llm_core_temperature.py`
- [ ] CI-hardening track: pytest-randomly → fix order-dependent tests → coverage reporting → make it a blocking gate → pytest-xdist — none of these stages are done yet

**ROADMAP.md backlog not yet listed above** *(added 2026-07-19)*
- [ ] Cookbook: hardware-tiered model presets for Deep Research; rank cookbook models by hardware fit; improve error feedback/logging UX; SGLang cross-platform support
- [ ] Better AI-assisted Notes/Todos integration
- [ ] Modal/window positioning fragility; mobile `@media` override discoverability
- [ ] More endpoint/provider-probing tests (Anthropic, Gemini, Groq, xAI, OpenRouter, OpenAI, DeepSeek)
- [ ] Better scheduler defaults/visibility
- [ ] Admin-tool security hardening docs
- **Explicit non-goal right now**: no more themes (per ROADMAP.md — don't propose new theme work unprompted). Note: the `gotham` theme (2026-08-09/10, see [[history]]) doesn't violate this — the user asked for it directly; the non-goal is about *me* proposing new themes unprompted, not about declining a direct request.

---

## Active TODOs

- [ ] Confirm `pip-audit`/Trivy findings aren't silently ignored — both are advisory-only in CI (see [[systems]] Security CI), so nothing blocks on them today. *(added 2026-07-19)*
- [ ] GitHub issue [#5688](https://github.com/odysseus-dev/odysseus/issues/5688) — proposed the RSS backlog batch as a new feature per `CONTRIBUTING.md`'s no-bulk-agent-PR policy (one issue, not multiple PRs). Awaiting maintainer response before opening any PR. *(added 2026-07-24)*
- [ ] **Decide whether to unify the 3 other email-reader header blocks** (`emailLibrary.js`) with the 2026-07-26 icon-only/consolidated-Reply-dropdown redesign — one is confirmed-dead `_toggleCardPreview`-era code (safe to just delete), the other two are the "open email in a new tab" and "open in a new window" views, which still show the old 6-separate-icon layout. Left alone since the user's feedback was specifically about the 3-pane reading pane. *(added 2026-07-26)*
- [ ] **ChromaDB is currently unreachable on this install** (`localhost:8100` — `ToolIndex init failed`, retries every 30s). Semantic tool retrieval is therefore off across every domain, leaving only the deterministic `_KEYWORD_HINTS` fallback; that's what silently stripped `bash` from the toolset until it was made unconditional on 2026-07-28 (see [[history]]). RAG/personal-doc search is presumably degraded too. Either start the service (`docker compose up chromadb`) or decide the app should run keyword-only by design. **Note the general lesson from the `bash` saga**: any tool reachable *only* via semantic retrieval silently disappears while this is down, and the failure looks like the agent being broken rather than a service being offline — worth auditing which other tools are in that position, and/or surfacing "semantic retrieval unavailable" somewhere visible instead of only in the server log. *(added 2026-07-27, updated 2026-07-28)*
- [ ] **Decide whether the collapsed icon-rail deserves badges on other sections too** — email (`.rail-email-badge`) and notes (`.rail-notes-badge`) now both show unread/fired counts in the collapsed rail; the pattern is proven and cheap to replicate (see [[history]], 2026-08-02) if the same "collapsed view has less info than expanded" gap turns out to affect other sections. Not investigated elsewhere yet. *(added 2026-08-02)*
