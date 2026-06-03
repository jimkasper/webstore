# DATA HUB — Spec
Last updated: 2026-04-26

---

## What is the DATA HUB?

The DATA HUB is an **optional** server-side intelligence service. It is not required for cross-app data sharing — that happens through the shared local event log (see below). The DATA HUB extends what the local log provides by adding cross-device sync, server-side materialized views, and the ANALYZER natural language query interface.

**What the DATA HUB adds on top of the baseline:**

1. Syncs the local event log to a server-side store — enables cross-device access to the same data
2. Maintains richer server-side materialized views for DASH (cross-app aggregation, long-range trends)
3. Exposes the **ANALYZER** — a natural language query interface for the user's own data
4. Enables CONNECT data marketplace access for Tier 5 users

The DATA HUB is the same for every tier. The tier controls only what the *platform* can see — not what the user gets back from their own DATA HUB.

---

## Cross-app data architecture

Cross-app data sharing has two tiers. The baseline works with no server dependency.

### Tier 1 — Shared local event log (always available)

Every LIFE app reads from and writes to a shared SQLite table on the user's device. No network, no service, no DATA HUB required.

```
App A writes event → shared local events table
App B reads from  → shared local events table
```

Any installed app can subscribe to events from any other installed app by querying the shared table. Cross-app reference linking, inline mentions, and DASH basic widgets all run from this table.

Full schema: `packages/types/local-store.sql`

### Tier 2 — DATA HUB sync (optional enhancement)

When DATA HUB is installed, every event written to the local log is also published to the Redis Streams bus. The DATA HUB consumes the stream and maintains a server-side mirror plus additional materialized views.

```
App writes event → local SQLite log (always)
                └→ Redis Streams (when DATA HUB is installed)
                       └→ DATA HUB consumes
                              ├── server-side event store (cross-device)
                              ├── materialized views (cross-app aggregates)
                              └── ANALYZER index
```

Apps do not need to know whether DATA HUB is installed. The write path is identical; the Redis publish is a fire-and-forget side effect.

---

## Cross-app data contract

### Event envelope (universal — never changes)

```json
{
  "id":          "uuid",
  "source":      "journal | scheduler | planner | diet | financial | agreement | research | posthumous | contacts | ...",
  "type":        "entry.created | task.completed | transaction.logged | ...",
  "payload":     { ... },
  "recorded_at": "ISO 8601 timestamp"
}
```

The envelope is fixed. All app-specific data lives inside `payload` as JSON. Because payload is schema-free, individual apps can evolve their payload structure without touching the envelope or requiring a migration. **The event schema does not version.**

TypeScript and Go types: `packages/types/index.ts` and `packages/types/event.go`

### Enforcement points

1. **Shared types package** (`packages/types/`) — TypeScript and Go types for the event envelope. Every app imports from this package. Malformed envelopes fail at compile time.
2. **Local event log write path** — runtime validation on every write to the shared SQLite table. Rejects events missing required envelope fields. Payload is stored as-is; content validation is the emitting app's responsibility.
3. **DATA HUB ingest layer** (when installed) — validates the envelope again on every incoming Redis Streams event before writing to the server-side store. Provides a second runtime enforcement point for events published from server-side app processes.

### Tier and cross-app data

All of a user's LIFE apps run at the same tier. A user is on one tier platform-wide — there is no per-app tier. This keeps privacy accounting simple: one key derivation, one platform access level, no edge cases.

### Partial installs — missing app events

When an app reads the shared local log and encounters an event from an app that isn't installed:
- The event and any references to it are stored normally
- The reading app ignores event types it doesn't recognize (safe unknown-type handling)
- A prompt surfaces: *"Install [App] to get full correlation for this data"*

The prompt appears in relevant DASH widgets and in ANALYZER responses (when DATA HUB is installed) — never as a blocking error. All existing data continues to work; cross-app correlation enriches further once the missing app is installed.

---

## DASH — two-tier widget model

### Basic DASH (no DATA HUB required)

Each app maintains its own `dash_stats` row in the local `dash_stats` table (see `local-store.sql`). DASH reads all installed apps' rows and renders the widgets it knows about. No aggregation service required.

```
Scheduler  → upserts dash_stats row (today's events, task health)
Journal    → upserts dash_stats row (streak, last entry, mood)
Financial  → upserts dash_stats row (today spend, budget status)
...
DASH reads all dash_stats rows → renders widgets
```

### Enhanced DASH (DATA HUB installed)

DATA HUB maintains server-side materialized views that aggregate data across apps for fast reads and long-range trend analysis.

Example views:
- **Activity summary** — posts, completions, journal entries by day/week/month
- **Mood trend** — derived from journal sentiment and LIFE app signals, correlated with exercise/sleep/diet
- **Task health** — ratio of completed to open need-dos, should-dos, to-dos with deferral tracking
- **Spending summary** — from Financial app with category breakdowns
- **Nutrition summary** — from Diet app with macro trend lines
- **Social engagement** — post views, reactions, comments, follows

