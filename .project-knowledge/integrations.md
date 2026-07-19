# External Integrations & Data Contracts

> Part of odysseus/.project-knowledge/ | Last updated: 2026-06-25
> Document exact field contracts — never guess the shape.

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
