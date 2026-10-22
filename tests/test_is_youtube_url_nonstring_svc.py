from services.youtube.youtube_handler import is_youtube_url


def test_is_youtube_url_handles_non_string():
    # `"youtube.com" in url` raises TypeError on a non-string url.
    assert is_youtube_url(123) is False
    assert is_youtube_url(None) is False
    assert is_youtube_url(["https://youtu.be/x"]) is False


def test_is_youtube_url_detects_real_urls():
    assert is_youtube_url("https://www.youtube.com/watch?v=x") is True
    assert is_youtube_url("https://youtu.be/x") is True
    assert is_youtube_url("youtube.com/watch?v=x") is True


def test_is_youtube_url_rejects_lookalike_hosts():
    assert is_youtube_url("https://youtube.com.evil.example/watch?v=x") is False
    assert is_youtube_url("https://evil.example/?u=youtube.com") is False
    assert is_youtube_url("https://evil.example/youtu.be/x") is False
