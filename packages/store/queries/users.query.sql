-- name: CreateUser :execlastid
INSERT INTO users (
    username,
    username_canonical,
    password_hash,
    email,
    email_canonical,
    birth_date,
    avatar,
    newsletter,
    terms_accepted_at,
    created_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);

-- name: GetUserByID :one
SELECT * FROM users WHERE id = ?;

-- name: GetUserByUsername :one
SELECT * FROM users WHERE username_canonical = ?;

-- name: MarkUserSignedIn :exec
UPDATE users SET last_signed_in_at = ? WHERE id = ?;
