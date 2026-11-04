package cms

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// tagHabbo makes a habbo whose profile took tags a minute apart from at.
func tagHabbo(t *testing.T, db *sql.DB, name string, at time.Time, tags ...string) int64 {
	t.Helper()
	_, avatarID := owner(t, db, strings.ToLower(name)+"@example.com", name, 0)
	q := store.New(db)
	profile, err := q.GetAvatarProfile(t.Context(), avatarID)
	if err != nil {
		t.Fatal(err)
	}
	for i, tag := range tags {
		if _, err := q.AddProfileTag(t.Context(), store.AddProfileTagParams{ProfileID: profile.ID, Tag: tag, CreatedAt: at.Add(time.Duration(i) * time.Minute)}); err != nil {
			t.Fatal(err)
		}
	}
	return avatarID
}

func archiveHabbo(t *testing.T, db *sql.DB, avatarID int64) {
	t.Helper()
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, avatarID); err != nil {
		t.Fatal(err)
	}
}

func tagsOf(t *testing.T, db *sql.DB, avatarID int64) []string {
	t.Helper()
	q := store.New(db)
	profile, err := q.GetAvatarProfile(t.Context(), avatarID)
	if err != nil {
		t.Fatal(err)
	}
	tags, err := q.ListProfileTags(t.Context(), profile.ID)
	if err != nil {
		t.Fatal(err)
	}
	return tags
}

func TestTheCloudSizesTagsByHowManyHabbosCarryThem(t *testing.T) {
	db, mux := newSite(t)
	tagHabbo(t, db, "Alpha", testNow, "retro", "party", "holo")
	tagHabbo(t, db, "Beta", testNow, "retro", "party")
	tagHabbo(t, db, "Gamma", testNow, "retro")
	archiveHabbo(t, db, tagHabbo(t, db, "Ghost", testNow, "retro", "ghost"))

	rec := serve(mux, "GET", "/tags", nil, nil)
	wantPage(t, rec, http.StatusOK, "tags.html {", "{Tag:retro Size:200}", "{Tag:party Size:150}", "{Tag:holo Size:100}",
		"TagFight:true Searched:false Tag: Results:[] CanTag:false}")
	if strings.Contains(rec.Body.String(), "ghost") {
		t.Error("the cloud shows the tag of an archived habbo")
	}
}

func TestTheCloudOfOneCountSizesEveryTag100(t *testing.T) {
	db, mux := newSite(t)
	tagHabbo(t, db, "Alpha", testNow, "retro", "holo")
	wantPage(t, serve(mux, "GET", "/tags", nil, nil), http.StatusOK, "{Tag:retro Size:100}", "{Tag:holo Size:100}")
}

func TestTheCloudShowsTwentyTags(t *testing.T) {
	db, mux := newSite(t)
	var tags []string
	for i := range 25 {
		tags = append(tags, fmt.Sprintf("tag%02d", i))
	}
	tagHabbo(t, db, "Alpha", testNow, tags...)
	if got := strings.Count(serve(mux, "GET", "/tags", nil, nil).Body.String(), "{Tag:tag"); got != 20 {
		t.Errorf("the cloud has %d tags, want 20", got)
	}
}

