package store

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"slices"
	"testing"
	"time"
)

func storeImage(t *testing.T, q *Queries, format string, uploader sql.NullInt64, at time.Time) int64 {
	t.Helper()
	id, err := q.CreateImage(t.Context(), CreateImageParams{Format: format, Data: []byte("picture of " + format), Width: 300, Height: 187, CreatedAt: at, CreatedByUserID: uploader})
	if err != nil {
		t.Fatalf("CreateImage: %v", err)
	}
	return id
}

func showing(t *testing.T, q *Queries, title string, image sql.NullInt64, address string) int64 {
	t.Helper()
	article, err := q.CreateNewsArticle(t.Context(), CreateNewsArticleParams{
		Title:       title,
		Category:    "News",
		ImageURL:    address,
		ImageID:     image,
		Summary:     "s",
		Body:        "b",
		PublishedAt: testNow,
		CreatedAt:   testNow,
		UpdatedAt:   testNow,
	})
	if err != nil {
		t.Fatalf("CreateNewsArticle %s: %v", title, err)
	}
	return article.ID
}

func imageLinks(t *testing.T, db *sql.DB) map[string]sql.NullInt64 {
	t.Helper()
	rows, err := db.QueryContext(t.Context(), `SELECT title, image_id FROM news_articles`)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	links := map[string]sql.NullInt64{}
	for rows.Next() {
		var title string
		var image sql.NullInt64
		if err := rows.Scan(&title, &image); err != nil {
			t.Fatal(err)
		}
		links[title] = image
	}
	return links
}

// An older hotel kept only the address, so the update finds the uploads by it.
func TestTheLinkUpdateFindsTheArticlesOfEachUpload(t *testing.T) {
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates := must(Updates())
	if updates[5].Name != "news-image-links" || updates[5].Automatic {
		t.Fatalf("update 6 is %+v, want news-image-links, waiting for an administrator", updates[5])
	}
	must(ApplyUpdates(t.Context(), db, updates[:5]))
	insert := func(query string, args ...any) {
		t.Helper()
		if _, err := db.ExecContext(t.Context(), query, args...); err != nil {
			t.Fatalf("%s: %v", query, err)
		}
	}
	insert(`INSERT INTO images (id, format, data, width, height, created_at) VALUES (1, 'png', x'00', 300, 187, ?), (2, 'gif', x'00', 300, 187, ?)`, testNow, testNow)
	for title, address := range map[string]string{
		"png":            "/news/images/1.png",
		"gif":            "/news/images/2.gif",
		"another png":    "/news/images/1.png",
		"wrong format":   "/news/images/2.png",
		"missing":        "/news/images/3.png",
		"leading zero":   "/news/images/01.png",
		"local":          "/web-gallery/images/top-story/top_story_news.png",
		"address":        "https://images.example.com/news/images/1.png",
		"query":          "/news/images/1.png?size=2",
		"another folder": "/images/1.png",
	} {
		insert(`INSERT INTO news_articles (title, category, image_url, summary, body, published_at, created_at, updated_at) VALUES (?, 'News', ?, 's', 'b', ?, ?, ?)`, title, address, testNow, testNow, testNow)
	}

	must(ApplyUpdates(t.Context(), db, updates[5:6]))
	want := map[string]sql.NullInt64{
		"png":         {Int64: 1, Valid: true},
		"gif":         {Int64: 2, Valid: true},
		"another png": {Int64: 1, Valid: true},
	}
	for title, got := range imageLinks(t, db) {
		if got != want[title] {
			t.Errorf("%s links to %v, want %v", title, got, want[title])
		}
	}

	q := New(db)
	if _, err := q.DeleteImage(t.Context(), 2); !IsForeignKey(err) {
		t.Errorf("deleting the GIF an article shows = %v, want a foreign key refusal", err)
	}
	if got := must(q.GetImage(t.Context(), 2)); got.Format != "gif" {
		t.Errorf("the GIF became %+v", got)
	}
}

func TestAnImageInUseIsNotDeleted(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	used := storeImage(t, q, "png", sql.NullInt64{}, testNow)
	unused := storeImage(t, q, "gif", sql.NullInt64{}, testNow)
	article := showing(t, q, "Uses it", sql.NullInt64{Int64: used, Valid: true}, fmt.Sprintf("/news/images/%d.png", used))

	if n, err := q.DeleteImage(ctx, used); !IsForeignKey(err) || n != 0 {
		t.Errorf("DeleteImage of an image in use = %d, %v, want a foreign key refusal", n, err)
	}
	if n, err := q.DeleteImage(ctx, unused); err != nil || n != 1 {
		t.Errorf("DeleteImage of an unused image = %d, %v", n, err)
	}
	if n, err := q.DeleteImage(ctx, unused); err != nil || n != 0 {
		t.Errorf("DeleteImage of a deleted image = %d, %v", n, err)
	}

	n, err := q.UpdateNewsArticle(ctx, UpdateNewsArticleParams{ID: article, Title: "Uses it", Category: "News", ImageURL: "/web-gallery/images/top-story/top_story_news.png", Summary: "s", Body: "b", UpdatedAt: testNow})
	if err != nil || n != 1 {
		t.Fatalf("UpdateNewsArticle = %d, %v", n, err)
	}
	if got := must(q.GetNewsArticle(ctx, article)); got.ImageID.Valid {
		t.Errorf("the article still links to %v", got.ImageID)
	}
	if n, err := q.DeleteImage(ctx, used); err != nil || n != 1 {
		t.Errorf("DeleteImage once no article shows it = %d, %v", n, err)
	}
}

