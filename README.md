# ParticipantAIAsistant

AI assistant that resolves loyalty‑program **participants' queries**. It combines
a participant's live data from the Whistle / WeWhistle loyalty platform
(**Users, Badges, Recognition, Budgets**) with a curated knowledge base about the
program's features — **Recognition, Product Claims, and Learn & Earn**, plus
**points, badges and cash** rewards — using a **RAG (retrieval‑augmented
generation) + LLM** pipeline.

## What it does

A participant can ask things like:

- *"How do I claim a product with my points?"*
- *"How many points do I have and what badges have I earned?"*
- *"How does Learn & Earn work?"*
- *"How much recognition budget do I have left?"*

The assistant retrieves the most relevant knowledge‑base passages, optionally
pulls the participant's live account data from the loyalty API, and asks an LLM
to answer **grounded only in that context** (with source citations).

## Architecture

```
                ┌─────────────────────────────────────────────┐
   Question ──▶ │              ParticipantAssistant            │
   (+ id)       │                                             │
                │  1. WhistleClient  ── live participant data  │──▶ Whistle API
                │     (users/badges/recognition/budgets)       │   (env‑configured)
                │  2. Retriever (RAG) ── relevant KB passages  │──▶ data/knowledge_base
                │  3. LLMProvider ── grounded answer           │──▶ OpenAI‑compatible API
                └─────────────────────────────────────────────┘
                                     │
                                     ▼
                          Answer + cited sources
```

| Module | Responsibility |
| --- | --- |
| `participant_assistant/config.py` | Settings loaded from environment / `.env` (no committed secrets). |
| `participant_assistant/whistle_client.py` | REST client for Users, Badges, Recognition, Budgets (token or username/password auth). |
| `participant_assistant/rag/` | Knowledge‑base loading/chunking + dependency‑free TF‑IDF retriever. |
| `participant_assistant/llm/` | LLM provider abstraction: `openai` (OpenAI‑compatible) or `echo` (offline mock). |
| `participant_assistant/assistant.py` | Orchestrates live data + retrieval + LLM into a grounded answer. |
| `participant_assistant/cli.py` | Command‑line interface (single question or interactive). |
| `data/knowledge_base/` | Markdown knowledge for Recognition, Product Claims, Learn & Earn, Budgets, Points/Badges/Cash. |

## Quick start

```bash
# 1. Install dependencies
pip install -r requirements.txt          # runtime
pip install -r requirements-dev.txt      # + tests

# 2. Configure (copy and edit; NEVER commit a real .env)
cp .env.example .env

# 3. Ask a question (offline mock LLM, no external services needed)
LLM_PROVIDER=echo python -m participant_assistant.cli -q "How do I claim a product?"

# 4. With live participant data + a real LLM (after configuring .env)
python -m participant_assistant.cli -p <participant_id> -q "How many points do I have?"
```

## Configuration

All configuration — **including credentials** — is read from environment
variables (optionally from a local `.env`). See [`.env.example`](.env.example).

| Variable | Purpose |
| --- | --- |
| `WHISTLE_BASE_URL` | Loyalty API base URL (e.g. `https://test.wewhistle.com`). |
| `WHISTLE_API_TOKEN` *or* `WHISTLE_USERNAME` / `WHISTLE_PASSWORD` | Authentication. A token is used directly; username/password is exchanged for a token at runtime. |
| `LLM_PROVIDER` | `openai` (OpenAI‑compatible API) or `echo` (offline mock). |
| `OPENAI_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` | LLM settings (used when `LLM_PROVIDER=openai`). |
| `KNOWLEDGE_BASE_DIR`, `RAG_TOP_K` | RAG knowledge directory and number of passages retrieved. |

> **Security:** Credentials are **never** hard‑coded or committed. `.env` is
> git‑ignored. Provide secrets only through the environment / secret manager of
> your deployment. (The credentials mentioned in the original request must be
> supplied at runtime via the environment — they are intentionally not stored in
> this repository.)

## Connecting to the live Whistle API

The client targets these resource groups (paths are centralised in
`WhistleEndpoints` and can be overridden per tenant):

| Resource | Methods |
| --- | --- |
| Users | `get_users()`, `get_user(id)` |
| Badges | `get_badges()`, `get_user_badges(id)` |
| Recognition | `get_recognition()`, `get_user_recognition(id)` |
| Budgets | `get_budgets()`, `get_user_budgets(id)` |

Because the live tenant's exact request/response shapes are authoritative,
confirm the endpoint paths and field names against the platform's API
documentation and adjust `WhistleEndpoints` / `_format_participant` if needed.
The response normalisers already handle common list envelopes
(`data` / `results` / `items`) and token shapes (`token` / `access_token` /
`jwt`).

## Testing

```bash
python -m pytest
```

The suite is fully **offline**: the Whistle API and LLM HTTP calls are mocked,
and retrieval uses a dependency‑free TF‑IDF store, so no network access or API
keys are required to run the tests.

## Extending

- **Better embeddings:** swap `TfidfVectorStore` for an embedding‑backed store
  (it implements the same `add` / `search` interface) without changing the
  retriever or assistant.
- **More LLMs:** add a subclass of `LLMProvider` and register it in
  `build_provider`.
- **More knowledge:** drop additional `.md`/`.txt` files into
  `data/knowledge_base/`.
