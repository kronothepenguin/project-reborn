-- name: CreateAvatar :one
INSERT INTO avatars (user_id, name, figure, gender, motto, created_at, updated_at)
VALUES (
    sqlc.arg(user_id), sqlc.arg(name), sqlc.arg(figure), sqlc.arg(gender), sqlc.arg(motto),
    sqlc.arg(created_at), sqlc.arg(updated_at)
)
RETURNING *;

-- name: GetAvatar :one
SELECT * FROM avatars WHERE id = sqlc.arg(id);

-- It sees archived habbos too, because their names stay taken.
-- name: GetAvatarByName :one
SELECT * FROM avatars WHERE name = sqlc.arg(name);

-- name: ListUserAvatars :many
SELECT * FROM avatars
WHERE user_id = sqlc.arg(user_id) AND archived_at IS NULL
ORDER BY created_at, id;

-- name: CountAvatars :one
SELECT COUNT(*) FROM avatars WHERE archived_at IS NULL;

-- name: ListRandomAvatars :many
SELECT * FROM avatars
WHERE archived_at IS NULL
ORDER BY RANDOM()
LIMIT sqlc.arg(count);

-- name: UpdateAvatarMotto :exec
UPDATE avatars SET motto = sqlc.arg(motto), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: UpdateAvatarLook :exec
UPDATE avatars SET figure = sqlc.arg(figure), gender = sqlc.arg(gender), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id);

-- name: ArchiveAvatar :execrows
UPDATE avatars SET archived_at = sqlc.arg(archived_at), updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND user_id = sqlc.arg(user_id) AND archived_at IS NULL;

-- name: RestoreAvatar :execrows
UPDATE avatars SET archived_at = NULL, updated_at = sqlc.arg(updated_at)
WHERE id = sqlc.arg(id) AND archived_at IS NOT NULL;

-- Habbos for staff, archived ones too. A query matches part of a name or a whole
-- id; with private it also matches part of an email or an address the user used,
-- so that a search by IP finds clones.
-- name: SearchHabbos :many
SELECT avatars.id, avatars.user_id, avatars.name, avatars.created_at, avatars.archived_at, users.email
FROM avatars
JOIN users ON users.id = avatars.user_id
WHERE CAST(sqlc.arg(query) AS TEXT) = ''
   OR avatars.name LIKE '%' || CAST(sqlc.arg(query) AS TEXT) || '%'
   OR CAST(avatars.id AS TEXT) = CAST(sqlc.arg(query) AS TEXT)
   OR (
       CAST(sqlc.arg(private) AS BOOLEAN)
       AND (
           users.email LIKE '%' || CAST(sqlc.arg(query) AS TEXT) || '%'
           OR users.created_ip = CAST(sqlc.arg(query) AS TEXT)
           OR users.id IN (
               SELECT login_attempts.user_id FROM login_attempts
               WHERE login_attempts.ip = CAST(sqlc.arg(query) AS TEXT)
           )
       )
   )
ORDER BY avatars.name
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: CountHabbos :one
SELECT COUNT(*)
FROM avatars
JOIN users ON users.id = avatars.user_id
WHERE CAST(sqlc.arg(query) AS TEXT) = ''
   OR avatars.name LIKE '%' || CAST(sqlc.arg(query) AS TEXT) || '%'
   OR CAST(avatars.id AS TEXT) = CAST(sqlc.arg(query) AS TEXT)
   OR (
       CAST(sqlc.arg(private) AS BOOLEAN)
       AND (
           users.email LIKE '%' || CAST(sqlc.arg(query) AS TEXT) || '%'
           OR users.created_ip = CAST(sqlc.arg(query) AS TEXT)
           OR users.id IN (
               SELECT login_attempts.user_id FROM login_attempts
               WHERE login_attempts.ip = CAST(sqlc.arg(query) AS TEXT)
           )
       )
   );

-- name: ListAllUserAvatars :many
SELECT * FROM avatars
WHERE user_id = sqlc.arg(user_id)
ORDER BY created_at, id;

-- name: ListAvatarBadges :many
SELECT * FROM avatar_badges
WHERE avatar_id = sqlc.arg(avatar_id)
ORDER BY granted_at, code;

-- A habbo wears one badge, so this comes before wearing another.
-- name: TakeOffAvatarBadge :exec
UPDATE avatar_badges SET worn = FALSE
WHERE avatar_id = sqlc.arg(avatar_id) AND worn;

-- name: GrantAvatarBadge :execrows
INSERT INTO avatar_badges (avatar_id, code, worn, granted_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(code), TRUE, sqlc.arg(granted_at))
ON CONFLICT (avatar_id, code) DO NOTHING;

-- name: WearAvatarBadge :exec
UPDATE avatar_badges SET worn = TRUE
WHERE avatar_id = sqlc.arg(avatar_id) AND code = sqlc.arg(code);

-- name: DeleteAvatarBadge :execrows
DELETE FROM avatar_badges
WHERE avatar_id = sqlc.arg(avatar_id) AND code = sqlc.arg(code);

-- name: GetWornAvatarBadge :one
SELECT * FROM avatar_badges
WHERE avatar_id = sqlc.arg(avatar_id) AND worn;
