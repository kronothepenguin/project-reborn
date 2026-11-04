package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	newsImageInvalid = "The topstory image must be one of the local images, an uploaded image or an http(s) address."
	pollStory        = "/web-gallery/images/top-story/top_story_poll2.png"
)

var oldNewsDate = time.Date(2008, time.June, 1, 12, 0, 0, 0, time.UTC)

func newsWriter(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Writer", auth.HousekeepingAccess, auth.HousekeepingNews)
}

func articleURL(id int64) string {
	return fmt.Sprintf("/housekeeping/news/%d", id)
}

func articleForm(title, topStory string) url.Values {
	return url.Values{
		"title":       {title},
		"category":    {"Tips"},
		"topstory":    {topStory},
		"short_story": {"A small introduction."},
		"story":       {"[b]The story.[/b]"},
	}
}

// oldArticle writes an article as Holo's form would have, in 2008.
func oldArticle(t *testing.T, db *sql.DB, avatarID int64, category string) int64 {
	t.Helper()
	article, err := store.New(db).CreateNewsArticle(t.Context(), store.CreateNewsArticleParams{
		AvatarID:    sql.NullInt64{Int64: avatarID, Valid: true},
		Title:       "Old news",
		Category:    category,
		ImageURL:    seed.DefaultTopStory,
		Summary:     "Old summary",
		Body:        "Old body",
		PublishedAt: oldNewsDate,
		CreatedAt:   oldNewsDate,
		UpdatedAt:   oldNewsDate,
	})
	if err != nil {
		t.Fatalf("CreateNewsArticle: %v", err)
	}
	return article.ID
}

func newsArticle(t *testing.T, db *sql.DB, id int64) store.GetNewsArticleRow {
	t.Helper()
	article, err := store.New(db).GetNewsArticle(t.Context(), id)
	if err != nil {
		t.Fatalf("GetNewsArticle %d: %v", id, err)
	}
	return article
}

func newestArticle(t *testing.T, db *sql.DB) store.GetNewsArticleRow {
	t.Helper()
	var id int64
	if err := db.QueryRowContext(t.Context(), `SELECT MAX(id) FROM news_articles`).Scan(&id); err != nil {
		t.Fatalf("find the newest article: %v", err)
	}
	return newsArticle(t, db, id)
}

func sameArticle(a, b store.GetNewsArticleRow) bool {
	return a.ID == b.ID && a.AvatarID == b.AvatarID && a.Title == b.Title && a.Category == b.Category &&
		a.ImageURL == b.ImageURL && a.Summary == b.Summary && a.Body == b.Body && a.Author == b.Author &&
		a.PublishedAt.Equal(b.PublishedAt) && a.UpdatedAt.Equal(b.UpdatedAt)
}

func TestTheNewsTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	before := newsArticle(t, db, id)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingBanners, auth.HousekeepingHomeStore, auth.HousekeepingSettings, auth.HousekeepingLogs)

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
	}{
		{"GET", "/housekeeping/news", nil},
		{"GET", "/housekeeping/news/new", nil},
		{"POST", "/housekeeping/news", articleForm("New", seed.DefaultTopStory)},
		{"GET", articleURL(id), nil},
		{"POST", articleURL(id), articleForm("Changed", seed.DefaultTopStory)},
		{"POST", articleURL(id) + "/delete", url.Values{}},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusForbidden, "access-denied.html")
	}
	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 1 {
		t.Errorf("%d articles, want 1", got)
	}
	if after := newsArticle(t, db, id); !sameArticle(after, before) {
		t.Errorf("article = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestTheComposeFormIsHolos(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)

	rec := serve(mux, "GET", "/housekeeping/news/new", cookie, nil)
	wantPage(t, rec, http.StatusOK, "news/new.html",
		"ID:0 Title: Form:{Title: Category:HoloCMS TopStory:/web-gallery/images/top-story/top_story_news.png ShortStory: Story:}",
		"Categories:[{Name:HoloCMS Selected:true} {Name:News Selected:false} {Name:Furniture Selected:false} {Name:Updates Selected:false} {Name:Server Selected:false} {Name:Credits Selected:false} {Name:Holo Club Selected:false} {Name:Maintenance Selected:false} {Name:Technical Selected:false} {Name:Downtime Selected:false} {Name:Website Selected:false} {Name:Special Offers Selected:false} {Name:Sponsored Selected:false} {Name:Events &amp; Competitions Selected:false} {Name:Security Selected:false} {Name:Staff Selected:false} {Name:Announcements Selected:false} {Name:Tips Selected:false} {Name:Holograph Emulator Selected:false} {Name:Other Selected:false}]",
		"TopStories:[/web-gallery/images/top-story/accessories_top.gif /web-gallery/images/top-story/top_story_news.png /web-gallery/images/top-story/top_story_newsflash.png /web-gallery/images/top-story/top_story_poll2.png /web-gallery/images/top-story/topstory_accessories2.gif]",
		"Preview:http://localhost:17387/web-gallery/images/top-story/top_story_news.png")
}

func TestTheClubIsNamedAfterTheSite(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	if err := settings.Set(t.Context(), db, 0, "site.shortName", "Reborn"); err != nil {
		t.Fatalf("settings.Set: %v", err)
	}

	rec := serve(mux, "GET", "/housekeeping/news/new", cookie, nil)
	wantPage(t, rec, http.StatusOK, "{Name:Credits Selected:false} {Name:Reborn Club Selected:false} {Name:Maintenance Selected:false}")
	if strings.Contains(rec.Body.String(), "Holo Club") {
		t.Error("the club keeps Holo's name")
	}
}

func TestPublishingAnArticle(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := newsWriter(t, db)
	writerHabbo := habboOf(t, db, "Writer")

	before := time.Now().UTC()
	form := url.Values{
		"title":       {"Big News"},
		"category":    {"Events & Competitions"},
		"topstory":    {pollStory},
		"short_story": {"A small introduction."},
		"story":       {"[b]The story.[/b]\r\nSecond line."},
	}
	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, form), "/housekeeping/news?published=1")
	after := time.Now().UTC()

	got := newestArticle(t, db)
	if got.Title != "Big News" || got.Category != "Events & Competitions" || got.ImageURL != pollStory ||
		got.Summary != "A small introduction." || got.Body != "[b]The story.[/b]\r\nSecond line." {
		t.Errorf("article = %+v", got)
	}
	if got.AvatarID.Int64 != writerHabbo.ID || got.Author != "Writer" {
		t.Errorf("the author is habbo %v %q, want %d Writer", got.AvatarID, got.Author, writerHabbo.ID)
	}
	if got.PublishedAt.Before(before.Truncate(time.Second)) || got.PublishedAt.After(after) {
		t.Errorf("published at %v, want now", got.PublishedAt)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/news?published=1", cookie, nil), http.StatusOK, "news.html",
		"Message:Article published successfully. Error:",
		fmt.Sprintf("{ID:%d Title:Big News Summary:A small introduction. Date:%s Author:Writer}", got.ID, got.PublishedAt.UTC().Format("2006-01-02")))
	wantOneLog(t, db, "news.create", fmt.Sprintf("Big News (ID: %d)", got.ID), 0, 0)
	wantActor(t, db, "news.create", userID)
}

func TestTheAuthorIsTheActiveHabbo(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "writer@example.com", "Writer")
	grant(t, db, userID, auth.HousekeepingAccess, auth.HousekeepingNews)
	second := secondHabbo(t, db, userID, "WriterTwo")
	cookie := login(t, db, "WriterTwo")

	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("By the second", seed.DefaultTopStory)), "/housekeeping/news?published=1")
	if got := newestArticle(t, db); got.AvatarID.Int64 != second.ID || got.Author != "WriterTwo" {
		t.Errorf("the author is habbo %v %q, want %d WriterTwo", got.AvatarID, got.Author, second.ID)
	}
}

func TestTheListIsNewestFirst(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	habbo(t, db, "author@example.com", "Author")
	old := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Fresh", seed.DefaultTopStory)), "/housekeeping/news?published=1")
	fresh := newestArticle(t, db)

	rec := serve(mux, "GET", "/housekeeping/news", cookie, nil)
	wantPage(t, rec, http.StatusOK, "news.html", fmt.Sprintf(
		"Articles:[{ID:%d Title:Fresh Summary:A small introduction. Date:%s Author:Writer} {ID:%d Title:Old news Summary:Old summary Date:2008-06-01 Author:Author}] Message: Error:",
		fresh.ID, fresh.PublishedAt.UTC().Format("2006-01-02"), old))
}

