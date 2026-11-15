package router

import (
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// threadUpdated is savetopicsettings.php's answer, and topicEmpty the words of
// viewthread.php's Moderation Tools for a blank title, which Holo checked only
// in the browser.
const (
	threadUpdated = "The thread has been updated successfully."
	topicEmpty    = "Topic title may not be empty"
)

type threadSettings struct {
	Title  string `json:"title"`
	Closed bool   `json:"closed"`
	Sticky bool   `json:"sticky"`
}

type threadAnswer struct {
	Message  string `json:"message,omitempty"`
	Location string `json:"location,omitempty"`
	Error    string `json:"error,omitempty"`
}

// moderatedThread loads the thread of the path for a holder of forum.edit. Anyone
// else gets 403, and a thread that does not exist, or a switched-off board, 404.
func (r *Router) moderatedThread(w http.ResponseWriter, req *http.Request) (store.ForumThread, bool) {
	if !settings.GetBool("features.forum") {
		http.NotFound(w, req)
		return store.ForumThread{}, false
	}
	if !r.holds(req.Context(), auth.ForumEdit) {
		r.answerJSON(w, http.StatusForbidden, threadAnswer{Error: http.StatusText(http.StatusForbidden)})
		return store.ForumThread{}, false
	}
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return store.ForumThread{}, false
	}
	thread, err := r.deps.Queries.GetForumThread(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return thread, false
	case err != nil:
		r.fail(w, err)
		return thread, false
	}
	return thread, true
}

// HandleForumThreadsSettingsJSON handles GET /forum/threads/{id}/settings,
// opentopicsettings.php: the Moderation Tools open on the thread as it is now.
func (r *Router) HandleForumThreadsSettingsJSON(w http.ResponseWriter, req *http.Request) {
	thread, ok := r.moderatedThread(w, req)
	if !ok {
		return
	}
	r.answerJSON(w, http.StatusOK, threadSettings{Title: thread.Title, Closed: thread.Locked, Sticky: thread.Sticky})
}

// HandleForumThreadsSettingsSave handles POST /forum/threads/{id}/settings,
// savetopicsettings.php: a moderator renames the thread, opens or closes it, and
// makes it sticky or normal. The answer leads to the thread's last page, as
// Holo's Proceed did.
func (r *Router) HandleForumThreadsSettingsSave(w http.ResponseWriter, req *http.Request) {
	thread, ok := r.moderatedThread(w, req)
	if !ok {
		return
	}
	var body threadSettings
	if !readEdit(w, req, &body) {
		return
	}
	title := strings.TrimSpace(body.Title)
	switch {
	case title == "":
		r.answerJSON(w, http.StatusUnprocessableEntity, threadAnswer{Error: topicEmpty})
		return
	case utf8.RuneCountInString(title) > topicMax:
		r.answerJSON(w, http.StatusUnprocessableEntity, threadAnswer{Error: topicLong})
		return
	}
	ctx := req.Context()
	q := r.deps.Queries
	if _, err := q.UpdateForumThread(ctx, store.UpdateForumThreadParams{ID: thread.ID, Title: title, Locked: body.Closed, Sticky: body.Sticky}); err != nil {
		r.fail(w, err)
		return
	}
	count, err := q.CountForumPosts(ctx, thread.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	location := "/forum/threads/" + strconv.FormatInt(thread.ID, 10) + "?page=" + strconv.Itoa(pagesOf(count)) + "#page-bottom"
	r.answerJSON(w, http.StatusOK, threadAnswer{Message: threadUpdated, Location: location})
}
