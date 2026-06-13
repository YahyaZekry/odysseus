# PROJECT KNOWLEDGE — Odysseus

> Last updated: 2026-06-12
> Status: Active

---

## What This Project Does
A self-hosted AI workspace — an open-source alternative to ChatGPT/Claude that runs on local hardware. Provides chat with any OpenAI-compatible LLM, an agent with tools (files, shell, web, MCP, memory, skills), deep research, email/calendar/contacts sync, notes/tasks, document editing, image generation, model management ("Cookbook"), and more. Privacy-first, local-first.

---

## Tech Stack
| Category        | Details                                      |
|-----------------|----------------------------------------------|
| Language        | Python 3.11+                                 |
| Runtime         | uvicorn (ASGI) / Docker Compose              |
| Framework       | FastAPI                                      |
| Database        | SQLite                                       |
| ORM / Query     | SQLAlchemy                                   |
| Auth            | bcrypt + session tokens + TOTP 2FA (pyotp) + API bearer tokens |
| Frontend        | Vanilla JS SPA (no framework), ES modules, CSS |
| Vector Store    | ChromaDB (standalone service)                |
| Embeddings      | fastembed (ONNX, local) + optional OpenAI-compatible API endpoint |
| Search          | Pluggable provider registry — SearXNG, DuckDuckGo, Brave, Google PSE, Tavily, Serper, Bing, Search1API, Firecrawl, Exa |
| Styling         | Vanilla CSS                                  |
| Testing         | pytest + pytest-asyncio                      |
| Key Libraries   | httpx, pydantic, beautifulsoup4, pypdf, caldav, icalendar, python-dateutil, croniter, cryptography, bcrypt, mcp, qrcode, nh3, markdown |
| Notifications   | ntfy (self-hosted)                           |
| Container       | Docker Compose (Odysseus + ChromaDB + SearXNG + ntfy) |
| Deployment      | Docker Compose (recommended), native Linux/macOS/Windows, systemd service |

---

