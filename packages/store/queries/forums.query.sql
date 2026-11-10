-- name: CreateForumThread :one
INSERT INTO forum_threads (avatar_id, title, created_at)
VALUES (CAST(sqlc.arg(avatar_id) AS INTEGER), sqlc.arg(title), sqlc.arg(created_at))
RETURNING *;

-- name: CreateForumPost :one
INSERT INTO forum_posts (forum_thread_id, avatar_id, body, created_at)
VALUES (sqlc.arg(forum_thread_id), CAST(sqlc.arg(avatar_id) AS INTEGER), sqlc.arg(body), sqlc.arg(created_at))
RETURNING *;

-- name: GetForumThread :one
SELECT * FROM forum_threads WHERE id = sqlc.arg(id);

-- Every load of a thread counts (0094).
-- name: CountForumThreadView :exec
UPDATE forum_threads SET views = views + 1 WHERE id = sqlc.arg(id);

-- name: UpdateForumThread :execrows
UPDATE forum_threads SET title = sqlc.arg(title), sticky = sqlc.arg(sticky), locked = sqlc.arg(locked)
WHERE id = sqlc.arg(id);

-- Its posts go with it.
-- name: DeleteForumThread :execrows
DELETE FROM forum_threads WHERE id = sqlc.arg(id);

-- A thread whose last post was deleted goes with it.
-- name: DeleteEmptyForumThread :execrows
DELETE FROM forum_threads
WHERE forum_threads.id = sqlc.arg(id) AND NOT EXISTS (SELECT 1 FROM forum_posts WHERE forum_posts.forum_thread_id = forum_threads.id);

-- name: GetForumPost :one
SELECT * FROM forum_posts WHERE id = sqlc.arg(id);

-- name: EditForumPost :execrows
UPDATE forum_posts
SET body = sqlc.arg(body), edited_at = sqlc.arg(edited_at), edited_by_avatar_id = CAST(sqlc.arg(edited_by_avatar_id) AS INTEGER)
WHERE id = sqlc.arg(id);

-- name: DeleteForumPost :execrows
DELETE FROM forum_posts WHERE id = sqlc.arg(id);

-- The habbo's newest post, which the spam check measures from (0091).
-- name: GetLastForumPostAt :one
SELECT created_at FROM forum_posts WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER)
ORDER BY created_at DESC, id DESC
LIMIT 1;

-- The habbo's posts on the board, its Messages:.
-- name: CountAvatarForumPosts :one
SELECT COUNT(*) FROM forum_posts WHERE avatar_id = CAST(sqlc.arg(avatar_id) AS INTEGER);

-- The board's pages count the threads that are not sticky (0088).
-- name: CountForumThreads :one
SELECT COUNT(*) FROM forum_threads WHERE NOT sticky;

-- The sticky threads, or a page of the others, each list by its newest post as Holo's
-- board did, with the opener, the newest post's habbo and time, and the replies. An
-- archived habbo carries its archive time (0089). A row_limit of -1 lists every row.
-- name: ListForumThreads :many
SELECT
    forum_threads.id,
    forum_threads.title,
    forum_threads.sticky,
    forum_threads.locked,
    forum_threads.views,
    forum_threads.created_at,
    CAST(COALESCE(opener.name, '') AS TEXT) AS opener_name,
    opener.archived_at AS opener_archived_at,
    last_post.created_at AS last_post_at,
    CAST(COALESCE(last_poster.name, '') AS TEXT) AS last_poster_name,
    last_poster.archived_at AS last_poster_archived_at,
    (SELECT COUNT(*) - 1 FROM forum_posts WHERE forum_posts.forum_thread_id = forum_threads.id) AS replies
FROM forum_threads
JOIN forum_posts AS last_post ON last_post.id = (
    SELECT forum_posts.id FROM forum_posts
    WHERE forum_posts.forum_thread_id = forum_threads.id
    ORDER BY forum_posts.created_at DESC, forum_posts.id DESC
    LIMIT 1
)
LEFT JOIN avatars AS opener ON opener.id = forum_threads.avatar_id
LEFT JOIN avatars AS last_poster ON last_poster.id = last_post.avatar_id
WHERE forum_threads.sticky = sqlc.arg(sticky)
ORDER BY last_post.created_at DESC, forum_threads.id DESC
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);

-- name: CountForumPosts :one
SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = sqlc.arg(forum_thread_id);

-- A page of the thread's posts, oldest first, with what Holo's post boxes show of their
-- habbos: the figure, the motto, the worn badge, the favourite group, the posts the
-- habbo has on the board, and the habbo that last edited the post.
-- name: ListForumPosts :many
SELECT
    forum_posts.id,
    forum_posts.body,
    forum_posts.created_at,
    forum_posts.edited_at,
    CAST(COALESCE(forum_posts.avatar_id, 0) AS INTEGER) AS author_id,
    CAST(COALESCE(author.name, '') AS TEXT) AS author_name,
    CAST(COALESCE(author.figure, '') AS TEXT) AS author_figure,
    CAST(COALESCE(author.motto, '') AS TEXT) AS author_motto,
    author.archived_at AS author_archived_at,
    CAST(COALESCE((
        SELECT avatar_badges.code FROM avatar_badges
        WHERE avatar_badges.avatar_id = forum_posts.avatar_id AND avatar_badges.slot > 0
        ORDER BY avatar_badges.slot
        LIMIT 1
    ), '') AS TEXT) AS badge,
    CAST(COALESCE(favourite.group_id, 0) AS INTEGER) AS group_id,
    CAST(COALESCE(groups.badge, '') AS TEXT) AS group_badge,
    (SELECT COUNT(*) FROM forum_posts AS mine WHERE mine.avatar_id = forum_posts.avatar_id) AS messages,
    CAST(COALESCE(editor.name, '') AS TEXT) AS editor_name,
    editor.archived_at AS editor_archived_at
FROM forum_posts
LEFT JOIN avatars AS author ON author.id = forum_posts.avatar_id
LEFT JOIN group_members AS favourite ON favourite.avatar_id = forum_posts.avatar_id AND favourite.favourite
LEFT JOIN groups ON groups.id = favourite.group_id
LEFT JOIN avatars AS editor ON editor.id = forum_posts.edited_by_avatar_id
WHERE forum_posts.forum_thread_id = sqlc.arg(forum_thread_id)
ORDER BY forum_posts.created_at, forum_posts.id
LIMIT sqlc.arg(row_limit) OFFSET sqlc.arg(row_offset);
