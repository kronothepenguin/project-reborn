package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// thread writes a thread with its first post and replies by the same habbo, a
// minute apart from at.
func thread(t *testing.T, db *sql.DB, avatar int64, title string, at time.Time, replies int) store.ForumThread {
	t.Helper()
	q := store.New(db)
	th, err := q.CreateForumThread(t.Context(), store.CreateForumThreadParams{AvatarID: avatar, Title: title, CreatedAt: at})
	if err != nil {
		t.Fatal(err)
	}
	for i := range replies + 1 {
		body := fmt.Sprintf("Post %d of %s", i, title)
		if _, err := q.CreateForumPost(t.Context(), store.CreateForumPostParams{ForumThreadID: th.ID, AvatarID: avatar, Body: body, CreatedAt: at.Add(time.Duration(i) * time.Minute)}); err != nil {
			t.Fatal(err)
		}
	}
	return th
}

func pin(t *testing.T, db *sql.DB, th store.ForumThread, locked bool) {
	t.Helper()
	if _, err := store.New(db).UpdateForumThread(t.Context(), store.UpdateForumThreadParams{ID: th.ID, Title: th.Title, Sticky: true, Locked: locked}); err != nil {
		t.Fatal(err)
	}
}

func TestTheBoardShowsEveryStickyOnEachPage(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	frank := avatarID(t, db, "Frank")
	pin(t, db, thread(t, db, frank, "Rules", testNow, 0), true)
	pin(t, db, thread(t, db, frank, "News", testNow.Add(time.Second), 0), false)
	for i := range 12 {
		thread(t, db, frank, fmt.Sprintf("Talk %02d", i), testNow.Add(time.Duration(i+1)*time.Hour), 0)
	}
	thread(t, db, frank, "Long", testNow.Add(30*time.Minute), 10)

	titles := func(body string) []string {
		var got []string
		for _, part := range strings.Split(body, " Title:")[1:] {
			got = append(got, part[:strings.Index(part, " Sticky:")])
		}
		return got
	}
	first := serve(mux, "GET", "/forum", nil, nil)
	wantPage(t, first, http.StatusOK, "forum.html", "Pages:[{Number:1 Current:true} {Number:2 Current:false}]", "Empty:false")
	want := []string{"News", "Rules", "Talk 11", "Talk 10", "Talk 09", "Talk 08", "Talk 07", "Talk 06", "Talk 05", "Talk 04", "Talk 03", "Talk 02"}
	if got := titles(first.Body.String()); strings.Join(got, "|") != strings.Join(want, "|") {
		t.Errorf("page 1 = %v, want %v", got, want)
	}
	second := serve(mux, "GET", "/forum?page=2", nil, nil)
	if got := titles(second.Body.String()); strings.Join(got, "|") != "News|Rules|Talk 01|Talk 00|Long" {
		t.Errorf("page 2 = %v", got)
	}
	wantPage(t, second, http.StatusOK, "Pages:[{Number:1 Current:false} {Number:2 Current:true}]")
	for _, query := range []string{"?page=3", "?page=0", "?page=x"} {
		wantPage(t, serve(mux, "GET", "/forum"+query, nil, nil), http.StatusOK, "{Number:1 Current:true}")
	}

	// Rows alternate from the first, stickies included, and carry Holo's columns.
	body := second.Body.String()
	for _, text := range []string{
		"Title:News Sticky:true Locked:false Pages:[1] Opener:Frank OpenerArchived:false Date:27-10-2026 Time:21:00:01 LastDate:27-10-2026 LastTime:21:00:01 LastPage:1 LastPoster:Frank LastPosterArchived:false Replies:0 Views:0 Even:true}",
		"Title:Rules Sticky:true Locked:true ",
		"Even:false} {ID:",
		"Title:Long Sticky:false Locked:false Pages:[1 2] Opener:Frank OpenerArchived:false Date:27-10-2026 Time:21:30:00 LastDate:27-10-2026 LastTime:21:40:00 LastPage:2 LastPoster:Frank LastPosterArchived:false Replies:10 Views:0 Even:true}",
	} {
		if !strings.Contains(body, text) {
			t.Errorf("page 2 lacks %q: %s", text, body)
		}
	}
}

func TestAnEmptyBoardSaysSo(t *testing.T) {
	db, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/forum", nil, nil), http.StatusOK, "Pages:[] Threads:[] Empty:true")

	// Holo counted every thread, so a board of stickies alone is not empty, though
	// it has no page.
	habbo(t, db, "frank@example.com", "Frank")
	pin(t, db, thread(t, db, avatarID(t, db, "Frank"), "Rules", testNow, 0), false)
	wantPage(t, serve(mux, "GET", "/forum", nil, nil), http.StatusOK, "Pages:[] Threads:[{ID:1 Title:Rules", "Empty:false")
}

func TestTheBoardNeedsTheForumFeature(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	th := thread(t, db, avatarID(t, db, "Frank"), "Hello", testNow, 0)
	setSetting(t, db, "features.forum", false)
	wantRedirect(t, serve(mux, "GET", "/forum", nil, nil), "/")
	wantRedirect(t, serve(mux, "GET", fmt.Sprintf("/forum/threads/%d", th.ID), nil, nil), "/")
	if n := countRows(t, db, `SELECT views FROM forum_threads WHERE id = ?`, th.ID); n != 0 {
		t.Errorf("a refused visit counted %d views", n)
	}
}

