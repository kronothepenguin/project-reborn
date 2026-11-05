package router

import (
	"context"
	"html/template"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type forumThreadPage struct {
	community
	ImagingURL string
	Smilies    bool
	Me         forumViewer
	ThreadID   int64
	Title      string
	Locked     bool
	Pages      []pageLink
	Posts      []forumPost
}

// forumPost is one of Holo's post boxes. RE marks every post but the thread's
// first, and Even Holo's grey row, every other row from the first.
type forumPost struct {
	ID             int64
	RE             bool
	Date           string
	Author         string
	AuthorArchived bool
	Figure         string
	Motto          string
	Messages       int64
	Badge          string
	Group          int64
	GroupBadge     string
	Edited         bool
	EditedAt       string
	Editor         string
	EditorArchived bool
	HTML           template.HTML
	// Body is the post's BBCode, which Quote and Modify copy.
	Body string
	// CanEdit shows Modify and the delete button.
	CanEdit bool
	Even    bool
}

// HandleForumThreadsView handles GET /forum/threads/{id}, viewthread.php: a page of
// ten posts, oldest first, counting a view on every load (0094). A thread that
// does not exist goes to the board, as in Holo.
func (r *Router) HandleForumThreadsView(w http.ResponseWriter, req *http.Request) {
	if !settings.GetBool("features.forum") {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	}
	ctx := req.Context()
	q := r.deps.Queries
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.Redirect(w, req, "/forum", http.StatusSeeOther)
		return
	}
	thread, err := q.GetForumThread(ctx, id)
	switch {
	case store.IsNotFound(err):
		http.Redirect(w, req, "/forum", http.StatusSeeOther)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	if err := q.CountForumThreadView(ctx, thread.ID); err != nil {
		r.fail(w, err)
		return
	}
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	count, err := q.CountForumPosts(ctx, thread.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	pages := pagesOf(count)
	page := pageOf(req, pages)
	rows, err := q.ListForumPosts(ctx, store.ListForumPostsParams{ForumThreadID: thread.ID, RowLimit: forumPageSize, RowOffset: int64((page - 1) * forumPageSize)})
	if err != nil {
		r.fail(w, err)
		return
	}
	view := forumThreadPage{
		community:  shared,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
		Smilies:    settings.GetBool("features.smilies"),
		ThreadID:   thread.ID,
		Title:      thread.Title,
		Locked:     thread.Locked,
		Pages:      pageLinks(pages, page),
	}
	if view.Me, err = r.forumViewer(ctx); err != nil {
		r.fail(w, err)
		return
	}
	moderator := r.holds(ctx, auth.ForumEdit)
	session, signedIn := auth.FromContext(ctx)
	for i, row := range rows {
		post := forumPost{
			ID:             row.ID,
			RE:             i > 0 || page > 1,
			Date:           row.CreatedAt.UTC().Format(dateFull),
			Author:         row.AuthorName,
			AuthorArchived: row.AuthorArchivedAt.Valid,
			Figure:         row.AuthorFigure,
			Motto:          row.AuthorMotto,
			Messages:       row.Messages,
			Group:          row.GroupID,
			GroupBadge:     row.GroupBadge,
			Edited:         row.EditedAt.Valid,
			Editor:         row.EditorName,
			EditorArchived: row.EditorArchivedAt.Valid,
			HTML:           bbcode.Format(row.Body, view.Smilies),
			Body:           row.Body,
			CanEdit:        signedIn && (moderator || row.AuthorID == session.AvatarID),
			Even:           i%2 == 0,
		}
		if row.Badge != "" {
			post.Badge = image("c_images/album1584/" + row.Badge + ".gif")
		}
		if post.Edited {
			post.EditedAt = row.EditedAt.Time.UTC().Format(dateFull)
		}
		view.Posts = append(view.Posts, post)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "forum/threads/id.html", view)
}

// The limits of Holo's columns, which MySQL cut silently, and the texts that
// refuse a post: Holo's for a blank title and a spammer, and two after them.
const (
	topicMax   = 30
	messageMax = 65_535
	topicBlank = "Topic title may not be blank"
	topicLong  = "Topic title may not be longer than 30 characters"
	postBlank  = "Post may not be blank"
	postLong   = "Post may not be longer than 65535 characters"
	postSpam   = "Spam detected!"
)

type forumWrite struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type forumAnswer struct {
	Location string `json:"location,omitempty"`
	Error    string `json:"error,omitempty"`
}

// messageRefusal is the text that refuses a post's message, or empty.
func messageRefusal(message string) string {
	switch {
	case strings.TrimSpace(message) == "":
		return postBlank
	case utf8.RuneCountInString(message) > messageMax:
		return postLong
	}
	return ""
}

// spamming reports whether the habbo posted within forum.spamSeconds, which 0
// turns off (0091).
func spamming(ctx context.Context, q *store.Queries, avatarID int64, now time.Time) (bool, error) {
	seconds := settings.GetInt("forum.spamSeconds")
	if seconds <= 0 {
		return false, nil
	}
	last, err := q.GetLastForumPostAt(ctx, avatarID)
	if store.IsNotFound(err) {
		return false, nil
	}
	return err == nil && now.Sub(last) < time.Duration(seconds)*time.Second, err
}

// HandleForumThreadsCreate handles POST /forum/threads, savetopic.php: the active
// habbo opens a thread with its first post, and goes to it.
func (r *Router) HandleForumThreadsCreate(w http.ResponseWriter, req *http.Request) {
	if !settings.GetBool("features.forum") {
		http.NotFound(w, req)
		return
	}
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	var body forumWrite
	if !readEdit(w, req, &body) {
		return
	}
	title := strings.TrimSpace(body.Title)
	refusal := messageRefusal(body.Message)
	switch {
	case title == "":
		refusal = topicBlank
	case utf8.RuneCountInString(title) > topicMax:
		refusal = topicLong
	}
	var thread store.ForumThread
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		if refusal != "" {
			return nil
		}
		spam, err := spamming(ctx, q, session.AvatarID, now)
		if err != nil || spam {
			refusal = postSpam
			return err
		}
		if thread, err = q.CreateForumThread(ctx, store.CreateForumThreadParams{AvatarID: session.AvatarID, Title: title, CreatedAt: now}); err != nil {
			return err
		}
		_, err = q.CreateForumPost(ctx, store.CreateForumPostParams{ForumThreadID: thread.ID, AvatarID: session.AvatarID, Body: body.Message, CreatedAt: now})
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, forumAnswer{Error: refusal})
	default:
		r.answerJSON(w, http.StatusOK, forumAnswer{Location: "/forum/threads/" + strconv.FormatInt(thread.ID, 10)})
	}
}
