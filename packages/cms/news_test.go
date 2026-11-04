package cms

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func newsArticle(t *testing.T, db *sql.DB, a store.CreateNewsArticleParams) int64 {
	t.Helper()
	if a.PublishedAt.IsZero() {
		a.PublishedAt = testNow
	}
	a.CreatedAt, a.UpdatedAt = a.PublishedAt, a.PublishedAt
	row, err := store.New(db).CreateNewsArticle(t.Context(), a)
	if err != nil {
		t.Fatalf("CreateNewsArticle: %v", err)
	}
	return row.ID
}

// between is the text of page from after open to the next close.
func between(t *testing.T, page, open, close string) string {
	t.Helper()
	start := strings.Index(page, open)
	if start < 0 {
		t.Fatalf("the page lacks %q: %s", open, page)
	}
	rest := page[start+len(open):]
	end := strings.Index(rest, close)
	if end < 0 {
		t.Fatalf("the page lacks %q after %q: %s", close, open, page)
	}
	return rest[:end]
}

// thirtyUpdates writes Article 1 to Article 30 in Updates, an hour apart, and
// returns their ids, oldest first.
func thirtyUpdates(t *testing.T, db *sql.DB) []int64 {
	t.Helper()
	var ids []int64
	for i := range 30 {
		ids = append(ids, newsArticle(t, db, store.CreateNewsArticleParams{
			Title:       fmt.Sprintf("Article %d", i+1),
			Category:    "Updates",
			PublishedAt: testNow.Add(time.Duration(i) * time.Hour),
		}))
	}
	return ids
}

func listed(ids []int64, from, to int, dated bool) string {
	var items []string
	for i := from; i >= to; i-- {
		date := ""
		if dated {
			date = testNow.Add(time.Duration(i-1) * time.Hour).Format("2006-01-02")
		}
		items = append(items, fmt.Sprintf("{ID:%d Title:Article %d Date:%s}", ids[i-1], i, date))
	}
	return strings.Join(items, " ")
}

func TestTheArchiveListsEveryArticleNewestFirst(t *testing.T) {
	db, mux := newSite(t)
	ids := thirtyUpdates(t, db)

	rec := serve(mux, "GET", "/news", nil, nil)
	wantPage(t, rec, http.StatusOK, "news.html {", "InCategory:false Category: Articles:")
	if got, want := between(t, rec.Body.String(), "Articles:[", "]"), listed(ids, 30, 1, true); got != want {
		t.Errorf("the archive = %s, want every article, newest first: %s", got, want)
	}
	if got, want := between(t, rec.Body.String(), "Headlines:[", "]"), listed(ids, 30, 21, false); got != want {
		t.Errorf("the headlines = %s, want the 10 newest: %s", got, want)
	}
}

func TestACategoryListsItsLast25(t *testing.T) {
	db, mux := newSite(t)
	ids := thirtyUpdates(t, db)
	newsArticle(t, db, store.CreateNewsArticleParams{Title: "Party", Category: "Events", PublishedAt: testNow.Add(48 * time.Hour)})

	rec := serve(mux, "GET", "/news?category=Updates", nil, nil)
	wantPage(t, rec, http.StatusOK, "news.html {", "InCategory:true Category:Updates Articles:")
	if got, want := between(t, rec.Body.String(), "Articles:[", "]"), listed(ids, 30, 6, true); got != want {
		t.Errorf("the category = %s, want its 25 newest: %s", got, want)
	}

	rec = serve(mux, "GET", "/news?category=Events+%26+Competitions", nil, nil)
	wantPage(t, rec, http.StatusOK, html.EscapeString("InCategory:true Category:Events & Competitions Articles:[]"))

	rec = serve(mux, "GET", "/news?category=", nil, nil)
	wantPage(t, rec, http.StatusOK, "InCategory:true Category: Articles:[]")
}

func TestAnArticleShowsItsTextAndAuthor(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "writer@example.com", "Writer")
	writer, err := store.New(db).GetAvatarByName(t.Context(), "Writer")
	if err != nil {
		t.Fatal(err)
	}
	id := newsArticle(t, db, store.CreateNewsArticleParams{
		AvatarID: sql.NullInt64{Int64: writer.ID, Valid: true},
		Title:    "Tom & 'Jerry'",
		Category: "Events & Competitions",
		Summary:  "Line one\r\nLine <two>",
		Body:     "[b]Bold[/b] :) <i>raw</i>\nNext",
	})

	rec := serve(mux, "GET", fmt.Sprintf("/news/%d", id), nil, nil)
	wantPage(t, rec, http.StatusOK,
		"news/id.html {",
		html.EscapeString(fmt.Sprintf("Headlines:[{ID:%d Title:Tom & 'Jerry' Date:}]", id)),
		html.EscapeString("Title:Tom & 'Jerry' Category:Events & Competitions Date:2026-10-27 "),
		html.EscapeString("Summary:Line one<br />\r\nLine &lt;two&gt; "),
		html.EscapeString("Body:<strong>Bold</strong> :) &lt;i&gt;raw&lt;/i&gt;<br />\nNext "),
		"Author:Writer}",
	)
}

func TestAnArticleWithoutAnAuthorHasNone(t *testing.T) {
	db, mux := newSite(t)
	id := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Alone", Category: "Updates"})
	wantPage(t, serve(mux, "GET", fmt.Sprintf("/news/%d", id), nil, nil), http.StatusOK, "news/id.html {", "Author:}")
}

func TestAnUnknownArticleShowsTheArchive(t *testing.T) {
	db, mux := newSite(t)
	id := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Only", Category: "Updates"})
	for _, path := range []string{fmt.Sprintf("/news/%d", id+1), "/news/abc", "/news/0", "/news/-1", "/news/1.5"} {
		rec := serve(mux, "GET", path, nil, nil)
		wantPage(t, rec, http.StatusNotFound, "news.html {", fmt.Sprintf("InCategory:false Category: Articles:[{ID:%d Title:Only Date:2026-10-27}]", id))
	}
}

func TestNoNewsYet(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/news", nil, nil), http.StatusOK, "Headlines:[]", "Articles:[]")
}

func TestTheNewsKnowsWhoReadsIt(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "reader@example.com", "Reader")
	id := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Read me", Category: "Updates"})
	cookie := login(t, db, "Reader")
	for _, path := range []string{"/news", fmt.Sprintf("/news/%d", id)} {
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, "SignedIn:true Habbo:Reader ")
	}
}

func TestTheNewsClosesForMaintenance(t *testing.T) {
	db, mux := newSite(t)
	id := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Closed", Category: "Updates"})
	setMaintenance(t, db, true)
	for _, path := range []string{"/news", fmt.Sprintf("/news/%d", id)} {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusServiceUnavailable, "maintenance.html")
	}
}
