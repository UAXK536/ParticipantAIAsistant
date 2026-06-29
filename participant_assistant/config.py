"""Application configuration.

All configuration — including secrets such as API credentials — is read from
environment variables (optionally seeded from a local ``.env`` file). Secrets
are never hard-coded or committed to source control.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


def _load_dotenv(path: str = ".env") -> None:
    """Minimal ``.env`` loader (no third-party dependency).

    Lines of the form ``KEY=VALUE`` are loaded into ``os.environ`` unless the
    variable is already set. Existing environment variables always win so that
    real deployments can override the file.
    """

    env_path = Path(path)
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _get_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    """Strongly-typed application settings."""

    # Whistle loyalty API
    whistle_base_url: str = "https://test.wewhistle.com"
    whistle_api_token: Optional[str] = None
    whistle_username: Optional[str] = None
    whistle_password: Optional[str] = None
    whistle_auth_path: str = "/api/auth/login"
    whistle_timeout_seconds: int = 30

    # LLM provider
    llm_provider: str = "echo"
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.2
    llm_timeout_seconds: int = 30
    openai_api_key: Optional[str] = None
    llm_base_url: str = "https://api.openai.com/v1"

    # RAG
    knowledge_base_dir: str = "data/knowledge_base"
    rag_top_k: int = 4

    @property
    def has_whistle_credentials(self) -> bool:
        return bool(self.whistle_api_token) or bool(
            self.whistle_username and self.whistle_password
        )


def load_settings(dotenv_path: str = ".env") -> Settings:
    """Build :class:`Settings` from the environment (and an optional .env)."""

    _load_dotenv(dotenv_path)

    def _get(name: str, default: Optional[str] = None) -> Optional[str]:
        value = os.environ.get(name)
        return value if value not in (None, "") else default

    return Settings(
        whistle_base_url=_get("WHISTLE_BASE_URL", "https://test.wewhistle.com"),
        whistle_api_token=_get("WHISTLE_API_TOKEN"),
        whistle_username=_get("WHISTLE_USERNAME"),
        whistle_password=_get("WHISTLE_PASSWORD"),
        whistle_auth_path=_get("WHISTLE_AUTH_PATH", "/api/auth/login"),
        whistle_timeout_seconds=int(_get("WHISTLE_TIMEOUT_SECONDS", "30")),
        llm_provider=_get("LLM_PROVIDER", "echo"),
        llm_model=_get("LLM_MODEL", "gpt-4o-mini"),
        llm_temperature=float(_get("LLM_TEMPERATURE", "0.2")),
        llm_timeout_seconds=int(_get("LLM_TIMEOUT_SECONDS", "30")),
        openai_api_key=_get("OPENAI_API_KEY"),
        llm_base_url=_get("LLM_BASE_URL", "https://api.openai.com/v1"),
        knowledge_base_dir=_get("KNOWLEDGE_BASE_DIR", "data/knowledge_base"),
        rag_top_k=int(_get("RAG_TOP_K", "4")),
    )
