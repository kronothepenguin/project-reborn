package router

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// forumPageSize is Holo's ten threads, and ten posts, to a page.
const forumPageSize = 10

// pageLink is one number of Holo's View page: list.
type pageLink struct {
	Number  int
	Current bool
}

func pageLinks(pages, current int) []pageLink {
	links := make([]pageLink, 0, pages)
	for n := 1; n <= pages; n++ {
		links = append(links, pageLink{Number: n, Current: n == current})
	}
	return links
}

// pagesOf is how many pages of ten n rows fill.
func pagesOf(n int64) int {
	return int((n + forumPageSize - 1) / forumPageSize)
}

// pageOf is the page asked for, or the first when it is not one of pages, as Holo
// did.
func pageOf(req *http.Request, pages int) int {
	page, err := strconv.Atoi(req.URL.Query().Get("page"))
	if err != nil || page < 1 || page > pages {
		return 1
	}
	return page
}

// splitDate is Holo's date and time of a d-m-Y H:i:s date, which the board shows
// apart.
func splitDate(full string) (string, string) {
	date, clock, _ := strings.Cut(full, " ")
	return date, clock
}

// forumViewer is the active habbo's own post box, which a preview shows.
type forumViewer struct {
	Name       string
	Figure     string
	Motto      string
	Messages   int64
	Badge      string
	Group      int64
	GroupBadge string
}

// forumViewer is the signed-in visitor's box, or none for a guest.
func (r *Router) forumViewer(ctx context.Context) (forumViewer, error) {
	session, ok := auth.FromContext(ctx)
	if !ok {
		return forumViewer{}, nil
	}
	q := r.deps.Queries
	avatar, err := q.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return forumViewer{}, err
	}
	me := forumViewer{Name: avatar.Name, Figure: avatar.Figure, Motto: avatar.Motto}
	if me.Messages, err = q.CountAvatarForumPosts(ctx, avatar.ID); err != nil {
		return me, err
	}
	badge, err := q.GetWornAvatarBadge(ctx, avatar.ID)
	switch {
	case err == nil:
		me.Badge = image("c_images/album1584/" + badge.Code + ".gif")
	case !store.IsNotFound(err):
		return me, err
	}
	favourite, err := q.GetFavouriteGroup(ctx, avatar.ID)
	switch {
	case err == nil:
		me.Group, me.GroupBadge = favourite.ID, favourite.Badge
	case !store.IsNotFound(err):
		return me, err
	}
	return me, nil
}

type forumPage struct {
	community
	ImagingURL string
	Smilies    bool
	Me         forumViewer
	Pages      []pageLink
	Threads    []forumThreadRow
	// Empty is a board with no thread at all, which says so.
	Empty bool
}

// forumThreadRow is one row of the board. Pages are the thread's own, LastPage
// the one its newest post is on, and Even Holo's grey row, every other row from
// the first.
type forumThreadRow struct {
	ID                 int64
	Title              string
	Sticky             bool
	Locked             bool
	Pages              []int
	Opener             string
	OpenerArchived     bool
	Date               string
	Time               string
	LastDate           string
	LastTime           string
	LastPage           int
	LastPoster         string
	LastPosterArchived bool
	Replies            int64
	Views              int64
	Even               bool
}

// HandleForumView handles GET /forum, forum.php: every sticky thread on each page,
// then ten other threads, each list by its newest post (0088). With features.forum
// off, Holo sent the visitor to its index.
func (r *Router) HandleForumView(w http.ResponseWriter, req *http.Request) {
	if !settings.GetBool("features.forum") {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	}
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	q := r.deps.Queries
	count, err := q.CountForumThreads(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	pages := pagesOf(count)
	page := pageOf(req, pages)
	stickies, err := q.ListForumThreads(ctx, store.ListForumThreadsParams{Sticky: true, RowLimit: -1})
	if err != nil {
		r.fail(w, err)
		return
	}
	others, err := q.ListForumThreads(ctx, store.ListForumThreadsParams{RowLimit: forumPageSize, RowOffset: int64((page - 1) * forumPageSize)})
	if err != nil {
		r.fail(w, err)
		return
	}
	view := forumPage{
		community:  shared,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
		Smilies:    settings.GetBool("features.smilies"),
		Pages:      pageLinks(pages, page),
		Empty:      count == 0 && len(stickies) == 0,
	}
	if view.Me, err = r.forumViewer(ctx); err != nil {
		r.fail(w, err)
		return
	}
	for i, row := range append(stickies, others...) {
		view.Threads = append(view.Threads, threadRow(row, i%2 == 0))
	}
	astro.WriteTemplate(w, r.deps.Resolver, "forum.html", view)
}

func threadRow(row store.ListForumThreadsRow, even bool) forumThreadRow {
	out := forumThreadRow{
		ID:                 row.ID,
		Title:              row.Title,
		Sticky:             row.Sticky,
		Locked:             row.Locked,
		Opener:             row.OpenerName,
		OpenerArchived:     row.OpenerArchivedAt.Valid,
		LastPoster:         row.LastPosterName,
		LastPosterArchived: row.LastPosterArchivedAt.Valid,
		LastPage:           pagesOf(row.Replies + 1),
		Replies:            row.Replies,
		Views:              row.Views,
		Even:               even,
	}
	for n := 1; n <= out.LastPage; n++ {
		out.Pages = append(out.Pages, n)
	}
	out.Date, out.Time = splitDate(row.CreatedAt.UTC().Format(dateFull))
	out.LastDate, out.LastTime = splitDate(row.LastPostAt.UTC().Format(dateFull))
	return out
}
