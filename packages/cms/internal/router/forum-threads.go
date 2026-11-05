package router

import (
	"html/template"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type forumThreadPage struct {
	community
	ImagingURL string
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
	Even           bool
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
		ThreadID:   thread.ID,
		Title:      thread.Title,
		Locked:     thread.Locked,
		Pages:      pageLinks(pages, page),
	}
	smilies := settings.GetBool("features.smilies")
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
			HTML:           bbcode.Format(row.Body, smilies),
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
