import logging
from xml.etree import ElementTree as ET
from typing import Optional

logger = logging.getLogger(__name__)

OPML_NS = "http://opml.org/spec2"


def parse_opml(opml_content: str) -> list[dict]:
    feeds = []
    try:
        root = ET.fromstring(opml_content)
        body = root.find("body")
        if body is None:
            return feeds

        def _recurse(parent, group_name=""):
            for outline in parent.findall("outline"):
                attrs = outline.attrib
                feed_url = attrs.get("xmlUrl") or attrs.get("url", "")
                if feed_url:
                    feeds.append({
                        "feed_url": feed_url,
                        "title": attrs.get("text") or attrs.get("title", ""),
                        "site_url": attrs.get("htmlUrl") or attrs.get("siteUrl", ""),
                        "group": group_name,
                    })
                child_group = attrs.get("text", group_name) if not feed_url else group_name
                _recurse(outline, child_group)

        _recurse(body)
    except ET.ParseError as e:
        logger.warning("OPML parse error: %s", e)
    return feeds


def generate_opml(feeds: list[dict]) -> str:
    root = ET.Element("opml", version="2.0")
    head = ET.SubElement(root, "head")
    title = ET.SubElement(head, "title")
    title.text = "Odysseus Feeds"
    body = ET.SubElement(root, "body")

    groups = {}
    for feed in feeds:
        grp = feed.get("group", "") or ""
        groups.setdefault(grp, []).append(feed)

    for group_name, group_feeds in groups.items():
        parent = body
        if group_name:
            parent = ET.SubElement(body, "outline", text=group_name, title=group_name)
        for f in group_feeds:
            ET.SubElement(parent, "outline", type="rss",
                          text=f.get("title", ""),
                          title=f.get("title", ""),
                          xmlUrl=f.get("feed_url", ""),
                          htmlUrl=f.get("site_url", ""))

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode")
