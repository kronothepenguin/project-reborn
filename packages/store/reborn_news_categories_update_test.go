package store

import (
	"path/filepath"
	"slices"
	"testing"
)

// A hotel with articles in HoloCMS and Holograph Emulator finds them under Reborn
// CMS and Reborn Server once the update runs; the other categories stay.
func TestTheRebornCategoriesUpdateMovesHolosArticles(t *testing.T) {
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates := must(Updates())
	at := slices.IndexFunc(updates, func(u Update) bool { return u.Name == "reborn-news-categories" })
	if at < 0 {
		t.Fatalf("no reborn-news-categories update among %v", versions(updates))
	}
	must(ApplyUpdates(t.Context(), db, updates[:at]))

	q := New(db)
	article := func(category string) int64 {
		return must(q.CreateNewsArticle(t.Context(), CreateNewsArticleParams{
			Title: category, Category: category, PublishedAt: testNow, CreatedAt: testNow, UpdatedAt: testNow,
		})).ID
	}
	cms, emulator, news := article("HoloCMS"), article("Holograph Emulator"), article("News")

	must(ApplyUpdates(t.Context(), db, updates[at:at+1]))

	for category, want := range map[string][]int64{
		"Reborn CMS":         {cms},
		"Reborn Server":      {emulator},
		"News":               {news},
		"HoloCMS":            nil,
		"Holograph Emulator": nil,
	} {
		rows := must(q.ListNewsArticlesInCategory(t.Context(), ListNewsArticlesInCategoryParams{Category: category, RowLimit: 25}))
		var got []int64
		for _, row := range rows {
			got = append(got, row.ID)
		}
		if !slices.Equal(got, want) {
			t.Errorf("%s lists %v, want %v", category, got, want)
		}
	}
}
