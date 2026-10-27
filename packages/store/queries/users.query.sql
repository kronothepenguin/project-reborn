-- name: CreateUser :one
INSERT INTO users (email, born_on, newsletter, created_ip, created_at, updated_at)
VALUES (
    sqlc.arg(email), sqlc.arg(born_on), sqlc.arg(newsletter), sqlc.arg(created_ip),
    sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users WHERE id = sqlc.arg(id);

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = sqlc.arg(email);

-- name: CountUsersCreatedFromIP :one
SELECT COUNT(*) FROM users
WHERE created_ip = sqlc.arg(created_ip) AND created_at >= sqlc.arg(since);
