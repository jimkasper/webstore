-- migrate:up
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE connection_type AS ENUM ('follow', 'friend', 'block');

CREATE TABLE connections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
    to_space_id   UUID REFERENCES spaces(id) ON DELETE CASCADE,
    from_ap_actor TEXT,
    conn_type     connection_type NOT NULL DEFAULT 'follow',
    status        connection_status NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_space_id, to_space_id, conn_type)
);

-- migrate:down
DROP TABLE IF EXISTS connections;
DROP TYPE IF EXISTS connection_type;
DROP TYPE IF EXISTS connection_status;
