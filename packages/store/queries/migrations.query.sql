-- name: ListMigrations :many
SELECT * FROM migrations ORDER BY version;

-- name: GetMigration :one
SELECT * FROM migrations WHERE version = sqlc.arg(version);

-- name: CreateMigration :exec
INSERT INTO migrations (version, name, applied_at)
VALUES (sqlc.arg(version), sqlc.arg(name), sqlc.arg(applied_at));
