-- migrate:up
CREATE TYPE transfer_status AS ENUM ('pending', 'accepted', 'cancelled', 'expired');

CREATE TABLE transfers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_space_id   UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    to_space_id     UUID REFERENCES spaces(id) ON DELETE CASCADE,
    to_ap_actor     TEXT,
    payload_enc     TEXT NOT NULL,
    status          transfer_status NOT NULL DEFAULT 'pending',
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Rows are DELETED on accept/cancel — no audit log. By design.

-- migrate:down
DROP TABLE IF EXISTS transfers;
DROP TYPE IF EXISTS transfer_status;