## Project Structure
```
.
├── app.py                    # FastAPI entry point — routes, middleware, lifespan
├── core/                     # Core infrastructure
│   ├── auth.py               # AuthManager: bcrypt, sessions, 2FA, user/privilege CRUD
│   ├── database.py           # SQLAlchemy models (30+ tables) + engine + migrations
│   ├── models.py             # Pure data containers (ChatMessage, Session dataclasses)
│   ├── session_manager.py    # Session CRUD + message persistence
│   ├── middleware.py         # SecurityHeadersMiddleware, require_admin helper
│   ├── constants.py          # Base paths, env var defaults, agent output caps
│   ├── exceptions.py         # Custom exception types
│   ├── atomic_io.py          # Atomic JSON file writes
│   └── platform_compat.py    # Platform-specific compatibility
├── src/                      # Application logic
│   ├── llm_core.py           # LLM API client (~97KB) — OpenAI-compatible provider abstraction
│   ├── agent_loop.py         # Agent main loop (~170KB)
│   ├── tool_implementations.py # All agent tool implementations (~205KB)
│   ├── tool_schemas.py       # Tool JSON schemas (~82KB)
│   ├── tool_index.py         # RAG-based tool selection (~42KB)
│   ├── tool_execution.py     # Tool execution pipeline (~68KB)
│   ├── tool_parsing.py       # Tool call parsing (~20KB)
│   ├── ai_interaction.py     # AI interaction tools: debates, pipelines, UI control (~76KB)
│   ├── builtin_actions.py    # Built-in agent actions (~107KB)
│   ├── chat_handler.py       # Chat response handler
│   ├── chat_processor.py     # Chat processing pipeline
│   ├── deep_research.py      # Multi-step deep research engine
│   ├── research_handler.py   # Research orchestration
│   ├── memory.py             # Memory management
│   ├── memory_vector.py      # Vector memory (ChromaDB for memories)
│   ├── memory_provider.py    # Memory provider abstraction
│   ├── personal_docs.py      # Personal document management
│   ├── rag_manager.py        # RAG manager for personal docs
│   ├── rag_vector.py         # Vector RAG (ChromaDB for document search)
│   ├── rag_singleton.py      # RAG singleton accessor
│   ├── mcp_manager.py        # MCP server management (~29KB)
│   ├── mcp_oauth.py          # MCP OAuth flow
│   ├── builtin_mcp.py        # Built-in MCP server registration
│   ├── model_discovery.py    # LLM endpoint/model discovery
│   ├── model_context.py      # Model context window management
│   ├── endpoint_resolver.py  # Endpoint URL resolution
│   ├── config.py             # App configuration
│   ├── settings.py           # App settings CRUD
│   ├── embeddings.py         # Embedding provider abstraction
│   ├── embedding_lanes.py    # Embedding lane management
│   ├── chroma_client.py      # ChromaDB HTTP client wrapper
│   ├── task_scheduler.py     # Cron-style scheduled task engine (~110KB)
│   ├── event_bus.py          # In-process event bus
│   ├── webhook_manager.py    # Outgoing webhook manager
│   ├── upload_handler.py     # File upload handling (~28KB)
│   ├── api_key_manager.py    # API key management
│   ├── preset_manager.py     # Preset configuration manager
│   ├── auth_helpers.py       # Auth helper utilities
│   ├── session_actions.py    # Session action utilities
│   ├── session_search.py     # Session search
│   ├── integrations.py       # Third-party integrations (~21KB)
│   ├── secret_storage.py     # Fernet-encrypted secret storage
│   ├── prompt_security.py    # Prompt injection guardrails
│   ├── topic_analyzer.py     # Topic analysis
│   ├── context_compactor.py  # Context window compaction
│   ├── context_budget.py     # Context budget management
│   ├── bg_jobs.py            # Background job management
│   ├── bg_monitor.py         # Background job monitor
│   ├── assistant_log.py      # Assistant activity logging
│   ├── chatgpt_subscription.py # ChatGPT subscription device-flow
│   ├── copilot.py             # GitHub Copilot device-flow
│   ├── caldav_sync.py        # CalDAV sync engine
│   ├── caldav_writeback.py   # CalDAV write-back
│   ├── document_processor.py # Document processing
│   ├── document_actions.py   # Document action helpers
│   ├── email_thread_parser.py # Email thread parsing
│   ├── teacher_escalation.py # Teacher escalation workflow
│   ├── visual_report.py      # Deep research visual report rendering (~71KB)
│   ├── url_safety.py         # URL safety checks
│   ├── url_security.py       # URL security validation
│   ├── text_helpers.py       # Text processing utilities
│   ├── user_time.py          # User timezone handling
│   ├── rate_limiter.py       # Rate limiting
│   ├── readiness.py          # Readiness check
│   ├── chat_helpers.py       # Chat helper utilities
│   ├── agent_tools.py        # Agent tool interfaces
│   ├── agent_runs.py         # Agent run management
│   ├── action_intents.py     # Action intent detection
│   ├── goal_based_extractor.py # Goal-based data extraction
│   ├── generated_images.py   # Generated image utilities
│   ├── pdf_forms.py          # PDF form filling
│   ├── pdf_form_doc.py       # PDF form document handling
│   ├── pdf_runtime.py        # PDF runtime checks
│   ├── markitdown_runtime.py # Office document -> Markdown conversion
│   ├── tls_overrides.py      # TLS configuration overrides
│   ├── upload_limits.py      # Upload size limits
│   ├── settings_scrub.py     # Settings sanitization
│   ├── request_models.py     # API request validation models
│   ├── app_helpers.py        # App helper utilities
│   ├── app_initializer.py    # Component initialization
│   ├── copilot.py            # GitHub Copilot integration
│   ├── cookbook_serve_lifecycle.py # Cookbook serve lifecycle management
│   ├── clean_server.sh       # Cleanup script
│   ├── database.py           # Database initialization
│   ├── exceptions.py         # Exception types
│   └── constants.py          # Constants
├── routes/                   # API route handlers (55+ files)
│   ├── auth_routes.py        # Auth endpoints (login, signup, 2FA, users, integrations)
│   ├── chat_routes.py        # Chat endpoints (~78KB)
│   ├── session_routes.py     # Session CRUD (~56KB)
│   ├── document_routes.py    # Document editor endpoints (~76KB)
│   ├── email_routes.py       # Email endpoints (~155KB)
│   ├── email_pollers.py      # Email background polling (~69KB)
│   ├── email_helpers.py      # Email helper utilities (~61KB)
│   ├── calendar_routes.py    # Calendar/CalDAV endpoints (~63KB)
│   ├── cookbook_routes.py    # Cookbook model management (~128KB)
│   ├── cookbook_helpers.py   # Cookbook helpers (~52KB)
│   ├── model_routes.py       # Model/probe endpoints (~101KB)
│   ├── shell_routes.py       # Shell execution endpoints (~52KB)
│   ├── task_routes.py        # Scheduled task endpoints (~51KB)
│   ├── note_routes.py        # Notes/todos endpoints (~41KB)
│   ├── skills_routes.py      # Skills management (~76KB)
│   ├── memory_routes.py      # Memory endpoints (~24KB)
│   ├── history_routes.py     # Chat history endpoints (~29KB)
│   ├── gallery_routes.py     # Image gallery endpoints (~81KB)
│   ├── mcp_routes.py         # MCP server management (~28KB)
│   ├── research_routes.py    # Deep research endpoints (~31KB)
│   ├── contacts_routes.py    # CardDAV contacts (~32KB)
│   ├── codex_routes.py       # Codex integration (~38KB)
│   ├── webhook_routes.py     # Webhook management (~16KB)
│   ├── upload_routes.py      # File upload endpoints (~13KB)
│   ├── assistant_routes.py   # Personal assistant endpoints (~14KB)
│   ├── backup_routes.py      # Backup/export/import
│   ├── compare_routes.py     # Model comparison (~11KB)
│   ├── chatgpt_subscription_routes.py # ChatGPT subscription device-flow
│   ├── copilot_routes.py     # GitHub Copilot device-flow
│   ├── hwfit_routes.py       # Hardware fit ("What Fits?") (~14KB)
│   ├── personal_routes.py    # Personal document management (~13KB)
│   ├── embedding_routes.py   # Embedding model management (~14KB)
│   ├── api_token_routes.py   # API token CRUD
│   ├── admin_wipe_routes.py  # Admin danger-zone wipes
│   ├── cleanup_routes.py     # Session cleanup
│   ├── search_routes.py      # Web search
│   ├── preset_routes.py      # Preset management
│   ├── prefs_routes.py       # User preferences
│   ├── diagnostics_routes.py # System diagnostics
│   ├── tts_routes.py         # Text-to-speech
│   ├── stt_routes.py         # Speech-to-text
│   ├── signature_routes.py   # Reusable image stamps
│   ├── vault_routes.py       # Secure vault
│   ├── editor_draft_routes.py # Image editor drafts
│   ├── font_routes.py        # Font management
│   ├── workspace_routes.py   # Workspace management
│   ├── feed_routes.py        # RSS Feed Reader CRUD, articles, OPML, AI summarize, refresh
│   ├── emoji_routes.py       # Emoji SVG proxy
│   └── device_flow.py        # OAuth device-flow helpers
├── services/                 # Service modules
│   ├── feed/                 # RSS/Atom feed reader: fetcher, discovery, OPML, full-content, YouTube resolver
│   ├── search/               # Web search service — pluggable provider registry (PROVIDER_REGISTRY + PROVIDER_FUNCTIONS in providers.py)
│   ├── memory/               # Memory extraction + skill management
│   ├── research/             # Research orchestration
│   ├── docs/                 # Document service
│   ├── hwfit/                # Hardware fit scoring (llmfit-based)
│   ├── shell/                # Shell execution service
│   ├── tts/                  # Text-to-speech service
│   ├── stt/                  # Speech-to-text service
│   ├── youtube/              # YouTube transcript handler
│   └── faces/                # Face detection service
├── mcp_servers/              # Built-in MCP servers
│   ├── email_server.py       # Email MCP server
│   ├── memory_server.py      # Memory MCP server
│   ├── rag_server.py         # RAG MCP server
│   └── image_gen_server.py   # Image generation MCP server
├── companion/                # Companion app endpoints
│   ├── routes.py             # /ping, /info, /models, /pair endpoints
│   └── pairing.py            # Companion pairing logic
├── static/                   # Frontend SPA
│   ├── index.html            # Main app shell
│   ├── login.html            # Login page
│   ├── app.js                # Main app bundle
│   ├── style.css             # Styles (~large, all CSS in one file)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── js/                   # ES modules (80+ files)
│       ├── chat.js, chatRenderer.js, chatStream.js
│       ├── cookbook*.js      # Cookbook UI modules
│       ├── calendar.js, calendar/
│       ├── email*.js         # Email UI modules
│       ├── notes.js          # Notes/todos UI
│       ├── feedReader.js     # RSS Feed Reader UI
│       ├── gallery*.js       # Gallery UI
│       ├── admin.js          # Admin settings
│       ├── compare/          # Model comparison UI
│       └── ...               # 70+ more modules
├── scripts/                  # Utility scripts
│   ├── check-docker-gpu.sh   # NVIDIA GPU Docker diagnostic
│   ├── check-docker-amd-gpu.sh # AMD GPU Docker diagnostic
│   ├── odysseus-mail         # CLI mail poller (for cron)
│   ├── hf_download.py        # HuggingFace model download helper
│   └── ...
├── integrations/             # External integration plugins
│   ├── claude/               # Claude Code integration (SKILL.md + API script)
│   └── codex/                # Codex plugin integration (plugin.json + SKILL.md)
├── config/                   # Bundled service configs
│   └── searxng/settings.yml  # SearXNG default config
├── docker/                   # Docker support files
│   ├── entrypoint.sh         # Entrypoint (drops privileges via gosu)
│   ├── gpu.nvidia.yml        # NVIDIA GPU Compose overlay
│   └── gpu.amd.yml           # AMD GPU Compose overlay
├── docker-compose.yml        # Main Compose file
├── Dockerfile                # Container image (Python 3.12-slim)
├── pyproject.toml            # Pytest config
├── requirements.txt          # Core Python dependencies
├── requirements-optional.txt # Optional dependencies (whisper, DuckDuckGo, PyMuPDF, markitdown)
├── package.json              # Node deps (Anthropic SDK, bombadil linter)
├── build-macos-app.sh        # macOS app bundler
├── launch-windows.ps1        # Windows one-command launcher
├── install-service.sh        # systemd service installer
├── odysseus-ui.service       # systemd unit file
├── .env.example              # Environment variable reference
├── README.md                 # Project documentation
├── ROADMAP.md                # Known issues and future work
├── CONTRIBUTING.md           # Contribution guide
├── ACKNOWLEDGMENTS.md        # Third-party acknowledgments
└── LICENSE                   # MIT license
```

