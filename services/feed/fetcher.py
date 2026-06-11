import logging
import hashlib
import feedparser
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

_HTTP_HEADERS = {
    "User-Agent": "Odysseus/1.0 RSS Reader",
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
}


def fetch_feed(feed_url: str, timeout: int = 30) -> Optional[dict]:
    try:
        parsed = feedparser.parse(feed_url, agent=_HTTP_HEADERS["User-Agent"])
        if parsed.bozo and not parsed.entries:
            logger.warning("Bozo feed %s: %s", feed_url, parsed.bozo_exception)
            return None

        feed_meta = parsed.feed
        entries = []
        for entry in parsed.entries:
            published = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)

            content = ""
            if hasattr(entry, "content") and entry.content:
                content = entry.content[0].get("value", "")
            elif hasattr(entry, "summary"):
                content = entry.summary or ""

            link = ""
            if hasattr(entry, "link"):
                link = entry.link or ""
            elif hasattr(entry, "links") and entry.links:
                link = entry.links[0].get("href", "")

            guid = entry.get("id", hashlib.md5(link.encode()).hexdigest())

            image = ""
            if hasattr(entry, "media_content"):
                for mc in entry.media_content:
                    if mc.get("medium") == "image" or mc.get("type", "").startswith("image"):
                        image = mc["url"]
                        break
            if not image and hasattr(entry, "media_thumbnail"):
                for mt in entry.media_thumbnail:
                    image = mt.get("url", "")
                    break

            entries.append({
                "guid": guid,
                "title": entry.get("title", ""),
                "url": link,
                "author": entry.get("author") or "",
                "content": content,
                "image": image,
                "published_at": published.isoformat() if published else None,
            })

        feed_title = feed_meta.get("title", "")
        site_url = ""
        if hasattr(feed_meta, "link"):
            site_url = feed_meta.link or ""
        icon = ""
        if hasattr(feed_meta, "icon"):
            icon = feed_meta.icon or ""
        elif hasattr(feed_meta, "logo"):
            icon = feed_meta.logo or ""

        return {
            "title": feed_title,
            "site_url": site_url,
            "icon": icon,
            "entries": entries,
        }
    except Exception as e:
        logger.error("Failed to fetch feed %s: %s", feed_url, e)
        return None
