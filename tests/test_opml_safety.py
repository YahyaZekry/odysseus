"""OPML imports must not expand attacker-controlled XML entities."""

from services.feed.opml import parse_opml


def test_parse_opml_rejects_entity_expansion():
    bomb = """<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
]>
<opml version="2.0"><body><outline text="&lol3;"/></body></opml>
"""
    assert parse_opml(bomb) == []


def test_parse_opml_collects_nested_feeds():
    doc = """<?xml version="1.0"?>
<opml version="2.0"><body>
  <outline text="Tech" title="Tech">
    <outline type="rss" text="HN" xmlUrl="https://example.com/rss" htmlUrl="https://example.com"/>
  </outline>
</body></opml>
"""
    assert parse_opml(doc) == [{
        "feed_url": "https://example.com/rss",
        "title": "HN",
        "site_url": "https://example.com",
        "group_path": ["Tech"],
    }]
