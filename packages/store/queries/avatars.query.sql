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

-- The habbos of ids for staff, the most recently active first, as Holo's Online
-- Users ordered them: a live session counts before the last sign-in.
-- name: ListHabbosByIDs :many
SELECT avatars.id, avatars.user_id, avatars.name, avatars.created_at, users.email
FROM avatars
JOIN users ON users.id = avatars.user_id
WHERE avatars.id IN (sqlc.slice(ids))
ORDER BY COALESCE(
    (SELECT MAX(sessions.last_seen_at) FROM sessions WHERE sessions.avatar_id = avatars.id),
    (SELECT MAX(login_attempts.created_at) FROM login_attempts
     WHERE login_attempts.avatar_id = avatars.id AND login_attempts.succeeded)
) DESC, avatars.id;

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

-- The site wears one badge, in slot 1, in place of the one there, so this comes before wearing another; the other
-- slots keep theirs.
-- name: TakeOffAvatarBadge :exec
UPDATE avatar_badges SET slot = 0
WHERE avatar_id = sqlc.arg(avatar_id) AND slot = 1;

-- name: GrantAvatarBadge :execrows
INSERT INTO avatar_badges (avatar_id, code, slot, granted_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(code), 1, sqlc.arg(granted_at))
ON CONFLICT (avatar_id, code) DO NOTHING;

-- name: WearAvatarBadge :exec
UPDATE avatar_badges SET slot = 1
WHERE avatar_id = sqlc.arg(avatar_id) AND code = sqlc.arg(code);

-- The client's badge window sets every slot at once, so its badges come off first.
-- name: TakeOffAvatarBadges :exec
UPDATE avatar_badges SET slot = 0
WHERE avatar_id = sqlc.arg(avatar_id) AND slot > 0;

-- name: WearAvatarBadgeInSlot :execrows
UPDATE avatar_badges SET slot = sqlc.arg(slot)
WHERE avatar_id = sqlc.arg(avatar_id) AND code = sqlc.arg(code);

-- name: DeleteAvatarBadge :execrows
DELETE FROM avatar_badges
WHERE avatar_id = sqlc.arg(avatar_id) AND code = sqlc.arg(code);

-- The site shows one badge: the one in the first slot the habbo fills.
-- name: GetWornAvatarBadge :one
SELECT * FROM avatar_badges
WHERE avatar_id = sqlc.arg(avatar_id) AND slot > 0
ORDER BY slot
LIMIT 1;

-- Unworn; archived habbos are still the user's and get it too.
-- name: GrantBadgeToUserAvatars :execrows
INSERT INTO avatar_badges (avatar_id, code, slot, granted_at)
SELECT avatars.id, sqlc.arg(code), 0, sqlc.arg(granted_at)
FROM avatars
WHERE avatars.user_id = sqlc.arg(user_id)
ON CONFLICT (avatar_id, code) DO NOTHING;

-- Archived habbos are still the user's and lose it too.
-- name: DeleteBadgeFromUserAvatars :execrows
DELETE FROM avatar_badges
WHERE code = sqlc.arg(code)
  AND avatar_id IN (SELECT avatars.id FROM avatars WHERE avatars.user_id = sqlc.arg(user_id));

-- name: ListWardrobeOutfits :many
SELECT * FROM wardrobe_outfits
WHERE avatar_id = sqlc.arg(avatar_id)
ORDER BY slot;

-- name: UpsertWardrobeOutfit :exec
INSERT INTO wardrobe_outfits (avatar_id, slot, figure, gender, updated_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(slot), sqlc.arg(figure), sqlc.arg(gender), sqlc.arg(updated_at))
ON CONFLICT (avatar_id, slot) DO UPDATE SET
    figure = excluded.figure,
    gender = excluded.gender,
    updated_at = excluded.updated_at;

-- name: GetAvatarGameData :one
SELECT * FROM avatar_game_data WHERE avatar_id = sqlc.arg(avatar_id);

-- name: SetAvatarLastOnline :exec
INSERT INTO avatar_game_data (avatar_id, last_online_at)
VALUES (sqlc.arg(avatar_id), sqlc.arg(last_online_at))
ON CONFLICT (avatar_id) DO UPDATE SET last_online_at = excluded.last_online_at;

-- name: SetAvatarMachineID :exec
INSERT INTO avatar_game_data (avatar_id, machine_id)
VALUES (sqlc.arg(avatar_id), CAST(sqlc.arg(machine_id) AS TEXT))
ON CONFLICT (avatar_id) DO UPDATE SET machine_id = excluded.machine_id;

-- name: SetAvatarSoundEnabled :exec
INSERT INTO avatar_game_data (avatar_id, sound_enabled)
VALUES (sqlc.arg(avatar_id), sqlc.arg(sound_enabled))
ON CONFLICT (avatar_id) DO UPDATE SET sound_enabled = excluded.sound_enabled;
