-- migrate:up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE spaces (
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
);

-- migrate:down
DROP TABLE IF EXISTS spaces;
DROP EXTENSION IF EXISTS "uuid-ossp";
