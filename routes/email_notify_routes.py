"""Real-time "new mail" push (see src/email_notify.py for the background
loop and pub/sub broker). This route just exposes it as SSE."""

import logging

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from src import email_notify
from src.auth_helpers import effective_user
from routes.email_helpers import require_user

logger = logging.getLogger(__name__)


def setup_email_notify_routes() -> APIRouter:
    router = APIRouter(tags=["email-notify"])

    @router.get("/api/email/notify/stream")
    async def notify_stream(request: Request):
        require_user(request)
        owner = effective_user(request) or ""
        return StreamingResponse(
            email_notify.subscribe(owner), media_type="text/event-stream"
        )

    return router
