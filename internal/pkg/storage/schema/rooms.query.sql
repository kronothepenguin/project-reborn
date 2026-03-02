-- name: GetRoom :one
SELECT * FROM rooms WHERE id = ? LIMIT 1;