Key files:
- `app.py` — FastAPI entry point: lifespan, middleware (CORS, security, auth, timeout), static file serving, all route registrations
- `core/database.py` — All SQLAlchemy models (30+ tables), engine config, encrypted text column
- `core/auth.py` — AuthManager: user CRUD, password hashing (bcrypt), session tokens, 2FA (TOTP), privileges
- `src/llm_core.py` — LLM API client: OpenAI-compatible provider abstraction, streaming, tool calling
- `src/agent_loop.py` — Main agent loop: tool selection, execution, continuation
- `src/tool_implementations.py` — All agent tool implementations (205KB)
- `src/task_scheduler.py` — Cron-style scheduled task engine (110KB)
- `src/builtin_actions.py` — Built-in agent actions (107KB)
- `src/ai_interaction.py` — Debates, pipelines, self-managing AI (76KB)
- `static/app.js` — Main frontend application bundle

---

## Database Schema
> SQLite via SQLAlchemy ORM. Tables defined in `core/database.py`.

| Table | Key Columns | Relations |
|-------|-------------|-----------|
| `sessions` | id (PK), name, endpoint_url, model, owner (FK→users), rag, archived, folder, is_important, message_count, total_input_tokens, total_output_tokens, mode, crew_member_id, last_message_at | has_many chat_messages, has_many documents, has_many gallery_images |
| `chat_messages` | id (PK), session_id (FK→sessions), role (user/assistant/system), content, metadata, timestamp | belongs_to session |
| `chat_messages_fts` | Virtual table for FTS5 full-text search on chat_messages | |
| `documents` | id (PK), session_id (FK→sessions), title, language, current_content, version_count, is_active, archived, owner, tidy_verdict, source_email_uid/folder/account_id/message_id | has_many document_versions, belongs_to session |
| `document_versions` | id (PK), document_id (FK→documents), version_number, content, summary, source (ai/user) | belongs_to document |
| `gallery_images` | id (PK), filename (unique), prompt, model, size, quality, tags, ai_tags, session_id (FK→sessions), album_id (FK→gallery_albums), owner, is_active, favorite, file_hash, taken_at, camera_make/model, gps_lat/lng, width, height, file_size | belongs_to session, belongs_to album |
| `gallery_albums` | id (PK), name, description, cover_id (FK→gallery_images), owner | has_many gallery_images |
| `email_accounts` | id (PK), owner, is_default, imap_host/port/username/password (encrypted), smtp_host/port/username/password (encrypted), imap_use_ssl, smtp_use_ssl, provider, routing_rules (JSON), polling_enabled, sync_folder | |
| `email_messages` | id (PK), account_id (FK→email_accounts), folder, uid, message_id (Message-ID header), subject, from_addr, to_addrs, cc_addrs, date, body_text, body_html, flags, is_read, is_flagged, is_urgent, thread_id, in_reply_to | belongs_to email_account |
| `scheduled_tasks` | id (PK), name, owner, action, params (JSON), schedule (cron expr), enabled, last_run_at, next_run_at, is_event, webhook_enabled, webhook_token, webhook_url, end_after_min | |
| `api_tokens` | id (PK), name, token_prefix, token_hash, owner, scopes, is_active, last_used_at | |
| `webhooks` | id (PK), name, url, events (JSON), owner, secret, is_active | |
| `notes` | id (PK), owner, title, content, color, is_pinned, is_archived, reminder_at, checklist (JSON), tags, folder, shared_with | |
| `contacts` | id (PK), owner, carddav_url, carddav_username, carddav_password (encrypted), name, email, phone, organization, photo, vcard_raw, sync_token, etag | |
| `crew_members` | id (PK), name, system_prompt, model, endpoint_url, temperature, owner, session_id (FK→sessions) | belongs_to session |
| ~~`skill_definitions`~~ (correction 2026-06-09) | **Not a DB table.** Skills are stored as `SKILL.md` files under `data/skills/<category>/<name>/` (YAML frontmatter + markdown body), managed by `SkillsManager` (`services/memory/skills.py`); usage counters in `data/skills/_usage.json`. Owner-scoped via the `owner:` frontmatter field. | |
| `memories` | id (PK), text, category, source, owner, session_id (FK→sessions), timestamp | belongs_to session; vector copies in `data/memory_vectors/` (ChromaDB/fastembed) |
| `settings` | key (PK), value, type | |
| `notifications` | id (PK), owner, title, body, type, link, is_read, created_at | |
| `calendar_cache` | id (PK), owner, cal_data (JSON), account_id, calendar_id | |
| `editor_drafts` | id (PK), owner, name, state (JSON), thumbnail, updated_at | |
| `vault_items` | id (PK), owner, name, content (encrypted), type |
| `feed_groups` | id (PK), owner, name | has_many feeds |
| `feeds` | id (PK), owner, group_id (FK→feed_groups), title, site_url, feed_url, icon, fetch_interval, last_fetched, error_count, last_error, enabled, created_at | has_many articles, belongs_to feed_group |
| `feed_sync_accounts` | id (PK), owner, service (greader/newsblur/inoreader), credentials (encrypted), sync_enabled, last_synced | | |

RLS / access rules:
- Most tables are owner-scoped: queries filter by `owner == current_user` or `owner IS NULL`
- Admin routes require `require_admin` decorator (checks user is admin in auth.json)
- Sessions scoped per-owner; legacy null-owner sessions are shared
- API tokens are scoped (e.g. `chat`, `email:read`, `todos:write`)
- `internal-tool` loopback bypasses owner checks for agent-internal calls

---

## Server Actions / API Routes
> 150+ endpoints across 55+ route files. Prefix `/api/auth` on all auth routes, `/api` on others.