func TestEditingKeepsTheAuthorAndTheDate(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	author := habboOf(t, db, "Author")
	id := oldArticle(t, db, author.ID, "News")
	editorID, cookie := newsWriter(t, db)

	wantPage(t, serve(mux, "GET", articleURL(id), cookie, nil), http.StatusOK, "news/id.html",
		fmt.Sprintf("ID:%d Title:Old news Form:{Title:Old news Category:News TopStory:%s ShortStory:Old summary Story:Old body}", id, seed.DefaultTopStory),
		"{Name:HoloCMS Selected:false} {Name:News Selected:true}",
		"Preview:http://localhost:17387/web-gallery/images/top-story/top_story_news.png")

	form := articleForm("New title", "https://images.example.com/top.png")
	wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, form), "/housekeeping/news?updated=1")

	got := newsArticle(t, db, id)
	if got.Title != "New title" || got.Category != "Tips" || got.ImageURL != "https://images.example.com/top.png" ||
		got.Summary != "A small introduction." || got.Body != "[b]The story.[/b]" {
		t.Errorf("article = %+v", got)
	}
	if got.AvatarID.Int64 != author.ID || got.Author != "Author" {
		t.Errorf("the author became habbo %v %q, want %d Author", got.AvatarID, got.Author, author.ID)
	}
	if !got.PublishedAt.Equal(oldNewsDate) {
		t.Errorf("the date became %v, want %v", got.PublishedAt, oldNewsDate)
	}
	if !got.UpdatedAt.After(oldNewsDate) {
		t.Errorf("updated at %v", got.UpdatedAt)
	}
	wantOneLog(t, db, "news.update", fmt.Sprintf("New title (ID: %d): title, category, topstory, short_story, story", id), 0, 0)
	wantActor(t, db, "news.update", editorID)
	wantPage(t, serve(mux, "GET", "/housekeeping/news?updated=1", cookie, nil), http.StatusOK,
		"Message:Article updated successfully. Error:")
	wantPage(t, serve(mux, "GET", articleURL(id), cookie, nil), http.StatusOK, "Preview:https://images.example.com/top.png")
}

func TestSavingAnArticleUnchangedLogsNothing(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	_, cookie := newsWriter(t, db)
	before := newsArticle(t, db, id)

	form := url.Values{"title": {"Old news"}, "category": {"News"}, "topstory": {seed.DefaultTopStory}, "short_story": {"Old summary"}, "story": {"Old body"}}
	wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, form), "/housekeeping/news?updated=1")
	if after := newsArticle(t, db, id); !sameArticle(after, before) {
		t.Errorf("article = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

// Holo's form selected Events & Competitions for Security, and HoloCMS for Events
// & Competitions and Other, so that saving moved them.
func TestTheEditFormKeepsTheCategory(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	author := habboOf(t, db, "Author").ID
	_, cookie := newsWriter(t, db)

	for _, c := range []struct {
		category string
		printed  string
	}{
		{"Events & Competitions", "{Name:Events &amp; Competitions Selected:true}"},
		{"Security", "{Name:Security Selected:true}"},
		{"Other", "{Name:Other Selected:true}"},
		{"Holograph Emulator", "{Name:Holograph Emulator Selected:true}"},
	} {
		rec := serve(mux, "GET", articleURL(oldArticle(t, db, author, c.category)), cookie, nil)
		wantPage(t, rec, http.StatusOK, c.printed)
		if selected := strings.Count(rec.Body.String(), "Selected:true"); selected != 1 {
			t.Errorf("%s: %d categories are selected", c.category, selected)
		}
	}

	if err := settings.Set(t.Context(), db, 0, "site.shortName", "Reborn"); err != nil {
		t.Fatalf("settings.Set: %v", err)
	}
	club := oldArticle(t, db, author, "Holo Club")
	rec := serve(mux, "GET", articleURL(club), cookie, nil)
	wantPage(t, rec, http.StatusOK, "{Name:Reborn Club Selected:false}", "{Name:Other Selected:false} {Name:Holo Club Selected:true}]")
	if selected := strings.Count(rec.Body.String(), "Selected:true"); selected != 1 {
		t.Errorf("%d categories are selected", selected)
	}
	form := url.Values{"title": {"Old news"}, "category": {"Holo Club"}, "topstory": {seed.DefaultTopStory}, "short_story": {"Old summary"}, "story": {"Old body"}}
	wantRedirect(t, serve(mux, "POST", articleURL(club), cookie, form), "/housekeeping/news?updated=1")
	if got := newsArticle(t, db, club); got.Category != "Holo Club" {
		t.Errorf("the category became %q", got.Category)
	}
}

func TestATopStoryIsLocalOrAnAddress(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)

	for address, want := range map[string]string{
		"https://images.example.com/top.png":                                           "https://images.example.com/top.png",
		"http://images.habbohotel.co.uk/c_images/Top_Story_Images/top_story_web60.png": "http://images.habbohotel.co.uk/c_images/Top_Story_Images/top_story_web60.png",
		"  https://images.example.com/spaced.png \t":                                   "https://images.example.com/spaced.png",
		"https://images.example.com/top.png?size=large#first":                          "https://images.example.com/top.png?size=large#first",
		seed.TopStories()[0]: seed.TopStories()[0],
		seed.TopStories()[1]: seed.TopStories()[1],
		seed.TopStories()[2]: seed.TopStories()[2],
		seed.TopStories()[3]: seed.TopStories()[3],
		seed.TopStories()[4]: seed.TopStories()[4],
	} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Picture", address)), "/housekeeping/news?published=1")
		if got := newestArticle(t, db).ImageURL; got != want {
			t.Errorf("%q was saved as %q, want %q", address, got, want)
		}
	}
}

