package cms

import (
	"fmt"
	"html"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestTheCommunityPageShowsHolosBoxes(t *testing.T) {
	db, mux := newSite(t)
	q := store.New(db)
	habbo(t, db, "alpha@example.com", "Alpha")
	habbo(t, db, "beta@example.com", "Beta")
	habbo(t, db, "ghost@example.com", "Ghost")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET motto = 'Hi <3' WHERE name = 'Beta'`); err != nil {
		t.Fatal(err)
	}
	ghost, err := q.GetAvatarByName(t.Context(), "Ghost")
	if err != nil {
		t.Fatal(err)
	}
	archiveHabbo(t, db, ghost.ID)
	var ids []int64
	for i := range 5 {
		ids = append(ids, newsArticle(t, db, store.CreateNewsArticleParams{
			Title:       fmt.Sprintf("Article %d", i+1),
			Category:    "Updates",
			ImageURL:    fmt.Sprintf("/web-gallery/images/top-story/%d.png", i+1),
			Summary:     fmt.Sprintf("Summary %d", i+1),
			PublishedAt: testNow.Add(time.Duration(i) * 24 * time.Hour),
		}))
	}
	tagHabbo(t, db, "Tagger", testNow, "retro")
	for _, b := range []store.CreateBannerParams{
		{Title: "First", ImageURL: "/banners/1.gif", LinkURL: "https://example.com/1", Enabled: true},
		{Title: "Hidden", ImageURL: "/banners/2.gif", LinkURL: "/community", Enabled: false},
		{Title: "Second", ImageURL: "/banners/3.gif", LinkURL: "/tags", Enabled: true},
	} {
		b.CreatedAt, b.UpdatedAt = testNow, testNow
		if _, err := q.CreateBanner(t.Context(), b); err != nil {
			t.Fatal(err)
		}
	}

	rec := serve(mux, "GET", "/community", nil, nil)
	body := rec.Body.String()
	wantPage(t, rec, http.StatusOK, "community.html {",
		"{Name:Alpha Figure:hd-180-1 Created:27-10-2026 Motto: Online:false}",
		html.EscapeString("{Name:Beta Figure:hd-180-1 Created:27-10-2026 Motto:Hi <3 Online:false}"),
		fmt.Sprintf("TopStories:[{ID:%d Title:Article 5 Summary:Summary 5 Image:/web-gallery/images/top-story/5.png} {ID:%d Title:Article 4 Summary:Summary 4 Image:/web-gallery/images/top-story/4.png}]", ids[4], ids[3]),
		fmt.Sprintf("MoreNews:[{ID:%d Title:Article 3 Date:2026-10-29} {ID:%d Title:Article 2 Date:2026-10-28}]", ids[2], ids[1]),
		"Cloud:[{Tag:retro Size:100}]",
		"Banners:[{Text:First Image:/banners/1.gif Link:https://example.com/1} {Text:Second Image:/banners/3.gif Link:/tags}]",
	)
	for _, absent := range []string{"Name:Ghost", "Article 1", "Hidden"} {
		if strings.Contains(body, absent) {
			t.Errorf("the page shows %q", absent)
		}
	}
}

func TestTheCommunityPageShowsEighteenHabbos(t *testing.T) {
	db, mux := newSite(t)
	for i := range 20 {
		habbo(t, db, fmt.Sprintf("habbo%02d@example.com", i), fmt.Sprintf("Habbo%02d", i))
	}
	if got := strings.Count(serve(mux, "GET", "/community", nil, nil).Body.String(), "{Name:Habbo"); got != 18 {
		t.Errorf("the grid holds %d habbos, want 18", got)
	}
}

func TestTheNewsPromoHoldsTheNewsThereIs(t *testing.T) {
	db, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/community", nil, nil), http.StatusOK, "TopStories:[] MoreNews:[]", "Banners:[]}")

	first := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Only", Category: "Updates"})
	wantPage(t, serve(mux, "GET", "/community", nil, nil), http.StatusOK,
		fmt.Sprintf("TopStories:[{ID:%d Title:Only Summary: Image:}] MoreNews:[]", first))

	newsArticle(t, db, store.CreateNewsArticleParams{Title: "Second", Category: "Updates", PublishedAt: testNow.Add(time.Hour)})
	third := newsArticle(t, db, store.CreateNewsArticleParams{Title: "Third", Category: "Updates", PublishedAt: testNow.Add(2 * time.Hour)})
	wantPage(t, serve(mux, "GET", "/community", nil, nil), http.StatusOK,
		fmt.Sprintf("{ID:%d Title:Third", third),
		fmt.Sprintf("MoreNews:[{ID:%d Title:Only Date:2026-10-27}]", first))
}

func TestTheCommunityPageClosesForMaintenance(t *testing.T) {
	db, mux := newSite(t)
	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/community", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
}
