"""LLM provider abstraction.

Two providers are bundled:

* :class:`OpenAIProvider` — calls an OpenAI-compatible ``/chat/completions``
  endpoint (works with OpenAI and Azure/OpenAI-compatible gateways).
* :class:`EchoProvider` — a fully offline, deterministic provider used for
  local development and tests. It produces a grounded, extractive answer from
  the supplied context so the end-to-end RAG flow can be exercised without any
  external LLM API.
"""

from __future__ import annotations

import abc
from dataclasses import dataclass
from typing import List, Optional

import requests

from ..config import Settings


@dataclass
class Message:
    role: str  # "system" | "user" | "assistant"
    content: str


class LLMProvider(abc.ABC):
    """Common interface for chat-completion style LLMs."""

    @abc.abstractmethod
    def complete(self, messages: List[Message]) -> str:
        """Return the assistant's reply for the given conversation."""


class EchoProvider(LLMProvider):
    """Offline provider that returns a grounded answer from the prompt context.

    It does not invent facts: it surfaces the most relevant lines from the
    provided context that overlap with the user's question, which keeps the
    full pipeline testable and deterministic without network access.
    """

    def complete(self, messages: List[Message]) -> str:
        user = next((m for m in reversed(messages) if m.role == "user"), None)
        system_msgs = [m for m in messages if m.role == "system"]
        if user is None:
            return "I need a question to help you."

        question = user.content
        # The last system message carries the retrieved context.
        context = system_msgs[-1].content if system_msgs else ""
        relevant = _select_relevant_lines(question, context)
        if not relevant:
            return (
                "I don't have enough information in the knowledge base or your "
                "account data to answer that yet."
            )
        body = "\n".join(f"- {line}" for line in relevant)
        return f"Based on the available information:\n{body}"


class OpenAIProvider(LLMProvider):
    """Calls an OpenAI-compatible chat-completions endpoint."""

    def __init__(self, settings: Settings, session: Optional[requests.Session] = None) -> None:
        if not settings.openai_api_key:
            raise ValueError(
                "OPENAI_API_KEY is required when LLM_PROVIDER=openai."
            )
        self.settings = settings
        self.session = session or requests.Session()

    def complete(self, messages: List[Message]) -> str:
        url = self.settings.llm_base_url.rstrip("/") + "/chat/completions"
        payload = {
            "model": self.settings.llm_model,
            "temperature": self.settings.llm_temperature,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
        }
        headers = {
            "Authorization": "Bearer " + self.settings.openai_api_key,
            "Content-Type": "application/json",
        }
        response = self.session.post(
            url, json=payload, headers=headers, timeout=self.settings.llm_timeout_seconds
        )
        if response.status_code >= 400:
            raise RuntimeError(
                f"LLM request failed ({response.status_code}): {response.text[:500]}"
            )
        data = response.json()
        return data["choices"][0]["message"]["content"]


def build_provider(settings: Settings) -> LLMProvider:
    provider = (settings.llm_provider or "echo").lower()
    if provider == "openai":
        return OpenAIProvider(settings)
    if provider == "echo":
        return EchoProvider()
    raise ValueError(f"Unknown LLM provider: {settings.llm_provider!r}")


def _select_relevant_lines(question: str, context: str, limit: int = 6) -> List[str]:
    import re

    def tokens(text: str) -> set:
        return set(re.findall(r"[a-z0-9]+", text.lower()))

    q_tokens = tokens(question)
    scored = []
    for raw in context.splitlines():
        line = raw.strip("-* \t")
        if len(line) < 8:
            continue
        overlap = len(q_tokens & tokens(line))
        if overlap:
            scored.append((overlap, line))
    scored.sort(key=lambda item: item[0], reverse=True)
    seen = set()
    result = []
    for _, line in scored:
        if line in seen:
            continue
        seen.add(line)
        result.append(line)
        if len(result) >= limit:
            break
    return result
