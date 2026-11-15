package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleForumPostsDelete handles POST /forum/posts/{id}/delete, deletepost.php: the
// post goes, and its thread with it when it was the last. The answer sends the
// visitor to the board only then, where Holo sent every deletion there.
func (r *Router) HandleForumPostsDelete(w http.ResponseWriter, req *http.Request) {
	post, ok := r.changedPost(w, req)
	if !ok {
		return
	}
	ctx := req.Context()
	var gone int64
	err := r.inTx(ctx, func(q *store.Queries) error {
		if _, err := q.DeleteForumPost(ctx, post.ID); err != nil {
			return err
		}
		var err error
		gone, err = q.DeleteEmptyForumThread(ctx, post.ForumThreadID)
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case gone > 0:
		r.answerJSON(w, http.StatusOK, forumAnswer{Location: "/forum"})
	default:
		r.answerJSON(w, http.StatusOK, forumAnswer{})
	}
}