func TestASearchListsTheHabbosWithTheTag(t *testing.T) {
	db, mux := newSite(t)
	gamma := tagHabbo(t, db, "Gamma", testNow.Add(2*time.Hour), "retro")
	tagHabbo(t, db, "Alpha", testNow, "holo", "retro")
	archiveHabbo(t, db, tagHabbo(t, db, "Ghost", testNow.Add(-time.Hour), "retro"))
	tagHabbo(t, db, "Beta", testNow.Add(time.Hour), "party")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET motto = 'I <3 "retro"' WHERE id = ?`, gamma); err != nil {
		t.Fatal(err)
	}

	rec := serve(mux, "GET", "/tags?tag=Retro", nil, nil)
	wantPage(t, rec, http.StatusOK, "tags.html {",
		"Searched:true Tag:retro Results:[{Name:Alpha Figure:hd-180-1 Motto: Tags:[holo retro]} "+
			html.EscapeString(`{Name:Gamma Figure:hd-180-1 Motto:I <3 "retro" Tags:[retro]}] CanTag:false}`))
}

func TestASearchMatchesTheTagExactly(t *testing.T) {
	db, mux := newSite(t)
	tagHabbo(t, db, "Alpha", testNow, "retro")
	for _, query := range []string{"retr%25", "r_tro", "retr", "%25"} {
		wantPage(t, serve(mux, "GET", "/tags?tag="+query, nil, nil), http.StatusOK, "Searched:true", "Results:[] CanTag:false}")
	}
	wantPage(t, serve(mux, "GET", "/tags?tag=", nil, nil), http.StatusOK, "Searched:false Tag: Results:[]")
}

func TestASearchListsTwenty(t *testing.T) {
	db, mux := newSite(t)
	for i := range 25 {
		tagHabbo(t, db, fmt.Sprintf("Habbo%02d", i), testNow.Add(time.Duration(i)*time.Minute), "retro")
	}
	body := serve(mux, "GET", "/tags?tag=retro", nil, nil).Body.String()
	if got := strings.Count(body, "{Name:Habbo"); got != 20 {
		t.Errorf("the search lists %d habbos, want 20", got)
	}
	if !strings.Contains(body, "Results:[{Name:Habbo00 ") || !strings.Contains(body, "{Name:Habbo19 ") || strings.Contains(body, "Habbo20") {
		t.Errorf("the search does not list the first 20 to take the tag: %s", body)
	}
}

func TestAHabboIsOfferedTheTagItSearched(t *testing.T) {
	db, mux := newSite(t)
	alpha := tagHabbo(t, db, "Alpha", testNow, "retro")
	cookie := login(t, db, "Alpha")

	for query, want := range map[string]string{
		"newtag":                "CanTag:true",
		"NewTag":                "CanTag:true",
		"retro":                 "CanTag:false",
		"a":                     "CanTag:false",
		"new-tag":               "CanTag:false",
		strings.Repeat("x", 21): "CanTag:false",
	} {
		if rec := serve(mux, "GET", "/tags?tag="+query, cookie, nil); !strings.Contains(rec.Body.String(), want+"}") {
			t.Errorf("searching %q: want %s: %s", query, want, rec.Body)
		}
	}
	wantPage(t, serve(mux, "GET", "/tags?tag=newtag", nil, nil), http.StatusOK, "CanTag:false}")

	setSetting(t, db, "homes.maxTags", 1)
	wantPage(t, serve(mux, "GET", "/tags?tag=newtag", cookie, nil), http.StatusOK, "CanTag:false}")
	if got := tagsOf(t, db, alpha); !slices.Equal(got, []string{"retro"}) {
		t.Errorf("tags = %v", got)
	}
}

func TestTaggingYourselfFromASearch(t *testing.T) {
	db, mux := newSite(t)
	alpha := tagHabbo(t, db, "Alpha", testNow, "retro")
	cookie := login(t, db, "Alpha")

	wantRedirect(t, serve(mux, "POST", "/tags", cookie, map[string][]string{"tag": {"NewTag"}}), "/tags?tag=newtag")
	if got := tagsOf(t, db, alpha); !slices.Equal(got, []string{"retro", "newtag"}) {
		t.Errorf("tags = %v, want newtag added", got)
	}
	wantRedirect(t, serve(mux, "POST", "/tags", cookie, map[string][]string{"tag": {"a b"}}), "/tags?tag=a+b")
	setSetting(t, db, "homes.maxTags", 2)
	wantRedirect(t, serve(mux, "POST", "/tags", cookie, map[string][]string{"tag": {"third"}}), "/tags?tag=third")
	if got := tagsOf(t, db, alpha); !slices.Equal(got, []string{"retro", "newtag"}) {
		t.Errorf("tags = %v, want the refused tags left out", got)
	}
}

func TestAGuestCannotTagItself(t *testing.T) {
	db, mux := newSite(t)
	alpha := tagHabbo(t, db, "Alpha", testNow, "retro")
	wantRedirect(t, serve(mux, "POST", "/tags", nil, map[string][]string{"tag": {"newtag"}}), "/")
	if got := tagsOf(t, db, alpha); !slices.Equal(got, []string{"retro"}) {
		t.Errorf("tags = %v", got)
	}
}

func fight(mux *http.ServeMux, body string) *httptest.ResponseRecorder {
	r := httptest.NewRequest("POST", "/tags/fight", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func TestTheTagFightCountsTheHabbosOfEachTag(t *testing.T) {
	db, mux := newSite(t)
	tagHabbo(t, db, "Alpha", testNow, "retro", "holo")
	tagHabbo(t, db, "Beta", testNow, "retro")
	archiveHabbo(t, db, tagHabbo(t, db, "Ghost", testNow, "retro", "holo"))

	for body, want := range map[string]fightAnswer{
		`{"tag1":"retro","tag2":"holo"}`:   {2, 1},
		`{"tag1":"Holo  ","tag2":"RETRO"}`: {1, 2},
		`{"tag1":" retro","tag2":"none"}`:  {0, 0},
		`{"tag1":"retr%","tag2":"r_tro"}`:  {0, 0},
	} {
		rec := fight(mux, body)
		var got fightAnswer
		if err := json.Unmarshal(rec.Body.Bytes(), &got); rec.Code != http.StatusOK || err != nil || got != want {
			t.Errorf("fight %s = %d %s, want %+v", body, rec.Code, rec.Body, want)
		}
	}
	for _, body := range []string{`{"tag1":"","tag2":"holo"}`, `{"tag1":"retro"}`, `not json`} {
		if rec := fight(mux, body); rec.Code != http.StatusBadRequest {
			t.Errorf("fight %s = %d, want 400", body, rec.Code)
		}
	}
}

type fightAnswer struct {
	Hits1 int64 `json:"hits1"`
	Hits2 int64 `json:"hits2"`
}

func TestTheTagFightSwitch(t *testing.T) {
	db, mux := newSite(t)
	tagHabbo(t, db, "Alpha", testNow, "retro")
	setSetting(t, db, "features.tagFight", false)

	wantPage(t, serve(mux, "GET", "/tags", nil, nil), http.StatusOK, "TagFight:false")
	if rec := fight(mux, `{"tag1":"retro","tag2":"holo"}`); rec.Code != http.StatusNotFound {
		t.Errorf("a fight with the switch off = %d, want 404", rec.Code)
	}
}

func TestTheTagsCloseForMaintenance(t *testing.T) {
	db, mux := newSite(t)
	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/tags", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
	if rec := fight(mux, `{"tag1":"retro","tag2":"holo"}`); rec.Code != http.StatusServiceUnavailable {
		t.Errorf("a fight during maintenance = %d, want 503", rec.Code)
	}
}
