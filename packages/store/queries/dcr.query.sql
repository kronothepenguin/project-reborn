-- name: ListDCRVariables :many
SELECT key, value FROM dcr_variables ORDER BY id;

-- name: DeleteDCRVariables :exec
DELETE FROM dcr_variables;

-- name: PutDCRVariable :exec
INSERT INTO dcr_variables (key, value) VALUES (sqlc.arg(key), sqlc.arg(value))
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- name: ListDCRTexts :many
SELECT key, value FROM dcr_texts ORDER BY id;

-- name: DeleteDCRTexts :exec
DELETE FROM dcr_texts;

-- name: PutDCRText :exec
INSERT INTO dcr_texts (key, value) VALUES (sqlc.arg(key), sqlc.arg(value))
ON CONFLICT (key) DO UPDATE SET value = excluded.value;

-- name: CountDCRVariables :one
SELECT COUNT(*) FROM dcr_variables;

-- name: CountDCRTexts :one
SELECT COUNT(*) FROM dcr_texts;
