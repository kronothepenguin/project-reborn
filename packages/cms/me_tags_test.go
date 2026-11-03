package cms

import (
	"encoding/json"
	"net/http"
	"slices"
	"testing"
)

type tagsReply struct {
	Tags  []string `json:"tags"`
	Error string   `json:"error"`
}

func tag(t *testing.T, mux *http.ServeMux, cookie *http.Cookie, path string, body any) (int, tagsReply) {
	t.Helper()
	rec := edit(mux, cookie, path, body)
	var reply tagsReply
	json.Unmarshal(rec.Body.Bytes(), &reply)
	return rec.Code, reply
}

func TestTagsNeedASession(t *testing.T) {
	_, mux := storeSite(t)
	if rec := edit(mux, nil, "/me/tags", map[string]string{"tag": "holo"}); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's tag answers %d", rec.Code)
	}
}

func TestAddingTags(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)
	cookie := login(t, db, "Frank")

	code, reply := tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "Holo"})
	if code != http.StatusOK || !slices.Equal(reply.Tags, []string{"holo"}) {
		t.Errorf("add = %d %+v", code, reply)
	}
	for _, bad := range []string{"holo", "a", "abcdefghijklmnopqrstu", "two words", "<b>", "café", ""} {
		code, reply := tag(t, mux, cookie, "/me/tags", map[string]string{"tag": bad})
		if code != http.StatusUnprocessableEntity || reply.Error != "invalid" || !slices.Equal(reply.Tags, []string{"holo"}) {
			t.Errorf("%q = %d %+v", bad, code, reply)
		}
	}
	if code, _ := tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "abcdefghijklmnopqrst"}); code != http.StatusOK {
		t.Errorf("a tag of 20 answers %d", code)
	}
}

func TestATagLimit(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)
	setting(t, db, "homes.maxTags", 2)
	cookie := login(t, db, "Frank")
	tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "one"})
	tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "two"})

	code, reply := tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "three"})
	if code != http.StatusUnprocessableEntity || reply.Error != "limit" || len(reply.Tags) != 2 {
		t.Errorf("past the limit = %d %+v", code, reply)
	}
}

func TestRemovingATag(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)
	cookie := login(t, db, "Frank")
	tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "one"})
	tag(t, mux, cookie, "/me/tags", map[string]string{"tag": "two"})

	code, reply := tag(t, mux, cookie, "/me/tags/one/delete", map[string]string{})
	if code != http.StatusOK || !slices.Equal(reply.Tags, []string{"two"}) {
		t.Errorf("remove = %d %+v", code, reply)
	}
}

func TestTagsAreTheActiveHabbos(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)
	owner(t, db, "other@example.com", "Other", 0)
	tag(t, mux, login(t, db, "Other"), "/me/tags", map[string]string{"tag": "theirs"})

	code, reply := tag(t, mux, login(t, db, "Frank"), "/me/tags/theirs/delete", map[string]string{})
	if code != http.StatusOK || len(reply.Tags) != 0 {
		t.Errorf("remove = %d %+v", code, reply)
	}
	wantPage(t, serve(mux, "GET", "/home/Other", nil, nil), http.StatusOK, "Tags:[theirs]")
}
