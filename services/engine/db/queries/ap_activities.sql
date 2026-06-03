-- name: CreateAPActivity :one
INSERT INTO ap_activities (ap_id, actor_id, type, object_raw, direction)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: ListAPActivitiesByActor :many
SELECT * FROM ap_activities
WHERE actor_id = $1 AND direction = $2
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: DeleteAPActivitiesOlderThan :exec
DELETE FROM ap_activities WHERE created_at < $1;