| Route | Auth Required | What It Does |
|-------|---------------|-------------|
| `GET /` | Session | Serve SPA (index.html) |
| `GET /login` | None | Login page (redirects if auth disabled) |
| `GET /notes`, `/calendar`, `/cookbook`, `/email`, `/memory`, `/gallery`, `/tasks`, `/library` | Session | SPA deep-link routes |
| `POST /api/auth/setup` | None | First-time admin setup |
| `POST /api/auth/signup` | None | User registration |
| `POST /api/auth/login` | None | Login (returns session cookie) |
| `POST /api/auth/logout` | None | Logout (clears session) |
| `GET /api/auth/status` | None | Auth status + current user |
| `POST /api/auth/change-password` | Session | Change password |
| `POST /api/auth/2fa/setup` | Session | Enable 2FA (returns TOTP URI) |
| `POST /api/auth/2fa/confirm` | Session | Confirm 2FA setup |
| `POST /api/auth/2fa/disable` | Session | Disable 2FA |
| `GET /api/auth/2fa/status` | Session | Check 2FA status |
| `GET /api/auth/users` | Admin | List users |
| `POST /api/auth/users` | Admin | Create user |
| `PUT /api/auth/users/{username}/privileges` | Admin | Update user privileges |
| `PUT /api/auth/users/{username}/rename` | Admin | Rename user |
| `DELETE /api/auth/users` | Admin | Delete users |
| `PUT /api/auth/open-signup` | Admin | Toggle open signup |
| `GET /api/auth/features` | None | Get enabled features |
| `POST /api/auth/features` | Admin | Set enabled features |
| `GET /api/auth/settings` | None | Get auth settings |
| `POST /api/auth/settings` | Admin | Set auth settings |
| `GET /api/auth/integrations` | Session | List integrations |
| `GET /api/auth/integrations/presets` | None | Integration presets |
| `POST /api/auth/integrations` | Session | Create integration |
| `PUT /api/auth/integrations/{id}` | Session | Update integration |
| `DELETE /api/auth/integrations/{id}` | Session | Delete integration |
| `POST /api/auth/integrations/{id}/test` | Session | Test integration |
| `GET /api/chat/...` | Session | Chat endpoints (streaming, send, etc.) |
| `GET /api/session/...` | Session | Session CRUD, listing, search |
| `GET /api/document/...` | Session | Document CRUD, versions, search |
| `GET /api/email/...` | Session | Email: list, read, send, search, folders, accounts, attachments, triage |
| `GET /api/calendar/...` | Session | Calendar: config, accounts, calendars, events, sync, .ics |
| `GET /api/cookbook/...` | Session | Cookbook: model scan, download, serve, dependencies, hardware fit |
| `GET /api/model/...` | Session | Model discovery, probing, provider management |
| `GET /api/shell/...` | Session/Agent | Shell command execution (admin-gated) |
| `GET /api/task/...` | Session | Scheduled task CRUD, run, webhook |
| `GET /api/note/...` | Session | Notes/todos CRUD, reminders |
| `GET /api/skills/...` | Session | Skills CRUD, audit, search |
| `GET /api/memory/...` | Session | Memory CRUD, search |
| `GET /api/history/...` | Session | Session history |
| `GET /api/gallery/...` | Session | Gallery: images, albums, upload, edit, search |
| `GET /api/mcp/...` | Admin | MCP server management |
| `GET /api/research/...` | Session | Deep research: run, status, results |
| `GET /api/contacts/...` | Session | CardDAV contacts CRUD, sync |
| `GET /api/codex/...` | API Token | Codex/Claude Code bridge endpoints |
| `GET /api/webhook/...` | Session | Webhook CRUD, test, logs |
| `POST /api/upload` | Session | File upload |
| `GET /api/backup/export` | Session | Export user data |
| `POST /api/backup/import` | Session | Import user data |
| `GET /api/compare/...` | Session | Model A/B comparison |
| `GET /api/copilot/...` | Session | GitHub Copilot device-flow |
| `GET /api/chatgpt-subscription/...` | Session | ChatGPT Subscription device-flow |
| `GET /api/personal/...` | Session | Personal document management |
| `GET /api/embedding/...` | Session | Embedding model management |
| `GET /api/tts/...` | Session | Text-to-speech |
| `GET /api/stt/...` | Session | Speech-to-text |
| `GET /api/signature/...` | Session | Reusable image stamps |
| `GET /api/vault/...` | Session | Secure vault CRUD |
| `GET /api/editor-draft/...` | Session | Image editor draft persistence |
| `GET /api/workspace/...` | Session | Workspace management |
| `GET /api/emoji/...` | None | Emoji SVG proxy (Twemoji) |
| `GET /api/health` | None | Liveness check |
| `GET /api/ready` | None | Readiness check (DB, data dir) |
| `GET /api/version` | None | App version |
| `GET /api/runtime` | None | Runtime info (Docker, Ollama URL) |
| `DELETE /api/wipe/{kind}` | Admin | Danger-zone data wipe |
| `GET /api/tokens` | Session | List API tokens (admin: all; user: own) |
| `POST /api/tokens` | Session | Create API token |
| `PATCH /api/tokens/{id}` | Session | Update API token |
| `DELETE /api/tokens/{id}` | Session | Delete API token |
| `GET /api/auth/assistant/...` | Session | Personal assistant settings, status, run |
| `POST /api/tasks/{id}/webhook/{token}` | None | External webhook trigger (token-authenticated) |
| `GET/POST/PUT/DELETE /api/feeds` | Session | Feed CRUD (list, create, update, delete, groups) |
| `GET /api/feeds/articles` | Session | List articles with filters (feed_id, group_id, read, starred, search, limit, offset) |
| `POST /api/feeds/{id}/refresh` | Session | Force refresh a single feed |
| `POST /api/feeds/refresh-all` | Session | Queue refresh of all feeds (background task) |
| `POST /api/feeds/articles/{id}/read` | Session | Mark article read/unread |
| `POST /api/feeds/articles/{id}/star` | Session | Star/unstar article |
| `POST /api/feeds/articles/read-all` | Session | Mark all articles as read (optionally by feed_id) |
| `POST /api/feeds/articles/{id}/summarize` | Session | AI-generated article summary |
| `POST /api/feeds/articles/{id}/full-content` | Session | Extract full article content via trafilatura |
| `POST /api/feeds/discover` | Session | Discover RSS feeds from a URL |
| `POST /api/feeds/opml/export` | Session | Export feeds as OPML (returns XML) |
| `POST /api/feeds/opml/import` | Session | Import feeds from OPML |
| `GET /api/companion/ping/info/models/pair` | Session | Companion app endpoints |

---

## Environment Variables
> All configurable via `.env`. Full reference at `.env.example`.

