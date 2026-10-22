"""Upload path helpers must validate ids without relying on route callers."""
import uuid

import pytest
from fastapi import HTTPException

from routes.upload_routes import _vision_cache_filename


def test_vision_cache_filename_accepts_canonical_id():
    file_id = uuid.uuid4().hex + ".png"
    assert _vision_cache_filename(file_id) == f"{file_id}.txt"


@pytest.mark.parametrize(
    "file_id",
    [
        "../escape",
        "..",
        "/etc/passwd",
        uuid.uuid4().hex + "/../escape",
        uuid.uuid4().hex + ".tar.gz",
        "",
    ],
)
def test_vision_cache_filename_rejects_noncanonical_id(file_id):
    with pytest.raises(HTTPException) as exc:
        _vision_cache_filename(file_id)
    assert exc.value.status_code == 400
