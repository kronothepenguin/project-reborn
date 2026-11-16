package router

import (
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// mayChangePost reports whether the visitor may change a post of authorID: its
// habbo while that habbo is active (0086), or a holder of forum.edit.
func (r *Router) mayChangePost(req *http.Request, authorID int64) bool {
	session, ok := auth.FromContext(req.Context())
	return ok && (authorID == session.AvatarID || r.holds(req.Context(), auth.ForumEdit))
}

// changedPost loads the post of the path for those who may change it. Anyone else
// gets 403, and a post that does not exist, or a switched-off board, 404.
func (r *Router) changedPost(w http.ResponseWriter, req *http.Request) (store.ForumPost, bool) {
	if !settings.Bool(req.Context(), r.deps.Queries, "features.forum") {
		http.NotFound(w, req)
		return store.ForumPost{}, false
	}
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.ForumPost{}, false
	}
	post, err := r.deps.Queries.GetForumPost(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return post, false
	case err != nil:
		r.fail(w, err)
		return post, false
	case !r.mayChangePost(req, post.AvatarID.Int64):
		r.answerJSON(w, http.StatusForbidden, forumAnswer{Error: http.StatusText(http.StatusForbidden)})
		return post, false
	}
	return post, true
}

// HandleForumPostsEdit handles POST /forum/posts/{id}, updatepost.php: the post
// takes its new text, with the time and the habbo of the edit. Edits do not count
// for the spam check (0091).
func (r *Router) HandleForumPostsEdit(w http.ResponseWriter, req *http.Request) {
	post, ok := r.changedPost(w, req)
	if !ok {
		return
	}
	var body forumWrite
	if !readEdit(w, req, &body) {
		return
	}
	if refusal := messageRefusal(body.Message); refusal != "" {
		r.answerJSON(w, http.StatusUnprocessableEntity, forumAnswer{Error: refusal})
		return
	}
	session, _ := auth.FromContext(req.Context())
	edited := store.EditForumPostParams{ID: post.ID, Body: body.Message, EditedByAvatarID: session.AvatarID}
	edited.EditedAt.Time, edited.EditedAt.Valid = time.Now().UTC(), true
	if _, err := r.deps.Queries.EditForumPost(req.Context(), edited); err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, forumAnswer{})
}
