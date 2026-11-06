package router

import "net/http"

// HandleForumThreadsDelete handles POST /forum/threads/{id}/delete, deletetopic.php:
// a moderator deletes the thread with its posts, and goes to the board.
func (r *Router) HandleForumThreadsDelete(w http.ResponseWriter, req *http.Request) {
	thread, ok := r.moderatedThread(w, req)
	if !ok {
		return
	}
	if _, err := r.deps.Queries.DeleteForumThread(req.Context(), thread.ID); err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, threadAnswer{Location: "/forum"})
}
