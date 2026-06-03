-- migrate:up
CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id      UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_space_id ON sessions(space_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- migrate:down
DROP TABLE IF EXISTS sessions;
