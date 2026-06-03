# nTogether Platform — Design Analysis
Last updated: 2026-04-23

---

## Section 1: Issues Requiring Clarification

### Issue 1 — zk-STARKs are a proof system, not an encryption primitive

Throughout the design, zk-STARKs are used as a synonym for encryption ("E2E encrypted via zk-STARKs," "data encrypted via zk-STARKs"). zk-STARKs are a zero-knowledge *proof* system — you cannot encrypt data with them the way you use AES or RSA. What they actually do is let you prove statements about data without revealing the data. Actual encryption uses conventional cryptography (AES-256-GCM, X25519, Ed25519). zk-STARKs are genuinely useful in specific places: privacy coin transaction layer, data marketplace proofs, algorithm verification. If this conflation survives into engineering, the team will be asked to implement something technically impossible.

> **Resolution needed:** Should zk-STARKs be reserved for proof-generation scenarios only (coin, data marketplace, algorithm verification), with standard cryptography handling all encryption?

---

### Issue 2 — ENGINE, CONNECT, and Data Hub are three different things all called "hub"

ENGINE = ActivityPub/identity federation hub. CONNECT = public search and algorithm/data marketplace. Data Hub = personal data aggregation layer that powers all cross-app intelligence engines. The Data Hub does not have a clear app-level home. If it lives inside ENGINE, it overloads the auth service. If it lives inside CONNECT, a public-facing marketplace app now holds all personal behavioral data — which breaks zero-knowledge guarantees.

> **Resolution needed:** Is the personal Data Hub a component of LIFE, a component of DASH, or a standalone service separate from both ENGINE and CONNECT?

---

### Issue 3 — Per-persona tier isolation conflicts with cross-app data synergies

A user can run a Tier 1 persona and a Tier 5 persona simultaneously. The cross-app intelligence engines aggregate data across all apps. If both personas share the same Data Hub, the Tier 5 persona's fully-collected behavioral data co-exists with the Tier 1 persona's zero-knowledge-protected data — and any algorithm that runs across both can infer identity. Cross-app synergies and cryptographic persona isolation are in direct tension.

> **Resolution needed:** Do multiple personas share the same Data Hub (enabling cross-persona analytics) or are they cryptographically isolated from each other (preserving Tier 1 guarantees but disabling cross-persona analytics)?

---

### Issue 4 — Tiered coin conversion rate has no reference rate

The coin uses revenue-matched supply, no burn, no external exchange listing, and tiered conversion rates (higher tiers get better rates). But "better than what?" — there is no reference rate defined. A floor-price algorithm is implied but never designed. Without a reference rate, the tiered conversion feature cannot be built and the coin's economic model cannot be independently audited or regulated.

> **Resolution needed:** Is the coin-to-fiat conversion rate an internal platform-set rate (floor-price algorithm), a fixed peg to a fiat/commodity basket, or does it require external exchange listing to establish a reference rate?

---

### Issue 5 — Host-controlled ad review creates an unaddressed legal liability gap

No platform gatekeeping is philosophically consistent with data sovereignty values, but GDPR, DSA (EU Digital Services Act), FTC regulations, and COPPA impose obligations on platforms regardless of whether they claim to merely facilitate. When a host approves a fraudulent or illegal ad, the platform is still the facilitating infrastructure. Host-controlled editorial authority can coexist with a minimum prohibited content baseline — but that boundary needs to be defined before the advertising system is built.

