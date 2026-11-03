package store

import (
	"database/sql"
	"path/filepath"
	"slices"
	"testing"
	"time"
)

func baselineDB(t *testing.T) *sql.DB {
	t.Helper()
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates, err := Updates()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), updates[0].sql); err != nil {
		t.Fatal(err)
	}
	return db
}

func applyEveryUpdate(t *testing.T, db *sql.DB) {
	t.Helper()
	updates, err := Updates()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := ApplyUpdates(t.Context(), db, updates); err != nil {
		t.Fatalf("ApplyUpdates: %v", err)
	}
}

func TestANewDatabaseHasHolosRanks(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	groups, err := q.ListAccessGroups(t.Context())
	if err != nil {
		t.Fatalf("ListAccessGroups: %v", err)
	}
	want := map[string]int64{"Administrator": 7, "Moderator": 6, "Gold Hobba": 5, "Silver Hobba": 4, "HabboX": 3}
	if len(groups) != len(want) {
		t.Fatalf("%d groups, want %d", len(groups), len(want))
	}
	for _, group := range groups {
		if level, ok := want[group.Name]; !ok || group.Level != level || !group.StaffListed {
			t.Errorf("group %+v, want one of Holo's ranks, listed on the staff page", group)
		}
		if time.Since(group.CreatedAt).Abs() > time.Minute || group.CreatedAt.Location() != time.UTC {
			t.Errorf("group %s created at %v, want now in UTC", group.Name, group.CreatedAt)
		}
	}

	administrator := must(q.ListAccessGroupAttributes(t.Context(), 1))
	if !slices.Contains(administrator, "housekeeping.accessGroups") || len(administrator) < 19 {
		t.Errorf("Administrator holds %v, want every attribute", administrator)
	}
	moderator := must(q.ListAccessGroupAttributes(t.Context(), 2))
	wantModerator := []string{
		"forum.edit", "homes.staffItems", "housekeeping.access", "housekeeping.alerts", "housekeeping.alertsBroadcast",
		"housekeeping.banners", "housekeeping.bans", "housekeeping.credits", "housekeeping.help", "housekeeping.homeStore",
		"housekeeping.users", "housekeeping.vouchers", "site.maintenanceBypass",
	}
	if !slices.Equal(moderator, wantModerator) {
		t.Errorf("Moderator holds %v, want %v", moderator, wantModerator)
	}
	for _, rank := range []int64{3, 4, 5} {
		if attributes := must(q.ListAccessGroupAttributes(t.Context(), rank)); len(attributes) != 0 {
			t.Errorf("group %d holds %v, want none", rank, attributes)
		}
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM sqlite_temp_schema WHERE name = 'seed_ranks'"); n != 0 {
		t.Error("the ranks update left its temporary table behind")
	}
}

func TestAHotelWithGroupsGetsNoRanks(t *testing.T) {
	db := baselineDB(t)
	ctx := t.Context()
	if _, err := db.ExecContext(ctx, `INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (9, 'Owners', 2, ?, ?)`, testNow, testNow); err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (9, 'housekeeping.news')`); err != nil {
		t.Fatal(err)
	}

	applyEveryUpdate(t, db)
	if n := countRows(t, db, "SELECT COUNT(*) FROM access_groups"); n != 1 {
		t.Errorf("%d groups, want only Owners", n)
	}
	if got := must(New(db).ListAccessGroupAttributes(ctx, 9)); !slices.Equal(got, []string{"housekeeping.news"}) {
		t.Errorf("Owners holds %v, want its own attribute only", got)
	}
}

func TestAStoreAnAdministratorChangedKeepsItsRows(t *testing.T) {
	db := baselineDB(t)
	ctx := t.Context()
	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_categories (id, name, staff_only, position) VALUES (19, 'Mine', FALSE, 5)`); err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_items (id, home_store_category_id, kind, asset, name, price, quantity, enabled)
		VALUES (1, 19, 'sticker', 'c_images/stickers/sticker_geniefirehead.gif', 'Genie', 99, 1, FALSE)`); err != nil {
		t.Fatal(err)
	}

	applyEveryUpdate(t, db)
	q := New(db)
	if c := must(q.GetHomeStoreCategory(ctx, 19)); c.Name != "Mine" || c.Position != 5 {
		t.Errorf("category 19 = %+v, want the administrator's", c)
	}
	if item := must(q.GetHomeStoreItem(ctx, 1)); item.Name != "Genie" || item.Price != 99 || item.Enabled {
		t.Errorf("item 1 = %+v, want the administrator's", item)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM home_store_items"); n != 298 {
		t.Errorf("%d items, want the other 297 added", n)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM home_store_categories"); n != 20 {
		t.Errorf("%d categories, want the other 19 added", n)
	}
}
