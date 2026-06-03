-- migrate:up
CREATE TABLE ap_activities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ap_id       TEXT UNIQUE NOT NULL,
    actor_id    TEXT NOT NULL,
    type        TEXT NOT NULL,
    object_raw  JSONB NOT NULL,
    direction   TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Purged on a rolling basis per privacy policy.

-- migrate:down
DROP TABLE IF EXISTS ap_activities;
