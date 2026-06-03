-- name: UpsertAPActor :one
INSERT INTO ap_actors (ap_id, actor_type, preferred_username, inbox_url, outbox_url, public_key_pem, raw_data, fetched_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
ON CONFLICT (ap_id) DO UPDATE SET
    actor_type = EXCLUDED.actor_type,
    preferred_username = EXCLUDED.preferred_username,
    inbox_url = EXCLUDED.inbox_url,
    outbox_url = EXCLUDED.outbox_url,
    public_key_pem = EXCLUDED.public_key_pem,
    raw_data = EXCLUDED.raw_data,
    fetched_at = NOW()
RETURNING *;

-- name: GetAPActorByAPID :one
SELECT * FROM ap_actors WHERE ap_id = $1 LIMIT 1;