> **Resolution needed:** Should the platform maintain a minimum prohibited content list (illegal products, fraud, content illegal in the platform's jurisdiction) applied as a baseline before host review, or is the intent truly zero platform-level content moderation?

---

### Issue 6 — "Data stays at its creation tier forever" promise has no defined enforcement mechanism

This promise is a strong competitive differentiator. But a database flag can be altered by a breach or admin mistake. For it to be a true guarantee, it needs to be cryptographic — tier-specific encryption keys, with re-keying prohibited by design. The design does not specify whether this is enforced at the cryptographic layer or the application policy layer. This decision determines the data store architecture before the first line of code is written.

> **Resolution needed:** Should the creation-tier immutability be enforced cryptographically (tier-keyed encryption, structural enforcement) or at the application policy layer (immutable database tag, externally audited)?

---

### Issue 7 — ActivityPub federation is incompatible with Tier 1 privacy for the same user

ActivityPub is a public-by-default protocol. A Tier 1 SPACE that accepts a follower from another server would need to send activities to that server — giving the remote server a copy of the activity, outside nTogether's tier enforcement. The two cannot coexist for the same user's content without explicit design: either Tier 1 users are non-federated, or federation is restricted to Tier 3+ users who accept the tradeoff.

> **Resolution needed:** Should Tier 1 and Tier 2 users be excluded from ActivityPub federation entirely (walled-garden only), with federation restricted to Tier 3+?

---

### Issue 8 — Data buyout fee requires a valuation engine that doesn't exist until Phase 4/5

Users can pay to have lower-tier data deleted or anonymized on upgrade, with fees determined dynamically by data amount and value. But the valuation engine is a Phase 4/5 feature, while tier upgrades happen from Phase 1 onward. The platform cannot honor the upgrade promise without either building a simplified valuation model in Phase 1, or deferring the buyout option until Phase 4/5.

> **Resolution needed:** Should the data buyout fee use a simplified flat-rate model in early phases, with the full valuation engine applied once it's built?

---

### Issue 9 — MESSENGER should use Signal Protocol, not zk-STARKs

Practical E2E messaging encryption uses the Signal Protocol (Double Ratchet + X3DH) — which provides forward secrecy and break-in recovery. zk-STARKs do not provide these properties. Building a secure messaging system on zk-proofs rather than a proven ratcheting protocol means inventing a new cryptographic primitive, which is extraordinarily dangerous for a security-critical product. zk-STARKs belong in the proof layer; the Signal Protocol (or MLS) belongs in the messaging layer.

> **Resolution needed:** Should MESSENGER use the Signal Protocol for message confidentiality, with zk-STARKs reserved for proof-generation use cases?

---

### Issue 10 — BOARD's definition is contradictory across sessions

In one session, BOARD is a message board page type built within a PROFILE site, owned and moderated by the site owner. In the original overview, BOARD is a separate network-wide platform inspired by Reddit/Lemmy. These are two fundamentally different products — the scope difference is several months of development. The rollout phase assignment for BOARD depends on which is correct.

> **Resolution needed:** Is BOARD a standalone network-wide community platform (like Lemmy), a message-board page type within PROFILE, or both with a SPACE-level board that can optionally federate to a network-wide platform?

---

## Section 2: Structure Optimization

### Data Layer

**Speed**
- Partition the Data Hub from transactional app data: PostgreSQL handles OLTP writes (per-app schemas within the same cluster); TimescaleDB handles time-series data (journal, scheduler, financial transactions); materialized views power DASH widgets rather than a separate OLAP system in early phases.
- Redis is the hot path for the cross-app event bus, feed algorithm computation, trending, and real-time notifications — not PostgreSQL polling.
- Marketplace algorithm execution runs as WASM in the browser — the server never receives raw user data.

**Security**
- Zero-knowledge access log: append-only, cryptographically signed by the accessing party, transparency-log model. Without this, access patterns are a surveillance vector even if content is encrypted.
- Column-level encryption for all PII in PostgreSQL using `pgcrypto` with per-user keys — disk-level encryption only protects against hardware theft.
- Immutable tier tag implemented via PostgreSQL row-level security + content-addressed storage where each record's key is derived from its tier and user ID. Structural, not a column value that can be altered.

**Ease of use**
- All automatic cross-app data routing surfaces as a confirmation toast — non-blocking, dismissible, undoable. "Food entry from your journal — added to your diet log. Undo?" Makes the system feel transparent rather than opaque.

---

### API Layer

**Speed**
- All cross-app data requests go through the Data Hub service, never direct service-to-service calls. DASH calls the Data Hub, not the financial service directly.
- Consider GraphQL for the frontend-facing API layer (BUILDSPACE, DASH, Data Hub query interface). Variable data shape requirements will either over-fetch on REST or generate a proliferation of bespoke endpoints. Use persisted queries only for security.

**Security**
- Refresh token rotation (each use generates a new token) provides theft detection. Refresh tokens in HTTP-only cookies, not localStorage.
- Cross-tier interaction scrubbing happens at the write path, not post-processing. When a Tier 5 user tags a Tier 1 user, the Tier 1 identifier is anonymized before storage. The window between write and post-process is a privacy leak.
- Ad auction endpoint needs rate limiting and anti-fraud protection from day one — bid stuffing and impression fraud are API-layer attacks.

**Ease of use**
- Unified event schema for all cross-app notifications enforced at the API gateway. Every app subscribes to other apps' events using the same pattern.

---

### Frontend Layer

**Speed**
- Each app is a separately deployed React application sharing a common component library, loaded on demand via Vite lazy loading.
- BUILDSPACE live preview renders in a sandboxed iframe for both performance isolation and security.
- Canvas-based charting (not SVG) in DASH for large datasets.

**Security**
- Marketplace blocks/modules render in sandboxed iframes with strict CSP. A purchased block must not access the parent page's DOM, read other blocks' data, or make unauthorized network requests. Without this, a malicious marketplace block is an XSS attack against every user who installs it.
- Password manager autofill uses WebAuthn and Credential Management APIs, not DOM-scraping. DOM-based autofill is bypassable and phishing-vulnerable.

**Ease of use**
- Cross-app navigation architecture must be decided before any app is designed: persistent left-side app rail with contextual sub-navigation per app, plus a global command palette (Cmd+K) for app switching, task creation, journal entries, and global search. Quick journal entry and task creation must be two keystrokes from anywhere in the suite.
- DASH blocks need a standard size grid (small 1×1, medium 2×1, large 2×2) established before any blocks are designed.
- Tier-visibility indicators must use the same visual language across every app — users learn the pattern once.

---

## Section 3: Cross-App Data Communication Plan

### The Data Bus

**Technology:** Redis Streams (primary) + PostgreSQL event tables (durability fallback).

Redis Streams provide ordered, append-only event logs with consumer group support. Each app publishes to a named stream (`journal:events`, `scheduler:events`, `financial:events`, etc.). Consumer groups let multiple apps subscribe to the same stream independently and in order — when a food entry is logged, both the diet function and the financial function consume it from the same stream without coupling.

PostgreSQL event tables serve as the durability layer — every event also written to a `platform_events` table. If Redis is unavailable, consumers replay from PostgreSQL.

**Pattern:** Publish/subscribe, not RPC. No app calls another app's API directly for cross-app data flow.

---

### Shared Data Schema

Every event emitted to the bus must include:

```
event_id:        UUID v7 (time-ordered)
event_type:      string (namespaced: "journal.food_logged", "scheduler.event_completed")
source_app:      string
actor_id:        string (hashed user identifier — never plaintext user ID)
persona_id:      string (which persona emitted this)
creation_tier:   integer (1–5, immutable after write)
created_at:      timestamp UTC
device_id:       string (hashed, for local-first sync)
payload:         JSON (event-specific data)
privacy_flags:   JSON (which payload fields may cross app boundaries)
data_hash:       string (SHA-256 of payload, for integrity verification)
```

`creation_tier` and `privacy_flags` are written once and are immutable — enforced by PostgreSQL RLS triggers that reject any UPDATE to these columns.

---

### Real-Time Event Flow (example)

User marks a scheduled event complete:

1. Scheduler writes `scheduler.event_completed` to `scheduler:events` Redis Stream.
2. Journal consumer receives it → creates a draft post-event prompt → pushes a real-time notification to the user via WebSocket (Redis Pub/Sub on `user:{actor_id}:notifications`).
3. User completes the prompt. Journal writes `journal.event_reflection_completed` with mood, interaction tags, and outcome rating.
4. Financial consumer receives the original `scheduler.event_completed` event → creates a pending expense entry if cost fields are present and `privacy_flags` permits.
5. Relationship Health Score engine (background worker in Data Hub) receives `journal.event_reflection_completed` → updates composite scores for tagged contacts.
6. DASH consumer receives `journal.event_reflection_completed` → updates live dashboard widgets if open.

All steps are asynchronous and independently retryable. A failed WebSocket push does not affect steps 4, 5, or 6.

---

### Data Hub Query Modes

1. **Structured queries** — pre-compiled sqlc queries powering the intelligence engines (Optimal Scheduling, Wellbeing ROI, etc.). New queries require a code change.
2. **Natural language** — user asks a question; local LLM translates it to a structured query shown to the user before execution. On-device LLM for Tier 1–2; platform LLM for Tier 3–5 with explicit disclosure.
3. **WASM sandbox** — marketplace algorithms execute client-side against a local data snapshot. Data never leaves the device. Only the result is returned.

---

### Privacy Boundaries

**Flows without per-action consent** (governed by tier + `privacy_flags`, consented at tier selection):
- Aggregated mood indicators (not raw journal text) → Optimal Scheduling Engine
- Meal cost amounts → Financial function
- Scheduled event completion status → Journal prompt trigger (metadata only)
- Agreement term due dates → Scheduler and Journal reminder triggers
- Domain/hosting renewal dates → Scheduler reminders
- Achievement milestone triggers → cross-app notification (which app, not content)

**Requires explicit consent per use:**
- Any raw journal text → any other app
- Health/biometric data → any engine (opt-in per engine, per data type)
- Contact/relationship data → Relationship Health Score engine
- Browser history → any app
- Location data → any app
- Any data leaving the device for processing

**Never crosses app boundaries (structural, not policy):**
- Password manager vault contents
- Posthumous content (no event bus emission, no Data Hub indexing by design)
- Raw journal text content
- Agreement negotiation logs (outcomes flow to trust score; negotiation content never does)
- Private message and call content (platform never holds plaintext)
- Any field with `privacy_flags: "none"` — stripped at the write path before storage

The "never" categories are excluded from the event bus schema definition. There is no code path to route them. The prohibition is structural.
