-- migrate:up
CREATE INDEX idx_spaces_handle ON spaces(handle);
CREATE INDEX idx_connections_from ON connections(from_space_id);
CREATE INDEX idx_connections_to ON connections(to_space_id);
CREATE INDEX idx_transfers_to ON transfers(to_space_id);
CREATE INDEX idx_transfers_expires ON transfers(expires_at);
CREATE INDEX idx_ap_actors_ap_id ON ap_actors(ap_id);

-- migrate:down
DROP INDEX IF EXISTS idx_spaces_handle;
DROP INDEX IF EXISTS idx_connections_from;
DROP INDEX IF EXISTS idx_connections_to;
DROP INDEX IF EXISTS idx_transfers_to;
DROP INDEX IF EXISTS idx_transfers_expires;
DROP INDEX IF EXISTS idx_ap_actors_ap_id;
