-- nTogether — Shared local event log
-- SQLite schema shared across all LIFE apps on the user's device.
-- No service or network connection required to use this store.
-- The DATA HUB syncs this to the server-side store when installed.
--
-- The schema never versions. Payload is stored as-is (schema-free JSON).
-- Apps must handle unknown event sources/types gracefully.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Core event log ──────────────────────────────────────────────────────────
-- Every LIFE app writes events here. Any installed app can read from it.

CREATE TABLE IF NOT EXISTS events (
    id          TEXT    NOT NULL PRIMARY KEY,
    source      TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    payload     JSON    NOT NULL,
    recorded_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    synced      INTEGER NOT NULL DEFAULT 0  -- 0 = local only; 1 = synced to DATA HUB
);

CREATE INDEX IF NOT EXISTS idx_events_source      ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_type        ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_recorded_at ON events(recorded_at);
CREATE INDEX IF NOT EXISTS idx_events_source_type ON events(source, type);
CREATE INDEX IF NOT EXISTS idx_events_unsynced    ON events(synced) WHERE synced = 0;

-- ── Per-app DASH stats ───────────────────────────────────────────────────────
-- Each app upserts its own row whenever its state changes.
-- DASH reads all rows and renders widgets for sources it recognises.
-- No DATA HUB required for basic DASH functionality.

CREATE TABLE IF NOT EXISTS dash_stats (
    source     TEXT NOT NULL PRIMARY KEY,
    stats      JSON NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ── Cross-app references ─────────────────────────────────────────────────────
-- Lightweight pointer table. Any app can declare that one of its records
-- references a record owned by another app, without coupling to that app's schema.
--
-- Examples:
--   journal entry  → mentions  → contacts record
--   journal entry  → embeds    → scheduler event
--   agreement      → party     → contacts record
--   lists item     → tag       → contacts record (gift recipient)

CREATE TABLE IF NOT EXISTS cross_refs (
    id             TEXT NOT NULL PRIMARY KEY,
    from_source    TEXT NOT NULL,
    from_record_id TEXT NOT NULL,
    to_source      TEXT NOT NULL,
    to_record_id   TEXT NOT NULL,
    ref_type       TEXT NOT NULL,  -- 'mention' | 'embed' | 'party' | 'tag' | 'link'
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE(from_source, from_record_id, to_source, to_record_id, ref_type)
);

CREATE INDEX IF NOT EXISTS idx_refs_from ON cross_refs(from_source, from_record_id);
CREATE INDEX IF NOT EXISTS idx_refs_to   ON cross_refs(to_source, to_record_id);

-- ── Sync cursor ──────────────────────────────────────────────────────────────
-- Tracks the high-water mark for DATA HUB sync.
-- One row per source; DATA HUB sync process reads from last_synced_at onward.

CREATE TABLE IF NOT EXISTS sync_cursors (
    source         TEXT NOT NULL PRIMARY KEY,
    last_synced_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z'
);
