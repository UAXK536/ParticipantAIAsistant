"""Shared test helpers: a fake ``requests``-like session."""

from __future__ import annotations

import json as jsonlib
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional, Tuple


@dataclass
class FakeResponse:
    status_code: int = 200
    _json: Any = None
    text: str = ""

    @property
    def content(self) -> bytes:
        return self.text.encode() if self.text else (b"{}" if self._json is not None else b"")

    def json(self) -> Any:
        if self._json is None:
            raise ValueError("no json")
        return self._json


@dataclass
class FakeSession:
    """Routes requests to registered handlers keyed by (METHOD, path)."""

    routes: Dict[Tuple[str, str], Callable[..., FakeResponse]] = field(default_factory=dict)
    calls: list = field(default_factory=list)

    def register(self, method: str, path: str, handler: Callable[..., FakeResponse]) -> None:
        self.routes[(method.upper(), path)] = handler

    def request(self, method: str, url: str, **kwargs: Any) -> FakeResponse:
        from urllib.parse import urlsplit

        path = urlsplit(url).path
        self.calls.append((method.upper(), path, kwargs))
        handler = self.routes.get((method.upper(), path))
        if handler is None:
            return FakeResponse(status_code=404, text=f"no route for {method} {path}")
        return handler(**kwargs)

    # OpenAIProvider uses .post directly
    def post(self, url: str, **kwargs: Any) -> FakeResponse:
        return self.request("POST", url, **kwargs)


def json_response(payload: Any, status_code: int = 200) -> FakeResponse:
    return FakeResponse(status_code=status_code, _json=payload, text=jsonlib.dumps(payload))