| Variable | Used In | What It Enables |
|----------|---------|----------------|
| `LLM_HOST` | `src/constants.py` | Default LLM server host |
| `LLM_HOSTS` | `src/constants.py` | Additional LLM hosts for model discovery |
| `OLLAMA_BASE_URL` | `app.py` | Ollama endpoint override |
| `LM_STUDIO_URL` | `app.py` | LM Studio endpoint override |
| `OPENAI_API_KEY` | `src/constants.py` | OpenAI API access |
| `RESEARCH_LLM_ENDPOINT` | research handler | Research-specific LLM endpoint |
| `LLM_CA_BUNDLE` | `src/tls_overrides.py` | Custom CA cert bundle for LLM endpoints |
| `SEARXNG_INSTANCE` | `src/constants.py` | SearXNG URL for web search |
| `SEARXNG_SECRET` | SearXNG config | SearXNG cookie/CSRF secret |
| `DATA_BRAVE_API_KEY` | `services/search/providers.py` | Brave Search key (env fallback; primary: `brave_api_key` setting) |
| `GOOGLE_API_KEY` | `services/search/providers.py` | Google PSE key (env fallback; also needs `google_pse_cx`) |
| `TAVILY_API_KEY` / `SERPER_API_KEY` | `services/search/providers.py` | Tavily / Serper search keys (env fallback) |
| `BING_API_KEY` / `SEARCH1API_API_KEY` / `FIRECRAWL_API_KEY` / `EXA_API_KEY` | `services/search/providers.py` | Keys for Bing, Search1API, Firecrawl, Exa providers (env fallback) |
| `DATABASE_URL` | `core/database.py` | Database connection (default: SQLite) |
| `ODYSSEUS_DATA_DIR` | `src/constants.py` | Override data directory path |
| `AUTH_ENABLED` | `app.py` | Enable/disable auth |
| `APP_BIND` | Docker Compose | Host bind address |
| `APP_PORT` | Docker Compose | Host port |
| `APP_PUBLIC_URL` | webhooks, email | Public URL of the instance |
| `LOCALHOST_BYPASS` | `app.py` | Dev-only auth bypass for loopback |
| `SECURE_COOKIES` | `routes/auth_routes.py` | Mark session cookies Secure |
| `ODYSSEUS_ADMIN_PASSWORD` | setup | Pre-seed admin password |
| `ALLOWED_ORIGINS` | `app.py` | CORS allowed origins |
| `CHROMADB_HOST` | `src/chroma_client.py` | ChromaDB host |
| `CHROMADB_PORT` | `src/chroma_client.py` | ChromaDB port |
| `EMBEDDING_URL` | `src/embeddings.py` | Embedding API endpoint |
| `EMBEDDING_API_KEY` | `src/embeddings.py` | Embedding API key |
| `EMBEDDING_MODEL` | `src/embeddings.py` | Embedding model name |
| `FASTEMBED_MODEL` | `src/embeddings.py` | Local ONNX embedding model |
| `FASTEMBED_CACHE_PATH` | `src/constants.py` | fastembed cache directory |
| `CLEANUP_INTERVAL_HOURS` | `src/constants.py` | Cleanup interval |
| `ODYSSEUS_INPROCESS_POLLERS` | email pollers | Enable in-process email polling |
| `ODYSSEUS_INPROCESS_TASKS` | `app.py` | Enable in-process task scheduler |
| `ODYSSEUS_SCRIPT_HOST` | task scheduler | SSH host for remote script execution |
| `ODYSSEUS_CHAT_UPLOAD_MAX_BYTES` | upload limits | Chat attachment size cap |
| `ODYSSEUS_MAIL_ATTACHMENTS_DIR` | `src/constants.py` | Mail attachments directory |
| `REQUEST_HARD_TIMEOUT` | `app.py` | Request timeout in seconds |
| `COMPOSE_FILE` | Docker | GPU Compose overlay selection |
| `RENDER_GID` | Docker | AMD GPU render group ID |

---

## Dev Commands

| Command | What It Does |
|---------|-------------|
| `python -m uvicorn app:app --host 127.0.0.1 --port 7000` | Run dev server natively |
| `docker compose up -d --build` | Build and start all services |
| `docker compose logs --tail=120 odysseus` | View app logs |
| `pytest` | Run tests |
| `python setup.py` | First-time setup (creates admin, initializes DB) |
| `powershell -ExecutionPolicy Bypass -File .\launch-windows.ps1` | Windows one-command launcher |
| `./build-macos-app.sh` | Build macOS app bundle |
| `./install-service.sh` | Install systemd service |
| `pip install -r requirements.txt` | Install Python dependencies |
| `pip install -r requirements-optional.txt` | Install optional dependencies |

---

## External Integrations & Data Contracts

**SearXNG (self-hosted search engine)**
- Writes to: none (read-only)
- Reads from: SearXNG API at configured `SEARXNG_INSTANCE` URL
- Triggered by: user search requests
- Config: `config/searxng/settings.yml`

**ChromaDB (vector store)**
- Writes to: ChromaDB collections via HTTP API at configured host:port
- Reads from: ChromaDB collections
- Used by: personal docs RAG, tool selection index, memory vectors

**ntfy (push notifications)**
- Receives: notification requests from task scheduler and email triage
- Channel: HTTP POST to configured ntfy server

**CalDAV providers** (Radicale, Nextcloud, Apple, Fastmail)
- Writes to: remote CalDAV calendar collections
- Reads from: remote CalDAV calendar collections
- Auth: username/password per account

**CardDAV providers** (contacts)
- Writes to: remote CardDAV address book
- Reads from: remote CardDAV address book
- Auth: username/password per contact entry

**IMAP/SMTP (email)**
- Reads from: IMAP inbox (configurable folders)
- Writes to: IMAP (move, flag, delete) + SMTP (send)
- Data: `email_accounts` table stores credentials (Fernet-encrypted); `email_messages` caches fetched mail

**Codex / Claude Code integrations**
- Writes to: API via api_token scoped routes (todos, email, calendar, documents)
- Reads from: same scoped routes
- Auth: API bearer tokens (`ody_*`)

---

## Systems

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

---

