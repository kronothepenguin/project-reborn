package store

import (
	"bytes"
	"database/sql"
	"slices"
	"testing"
	"time"
)

func writeArticle(t *testing.T, q *Queries, author sql.NullInt64, title, category string, at time.Time) NewsArticle {
	t.Helper()
	article, err := q.CreateNewsArticle(t.Context(), CreateNewsArticleParams{
		AvatarID:    author,
		Title:       title,
		Category:    category,
		ImageURL:    "/web-gallery/images/top-story/top_story_news.png",
		Summary:     "About " + title,
		Body:        "[b]" + title + "[/b]",
		PublishedAt: at,
		CreatedAt:   at,
		UpdatedAt:   at,
	})
	if err != nil {
		t.Fatalf("CreateNewsArticle %s: %v", title, err)
	}
	return article
}

func articleTitles[T any](rows []T, title func(T) string) []string {
	var titles []string
	for _, row := range rows {
		titles = append(titles, title(row))
	}
	return titles
}

func TestNewsArticlesListNewestFirst(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	author := sql.NullInt64{Int64: avatar.ID, Valid: true}
	for i, title := range []string{"First", "Second", "Third", "Fourth", "Fifth"} {
		category := "News"
		if i%2 == 1 {
			category = "Events & Competitions"
		}
		writeArticle(t, q, author, title, category, testNow.Add(time.Duration(i)*time.Hour))
	}
	writeArticle(t, q, sql.NullInt64{}, "Sixth", "News", testNow.Add(4*time.Hour))

	all := must(q.ListNewsArticles(ctx))
	if got := articleTitles(all, func(r ListNewsArticlesRow) string { return r.Title }); !slices.Equal(got, []string{"Sixth", "Fifth", "Fourth", "Third", "Second", "First"}) {
		t.Errorf("archive = %v, want newest first, the later id first on the same date", got)
	}
	if all[0].Author != "" || all[1].Author != "Krono" {
		t.Errorf("authors = %q, %q, want none and Krono", all[0].Author, all[1].Author)
	}
	latest := must(q.ListLatestNewsArticles(ctx, 4))
	if got := articleTitles(latest, func(r ListLatestNewsArticlesRow) string { return r.Title }); !slices.Equal(got, []string{"Sixth", "Fifth", "Fourth", "Third"}) {
		t.Errorf("latest 4 = %v", got)
	}
	events := must(q.ListNewsArticlesInCategory(ctx, ListNewsArticlesInCategoryParams{Category: "Events & Competitions", RowLimit: 25}))
	if got := articleTitles(events, func(r ListNewsArticlesInCategoryRow) string { return r.Title }); !slices.Equal(got, []string{"Fourth", "Second"}) {
		t.Errorf("Events & Competitions = %v", got)
	}
}

func TestEditingAnArticleKeepsItsAuthorAndDate(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, avatar := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	article := writeArticle(t, q, sql.NullInt64{Int64: avatar.ID, Valid: true}, "First", "News", testNow)

	n, err := q.UpdateNewsArticle(ctx, UpdateNewsArticleParams{ID: article.ID, Title: "Changed", Category: "Staff", ImageURL: "https://example.com/top.png", Summary: "s", Body: "b", UpdatedAt: testNow.Add(time.Hour)})
	if err != nil || n != 1 {
		t.Fatalf("UpdateNewsArticle = %d, %v", n, err)
	}
	got := must(q.GetNewsArticle(ctx, article.ID))
	if got.Title != "Changed" || got.Category != "Staff" || got.ImageURL != "https://example.com/top.png" || got.Author != "Krono" || !got.PublishedAt.Equal(testNow) {
		t.Errorf("article = %+v", got)
	}
	if n, err := q.DeleteNewsArticle(ctx, article.ID); err != nil || n != 1 {
		t.Errorf("DeleteNewsArticle = %d, %v", n, err)
	}
	if _, err := q.GetNewsArticle(ctx, article.ID); !IsNotFound(err) {
		t.Errorf("GetNewsArticle after the delete = %v", err)
	}
}

func TestBannersListInTheOrderTheyWereAdded(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	var ids []int64
	for i, title := range []string{"One", "Two", "Three"} {
		banner, err := q.CreateBanner(ctx, CreateBannerParams{Title: title, ImageURL: "https://example.com/" + title + ".gif", LinkURL: "/news", Enabled: i != 1, CreatedAt: testNow, UpdatedAt: testNow})
		if err != nil {
			t.Fatal(err)
		}
		ids = append(ids, banner.ID)
	}
	if got := articleTitles(must(q.ListBanners(ctx)), func(b Banner) string { return b.Title }); !slices.Equal(got, []string{"One", "Two", "Three"}) {
		t.Errorf("banners = %v", got)
	}
	if got := articleTitles(must(q.ListEnabledBanners(ctx)), func(b Banner) string { return b.Title }); !slices.Equal(got, []string{"One", "Three"}) {
		t.Errorf("enabled banners = %v", got)
	}
	if n, err := q.UpdateBanner(ctx, UpdateBannerParams{ID: ids[1], Title: "Two", ImageURL: "https://example.com/2.gif", LinkURL: "/community", Enabled: true, UpdatedAt: testNow}); err != nil || n != 1 {
		t.Fatalf("UpdateBanner = %d, %v", n, err)
	}
	if got := len(must(q.ListEnabledBanners(ctx))); got != 3 {
		t.Errorf("%d enabled banners after enabling Two, want 3", got)
	}
	if n, err := q.DeleteBanner(ctx, ids[0]); err != nil || n != 1 {
		t.Errorf("DeleteBanner = %d, %v", n, err)
	}
}

func TestImagesKeepTheirBytes(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	data := []byte("\x89PNG\r\n\x1a\nnot really a png")
	id, err := q.CreateImage(t.Context(), CreateImageParams{Format: "png", Data: data, Width: 300, Height: 187, CreatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	image := must(q.GetImage(t.Context(), id))
	if image.Format != "png" || !bytes.Equal(image.Data, data) {
		t.Errorf("image = %s %q", image.Format, image.Data)
	}
	if _, err := q.CreateImage(t.Context(), CreateImageParams{Format: "jpeg", Data: data, Width: 300, Height: 187, CreatedAt: testNow}); err == nil {
		t.Error("an image of another format was stored")
	}
}
