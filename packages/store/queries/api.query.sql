-- name: GetAPISecret :one
SELECT secret FROM api_secret WHERE id = 1;
