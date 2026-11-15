package store

import (
	"database/sql"
	"path/filepath"
	"testing"
)

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
