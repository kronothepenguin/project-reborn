-- created_at comes first so sqlc types now as a non-null parameter.
-- name: CountActiveBans :one
SELECT COUNT(*) FROM bans
WHERE created_at <= sqlc.arg(now)
  AND lifted_at IS NULL
  AND (expires_at IS NULL OR expires_at > sqlc.arg(now));

-- The strongest active ban on the user or the IP: permanent first, then the
-- latest expiry. user_id is NULL when a login names an unknown habbo. The
-- CAST and the created_at comparison come first so sqlc types ip and now as
-- non-null parameters instead of copying the nullability of bans.ip and
-- bans.expires_at.
-- name: GetActiveBan :one
SELECT * FROM bans
WHERE created_at <= sqlc.arg(now)
  AND (user_id = sqlc.narg(user_id) OR ip = CAST(sqlc.arg(ip) AS TEXT))
  AND lifted_at IS NULL
  AND (expires_at IS NULL OR expires_at > sqlc.arg(now))
ORDER BY expires_at IS NULL DESC, expires_at DESC
LIMIT 1;

-- name: CreateBan :one
INSERT INTO bans (user_id, ip, reason, issued_by_user_id, created_at, expires_at)
VALUES (
    sqlc.narg(user_id), sqlc.narg(ip), sqlc.arg(reason), sqlc.narg(issued_by_user_id),
    sqlc.arg(created_at), sqlc.narg(expires_at)
)
RETURNING *;

-- name: GetBan :one
SELECT * FROM bans WHERE id = sqlc.arg(id);

-- Active as GetActiveBan defines it, newest first, with the user's first habbo to
-- name them. A ban on an address alone has no habbo.
-- name: ListActiveBans :many
SELECT bans.id, bans.user_id, bans.ip, bans.reason, bans.expires_at,
       CAST(COALESCE((
           SELECT avatars.name FROM avatars
           WHERE avatars.user_id = bans.user_id
           ORDER BY avatars.created_at, avatars.id
           LIMIT 1
       ), '') AS TEXT) AS habbo
FROM bans
WHERE bans.created_at <= sqlc.arg(now)
  AND bans.lifted_at IS NULL
  AND (bans.expires_at IS NULL OR bans.expires_at > sqlc.arg(now))
ORDER BY bans.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- A lifted ban stays as history.
-- name: LiftBan :execrows
UPDATE bans SET lifted_at = sqlc.arg(lifted_at), lifted_by_user_id = sqlc.narg(lifted_by_user_id)
WHERE id = sqlc.arg(id) AND lifted_at IS NULL;

-- name: GetOldestAlert :one
SELECT * FROM alerts
WHERE avatar_id = sqlc.arg(avatar_id) AND dismissed_at IS NULL
ORDER BY id
LIMIT 1;

-- name: DismissAlert :execrows
UPDATE alerts SET dismissed_at = sqlc.arg(dismissed_at)
WHERE id = sqlc.arg(id) AND avatar_id = sqlc.arg(avatar_id) AND dismissed_at IS NULL;

-- name: CreateAlert :exec
INSERT INTO alerts (avatar_id, sender_user_id, message, created_at)
VALUES (sqlc.arg(avatar_id), sqlc.narg(sender_user_id), sqlc.arg(message), sqlc.arg(created_at));

-- One row for each habbo that can still read it: an archived one cannot sign in.
-- name: CreateAlertForEveryone :execrows
INSERT INTO alerts (avatar_id, sender_user_id, message, created_at)
SELECT avatars.id, sqlc.narg(sender_user_id), sqlc.arg(message), sqlc.arg(created_at)
FROM avatars
WHERE avatars.archived_at IS NULL;

-- name: CountActiveAlerts :one
SELECT COUNT(*) FROM alerts WHERE dismissed_at IS NULL;

-- name: ListActiveAlerts :many
SELECT alerts.id, alerts.avatar_id, alerts.sender_user_id, alerts.message, avatars.name AS habbo
FROM alerts
JOIN avatars ON avatars.id = alerts.avatar_id
WHERE alerts.dismissed_at IS NULL
ORDER BY alerts.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: CountOpenHelpTickets :one
SELECT COUNT(*) FROM help_tickets WHERE picked_up_at IS NULL AND closed_at IS NULL;

-- Picked up or not, as Holo's overview listed them until they were deleted.
-- name: CountUnclosedHelpTickets :one
SELECT COUNT(*) FROM help_tickets WHERE closed_at IS NULL;

-- name: ListUnclosedHelpTickets :many
SELECT help_tickets.id, help_tickets.subject, help_tickets.created_at, help_tickets.picked_up_at, avatars.name AS habbo
FROM help_tickets
LEFT JOIN avatars ON avatars.id = help_tickets.avatar_id
WHERE help_tickets.closed_at IS NULL
ORDER BY help_tickets.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: GetHelpTicket :one
SELECT help_tickets.*, avatars.name AS habbo, avatars.user_id AS habbo_user_id
FROM help_tickets
LEFT JOIN avatars ON avatars.id = help_tickets.avatar_id
WHERE help_tickets.id = sqlc.arg(id);

-- name: PickUpHelpTicket :execrows
UPDATE help_tickets
SET picked_up_by_user_id = sqlc.narg(picked_up_by_user_id), picked_up_at = sqlc.narg(picked_up_at)
WHERE id = sqlc.arg(id) AND picked_up_at IS NULL AND closed_at IS NULL;

-- A closed ticket stays as history, and only a ticket someone took can be closed.
-- name: CloseHelpTicket :execrows
UPDATE help_tickets SET closed_at = sqlc.narg(closed_at)
WHERE id = sqlc.arg(id) AND picked_up_at IS NOT NULL AND closed_at IS NULL;
