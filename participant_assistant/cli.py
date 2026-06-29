"""Command-line interface for the participant assistant.

Examples
--------
    python -m participant_assistant.cli --question "How do I claim a product?"
    python -m participant_assistant.cli -p 12345 -q "How many points do I have?"
    python -m participant_assistant.cli   # interactive mode
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional

from .assistant import ParticipantAssistant
from .config import load_settings


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="participant_assistant",
        description="AI assistant for loyalty-program participants (RAG + LLM).",
    )
    parser.add_argument("-q", "--question", help="A single question to ask, then exit.")
    parser.add_argument(
        "-p",
        "--participant-id",
        dest="participant_id",
        help="Participant/user id to load live account context for.",
    )
    return parser


def _answer_once(assistant: ParticipantAssistant, question: str, participant_id: Optional[str]) -> None:
    result = assistant.ask(question, participant_id=participant_id)
    print(result.answer)
    if result.sources:
        print("\nSources: " + ", ".join(result.sources))


def main(argv: Optional[list] = None) -> int:
    args = _build_parser().parse_args(argv)
    settings = load_settings()
    assistant = ParticipantAssistant(settings)

    if args.question:
        _answer_once(assistant, args.question, args.participant_id)
        return 0

    print("Participant AI Assistant — type 'exit' to quit.")
    while True:
        try:
            question = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if question.lower() in {"exit", "quit"}:
            break
        if not question:
            continue
        _answer_once(assistant, question, args.participant_id)
    return 0


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
