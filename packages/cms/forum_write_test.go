package cms

import (
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type forumAnswer struct {
	Location string `json:"location"`
	Error    string `json:"error"`
}

func newThread(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, title, message string) (int, forumAnswer) {
	t.Helper()
	rec := edit(mux, cookie, "/forum/threads", map[string]string{"title": title, "message": message})
	if rec.Code == http.StatusUnauthorized || rec.Code == http.StatusNotFound {
		return rec.Code, forumAnswer{}
	}
	return rec.Code, decode[forumAnswer](t, rec)
}

func replyTo(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, thread int64, message string) (int, forumAnswer) {
	t.Helper()
	rec := edit(mux, cookie, fmt.Sprintf("/forum/threads/%d/posts", thread), map[string]string{"message": message})
	if rec.Code == http.StatusUnauthorized || rec.Code == http.StatusNotFound {
		return rec.Code, forumAnswer{}
	}
	return rec.Code, decode[forumAnswer](t, rec)
}

func TestANewThreadOpensWithItsFirstPost(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	code, answer := newThread(t, mux, login(t, db, "Frank"), "  Hello there  ", "Hi [b]all[/b]\nBye")
	if code != http.StatusOK || answer.Location != "/forum/threads/1" {
		t.Fatalf("opening a thread = %d %+v", code, answer)
	}
	th, err := store.New(db).GetForumThread(t.Context(), 1)
	if err != nil {
		t.Fatal(err)
	}
	posts, err := store.New(db).ListForumPosts(t.Context(), store.ListForumPostsParams{ForumThreadID: 1, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if th.Title != "Hello there" || !th.AvatarID.Valid || th.AvatarID.Int64 != avatarID(t, db, "Frank") || th.Sticky || th.Locked {
		t.Errorf("the thread = %+v", th)
	}
	if len(posts) != 1 || posts[0].Body != "Hi [b]all[/b]\nBye" || posts[0].AuthorName != "Frank" {
		t.Errorf("its posts = %+v", posts)
	}
}

func TestNewThreadsAreRefusedWithHolosTexts(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	setting(t, db, "forum.spamSeconds", 0)
	cookie := login(t, db, "Frank")
	for _, c := range []struct{ title, message, want string }{
		{"   ", "Hi", "Topic title may not be blank"},
		{strings.Repeat("é", 31), "Hi", "Topic title may not be longer than 30 characters"},
		{"Hello", " \n ", "Post may not be blank"},
		{"Hello", strings.Repeat("é", 65_536), "Post may not be longer than 65535 characters"},
	} {
		if code, answer := newThread(t, mux, cookie, c.title, c.message); code != http.StatusUnprocessableEntity || answer.Error != c.want {
			t.Errorf("%.20q/%.20q = %d %+v, want %q", c.title, c.message, code, answer, c.want)
		}
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_threads`); n != 0 {
		t.Errorf("refusals wrote %d threads", n)
	}
	for _, c := range []struct{ title, message string }{
		{strings.Repeat("é", 30), "Hi"},
		{"Long", strings.Repeat("é", 65_535)},
	} {
		if code, answer := newThread(t, mux, cookie, c.title, c.message); code != http.StatusOK {
			t.Errorf("a thread at the limits = %d %+v", code, answer)
		}
	}
	if code, _ := newThread(t, mux, nil, "Hello", "Hi"); code != http.StatusUnauthorized {
		t.Errorf("a guest's thread = %d, want 401", code)
	}
	setting(t, db, "features.forum", false)
	if code, _ := newThread(t, mux, cookie, "Hello", "Hi"); code != http.StatusNotFound {
		t.Errorf("a thread on a closed board = %d, want 404", code)
	}
}

func TestARepliesGoesToTheThreadsLastPage(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "dora@example.com", "Dora")
	setting(t, db, "forum.spamSeconds", 0)
	th := thread(t, db, avatarID(t, db, "Frank"), "Hello", testNow, 9)
	cookie := login(t, db, "Dora")

	code, answer := replyTo(t, mux, cookie, th.ID, "Me too")
	if want := fmt.Sprintf("/forum/threads/%d?page=2#page-bottom", th.ID); code != http.StatusOK || answer.Location != want {
		t.Fatalf("a reply = %d %+v, want %s", code, answer, want)
	}
	posts, err := store.New(db).ListForumPosts(t.Context(), store.ListForumPostsParams{ForumThreadID: th.ID, RowLimit: 1, RowOffset: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(posts) != 1 || posts[0].Body != "Me too" || posts[0].AuthorName != "Dora" {
		t.Errorf("the reply = %+v", posts)
	}

	if code, answer := replyTo(t, mux, cookie, th.ID, "  "); code != http.StatusUnprocessableEntity || answer.Error != "Post may not be blank" {
		t.Errorf("a blank reply = %d %+v", code, answer)
	}
	if code, _ := replyTo(t, mux, cookie, 9999, "Hi"); code != http.StatusNotFound {
		t.Errorf("a reply to no thread = %d, want 404", code)
	}
	if code, _ := replyTo(t, mux, nil, th.ID, "Hi"); code != http.StatusUnauthorized {
		t.Errorf("a guest's reply = %d, want 401", code)
	}
	pin(t, db, th, true)
	if code, answer := replyTo(t, mux, cookie, th.ID, "Too late"); code != http.StatusUnprocessableEntity || answer.Error != "closed" {
		t.Errorf("a reply to a closed thread = %d %+v", code, answer)
	}
	if code, answer := replyTo(t, mux, cookie, th.ID, " "); code != http.StatusUnprocessableEntity || answer.Error != "closed" {
		t.Errorf("a blank reply to a closed thread = %d %+v, want it closed first", code, answer)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_posts WHERE forum_thread_id = ?`, th.ID); n != 11 {
		t.Errorf("the thread holds %d posts, want 11", n)
	}
}

func TestPostsWaitForTheSpamCheck(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	cookie := login(t, db, "Frank")
	setting(t, db, "forum.spamSeconds", 30)
	if code, answer := newThread(t, mux, cookie, "First", "Hi"); code != http.StatusOK {
		t.Fatalf("the first thread = %d %+v", code, answer)
	}
	if code, answer := newThread(t, mux, cookie, "Second", "Hi"); code != http.StatusUnprocessableEntity || answer.Error != "Spam detected!" {
		t.Errorf("a thread right after = %d %+v", code, answer)
	}
	if code, answer := replyTo(t, mux, cookie, 1, "Again"); code != http.StatusUnprocessableEntity || answer.Error != "Spam detected!" {
		t.Errorf("a reply right after = %d %+v", code, answer)
	}
	if _, err := db.ExecContext(t.Context(), `UPDATE forum_posts SET created_at = ?`, time.Now().UTC().Add(-31*time.Second)); err != nil {
		t.Fatal(err)
	}
	if code, answer := replyTo(t, mux, cookie, 1, "Later"); code != http.StatusOK {
		t.Errorf("a reply 31 seconds on = %d %+v", code, answer)
	}
	setting(t, db, "forum.spamSeconds", 0)
	if code, answer := replyTo(t, mux, cookie, 1, "Off"); code != http.StatusOK {
		t.Errorf("a reply with the check off = %d %+v", code, answer)
	}
}

func TestTheForumPagesHoldTheViewersOwnBox(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "frank@example.com", "Frank")
	frank := avatarID(t, db, "Frank")
	club := groupOf(t, db, frank, "Club", testNow)
	favourite(t, db, club.ID, frank)
	if _, err := store.New(db).GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: frank, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	th := thread(t, db, frank, "Hello", testNow, 2)
	cookie := login(t, db, "Frank")
	box := fmt.Sprintf("Me:{Name:Frank Figure:hd-180-1 Motto: Messages:3 Badge:/c_images/album1584/ADM.gif Group:%d GroupBadge:%s Online:false}", club.ID, club.Badge)
	wantPage(t, serve(mux, "GET", "/forum", cookie, nil), http.StatusOK, box, "Smilies:true")
	wantPage(t, serve(mux, "GET", fmt.Sprintf("/forum/threads/%d", th.ID), cookie, nil), http.StatusOK, box, "Smilies:true")
	wantPage(t, serve(mux, "GET", "/forum", nil, nil), http.StatusOK, "Me:{Name: Figure: Motto: Messages:0 Badge: Group:0 GroupBadge: Online:false}")
}