## Features
- **Chat** — Chat with any local or API model (vLLM, llama.cpp, Ollama, OpenRouter, OpenAI, GitHub Copilot). Streaming, tool calling, multi-model sessions. *(added: detected)*
- **Agent** — Tool-using agent with web search, file operations, shell, MCP servers, memory, skills. Built on opencode agent framework. *(added: detected)*
- **Cookbook** — Scan hardware, recommend compatible models, click to download and serve. VRAM-aware, fit scoring, vLLM/llama.cpp serving. *(added: detected)*
- **Deep Research** — Multi-step research runs: gather, read, synthesize sources into visual reports. *(added: detected)*
- **Model Comparison** — Blind A/B model comparison with side-by-side output and synthesis. *(added: detected)*
- **Documents** — Multi-tab editor with markdown/HTML/CSV, syntax highlighting, AI edits and suggestions. *(added: detected)*
- **Memory & Skills** — Persistent memory and evolving skills with vector + keyword retrieval. Import/export. *(added: detected)*
- **Email** — IMAP/SMTP inbox with AI triage: urgency detection, auto-tag, auto-summary, auto-reply drafts. Multi-account. *(added: detected)*
- **Notes & Tasks** — Google Keep-style notes with reminders, checklists, cron-style scheduled tasks. ntfy/browser/email notification channels. *(added: detected)*
- **Calendar** — Local-first calendar with CalDAV sync (Radicale, Nextcloud, Apple, Fastmail). Agent-aware. *(added: detected)*
- **Image Generation & Gallery** — AI image generation, gallery with albums, EXIF, tags, search. *(added: detected)*
- **Image Editor** — Server-backed image editing drafts with tools. *(added: detected)*
- **Contacts** — CardDAV contacts sync and management. *(added: detected)*
- **MCP Servers** — Built-in MCP servers for browser, email, memory, RAG, image generation. *(added: detected)*
- **Webhooks** — Outgoing webhooks with event selection and secret signing. *(added: detected)*
- **API Tokens** — Scoped bearer tokens for external integrations. *(added: detected)*
- **Vault** — Encrypted secure storage for sensitive data. *(added: detected)*
- **Signatures** — Reusable image stamps. *(added: detected)*
- **Workspace** — Workspace/organization management. *(added: detected)*
- **Shell** — Command execution within agent (admin-gated). *(added: detected)*
- **Presets** — Preset model/endpoint configurations. *(added: detected)*
- **Backup & Restore** — Export/import user data (memories, presets, skills). *(added: detected)*
- **Integrations** — Third-party provider integration management (LLM providers, etc.). *(added: detected)*
- **Companion** — Mobile companion app pairing and info endpoints. *(added: detected)*
- **Codex / Claude Integration** — External AI code editor bridge via scoped API tokens. *(added: detected)*
- **PWA** — Installable as progressive web app with service worker. *(added: detected)*
- **2FA** — Two-factor authentication via TOTP. *(added: detected)*
- **Emoji SVG Proxy** — Same-origin lazy-cached Twemoji SVGs for chat rendering. *(added: detected)*
- **TTS/STT** — Text-to-speech and speech-to-text (optional local Whisper STT). *(added: detected)*
- **RSS Feed Reader** — 3-pane RSS/Atom feed reader with AI summaries, article thumbnails, star/read tracking, OPML import/export, YouTube channel URL resolution. *(added: 2026-06-11)*

---

## Workflows

**User Registration / First Boot**
1. First boot: no users → setup mode
2. `POST /api/auth/setup` (or first request auto-creates admin with printed password)
3. Admin logs in → changes password → configures settings
4. Optional: enable open signup, create additional users with privileges

**Chat Flow**
1. User sends message via `POST /api/chat/send` (or streaming variant)
2. ChatProcessor determines mode (chat/agent/research)
3. Messages persisted to `chat_messages` via SessionManager
4. LLM called with context + tools (if agent mode)
5. Response streamed back and persisted
6. Optional: memory extraction, tool execution, skill evaluation

**Agent Tool Execution**
1. Agent receives user request → LLM generates tool calls
2. Tool calls parsed via `tool_parsing.py`
3. Each tool executed via `tool_execution.py` calling into `tool_implementations.py`
4. Results fed back to LLM for next iteration
5. Loop continues until task complete or max turns reached

**Deep Research**
1. User submits research query (optionally with `category` for format override)
2. ResearchHandler spawns multi-step research job via `DeepResearcher`
3. Pipeline: classify category → plan (sub-questions + key topics + success criteria) → loop[generate queries → search → fetch + extract → synthesize → stop?] → final report (via `FINAL_REPORT_PROMPT` with STRUCTURE CHECK at top)
4. Visual report generated via `visual_report.py` (HTML with sources, stats, findings)
5. Report available for viewing/export at `/api/research/report/{session_id}`

**Email Triage**
1. Background email pollers fetch new mail from IMAP
2. AI analyzes urgency → tags → auto-reply drafts
3. Notifications sent via ntfy/browser for urgent mail
4. User can view, reply, manage from email UI

**Cookbook Model Download & Serve**
1. Hardware scan detects GPU/CPU/RAM/VRAM
2. Model recommendations based on hardware fit
3. User clicks download → background job via tmux
4. After download → serve via vLLM or llama.cpp
5. Model available in chat model selector

**Scheduled Tasks**
1. Task scheduler evaluates cron expressions
2. On match, executes action (built-in or user-defined)
3. Actions include: send email, run script, webhook, agent run, etc.
4. Results logged, notifications sent

**Feed Reader — Add Feed from URL**
1. User enters URL in "Add Feed" modal
2. Frontend calls `POST /api/feeds/discover` → `discover_feeds()` auto-detects RSS/Atom feeds
3. If the URL is a YouTube channel/handle/playlist URL, `resolve_youtube_feed()` resolves it to `feeds/videos.xml`
4. User selects which discovered feed to add
5. Frontend calls `POST /api/feeds` to create the feed (sets YouTube favicon if applicable)
6. Optionally, `POST /api/feeds/{id}/refresh` fetches the feed immediately

**Feed Reader — Read and Navigate Articles**
1. Click feed in sidebar → `_loadArticles()` fetches articles (paginated, filterable by unread/starred/feed)
2. Click article in list → `_openReader()` shows reader view (title, date, full content or summary)
3. Toolbar: back, star/unstar, AI summarize, full-content fetch, open original, mark read
4. Reader view is inside the main RSS modal with drag/dock/fullscreen support

---

## Known Issues / TODOs
(Detected from ROADMAP.md and code analysis)
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
- [/] **Honor a user-supplied output template in deep research** — ~~the final report is forced through `FINAL_REPORT_PROMPT` (fixed structure: exec summary, `##` headings, ≥1500 words, conclusion, "magazine style"), which overrides any structure the user asked for.~~ **Fixed 2026-06-12**: STRUCTURE CHECK moved to top of `FINAL_REPORT_PROMPT` — if user's question contains a custom template (numbered sections, per-entry labels, discrete entries), it takes priority over the default essay format.
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

