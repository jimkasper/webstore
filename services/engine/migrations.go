package main

import "github.com/jimkasper/ntogether/engine/internal/store"

// migrations returns ordered DB migrations to apply on startup.
// These are embedded directly to avoid file I/O at runtime.
func migrations() []store.Migration {
	return []store.Migration{
		{
			Version: "001_create_spaces",
			Up: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS spaces (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle        TEXT UNIQUE NOT NULL,
    display_name  TEXT NOT NULL,
    email_hash    TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    public_key    TEXT NOT NULL,
    private_key   TEXT NOT NULL,
    is_local      BOOLEAN NOT NULL DEFAULT TRUE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
		},
		{
			Version: "002_create_sessions",
			Up: `CREATE TABLE IF NOT EXISTS sessions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id      UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_space_id ON sessions(space_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);`,
		},
		{
			Version: "003_create_connections",
			Up: `DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('pending','accepted','rejected','blocked');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    CREATE TYPE connection_type AS ENUM ('follow','friend','block');
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE TABLE IF NOT EXISTS connections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    to_space_id   UUID REFERENCES spaces(id) ON DELETE CASCADE,
    from_ap_actor TEXT,
    conn_type     connection_type NOT NULL DEFAULT 'follow',
    status        connection_status NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_space_id, to_space_id, conn_type)
);`,
		},
		{
			Version: "004_create_transfers",
			Up: `DO $$ BEGIN
    CREATE TYPE transfer_status AS ENUM ('pending','accepted','cancelled','expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE TABLE IF NOT EXISTS transfers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_space_id   UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    to_space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE,
    to_ap_actor     TEXT,
    payload_enc     TEXT NOT NULL,
    status          transfer_status NOT NULL DEFAULT 'pending',
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
		},
		{
			Version: "005_create_ap_actors",
			Up: `CREATE TABLE IF NOT EXISTS ap_actors (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_id              TEXT UNIQUE NOT NULL,
    actor_type         TEXT NOT NULL DEFAULT 'Person',
    preferred_username TEXT NOT NULL,
    inbox_url          TEXT NOT NULL,
    outbox_url         TEXT,
    public_key_pem     TEXT NOT NULL,
    raw_data           JSONB,
    fetched_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
		},
		{
			Version: "006_create_ap_activities",
			Up: `CREATE TABLE IF NOT EXISTS ap_activities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_id       TEXT UNIQUE NOT NULL,
    actor_id    TEXT NOT NULL,
    type        TEXT NOT NULL,
    object_raw  JSONB NOT NULL,
    direction   TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
		},
		{
			Version: "007_indexes",
			Up: `CREATE INDEX IF NOT EXISTS idx_spaces_handle ON spaces(handle);
CREATE INDEX IF NOT EXISTS idx_connections_from ON connections(from_space_id);
CREATE INDEX IF NOT EXISTS idx_connections_to ON connections(to_space_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_space_id);
CREATE INDEX IF NOT EXISTS idx_transfers_expires ON transfers(expires_at);
CREATE INDEX IF NOT EXISTS idx_ap_actors_ap_id ON ap_actors(ap_id);`,
		},
	}
}
