"""Real-time "new mail" push.

A background loop polls each enabled email account's IMAP UIDNEXT every
~10s (see _email_notify_loop) and, when it changes, fans a tiny event out
to every connected browser tab for that account's owner over SSE. The
event carries no message content -- it's just a nudge telling the
frontend to re-run its existing unread-state/folder-list fetches right
now instead of waiting for the next slow poll. That keeps this module
free of any email-parsing duplication; routes/email_routes.py remains the
only place that reads/caches actual message data.

In-memory only, mirrors src/agent_runs.py's subscriber-set pattern: one
asyncio.Queue per connected client, keyed by owner. Does not survive a
server restart, which is fine -- a reconnecting client just resumes
getting nudges from that point on.
"""
import asyncio
import json
import logging
from typing import AsyncGenerator, Dict, Set

logger = logging.getLogger(__name__)

_subscribers: Dict[str, Set[asyncio.Queue]] = {}

POLL_INTERVAL_S = 10.0
HEARTBEAT_TIMEOUT_S = 15.0


def _key(owner: str) -> str:
    return owner or ""


def publish(owner: str, event: dict) -> None:
    """Fan an event out to every connected client for this owner. No-op if
    nobody is listening (no subscribers dict entry)."""
    queues = _subscribers.get(_key(owner))
    if not queues:
        return
    for q in list(queues):
        try:
            q.put_nowait(event)
        except Exception:
            pass


async def subscribe(owner: str) -> AsyncGenerator[str, None]:
    """SSE generator for one connected client. Yields `data: {...}\\n\\n` on
    each event, `: heartbeat\\n\\n` comment frames while idle (keeps
    proxies/browsers from timing the connection out)."""
    key = _key(owner)
    q: asyncio.Queue = asyncio.Queue()
    _subscribers.setdefault(key, set()).add(q)
    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=HEARTBEAT_TIMEOUT_S)
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
                continue
            yield f"data: {json.dumps(event)}\n\n"
    finally:
        subs = _subscribers.get(key)
        if subs is not None:
            subs.discard(q)
            if not subs:
                _subscribers.pop(key, None)


def _check_account_uidnext(account_id: str, owner: str) -> int | None:
    """Blocking IMAP STATUS check -- run via asyncio.to_thread. Returns the
    mailbox's UIDNEXT (the UID that will be assigned to the next arriving
    message), or None on any failure (account misconfigured, host
    unreachable, etc. -- logged at debug, never raised, so one bad account
    never stops the loop from checking the rest)."""
    import re
    from routes.email_helpers import _imap

    try:
        with _imap(account_id, owner=owner) as conn:
            typ, data = conn.status("INBOX", "(UIDNEXT)")
            if typ != "OK" or not data or not data[0]:
                return None
            raw = data[0].decode("utf-8", errors="replace") if isinstance(data[0], bytes) else str(data[0])
            m = re.search(r"UIDNEXT\s+(\d+)", raw)
            return int(m.group(1)) if m else None
    except Exception as e:
        logger.debug(f"[email-notify] UIDNEXT check failed for account {account_id}: {e}")
        return None


async def _email_notify_loop() -> None:
    """Started once at app startup (see app.py). Runs forever."""
    from core.database import SessionLocal, EmailAccount

    last_uidnext: Dict[tuple, int] = {}
    while True:
        await asyncio.sleep(POLL_INTERVAL_S)
        try:
            db = SessionLocal()
            try:
                accounts = [
                    (row.id, row.owner or "")
                    for row in db.query(EmailAccount).filter(EmailAccount.enabled == True).all()  # noqa: E712
                ]
            finally:
                db.close()
        except Exception as e:
            logger.warning(f"[email-notify] account list query failed: {e}")
            continue

        for account_id, owner in accounts:
            key = (owner, account_id)
            try:
                uidnext = await asyncio.to_thread(_check_account_uidnext, account_id, owner)
            except Exception as e:
                logger.debug(f"[email-notify] check errored for {account_id}: {e}")
                continue
            if uidnext is None:
                continue
            prev = last_uidnext.get(key)
            last_uidnext[key] = uidnext
            # Skip the very first observation per account (nothing to compare
            # against yet -- would otherwise fire a spurious "new mail" burst
            # for every account right after every server restart).
            if prev is not None and uidnext > prev:
                publish(owner, {"type": "new_mail", "account_id": account_id, "folder": "INBOX"})
