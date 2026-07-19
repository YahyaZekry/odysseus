# Systems

> Part of odysseus/.project-knowledge/ | Last updated: 2026-06-25

| System | Status | Details |
|--------|--------|---------|
| Authentication | ✅ Active | bcrypt, session cookies, 2FA (TOTP), API bearer tokens, per-user privileges |
| Database | ✅ Active | SQLite via SQLAlchemy ORM (30+ tables) |
| AI / LLM | ✅ Active | OpenAI-compatible client, multiple providers, streaming, tool calling |
| Web Search | ✅ Active | Pluggable provider registry (10 providers): SearXNG, DuckDuckGo, Brave, Google PSE, Tavily, Serper, Bing, Search1API, Firecrawl, Exa. Per-provider API key (settings.json) with env-var fallback |
| Agent | ✅ Active | Tool-using agent with MCP, web, files, shell, memory, skills |
| Memory / Skills | ✅ Active | Persistent memory + skills, vector + keyword retrieval, ChromaDB + fastembed |
| RAG (Personal Docs) | ✅ Active | ChromaDB-backed semantic document search |
| Email | ✅ Active | IMAP/SMTP multi-account, AI triage, auto-reply, urgency detection |
| Calendar | ✅ Active | CalDAV sync, local-first, .ics import/export |
| Notes/Tasks | ✅ Active | Notes with reminders, checklists, cron-style scheduled tasks |
| Cookbook (Model Mgmt) | ✅ Active | Hardware scan, model download, vLLM/llama.cpp serving |
| Deep Research | ✅ Active | Multi-step web research with visual report generation |
| MCP (Model Context Protocol) | ✅ Active | Built-in MCP servers: browser, email, memory, image gen, RAG |
| Webhooks | ✅ Active | Outgoing webhook management |
| Task Scheduler | ✅ Active | Cron-style in-process scheduler |
| Background Jobs | ✅ Active | Monitor for long-running tasks |
| Image Generation | ⚠️ Partial | Diffusion model integration present |
| TTS / STT | ✅ Active | Text-to-speech and speech-to-text providers |
| Gallery | ✅ Active | Photo album management, EXIF, tags |
| Contacts | ✅ Active | CardDAV contacts sync |
| Vault | ✅ Active | Encrypted secure storage |
| Shell | ✅ Active | User-facing command execution (admin-gated) |
| Companion App | ✅ Active | Mobile companion pairing endpoints |
| Codex / Claude Integration | ✅ Active | External AI code editor bridge |
| RSS Feed Reader | ✅ Active | RSS/Atom feed reader with AI summaries, OPML import/export, 3-pane UI, YouTube channel support |
| Notifications (ntfy) | ✅ Active | Push notification support |
| Docker Deployment | ✅ Active | Docker Compose with GPU overlays |
| PWA | ✅ Active | Service worker, manifest.json |
