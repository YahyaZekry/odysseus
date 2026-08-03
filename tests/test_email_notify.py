"""Real-time new-mail push (src/email_notify.py).

Covers the in-memory pub/sub broker (owner isolation, cleanup on
disconnect) and the UIDNEXT parsing used by the background poll loop to
detect new mail. No live IMAP/network needed — the broker is pure asyncio,
and the IMAP piece is tested against a fake connection whose `status()`
returns the same shape imaplib does.
"""
import asyncio
from contextlib import contextmanager

import pytest

from src import email_notify


@pytest.mark.asyncio
async def test_publish_reaches_only_the_same_owner():
    gen = email_notify.subscribe("alice")
    task = asyncio.ensure_future(gen.__anext__())
    await asyncio.sleep(0.02)

    email_notify.publish("alice", {"type": "new_mail", "account_id": "a1"})
    result = await asyncio.wait_for(task, timeout=1)
    assert result == 'data: {"type": "new_mail", "account_id": "a1"}\n\n'

    email_notify.publish("bob", {"type": "new_mail", "account_id": "a2"})
    task2 = asyncio.ensure_future(gen.__anext__())
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(task2, timeout=0.2)
    task2.cancel()
    await gen.aclose()


@pytest.mark.asyncio
async def test_publish_with_no_subscribers_is_a_noop():
    # Must not raise even though nobody is listening for this owner.
    email_notify.publish("nobody-here", {"type": "new_mail"})


@pytest.mark.asyncio
async def test_subscriber_cleaned_up_on_disconnect():
    gen = email_notify.subscribe("carol")
    task = asyncio.ensure_future(gen.__anext__())
    await asyncio.sleep(0.02)
    assert "carol" in email_notify._subscribers
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    await gen.aclose()
    assert "carol" not in email_notify._subscribers


@pytest.mark.asyncio
async def test_two_subscribers_same_owner_both_get_the_event():
    gen1 = email_notify.subscribe("dave")
    gen2 = email_notify.subscribe("dave")
    t1 = asyncio.ensure_future(gen1.__anext__())
    t2 = asyncio.ensure_future(gen2.__anext__())
    await asyncio.sleep(0.02)

    email_notify.publish("dave", {"type": "new_mail"})
    r1 = await asyncio.wait_for(t1, timeout=1)
    r2 = await asyncio.wait_for(t2, timeout=1)
    assert r1 == r2
    await gen1.aclose()
    await gen2.aclose()


class _FakeStatusConn:
    """Mimics imaplib's .status() return shape for STATUS INBOX (UIDNEXT)."""
    def __init__(self, uidnext=None, ok=True):
        self._uidnext = uidnext
        self._ok = ok

    def status(self, mailbox, items):
        if not self._ok:
            return ("NO", [None])
        raw = f'"{mailbox}" (UIDNEXT {self._uidnext})'.encode()
        return ("OK", [raw])


def test_check_account_uidnext_parses_status_response(monkeypatch):
    @contextmanager
    def fake_imap(account_id, owner=""):
        yield _FakeStatusConn(uidnext=4827)

    monkeypatch.setattr("routes.email_helpers._imap", fake_imap)
    assert email_notify._check_account_uidnext("acc1", "alice") == 4827


def test_check_account_uidnext_returns_none_on_bad_status(monkeypatch):
    @contextmanager
    def fake_imap(account_id, owner=""):
        yield _FakeStatusConn(ok=False)

    monkeypatch.setattr("routes.email_helpers._imap", fake_imap)
    assert email_notify._check_account_uidnext("acc1", "alice") is None


def test_check_account_uidnext_returns_none_on_connect_failure(monkeypatch):
    @contextmanager
    def fake_imap(account_id, owner=""):
        raise OSError("connection refused")
        yield  # pragma: no cover

    monkeypatch.setattr("routes.email_helpers._imap", fake_imap)
    assert email_notify._check_account_uidnext("acc1", "alice") is None