## Decisions & Notes
- **Vanilla JS frontend, no framework** — SPA uses raw ES modules with no build step. CSS is monolithic. Design choice to avoid framework churn.
- **SQLite single-file database** — Not designed for multi-server horizontal scaling. All data in `data/` directory.
- **Docker Compose for bundled services** — ChromaDB, SearXNG, ntfy run as sidecars. GPU overlay pattern via Compose files.
- **ChromaDB as external service** — Not embedded; connects via HTTP. Degrades gracefully if unavailable (503 vs crash).
- **Fernet encryption for stored secrets** — Email passwords, vault items encrypted at rest. Key at `data/.app_key`.
- **Agent loop runs in-process** — No separate agent worker. Uses asyncio for concurrency.
- **Built on opencode agent framework** — Agent tool system, MCP, and skill system derived from opencode.
- **Deep Research adapted from Alibaba Tongyi DeepResearch** — Multi-step research with visual report output.
- **Cookbook based on llmfit** — Hardware fit scoring for model selection.
- **Search providers use a pluggable registry** — `PROVIDER_REGISTRY` (per-provider metadata via the `ProviderInfo` dataclass: label, needs_key, needs_url, key_setting, env_var, hint, has_additional) + `PROVIDER_FUNCTIONS` (name→search fn) in `services/search/providers.py`. `_call_provider` does a registry lookup instead of if/elif. Adding a provider = add a `ProviderInfo` entry + a search fn + register it in `PROVIDER_FUNCTIONS`. `GET /api/search/providers` serves this metadata so the settings UI renders key/URL fields and hints dynamically (no hardcoded provider JS). `PROVIDER_INFO` retained as a backward-compatible `(label, needs_key, needs_url)` tuple map. *(2026-06-08, commit 182bd15)*
- **Deep research is a web-search pipeline, not a single LLM call** — `src/deep_research.py` runs: classify → plan (3–6 sub-questions) → loop[generate queries → search → scrape/extract (dropping low-quality) → synthesize (compresses/dedupes) → stop?] → final report via the fixed `FINAL_REPORT_PROMPT`, capped by `research_max_tokens`. It does **not** honor a user-supplied output template, and its web-grounding adds little for conceptual/knowledge-synthesis tasks. For structured, no-compression documents, chat/agent mode (with the `web_search` tool) is the right tool, not deep research.
- **Search runs one provider at a time with silent fallback** — `_build_provider_chain(primary)` = `[primary] + (search_fallback_chain or ["duckduckgo"])`. A provider with no API key returns `[]` (not an exception), so the chain silently advances. The provider that actually returned results is recorded in `DeepResearcher.providers_used` → surfaced in the report stats `Search:` field, and logged as `Research search: <prov> returned N results`. Odysseus does NOT query multiple providers in parallel and merge.
- **PDF support is read + form-fill + browser-print only** — Odysseus reads/extracts PDFs (pypdf, PyMuPDF/fitz) and fills+exports PDF *forms* (`/api/document/{id}/export-pdf`, requires a linked source PDF). Research reports export to PDF via the browser print dialog (`window.print()`, `src/visual_report.py:897`). There is **no** server-side text/markdown/HTML→PDF generation engine (no weasyprint/reportlab/pdfkit/fpdf), and **no** agent tool to emit a `.pdf` from generated content.
- **Skills are file-based SKILL.md, not a DB table** — under `data/skills/<category>/<name>/SKILL.md` (YAML frontmatter + body), managed by `SkillsManager` (`services/memory/skills.py`), created via `add_skill(...)` / `POST /api/skills/add`. Owner-scoped via the `owner` frontmatter field; published skills (`status: published`) always qualify for prompt injection (drafts gated by `skill_autosave_min_confidence`, max `skill_max_injected` per request). The Skills tab "Built-in" section is separate — it lists the agent's native tools from `agent_loop.TOOL_SECTIONS`, not editable skills.
- **Memory is on by default** (`memory: True` in `DEFAULT_SETTINGS`) — backed by the `memories` table + `data/memory.json`, with a vector copy in `data/memory_vectors/` (ChromaDB/fastembed). Empty until conversations populate it; it is active, not broken, when the list looks empty on a fresh install.
- **Kimi (Moonshot) is a first-class provider** — OpenAI-compatible, base `https://api.moonshot.ai/v1` (`.cn` also recognized). Wired in `static/js/slashCommands.js` (setup `kimi`/`moonshot`), `static/js/providers.js` (`_ENDPOINT_LABELS`), and `src/llm_core.py` (`_provider_label`). Uses the generic `openai` provider path (no special headers); logo already existed in `providers.js`. Same pattern as DeepSeek/Mistral (display-only label, not a behavior-distinct provider id).
- **RSS feed reader uses a Notes-like centered modal** — consistent with Notes, Email, Calendar behavior (centered backdrop modal with drag/snap/dock via `makeWindowDraggable`)
- **RSS reader uses feedparser directly** — rather than httpx+XML parsing. Battle-tested, covers RSS and Atom both.
- **`services/feed/full_content.py` uses trafilatura** — lightweight, no browser engine needed, produces clean Markdown
- **`_refresh_single()` runs as background task** via `BackgroundTasks` — non-blocking refresh-all with per-feed progress tracking
- **AI summary reuses `src.llm_core.query_llm()`** — no new provider infra
- **No OPML validation on import** — best-effort parse, errors silently drop malformed outlines
- **CSP `img-src` was missing `https:`** — blocked YouTube thumbnails (from `i*.ytimg.com`) and favicons. Fixed by adding `https:` to the allowlist.
- **YouTube embed → Error 153** — YouTube's in-page embed (iframe) fails with Error 153 ("Video player configuration error") for some videos. Embed URL returns HTTP 200 but empty content. Caused by YouTube-side restrictions (embedding disabled, shorts, etc.) not CSP. Three approaches attempted: (1) inline iframe in reader → Error 153; (2) `window.open` popup → opened as new tab (browser ignores popup features); (3) in-page modal overlay with embed + "Watch on YouTube" fallback link → embed still Error 153, fallback link opens video directly on YouTube (counts views). Current approach: in-page modal tries embed on open, shows fallback link below.

---

## Fixed

- **Deep research: `FINAL_REPORT_PROMPT` template override buried beneath essay defaults** — The "magazine-quality article" format requirements appeared before the "if user has a custom template, override these" check. Moved STRUCTURE CHECK to the top of `FINAL_REPORT_PROMPT`, before any format instructions. Default requirements are now explicitly labelled as fallbacks. *(fixed: 2026-06-12)*
- **Deep research: `_classify_category` returns `None` for "general" category** — When the classifier answered "general", the method returned `None` (because `"general" not in CATEGORY_PROMPTS`). Changed to return `"general"` so `self.category` is always set. *(fixed: 2026-06-12)*
- **Deep research: `SYNTHESIZE_PROMPT` lacked template-awareness** — Synthesis prompt used essay-format language ("well-organized report with logical flow") and had no instruction to preserve user's custom output structure across rounds. Added template-preservation instruction. *(fixed: 2026-06-12)*
- **Deep research: `FINAL_REPORT_PROMPT` fallback instruction didn't require template compliance** — The "write from trained knowledge" instruction didn't tell the model to also apply the user's structural template. Extended to say "AND apply the structural template from the question above." *(fixed: 2026-06-12)*
- **Deep research: `STOP_PROMPT` didn't evaluate structural completeness** — Stop criteria only checked topical coverage, not whether the user's template requirements (entry count, per-entry sections) were met. Added structural completeness criteria. *(fixed: 2026-06-12)*
- **Deep research: `QUERY_GEN_PROMPT` domain example was Batman-specific** — Hardcoded "Batman" example didn't generalise to other subjects. Replaced with domain-agnostic `[character name]` example. *(fixed: 2026-06-12)*
- **Deep research: `_final_report` unreachable when synthesis fails** — When synthesis timed out, `report` stayed `""`, triggering early return via `_fallback_report` — bypassing `_final_report` entirely where the trained-knowledge fallback and template instructions live. Changed to format findings and pass them to `_final_report` instead of exiting early. *(fixed: 2026-06-12)*
- **Deep research: `_synthesize` timing out on long prompts** — Full 500+ word user prompt (with template instructions) was passed as `{question}` to every synthesis call, making prompts too large for `big-pickle` model within 180s timeout. Changed to pass `self.research_plan` (condensed summary, ~70% shorter) instead. *(fixed: 2026-06-12)*
- **Deep research: `_fallback_report` used full question as H1** — `_fallback_report` dumped the entire 500+ word prompt as the document's H1 heading. Changed to use only first sentence, truncated to 120 chars. *(fixed: 2026-06-12)*
- **Deep research: User's process instructions leaking into extractor** — `goal=question` passed the full user prompt (including "Your first task is discovery, not confirmation") into `EXTRACTOR_SYSTEM`, causing the extractor model to reason about the goal instead of extracting content. Changed to pass `self.research_plan or question[:200]` instead. *(fixed: 2026-06-12)*
- **Deep research: Thinking tags leaking into extraction findings** — Model output "Thinking. 1. Analyze the Request:" before JSON, not caught by `strip_thinking` (which handles `<think>` tags but not numbered reasoning format). Added "Do NOT include any reasoning... Output ONLY valid JSON" to `EXTRACTOR_SYSTEM`. *(fixed: 2026-06-12)*
---

