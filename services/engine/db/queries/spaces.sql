-- name: GetSpaceByHandle :one
SELECT * FROM spaces WHERE handle = $1 AND is_active = TRUE LIMIT 1;

-- name: GetSpaceByID :one
SELECT * FROM spaces WHERE id = $1 AND is_active = TRUE LIMIT 1;

-- name: GetSpaceByEmailHash :one
SELECT * FROM spaces WHERE email_hash = $1 AND is_active = TRUE LIMIT 1;

-- name: CreateSpace :one
INSERT INTO spaces (handle, display_name, email_hash, password_hash, public_key, private_key)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateSpaceDisplayName :one
UPDATE spaces SET display_name = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeactivateSpace :exec
UPDATE spaces SET is_active = FALSE, updated_at = NOW()
WHERE id = $1;
