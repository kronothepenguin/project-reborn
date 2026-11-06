package cms

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type threadSettings struct {
	Title  string `json:"title"`
	Closed bool   `json:"closed"`
	Sticky bool   `json:"sticky"`
}

type threadAnswer struct {
	Message  string `json:"message"`
	Location string `json:"location"`
	Error    string `json:"error"`
}

func openThreadSettings(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, thread int64) (int, threadSettings) {
	t.Helper()
	r := httptest.NewRequest("GET", fmt.Sprintf("/forum/threads/%d/settings", thread), nil)
	r.Header.Set("Accept", "application/json")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	var got threadSettings
	if rec.Code == http.StatusOK {
		if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
			t.Fatalf("decode %q: %v", rec.Body.String(), err)
		}
	}
	return rec.Code, got
}

func saveThreadSettings(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, thread int64, s threadSettings) (int, threadAnswer) {
	t.Helper()
	rec := edit(mux, cookie, fmt.Sprintf("/forum/threads/%d/settings", thread), s)
	var got threadAnswer
	json.Unmarshal(rec.Body.Bytes(), &got)
	return rec.Code, got
}

func TestModeratorsRenameCloseAndStickAThread(t *testing.T) {
	db, mux, _, _ := board(t)
	eve := login(t, db, "Eve")
	if code, got := openThreadSettings(t, mux, eve, 1); code != http.StatusOK || got != (threadSettings{Title: "Hello"}) {
		t.Fatalf("opening the Moderation Tools = %d %+v", code, got)
	}

	code, answer := saveThreadSettings(t, mux, eve, 1, threadSettings{Title: "  Renamed  ", Closed: true, Sticky: true})
	want := threadAnswer{Message: "The thread has been updated successfully.", Location: "/forum/threads/1?page=1#page-bottom"}
	if code != http.StatusOK || answer != want {
		t.Fatalf("saving = %d %+v, want %+v", code, answer, want)
	}
	th, err := store.New(db).GetForumThread(t.Context(), 1)
	if err != nil || th.Title != "Renamed" || !th.Locked || !th.Sticky {
		t.Errorf("the saved thread = %+v, %v", th, err)
	}
	if _, got := openThreadSettings(t, mux, eve, 1); got != (threadSettings{Title: "Renamed", Closed: true, Sticky: true}) {
		t.Errorf("reopening shows %+v", got)
	}

	for title, refusal := range map[string]string{
		"   ":                   "Topic title may not be empty",
		strings.Repeat("a", 31): "Topic title may not be longer than 30 characters",
	} {
		if code, answer := saveThreadSettings(t, mux, eve, 1, threadSettings{Title: title}); code != http.StatusUnprocessableEntity || answer.Error != refusal {
			t.Errorf("saving %q = %d %+v, want %q", title, code, answer, refusal)
		}
	}
	if th, _ := store.New(db).GetForumThread(t.Context(), 1); th.Title != "Renamed" || !th.Locked {
		t.Errorf("a refused save changed the thread: %+v", th)
	}
	if code, _ := saveThreadSettings(t, mux, eve, 1, threadSettings{Title: strings.Repeat("é", 30)}); code != http.StatusOK {
		t.Errorf("30 characters of two bytes each = %d, want 200", code)
	}
}

func TestOnlyModeratorsReachTheModerationTools(t *testing.T) {
	db, mux, _, _ := board(t)
	for _, name := range []string{"Frank", "Dora"} {
		cookie := login(t, db, name)
		if code, _ := openThreadSettings(t, mux, cookie, 1); code != http.StatusForbidden {
			t.Errorf("%s opening the Moderation Tools = %d, want 403", name, code)
		}
		if code, _ := saveThreadSettings(t, mux, cookie, 1, threadSettings{Title: "Mine"}); code != http.StatusForbidden {
			t.Errorf("%s saving = %d, want 403", name, code)
		}
	}
	if code, _ := openThreadSettings(t, mux, nil, 1); code != http.StatusUnauthorized {
		t.Errorf("a guest opening the Moderation Tools = %d, want 401", code)
	}
	eve := login(t, db, "Eve")
	if code, _ := openThreadSettings(t, mux, eve, 9999); code != http.StatusNotFound {
		t.Errorf("opening no thread = %d, want 404", code)
	}
	setting(t, db, "features.forum", false)
	if code, _ := saveThreadSettings(t, mux, eve, 1, threadSettings{Title: "Off"}); code != http.StatusNotFound {
		t.Errorf("saving on a switched-off board = %d, want 404", code)
	}
}

func TestModeratorsDeleteAThreadWithItsPosts(t *testing.T) {
	db, mux, _, _ := board(t)
	remove := func(cookie *http.Cookie) (int, threadAnswer) {
		rec := edit(mux, cookie, "/forum/threads/1/delete", map[string]any{})
		var got threadAnswer
		json.Unmarshal(rec.Body.Bytes(), &got)
		return rec.Code, got
	}
	if code, _ := remove(login(t, db, "Frank")); code != http.StatusForbidden {
		t.Errorf("the author deleting the thread = %d, want 403", code)
	}
	if code, _ := remove(nil); code != http.StatusUnauthorized {
		t.Errorf("a guest deleting the thread = %d, want 401", code)
	}
	if code, answer := remove(login(t, db, "Eve")); code != http.StatusOK || answer.Location != "/forum" {
		t.Errorf("a moderator deleting the thread = %d %+v, want the board", code, answer)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_threads`); n != 0 {
		t.Errorf("%d threads left", n)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM forum_posts`); n != 0 {
		t.Errorf("%d posts left", n)
	}
	if code, _ := remove(login(t, db, "Eve")); code != http.StatusNotFound {
		t.Errorf("deleting it again = %d, want 404", code)
	}
}

func TestOnlyModeratorsSeeTheModerationToolsLink(t *testing.T) {
	db, mux, _, _ := board(t)
	moderator := func(cookie *http.Cookie) string {
		body := serve(mux, "GET", "/forum/threads/1", cookie, nil).Body.String()
		i := strings.Index(body, " Moderator:")
		if i < 0 {
			t.Fatalf("the page has no Moderator: %s", body)
		}
		return body[i+len(" Moderator:"):][:4]
	}
	for who, want := range map[string]string{"Eve": "true", "Frank": "fals", "Dora": "fals"} {
		if got := moderator(login(t, db, who)); got != want {
			t.Errorf("%s sees Moderator %s, want %s", who, got, want)
		}
	}
	if got := moderator(nil); got != "fals" {
		t.Errorf("a guest sees Moderator %s", got)
	}
}
