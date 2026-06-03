-- migrate:up
CREATE TABLE ap_actors (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_id              TEXT UNIQUE NOT NULL,
    actor_type         TEXT NOT NULL DEFAULT 'Person',
    preferred_username TEXT NOT NULL,
    inbox_url          TEXT NOT NULL,
    outbox_url         TEXT,
    public_key_pem     TEXT NOT NULL,
    raw_data           JSONB,
    fetched_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS ap_actors;
