package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// iot/go.php's answers to a report, and the subject of the ticket a report writes.
const (
	reportAsk     = "Is the post you have selected offensive or breaking the rules? Are you sure you want to report this post?"
	reportThanks  = "Thank you for reporting this post."
	reportWaiting = "Unable to report post: you still have a pending support request. Please try again later. Note that post reports also count as support requests."
	reportInvalid = "Invalid post specified"
	reportSubject = "DISCUSSION BOARD - REPORTED POST"
)

// reportMessage is the text of go.php's ticket: the post, its thread, the post's
// text and its address on the thread's page.
const reportMessage = `This user has reported a post on the Discussion Board. The Post ID is %d, in thread %d.

Original Message
-----------------------------------
%s

URL:
-----------------------------------
%s/forum/threads/%d?page=%d#post-%d`

// reportPage is the Help Tool window of a report. Ask shows Proceed, which posts
// the report with the thread's page.
type reportPage struct {
	ShortName string
	ID        int64
	Page      int
	Result    string
	Ask       bool
}

// reportedPage is the page of the thread that a report names, or the first.
func reportedPage(value string) int {
	page, err := strconv.Atoi(value)
	if err != nil || page < 1 {
		return 1
	}
	return page
}

// reportRefusal is go.php's answer that refuses a report of the post id by the
// active habbo, or empty with the post. A request staff have not picked up comes
// first (0090), then a post that does not exist.
func reportRefusal(ctx context.Context, q *store.Queries, avatarID int64, id string) (store.ForumPost, string, error) {
	waiting, err := q.CountWaitingHelpTickets(ctx, avatarID)
	switch {
	case err != nil:
		return store.ForumPost{}, "", err
	case waiting > 0:
		return store.ForumPost{}, reportWaiting, nil
	}
	postID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return store.ForumPost{}, reportInvalid, nil
	}
	post, err := q.GetForumPost(ctx, postID)
	if store.IsNotFound(err) {
		return post, reportInvalid, nil
	}
	return post, "", err
}

// HandleForumPostsReportView handles GET /forum/posts/{id}/report, the report of
// iot/go.php: the Help Tool window asks first (0095), unless go.php refused.
func (r *Router) HandleForumPostsReportView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	post, refusal, err := reportRefusal(ctx, r.deps.Queries, session.AvatarID, req.PathValue("id"))
	if err != nil {
		r.fail(w, err)
		return
	}
	view := reportPage{
		ShortName: settings.String(ctx, r.deps.Queries, "site.shortName"),
		ID:        post.ID,
		Page:      reportedPage(req.URL.Query().Get("page")),
		Result:    refusal,
	}
	switch refusal {
	case "":
		view.Result, view.Ask = reportAsk, true
	case reportInvalid:
		w.WriteHeader(http.StatusNotFound)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "forum/posts/id/report.html", view)
}

// HandleForumPostsReport handles POST /forum/posts/{id}/report, which Proceed sends:
// the active habbo's ticket names the post, as go.php's did, unless go.php refused.
func (r *Router) HandleForumPostsReport(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	view := reportPage{
		ShortName: settings.String(ctx, r.deps.Queries, "site.shortName"),
		Page:      reportedPage(req.PostFormValue("page")),
		Result:    reportThanks,
	}
	var refusal string
	err := r.inTx(ctx, func(q *store.Queries) error {
		post, why, err := reportRefusal(ctx, q, session.AvatarID, req.PathValue("id"))
		if err != nil || why != "" {
			refusal = why
			return err
		}
		view.ID = post.ID
		return q.CreateHelpTicket(ctx, store.CreateHelpTicketParams{
			AvatarID:    session.AvatarID,
			ForumPostID: sql.NullInt64{Int64: post.ID, Valid: true},
			Subject:     reportSubject,
			Message:     fmt.Sprintf(reportMessage, post.ID, post.ForumThreadID, post.Body, settings.String(ctx, q, "site.url"), post.ForumThreadID, view.Page, post.ID),
			IP:          auth.ClientIP(req),
			CreatedAt:   time.Now().UTC(),
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	switch refusal {
	case reportWaiting:
		view.Result = refusal
		w.WriteHeader(http.StatusUnprocessableEntity)
	case reportInvalid:
		view.Result = refusal
		w.WriteHeader(http.StatusNotFound)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "forum/posts/id/report.html", view)
}