---

## ANALYZER

The ANALYZER is a natural language query interface for the user's own data. It requires the DATA HUB — it queries the indexed server-side event history.

Example queries:
- "How many times did I journal last month?"
- "What were my most productive weeks this year?"
- "Show me all need-dos tagged #work that I've deferred more than once"
- "What did I spend on food in Q1?"
- "Which of my albums list items also appear on friends' lists?"

**Query processing by tier:**

| Tier | Processing |
|------|-----------|
| Tier 1–2 | On-device LLM. Queries never leave the device. |
| Tier 3–5 | Platform LLM. Users explicitly informed that queries are processed server-side. |

The ANALYZER only has access to the user's own DATA HUB. It cannot query other users' data.

---

## Baseline vs. enhanced feature table

| Feature | No DATA HUB | DATA HUB installed |
|---------|-------------|-------------------|
| Cross-app event sharing | ✅ Shared local SQLite log | ✅ Same + synced server-side |
| Inline cross-app references (journal → scheduler event) | ✅ `cross_refs` table | ✅ Same |
| Basic DASH widgets | ✅ Per-app `dash_stats` | ✅ Enhanced — cross-app aggregates |
| Long-range trend views | Limited — local log only | ✅ Server-side materialized views |
| Event-driven cross-app prompts | ✅ App reads shared log | ✅ Same |
| ANALYZER natural language queries | ❌ | ✅ |
| Cross-device sync | ❌ Local only | ✅ |
| CONNECT data marketplace (Tier 5) | ❌ | ✅ |
| Intelligence nudges | Basic — per-app | ✅ Full cross-app correlation |

---

## Storage architecture

| Layer | Data type | Storage |
|-------|-----------|---------|
| **Baseline (always)** | Shared event log | SQLite — `events` table in shared local store |
| **Baseline (always)** | Per-app dash stats | SQLite — `dash_stats` table in shared local store |
| **Baseline (always)** | Cross-app references | SQLite — `cross_refs` table in shared local store |
| **DATA HUB (optional)** | Server-side event mirror | PostgreSQL — one schema per app within a shared cluster |
| **DATA HUB (optional)** | Time-series data | TimescaleDB extension on the PostgreSQL instance |
| **DATA HUB (optional)** | Materialized views | PostgreSQL materialized views (early phase); OLAP system considered at scale |
| **DATA HUB (optional)** | Event stream | Redis Streams |
| **DATA HUB (optional)** | ANALYZER index | TBD — vector store for semantic search, relational for structured queries |

---

## Privacy and tier interaction

The DATA HUB holds the user's full data regardless of tier. The tier governs what platform systems can *read* from the DATA HUB:

| Tier | Platform access to DATA HUB |
|------|---------------------------|
| Tier 1 | Zero — platform cannot read any DATA HUB data |
| Tier 2 | Aggregate, anonymized platform-level stats only |
| Tier 3 | Behavioral patterns visible but not identity-linked |
| Tier 4 | Full data readable, linked to identity, for internal use only |
| Tier 5 | Full read access; data available for sale via CONNECT data marketplace |

The local event log (Tier 1 baseline) is on-device only — the platform cannot access it at any tier.

The user always has full access to their own data at every tier.

---

## User-facing surfaces

| Surface | Requires DATA HUB? |
|---------|-------------------|
| DASH basic widgets | No — per-app dash_stats |
| DASH enhanced / trend views | Yes |
| ANALYZER | Yes |
| Cross-app references (inline links) | No — cross_refs table |
| CONNECT data marketplace (Tier 5) | Yes |
| Intelligence nudges (basic) | No — apps read shared log |
| Intelligence nudges (cross-app correlation) | Yes |
| Cross-device data access | Yes |

---

## Open items

- ANALYZER LLM selection for on-device (Tier 1–2) and platform (Tier 3–5) models
- Vector store selection for semantic ANALYZER queries
- Data retention and deletion policies (how long is the server-side event history kept?)
- Export format for user data portability (JSON, CSV, SQLite dump)
- Whether ANALYZER results can be pinned or saved back to LIFE apps
- Conflict resolution policy when local log and server-side store diverge (offline edits)
- ~~Event schema versioning~~ — **resolved**: not needed. Envelope is fixed; payload is schema-free JSON.
- ~~Cross-app tier enforcement~~ — **resolved**: single tier per user, platform-wide.
- ~~Partial install behavior~~ — **resolved**: shared log stores all events; apps ignore unknown types; prompt user to install missing app.
- ~~DATA HUB as required dependency~~ — **resolved**: DATA HUB is optional. Shared local SQLite event log is the baseline for all cross-app data sharing.
