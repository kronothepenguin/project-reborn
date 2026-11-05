package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func editPost(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, post int64, message string) (int, forumAnswer) {
	t.Helper()
	rec := edit(mux, cookie, fmt.Sprintf("/forum/posts/%d", post), map[string]string{"message": message})
	if rec.Code == http.StatusUnauthorized || rec.Code == http.StatusNotFound {
		return rec.Code, forumAnswer{}
	}
	return rec.Code, decode[forumAnswer](t, rec)
}

func deletePost(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, post int64) (int, forumAnswer) {
	t.Helper()
	rec := edit(mux, cookie, fmt.Sprintf("/forum/posts/%d/delete", post), map[string]any{})
	if rec.Code == http.StatusUnauthorized || rec.Code == http.StatusNotFound {
		return rec.Code, forumAnswer{}
	}
	return rec.Code, decode[forumAnswer](t, rec)
}

// board is Frank's thread with Dora's reply, and Eve, who holds forum.edit.
func board(t *testing.T) (db *sql.DB, mux *http.ServeMux, frankPost, doraPost int64) {
	t.Helper()
	db, mux = newSite(t)
	frankUser := habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "dora@example.com", "Dora")
	eve := habbo(t, db, "eve@example.com", "Eve")
	grant(t, db, eve, auth.ForumEdit)
	secondHabbo(t, db, frankUser, "FrankToo")
	th := thread(t, db, avatarID(t, db, "Frank"), "Hello", testNow, 0)
	reply, err := store.New(db).CreateForumPost(t.Context(), store.CreateForumPostParams{ForumThreadID: th.ID, AvatarID: avatarID(t, db, "Dora"), Body: "Hi", CreatedAt: testNow.Add(1)})
	if err != nil {
		t.Fatal(err)
	}
	return db, mux, 1, reply.ID
}

func TestAuthorsAndModeratorsEditPosts(t *testing.T) {
	db, mux, frankPost, _ := board(t)
	q := store.New(db)
	if code, answer := editPost(t, mux, login(t, db, "Frank"), frankPost, "Hello, edited"); code != http.StatusOK || answer.Error != "" {
		t.Fatalf("the author's edit = %d %+v", code, answer)
	}
	post, err := q.GetForumPost(t.Context(), frankPost)
	if err != nil || post.Body != "Hello, edited" || !post.EditedAt.Valid || post.EditedByAvatarID.Int64 != avatarID(t, db, "Frank") {
		t.Errorf("the edited post = %+v, %v", post, err)
	}
	if code, answer := editPost(t, mux, login(t, db, "Eve"), frankPost, "Moderated"); code != http.StatusOK {
		t.Errorf("a moderator's edit = %d %+v", code, answer)
	}
	if post, _ := q.GetForumPost(t.Context(), frankPost); post.Body != "Moderated" || post.EditedByAvatarID.Int64 != avatarID(t, db, "Eve") {
		t.Errorf("the moderated post = %+v", post)
	}

	for _, name := range []string{"Dora", "FrankToo"} {
		if code, _ := editPost(t, mux, login(t, db, name), frankPost, "Mine now"); code != http.StatusForbidden {
			t.Errorf("%s editing Frank's post = %d, want 403", name, code)
		}
	}
	if code, _ := editPost(t, mux, nil, frankPost, "Guest"); code != http.StatusUnauthorized {
		t.Errorf("a guest's edit = %d, want 401", code)
	}
	if code, _ := editPost(t, mux, login(t, db, "Frank"), 9999, "Nothing"); code != http.StatusNotFound {
		t.Errorf("editing no post = %d, want 404", code)
	}
	if code, answer := editPost(t, mux, login(t, db, "Frank"), frankPost, "  "); code != http.StatusUnprocessableEntity || answer.Error != "Post may not be blank" {
		t.Errorf("a blank edit = %d %+v", code, answer)
	}

	// Edits do not count for the spam check (0091), and closed threads take them.
	th, err := q.GetForumThread(t.Context(), 1)
	if err != nil {
		t.Fatal(err)
	}
	pin(t, db, th, true)
	if code, answer := editPost(t, mux, login(t, db, "Frank"), frankPost, "Again at once"); code != http.StatusOK {
		t.Errorf("an edit at once, on a closed thread = %d %+v", code, answer)
	}
	setting(t, db, "features.forum", false)
	if code, _ := editPost(t, mux, login(t, db, "Frank"), frankPost, "Off"); code != http.StatusNotFound {
		t.Errorf("an edit on a closed board = %d, want 404", code)
	}
}

func TestDeletingAPostReturnsToItsThreadUnlessItWent(t *testing.T) {
	db, mux, frankPost, doraPost := board(t)
	if code, _ := deletePost(t, mux, login(t, db, "Dora"), frankPost); code != http.StatusForbidden {
		t.Errorf("Dora deleting Frank's post = %d, want 403", code)
	}
	if code, answer := deletePost(t, mux, login(t, db, "Dora"), doraPost); code != http.StatusOK || answer.Location != "" {
		t.Errorf("deleting a reply = %d %+v, want the thread again", code, answer)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_threads`); n != 1 {
		t.Errorf("deleting a reply took the thread: %d threads", n)
	}
	if code, answer := deletePost(t, mux, login(t, db, "Eve"), frankPost); code != http.StatusOK || answer.Location != "/forum" {
		t.Errorf("a moderator deleting the last post = %d %+v, want the board", code, answer)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_threads`); n != 0 {
		t.Errorf("the empty thread stayed")
	}
	if code, _ := deletePost(t, mux, nil, frankPost); code != http.StatusUnauthorized {
		t.Errorf("a guest's delete = %d, want 401", code)
	}
}

func TestOnlyThoseWhoMayChangeAPostSeeModify(t *testing.T) {
	db, mux, _, _ := board(t)
	path := "/forum/threads/1"
	flags := func(cookie *http.Cookie) string {
		var got []string
		for _, part := range strings.Split(serve(mux, "GET", path, cookie, nil).Body.String(), " CanEdit:")[1:] {
			got = append(got, part[:strings.Index(part, " ")])
		}
		return strings.Join(got, ",")
	}
	for who, want := range map[string]string{"Frank": "true,false", "Dora": "false,true", "Eve": "true,true", "FrankToo": "false,false"} {
		if got := flags(login(t, db, who)); got != want {
			t.Errorf("%s sees CanEdit %s, want %s", who, got, want)
		}
	}
	if got := flags(nil); got != "false,false" {
		t.Errorf("a guest sees CanEdit %s", got)
	}
}