func TestAThreadCountsEveryLoad(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	th := thread(t, db, avatarID(t, db, "Frank"), "Hello", testNow, 0)
	path := fmt.Sprintf("/forum/threads/%d", th.ID)
	for range 2 {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "forum/threads/id.html", "Title:Hello Locked:false")
	}
	if n := countRows(t, db, `SELECT views FROM forum_threads WHERE id = ?`, th.ID); n != 2 {
		t.Errorf("two loads counted %d views", n)
	}
	wantRedirect(t, serve(mux, "GET", "/forum/threads/9999", nil, nil), "/forum")
	wantRedirect(t, serve(mux, "GET", "/forum/threads/x", nil, nil), "/forum")
}

func TestAThreadShowsTenPostsAPage(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	th := thread(t, db, avatarID(t, db, "Frank"), "Long", testNow, 11)
	path := fmt.Sprintf("/forum/threads/%d", th.ID)

	first := serve(mux, "GET", path, nil, nil).Body.String()
	if n := strings.Count(first, " RE:true "); n != 9 || !strings.Contains(first, " RE:false ") {
		t.Errorf("page 1 marks %d posts RE, want all but the first: %s", n, first)
	}
	if !strings.Contains(first, "Pages:[{Number:1 Current:true} {Number:2 Current:false}]") || strings.Count(first, "{ID:") != 10 {
		t.Errorf("page 1 = %s", first)
	}
	second := serve(mux, "GET", path+"?page=2", nil, nil).Body.String()
	if strings.Count(second, " RE:true ") != 2 || strings.Contains(second, " RE:false ") || !strings.Contains(second, "Post 11 of Long") {
		t.Errorf("page 2 = %s", second)
	}
	if third := serve(mux, "GET", path+"?page=3", nil, nil).Body.String(); !strings.Contains(third, "{Number:1 Current:true}") {
		t.Errorf("a page out of range = %s", third)
	}
}

func TestPostBoxesShowTheirHabbos(t *testing.T) {
	db, mux := newSite(t)
	q := store.New(db)
	habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "dora@example.com", "Dora")
	frank, dora := avatarID(t, db, "Frank"), avatarID(t, db, "Dora")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET motto = 'Ask <me>' WHERE id = ?`, frank); err != nil {
		t.Fatal(err)
	}
	if _, err := q.GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: frank, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	club := groupOf(t, db, frank, "Club", testNow)
	favourite(t, db, club.ID, frank)
	th := thread(t, db, frank, "Hello", testNow, 0)
	reply, err := q.CreateForumPost(t.Context(), store.CreateForumPostParams{ForumThreadID: th.ID, AvatarID: dora, Body: "[b]Hi[/b] <i>", CreatedAt: testNow.Add(time.Minute)})
	if err != nil {
		t.Fatal(err)
	}
	edited := sql.NullTime{Time: testNow.Add(time.Hour), Valid: true}
	if _, err := q.EditForumPost(t.Context(), store.EditForumPostParams{ID: reply.ID, Body: "[b]Hi[/b] <i>", EditedAt: edited, EditedByAvatarID: frank}); err != nil {
		t.Fatal(err)
	}
	path := fmt.Sprintf("/forum/threads/%d", th.ID)

	body := serve(mux, "GET", path, nil, nil).Body.String()
	for _, text := range []string{
		fmt.Sprintf("RE:false Date:27-10-2026 21:00:00 Author:Frank AuthorArchived:false Figure:hd-180-1 Motto:Ask &lt;me&gt; Messages:1 Badge:/c_images/album1584/ADM.gif Group:%d GroupBadge:%s Edited:false", club.ID, club.Badge),
		"RE:true Date:27-10-2026 21:01:00 Author:Dora AuthorArchived:false",
		// The printed page escapes the post's HTML once more.
		"Badge: Group:0 GroupBadge: Edited:true EditedAt:27-10-2026 22:00:00 Editor:Frank EditorArchived:false HTML:&lt;strong&gt;Hi&lt;/strong&gt; &amp;lt;i&amp;gt; Body:[b]Hi[/b] &lt;i&gt; CanEdit:false CanReport:false Even:false}",
		"HTML:Post 0 of Hello Body:Post 0 of Hello CanEdit:false CanReport:false Even:true}",
	} {
		if !strings.Contains(body, text) {
			t.Errorf("the thread lacks %q: %s", text, body)
		}
	}

	if _, err := q.ArchiveAvatar(t.Context(), store.ArchiveAvatarParams{ID: frank, UserID: userOf(t, db, frank), ArchivedAt: sql.NullTime{Time: testNow, Valid: true}, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	body = serve(mux, "GET", path, nil, nil).Body.String()
	if !strings.Contains(body, "Author:Frank AuthorArchived:true") || !strings.Contains(body, "Editor:Frank EditorArchived:true") {
		t.Errorf("an archived habbo is not flagged: %s", body)
	}
	board := serve(mux, "GET", "/forum", nil, nil).Body.String()
	if !strings.Contains(board, "Opener:Frank OpenerArchived:true") || !strings.Contains(board, "LastPoster:Dora LastPosterArchived:false") {
		t.Errorf("the board does not flag the archived opener: %s", board)
	}
}