func TestABadTopStoryIsRefused(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	before := newsArticle(t, db, id)
	_, cookie := newsWriter(t, db)

	for _, address := range []string{
		"",
		"   ",
		"javascript:alert(1)",
		"data:image/png;base64,iVBORw0KGgo",
		"/web-gallery/images/top-story/nope.png",
		"/web-gallery/images/top-story/../../../config.json",
		"/news/images/1.png",
		"//images.example.com/top.png",
		"ftp://images.example.com/top.png",
		"http://",
		"https:///top.png",
		"top_story_news.png",
		"web-gallery/images/top-story/top_story_news.png",
	} {
		t.Run(address, func(t *testing.T) {
			form := articleForm("Typed", address)
			typed := "TopStory:" + strings.TrimSpace(address) + " ShortStory:A small introduction."
			wantPage(t, serve(mux, "POST", "/housekeeping/news", cookie, form), http.StatusUnprocessableEntity,
				"news/new.html", "Form:{Title:Typed Category:Tips "+typed, "{Name:Tips Selected:true}", "Error:"+newsImageInvalid)
			wantPage(t, serve(mux, "POST", articleURL(id), cookie, form), http.StatusUnprocessableEntity,
				"news/id.html", fmt.Sprintf("ID:%d Title:Old news Form:{Title:Typed Category:Tips %s", id, typed), "Error:"+newsImageInvalid)
		})
	}
	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 1 {
		t.Errorf("%d articles, want 1", got)
	}
	if after := newsArticle(t, db, id); !sameArticle(after, before) {
		t.Errorf("article = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestDeletingAnArticle(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	userID, cookie := newsWriter(t, db)

	wantRedirect(t, serve(mux, "POST", articleURL(id)+"/delete", cookie, url.Values{}), "/housekeeping/news?deleted=1")
	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 0 {
		t.Errorf("%d articles are left", got)
	}
	wantOneLog(t, db, "news.delete", fmt.Sprintf("Old news (ID: %d)", id), 0, 0)
	wantActor(t, db, "news.delete", userID)
	wantPage(t, serve(mux, "GET", "/housekeeping/news?deleted=1", cookie, nil), http.StatusOK,
		"news.html", "Articles:[] Message:Article deleted successfully. Error:")

	wantPage(t, serve(mux, "POST", articleURL(id)+"/delete", cookie, url.Values{}), http.StatusNotFound,
		"news.html", "Error:Unable to delete article; this article does not exist!")
	if rows := logsOf(t, db, "news.delete"); len(rows) != 1 {
		t.Errorf("%d delete rows, want 1", len(rows))
	}
}

func TestAnArticleThatDoesNotExist(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	const editMissing = "Error:Unable to edit article; this article does not exist!"
	const deleteMissing = "Error:Unable to delete article; this article does not exist!"

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
		want   string
	}{
		{"GET", articleURL(999), nil, editMissing},
		{"GET", "/housekeeping/news/abc", nil, editMissing},
		{"POST", articleURL(999), articleForm("Ghost", seed.DefaultTopStory), editMissing},
		{"POST", "/housekeeping/news/abc", articleForm("Ghost", seed.DefaultTopStory), editMissing},
		{"POST", articleURL(999) + "/delete", url.Values{}, deleteMissing},
		{"POST", "/housekeeping/news/abc/delete", url.Values{}, deleteMissing},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusNotFound, "news.html", "Articles:[]", c.want)
	}
	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 0 {
		t.Errorf("%d articles", got)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}
