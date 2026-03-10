-- name: GetUser :one
SELECT * FROM users WHERE id = ? LIMIT 1;

-- name: CreateUser :execlastid
INSERT INTO users(email, password, dob, newsletter) VALUES(?, ?, ?, ?);

-- name: CreateUserAvatar :exec
INSERT INTO users_avatars(user_id, name, credits, figure) VALUES(?, ?, ?, ?);

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ? LIMIT 1;

-- name: GetUserByAvatarName :one
SELECT users.* FROM users JOIN users_avatars ON users_avatars.user_id = users.id WHERE users_avatars.name = ? LIMIT 1;

-- name: CreateSession :exec
INSERT OR REPLACE INTO users_sessions(user_id, token) VALUES(?, ?);

-- name: DeleteSession :exec
DELETE FROM users_sessions WHERE token = ?;

-- name: VerifySession :one
SELECT EXISTS(SELECT 1 FROM users_sessions JOIN users ON users_sessions.user_id = users.id WHERE users_sessions.token = ? AND users.email = ?)
