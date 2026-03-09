-- name: GetUser :one
SELECT * FROM users WHERE id = ? LIMIT 1;

-- name: CreateUser :execlastid
INSERT INTO users(email, password, dob, newsletter) VALUES(?, ?, ?, ?);

-- name: CreateUserAvatar :exec
INSERT INTO users_avatars(user_id, name, credits, figure) VALUES(?, ?, ?, ?);

-- name: VerifySession :one
SELECT EXISTS(SELECT 1 FROM users_sessions JOIN users ON users_sessions.user_id = users.id WHERE users_sessions.token = ? AND users.email = ?)
