-- name: ListRecyclerRewards :many
SELECT * FROM recycler_rewards ORDER BY furni_count;

-- name: GetRecycling :one
SELECT * FROM recyclings WHERE avatar_id = sqlc.arg(avatar_id);

-- A habbo has one recycling at a time: a second one is a conflict.
-- name: CreateRecycling :exec
INSERT INTO recyclings (avatar_id, furni_definition_id, started_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(furni_definition_id), sqlc.arg(started_at));

-- name: DeleteRecycling :execrows
DELETE FROM recyclings WHERE avatar_id = sqlc.arg(avatar_id);

-- Out of the habbo's hand and into its recycler: no row changes when the hand does not hold the furni, or when the
-- furni was made after made_before (plans/server decision 0117).
-- name: RecycleFurni :execrows
UPDATE furni
SET avatar_id = NULL, recycler_avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
WHERE id = sqlc.arg(id) AND created_at <= sqlc.arg(made_before) AND avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- What the habbo gave its recycler comes back to its hand.
-- name: ReturnRecycledFurni :exec
UPDATE furni
SET avatar_id = recycler_avatar_id, recycler_avatar_id = NULL
WHERE recycler_avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- What the habbo gave its recycler is destroyed, for the reward.
-- name: DeleteRecycledFurni :execrows
DELETE FROM furni WHERE recycler_avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);
