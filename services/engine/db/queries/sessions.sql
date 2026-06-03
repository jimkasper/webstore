-- name: CreateSession :one
INSERT INTO sessions (space_id, refresh_token, expires_at)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetSessionByToken :one
SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW() LIMIT 1;

-- name: DeleteSessionByToken :exec
DELETE FROM sessions WHERE refresh_token = $1;

-- name: DeleteAllSessionsBySpaceID :exec
DELETE FROM sessions WHERE space_id = $1;
