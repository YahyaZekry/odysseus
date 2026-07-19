# Stack

> Part of odysseus/.project-knowledge/ | Last updated: 2026-06-25

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

## Environment Variables

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