## Session Log
| Date | Summary |
|------|---------|
| 2026-06-08 | Initial PROJECT_KNOWLEDGE.md created from code scan. Documented project structure, schema, all route files, env vars, systems, and features. |
| 2026-06-09 | Synced doc with the search provider registry refactor (commit 182bd15): documented `PROVIDER_REGISTRY`/`PROVIDER_FUNCTIONS`, the 4 new providers (Bing, Search1API, Firecrawl, Exa), dynamic `/api/search/providers` metadata, and new `*_api_key` settings. Uncommitted/in-progress: `research_handler.py` endpoint-probe timeout 15→60s & retries 1→2; `settings.js` hides result count when the active provider has no key. |
| 2026-06-09 | Q&A on search + deep research. Confirmed Exa is active (via stats `Search:` field). Documented how deep research works (pipeline + fixed `FINAL_REPORT_PROMPT` template + `research_max_tokens` cap) and why it ignores user output structure, search silent-fallback semantics + how to verify the used provider, and PDF capabilities (read/form-fill/browser-print only; no server-side text→PDF). Captured a 6-item Search & Deep Research improvement plan under Known Issues / TODOs. |
| 2026-06-09 | Added **Kimi (Moonshot)** as a first-class LLM provider (`slashCommands.js` setup + `providers.js`/`llm_core.py` endpoint labels; OpenAI-compatible, logo already present). Seeded **10 published starter skills** for owner `yahya` across productivity/research/memory/system via `SkillsManager` (files under `data/skills/`). Corrected the schema doc: skills are file-based `SKILL.md`, not a `skill_definitions` table; added the real `memories` table row. |
| 2026-06-11 | Completed Kimi integration by adding it to the UI provider dropdown (`index.html`) and bumping the service worker cache (`sw.js`). Synced the local `dev` branch with `upstream/dev` (bringing in 50+ commits) and resolved merge conflicts in `llm_core.py` and `slashCommands.js` to preserve both Kimi and upstream's NVIDIA providers. Pushed the resolved merge to `origin/dev`. |
| 2026-06-11 | **Avatar system**: chat bubbles now show username (instead of "You") via `window._currentUsername`. Added avatar element to user chat messages (initial letter or uploaded image). Click avatar in Settings > Account to upload (POST /api/upload → save file ID to /api/prefs/avatar_file_id). Avatar displays in sidebar, settings, and chat bubbles. Fixed FormData field name (`files`, not `file`) and response extraction (`data.files[0].id`). Replaced bare `showError`/`showToast` with `uiModule.` prefix. Added `has-avatar` class to hide `::before` dot. Existing chat bubbles refresh live after upload. |
| 2026-06-11 | **Navyseal theme**: new built-in theme `navyseal` (bg:#0a1628, fg:#b0cce8, panel:#0e1e36, border:#f0c800/YELLOW, red:#00bcd4/cyan). Default background pattern: aurora. |
| 2026-06-11 | **Neon glow toggle**: theme customize tab option to toggle pulsing box-shadow glow on all bordered elements (chat bubbles, input area, admin cards, modals, sidebar). Uses `body.neon-glow` class + `@keyframes neon-glow-pulse` animation on `--border` color. Saved in theme state alongside frosted. |
| 2026-06-11 | **6 new canvas background animations**: Aurora (slow-moving light curtains), Matrix Rain (falling katakana characters), Waves (undulating sine waves), Nebula (8 swirling gas blobs with HSL colors), Ripples (expanding concentric rings), Hex Grid (pulsing hexagons with staggered breathing). Registered in theme pattern system (`_BG_CLASSES`, `_CANVAS_PATTERNS`, dropdown options, canvas cleanup selector). Fixed hex grid row count (used `H/h` instead of `H/spacingY`) and added negative offset for full coverage. Increased hex visibility with fill+stroke and wider alpha/size pulse range. |
| 2026-06-11 | **RSS Feed Reader ("SmartRSS")**: New feature — 3-pane RSS reader with feed list sidebar, article list, and reader view. DB models: `FeedGroup`, `Feed`, `Article`, `FeedSyncAccount`. Backend: `services/feed/` (fetcher, discovery, OPML, full-content, YouTube resolver) + `routes/feed_routes.py` (full CRUD, articles, refresh, summarize, OPML). Frontend: `static/js/feedReader.js` + `.rss-*` CSS in `style.css`. Wired into `app.py`, `app.js`, `index.html` (nav rail + sidebar). YouTube channel URL resolution via `services/feed/youtube.py`. Window drag/snap/fullscreen via `makeWindowDraggable`. **Fixes**: CSP `img-src` missing `https:` blocked YouTube thumbnails/favicon → added `https:`; delete button added to feed items (always visible, right side); thumbnails switched from `<img>` to `background-image` for reliability. |
| 2026-06-11 | **YouTube video playback**: Replaced embed iframe approach (Error 153) with in-page modal overlay. Clicking ▶ opens a dark modal with YouTube embed + "Watch on YouTube" fallback link below. Embed still gives Error 153 for some videos — fallback link works (opens YouTube directly, counts views). Removed `window.open` popup approach (browser opens tab instead of popup). Added modal CSS, `_openVideoModal()` / `_closeVideoModal()` functions, event listeners for close button/backdrop/Escape. |
| 2026-06-12 | **Deep Research bugfix session**: Fixed 11 bugs across `deep_research.py` and `goal_based_extractor.py` identified through 3 audit iterations. Root causes: (1) `FINAL_REPORT_PROMPT` template override buried beneath essay defaults → moved STRUCTURE CHECK to top; (2) `_final_report` unreachable when synthesis fails → route findings through `_final_report` instead of early-exit via `_fallback_report`; (3) `_synthesize` timing out on full 500+ word prompt → pass condensed `research_plan` instead; (4) extractor reading user's process instructions as self-instructions → pass `research_plan` instead of full prompt as `goal`; (5) thinking tags leaking into extraction → "Output ONLY valid JSON" instruction; (6) `_classify_category` returning `None` for "general" → default to `"general"`. Also: expanded `_classify_category` prompt with per-category descriptions + examples; added domain-instruction to `QUERY_GEN_PROMPT`; added "General" category button to research panel (`panel.js`). All fixes verified against audit findings v1–v3. |
