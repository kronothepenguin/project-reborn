package router

import (
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// threadClosed answers a reply to a thread closed since the page loaded, which the
// form then shows closed, where Holo's reply vanished.
const threadClosed = "closed"

// HandleForumThreadsPostsCreate handles POST /forum/threads/{id}/posts,
// savepost.php: the active habbo replies, and goes to the thread's last page.
func (r *Router) HandleForumThreadsPostsCreate(w http.ResponseWriter, req *http.Request) {
	if !settings.Bool(req.Context(), r.deps.Queries, "features.forum") {
		http.NotFound(w, req)
		return
	}
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	var body forumWrite
	if !readEdit(w, req, &body) {
		return
	}
	refusal := messageRefusal(body.Message)
	missing := false
	var count int64
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		thread, err := q.GetForumThread(ctx, id)
		switch {
		case store.IsNotFound(err):
			missing = true
			return nil
		case err != nil:
			return err
		case thread.Locked:
			refusal = threadClosed
			return nil
		case refusal != "":
			return nil
		}
		spam, err := spamming(ctx, q, session.AvatarID, now)
		if err != nil || spam {
			refusal = postSpam
			return err
		}
		if _, err := q.CreateForumPost(ctx, store.CreateForumPostParams{ForumThreadID: id, AvatarID: session.AvatarID, Body: body.Message, CreatedAt: now}); err != nil {
			return err
		}
		count, err = q.CountForumPosts(ctx, id)
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case missing:
		http.NotFound(w, req)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, forumAnswer{Error: refusal})
	default:
		location := "/forum/threads/" + strconv.FormatInt(id, 10) + "?page=" + strconv.Itoa(pagesOf(count)) + "#page-bottom"
		r.answerJSON(w, http.StatusOK, forumAnswer{Location: location})
	}
}
