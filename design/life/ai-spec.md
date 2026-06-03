# AI — Spec
Last updated: 2026-04-27

---

## Overview

nTogether supports AI assistance throughout the platform — for journal prompts, LENS natural-language queries, CONTACTS smart suggestions, smart trigger condition building, and more. The user chooses where AI runs: **locally on their device** (private, offline-capable) or **via a cloud provider of their choosing** (more capable, requires API key).

Privacy tier directly governs which AI modes are available:

| Tier | Local AI | Cloud AI |
|------|----------|----------|
| T1 — Maximum Privacy | ✅ | ❌ |
| T2 — Private | ✅ | ❌ |
| T3 — Balanced | ✅ | ✅ (user opt-in) |
| T4 — Connected | ✅ | ✅ |
| T5 — Free | ✅ | ✅ |

No prompt or response ever leaves the device at T1–T2 regardless of configuration.

---

## Local AI

Local AI runs entirely on the user's device. No data is sent anywhere. Works offline.

### Engine: Ollama

nTogether ships with first-class [Ollama](https://ollama.com) integration. Ollama is an open-source local LLM runtime that runs quantized models on consumer hardware (Mac, Windows, Linux; iOS/Android via companion app).

**Setup flow:**
1. User opens AI Settings → Local AI tab
2. If Ollama is not detected, a one-click installer is offered (downloads Ollama for the current OS)
3. User selects a model from the recommended list (or enters a custom model name)
4. nTogether tests the connection and confirms the model is ready
5. Local AI is active — all AI features now route through Ollama by default

**Recommended models (curated for speed and quality on consumer hardware):**

| Model | Size | Best for | RAM required |
|-------|------|----------|-------------|
| **Llama 3.2 3B** | ~2 GB | Fast responses, always-on prompts, mobile | 4 GB |
| **Llama 3.1 8B** | ~5 GB | General purpose, journal, LENS queries | 8 GB |
| **Mistral 7B** | ~4.5 GB | Instruction following, smart suggestions | 8 GB |
| **Phi-3 Mini** | ~2.5 GB | Ultra-fast, low-power devices | 4 GB |
| **Gemma 2 9B** | ~6 GB | High quality, longer context | 12 GB |
| **Qwen2.5 7B** | ~5 GB | Multilingual, strong reasoning | 8 GB |
| Custom | — | User enters any Ollama-compatible model tag | — |

The recommended model for **mobile** (iOS/Android) is Phi-3 Mini or Llama 3.2 3B — fast, low-memory, runs on modern smartphones with Metal/NNAPI acceleration.

**Mobile:** On iOS and Android, local AI requires the Ollama companion app (or future direct integration with Core ML / llama.cpp). nTogether detects whether a local model is available and gracefully degrades to cloud if local is unavailable and the user permits it.

---

## Cloud AI

Cloud AI sends prompts to an external provider using an API key the user supplies. nTogether never stores or proxies the key — it is held in the device's secure keychain and sent directly from the device to the provider's API.

### Supported providers

| Provider | Models available | Notes |
|----------|-----------------|-------|
| **Anthropic** | Claude Sonnet 4, Claude Haiku 4.5 | Recommended default for quality |
| **OpenAI** | GPT-4o, GPT-4o Mini, o1 Mini | Widely available |
| **Google** | Gemini 1.5 Pro, Gemini 1.5 Flash | Strong multimodal (receipt OCR) |
| **Mistral AI** | Mistral Large, Mistral Small | European privacy compliance |
| **Groq** | Llama 3.1 70B (cloud-accelerated) | Very fast inference |
| **Custom / self-hosted** | Any OpenAI-compatible endpoint | For self-hosted vLLM, LM Studio, etc. |

**Adding a provider:**
1. AI Settings → Cloud AI → Add Provider
2. Select provider from list or enter a custom base URL
3. Paste API key (stored in system keychain, never in app database)
4. Select preferred model
5. Test connection → save

Multiple providers can be configured. The user sets a default and can switch per-session or per-feature.

---

## AI features by app

| App | Feature | Prompt type |
|-----|---------|-------------|
| **Journal** | Daily prompt generation | Generates 3 tailored morning/nightly prompts based on recent entries, current schedule, and mood history |
| **Journal** | Entry summary | Summarizes a long journal entry into a 2-sentence reflection |
| **Journal** | Mood inference | Infers mood tags from free-text entry (optional, user confirms) |
| **LENS** | Natural language query | Translates plain English into SQL against the user's LIFE data schema |
| **LENS** | Chart narration | Describes what a chart or trend is showing in plain language |
| **CONTACTS** | Smart suggestions | Suggests follow-up actions for contacts with overdue follow-up dates |
| **CONTACTS** | Context notes | Drafts a short "how we met" note based on calendar events that include the contact |
| **Scheduler** | Smart scheduling | Suggests optimal times for a new event based on energy patterns in past data |
| **Research** | Note summarization | Summarizes a research note or cluster of linked notes |
| **Research** | Connection suggestions | Surfaces potentially linked notes the user hasn't manually connected |
| **TRIGGERS** | Condition builder | Translates natural language ("remind me when I'm near the gym and I have free time") into a trigger condition bundle |
| **ACHIEVEMENTS** | Goal suggestions | Suggests goal templates based on the user's recent LENS data patterns |
| **Financial** | Receipt OCR | Extracts merchant, date, and line items from a receipt photo (uses vision-capable model) |
| **Around Town** | Venue notes | Drafts a quick note for a new venue entry based on the user's typed description |

---

## Context sent to AI

The AI always operates on the **minimum necessary context**. No raw personal data is sent unless the user explicitly includes it.

| Feature | Context included | Context excluded |
|---------|-----------------|-----------------|
| Journal prompts | Day of week, recent mood tags (anonymized), schedule summary (event types only, no names) | Event titles, contact names, note contents |
| LENS query | The user's LIFE data **schema** (column names and types only) + the user's natural-language question | Actual data rows |
| LENS narration | The chart data being displayed (aggregated, not raw rows) | Raw event log entries |
| Receipt OCR | The photo only | Financial account data |
| Trigger builder | The user's natural-language description + list of available condition types | Existing trigger configurations, personal saved places |

For **cloud AI**, the user sees a disclosure before the first prompt explaining what context will be sent. They can review and edit the context before it is submitted.

---

## Privacy controls

- **Prompt review mode** — user can enable a mode where every AI prompt is shown for review before sending. Available for both local and cloud.
- **Cloud AI off switch** — a single toggle in AI Settings disables all cloud AI immediately, even if keys are configured.
- **Audit log** — a local log of all AI calls: timestamp, feature, model used, context hash (not content), response length. Never leaves the device.
- **No training** — nTogether never sends data to any provider for training. All API calls use provider options that opt out of training where available (e.g. `X-Train: false` headers, OpenAI's no-training endpoint).

---

## AI settings schema

```sql
CREATE TABLE ai_config (
  id             TEXT PRIMARY KEY DEFAULT 'singleton',
  local_enabled  INTEGER DEFAULT 1,
  local_model    TEXT DEFAULT 'llama3.2:3b',
  ollama_url     TEXT DEFAULT 'http://localhost:11434',
  cloud_enabled  INTEGER DEFAULT 0,
  default_provider TEXT,          -- 'anthropic' | 'openai' | 'google' | 'mistral' | 'groq' | 'custom'
  prompt_review  INTEGER DEFAULT 0,
  audit_log      INTEGER DEFAULT 1,
  updated_at     TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE ai_providers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  base_url     TEXT NOT NULL,
  model        TEXT NOT NULL,
  -- API key stored in system keychain under key: 'ntogether.ai.<id>'
  -- Never stored in SQLite
  is_default   INTEGER DEFAULT 0,
  enabled      INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE ai_audit_log (
  id           TEXT PRIMARY KEY,
  feature      TEXT NOT NULL,    -- 'journal_prompt' | 'lens_query' | 'receipt_ocr' | etc.
  provider     TEXT NOT NULL,    -- 'local' | provider id
  model        TEXT NOT NULL,
  context_hash TEXT,             -- SHA-256 of context, not the context itself
  response_len INTEGER,
  latency_ms   INTEGER,
  created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

---

## Open items

- Whether local AI on mobile requires a separate Ollama companion app or can run inline via llama.cpp compiled into the Expo native module
- Model update delivery — how users get notified when better models are available without nTogether needing to ship an app update
- Whether vision-capable local models (for receipt OCR) are practical on mobile hardware at acceptable speed
- Cost display for cloud AI — showing estimated token cost per feature use so users aren't surprised by API bills
- Whether a shared nTogether-hosted AI endpoint is offered at higher privacy tiers as a convenience option (user opts in, still no data logging)
