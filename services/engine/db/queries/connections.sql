-- name: CreateConnection :one
INSERT INTO connections (from_space_id, to_space_id, from_ap_actor, conn_type, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetConnectionByID :one
SELECT * FROM connections WHERE id = $1 LIMIT 1;

-- name: GetConnectionBetween :one
SELECT * FROM connections
WHERE from_space_id = $1 AND to_space_id = $2 AND conn_type = $3
LIMIT 1;

-- name: UpdateConnectionStatus :one
UPDATE connections SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListFollowers :many
SELECT c.*, s.handle, s.display_name, s.public_key
FROM connections c
LEFT JOIN spaces s ON s.id = c.from_space_id
WHERE c.to_space_id = $1 AND c.conn_type = 'follow' AND c.status = 'accepted'
ORDER BY c.created_at DESC
LIMIT $2 OFFSET $3;

-- name: ListFollowing :many
SELECT c.*, s.handle, s.display_name, s.public_key
FROM connections c
LEFT JOIN spaces s ON s.id = c.to_space_id
WHERE c.from_space_id = $1 AND c.conn_type = 'follow' AND c.status = 'accepted'
ORDER BY c.created_at DESC
LIMIT $2 OFFSET $3;

-- name: DeleteConnection :exec
DELETE FROM connections WHERE id = $1;
