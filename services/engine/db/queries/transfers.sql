-- name: CreateTransfer :one
INSERT INTO transfers (from_space_id, to_space_id, to_ap_actor, payload_enc, expires_at)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetTransferByID :one
SELECT * FROM transfers WHERE id = $1 LIMIT 1;

-- name: UpdateTransferStatus :one
UPDATE transfers SET status = $2
WHERE id = $1
RETURNING *;

-- name: DeleteTransfer :exec
DELETE FROM transfers WHERE id = $1;

-- name: DeleteExpiredTransfers :exec
DELETE FROM transfers WHERE expires_at < NOW();