func TestAnArticleCannotLinkAMissingImage(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	_, err := q.CreateNewsArticle(t.Context(), CreateNewsArticleParams{Title: "Ghost", Category: "News", ImageURL: "/news/images/9.png", ImageID: sql.NullInt64{Int64: 9, Valid: true}, PublishedAt: testNow, CreatedAt: testNow, UpdatedAt: testNow})
	if !IsForeignKey(err) {
		t.Errorf("CreateNewsArticle with a missing image = %v, want a foreign key refusal", err)
	}
	article := showing(t, q, "Plain", sql.NullInt64{}, "https://images.example.com/top.png")
	_, err = q.UpdateNewsArticle(t.Context(), UpdateNewsArticleParams{ID: article, Title: "Plain", Category: "News", ImageURL: "/news/images/9.png", ImageID: sql.NullInt64{Int64: 9, Valid: true}, UpdatedAt: testNow})
	if !IsForeignKey(err) {
		t.Errorf("UpdateNewsArticle with a missing image = %v, want a foreign key refusal", err)
	}
}

func TestImagesListNewestFirstWithWhoUploadedThemAndTheirArticles(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	later, err := q.CreateAvatar(ctx, CreateAvatarParams{UserID: user.ID, Name: "KronoTwo", Figure: "hd-180-1", Gender: "M", CreatedAt: testNow.Add(time.Hour), UpdatedAt: testNow.Add(time.Hour)})
	if err != nil {
		t.Fatal(err)
	}
	uploader := sql.NullInt64{Int64: user.ID, Valid: true}
	first := storeImage(t, q, "png", uploader, testNow)
	second := storeImage(t, q, "gif", sql.NullInt64{}, testNow.Add(time.Minute))
	third := storeImage(t, q, "png", uploader, testNow.Add(time.Minute))
	for _, title := range []string{"Older", "Newer"} {
		showing(t, q, title, sql.NullInt64{Int64: first, Valid: true}, fmt.Sprintf("/news/images/%d.png", first))
	}
	showing(t, q, "Third", sql.NullInt64{Int64: third, Valid: true}, fmt.Sprintf("/news/images/%d.png", third))
	if _, err := db.ExecContext(ctx, `UPDATE news_articles SET published_at = ? WHERE title = 'Newer'`, testNow.Add(time.Hour)); err != nil {
		t.Fatal(err)
	}

	images := must(q.ListImages(ctx))
	if got := articleTitles(images, func(r ListImagesRow) string { return fmt.Sprint(r.ID) }); !slices.Equal(got, []string{fmt.Sprint(third), fmt.Sprint(second), fmt.Sprint(first)}) {
		t.Fatalf("images = %v, want newest first, the later id first at the same time", got)
	}
	want := []ListImagesRow{
		{ID: third, Format: "png", Size: int64(len("picture of png")), CreatedByUserID: uploader, Uploader: "Krono", Articles: 1},
		{ID: second, Format: "gif", Size: int64(len("picture of gif")), Uploader: "", Articles: 0},
		{ID: first, Format: "png", Size: int64(len("picture of png")), CreatedByUserID: uploader, Uploader: "Krono", Articles: 2},
	}
	for i, row := range images {
		row.CreatedAt = time.Time{}
		if row != want[i] {
			t.Errorf("image %d = %+v, want %+v", i, row, want[i])
		}
	}
	if later.Name != "KronoTwo" {
		t.Fatalf("the later habbo is %+v", later)
	}

	articles := must(q.ListImageArticles(ctx, sql.NullInt64{Int64: first, Valid: true}))
	if got := articleTitles(articles, func(r ListImageArticlesRow) string { return r.Title }); !slices.Equal(got, []string{"Newer", "Older"}) {
		t.Errorf("the articles of the first image = %v, want newest first", got)
	}
	if got := must(q.ListImageArticles(ctx, sql.NullInt64{Int64: second, Valid: true})); len(got) != 0 {
		t.Errorf("the unused image has articles %v", got)
	}
}
