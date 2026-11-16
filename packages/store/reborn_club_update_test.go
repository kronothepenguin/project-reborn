package store

import (
	"database/sql"
	"path/filepath"
	"slices"
	"testing"
)

// clubNewsBeforeTheUpdate opens a hotel standing before reborn-club-news, with
// one article in Holo Club, and returns the update and the article's id.
func clubNewsBeforeTheUpdate(t *testing.T) (*sql.DB, Update, int64) {
	t.Helper()
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates := must(Updates())
	at := slices.IndexFunc(updates, func(u Update) bool { return u.Name == "reborn-club-news" })
	if at < 0 {
		t.Fatalf("no reborn-club-news update among %v", versions(updates))
	}
	must(ApplyUpdates(t.Context(), db, updates[:at]))
	article := must(New(db).CreateNewsArticle(t.Context(), CreateNewsArticleParams{
		Title: "Club gifts", Category: "Holo Club", PublishedAt: testNow, CreatedAt: testNow, UpdatedAt: testNow,
	}))
	return db, updates[at], article.ID
}

func newsCategory(t *testing.T, db *sql.DB, id int64) string {
	t.Helper()
	return must(New(db).GetNewsArticle(t.Context(), id)).Category
}

// A hotel that kept the default short name finds its Holo Club articles under
// Reborn Club once the update runs.
func TestTheRebornClubUpdateMovesTheDefaultHotelsClubNews(t *testing.T) {
	db, update, article := clubNewsBeforeTheUpdate(t)

	must(ApplyUpdates(t.Context(), db, []Update{update}))

	if got := newsCategory(t, db, article); got != "Reborn Club" {
		t.Errorf("the club article is in %q, want Reborn Club", got)
	}
}

// A hotel with a short name of its own keeps its Holo Club articles where they
// are.
func TestTheRebornClubUpdateLeavesAnOwnShortNamesClubNews(t *testing.T) {
	db, update, article := clubNewsBeforeTheUpdate(t)
	if err := New(db).UpsertSetting(t.Context(), UpsertSettingParams{Key: "site.shortName", Value: `"Holo"`, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}

	must(ApplyUpdates(t.Context(), db, []Update{update}))

	if got := newsCategory(t, db, article); got != "Holo Club" {
		t.Errorf("the club article is in %q, want Holo Club", got)
	}
}
