package store

import (
	"database/sql"
	"path/filepath"
	"slices"
	"strings"
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
	moderator := withoutFuses(must(q.ListAccessGroupAttributes(t.Context(), 2)))
	wantModerator := []string{
		"forum.edit", "homes.staffItems", "housekeeping.access", "housekeeping.alerts", "housekeeping.alertsBroadcast",
		"housekeeping.banners", "housekeeping.bans", "housekeeping.credits", "housekeeping.help", "housekeeping.homeStore",
		"housekeeping.users", "housekeeping.vouchers", "site.maintenanceBypass",
	}
	if !slices.Equal(moderator, wantModerator) {
		t.Errorf("Moderator holds %v, want %v", moderator, wantModerator)
	}
	for _, rank := range []int64{3, 4, 5} {
		if attributes := withoutFuses(must(q.ListAccessGroupAttributes(t.Context(), rank))); len(attributes) != 0 {
			t.Errorf("group %d holds %v besides fuses, want none", rank, attributes)
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
	want := []string{"fuse_furni_chooser", "fuse_habbo_chooser", "fuse_use_club_dance", "fuse_use_special_room_layouts", "housekeeping.news"}
	if got := must(New(db).ListAccessGroupAttributes(ctx, 9)); !slices.Equal(got, want) {
		t.Errorf("Owners holds %v, want its own attribute and the fuses of level 2", got)
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

func TestTheDatabaseAttributeReachesThoseWhoManageAccess(t *testing.T) {
	db := baselineDB(t)
	ctx := t.Context()
	userID, _ := insertHabbo(t, db, "keeper@example.com", "Keeper")
	playerID, _ := insertHabbo(t, db, "player@example.com", "Player")
	for _, statement := range []string{
		`INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (1, 'Owners', 7, '2026-11-03 21:00:00+00:00', '2026-11-03 21:00:00+00:00')`,
		`INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (2, 'Helpers', 3, '2026-11-03 21:00:00+00:00', '2026-11-03 21:00:00+00:00')`,
		`INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (1, 'housekeeping.accessGroups'), (2, 'housekeeping.access')`,
	} {
		if _, err := db.ExecContext(ctx, statement); err != nil {
			t.Fatal(err)
		}
	}
	for id, attribute := range map[int64]string{userID: "housekeeping.accessGroups", playerID: "housekeeping.news"} {
		if _, err := db.ExecContext(ctx, `INSERT INTO user_attributes (user_id, attribute, granted_at) VALUES (?, ?, ?)`, id, attribute, testNow); err != nil {
			t.Fatal(err)
		}
	}

	applyEveryUpdate(t, db)
	q := New(db)
	if got := must(q.ListAccessGroupAttributes(ctx, 1)); !slices.Contains(got, "housekeeping.database") || !slices.Contains(got, "housekeeping.chatLogs") {
		t.Errorf("Owners holds %v, want housekeeping.database and housekeeping.chatLogs", got)
	}
	if got := must(q.ListAccessGroupAttributes(ctx, 2)); slices.Contains(got, "housekeeping.database") {
		t.Errorf("Helpers holds %v, want no housekeeping.database", got)
	}
	if got := must(q.ListDirectUserAttributes(ctx, userID)); !slices.Contains(got, "housekeeping.database") || !slices.Contains(got, "housekeeping.chatLogs") {
		t.Errorf("Keeper holds %v directly, want housekeeping.database and housekeeping.chatLogs", got)
	}
	if got := must(q.ListDirectUserAttributes(ctx, playerID)); slices.Contains(got, "housekeeping.database") {
		t.Errorf("Player holds %v directly, want no housekeeping.database", got)
	}
}

func withoutFuses(attributes []string) []string {
	return slices.DeleteFunc(attributes, func(name string) bool { return strings.HasPrefix(name, "fuse_") })
}

// holoFuseRanks is the rank 0009-holo-fuses.sql gives each fuse.
var holoFuseRanks = map[string]int64{
	"fuse_use_club_dance": 2, "fuse_use_special_room_layouts": 2, "fuse_habbo_chooser": 2, "fuse_furni_chooser": 2,
	"fuse_room_alert": 3, "fuse_enter_full_rooms": 3,
	"fuse_alert": 4, "fuse_kick": 4, "fuse_mute": 4, "fuse_enter_locked_rooms": 4,
	"fuse_remove_stickies": 5, "fuse_ban": 5, "fuse_room_kick": 5, "fuse_room_mute": 5, "fuse_receive_calls_for_help": 5,
	"fuse_see_all_roomowners":  5,
	"fuse_any_room_controller": 6, "fuse_performance_panel": 6, "fuse_pick_up_any_furni": 6, "fuse_superban": 6,
	"fuse_moderator_access": 6, "fuse_teleport": 6,
	"fuse_see_flat_ids": 7, "fuse_administrator_access": 7, "fuse_freeze": 7, "fuse_cancel_roomevent": 7,
	"fuse_catalog_editor": 7, "fuse_credits": 7, "fuse_debug_window": 7, "fuse_remove_photos": 7, "fuse_see_chat_log_link": 7,
}

func fusesUpTo(level int64) []string {
	var fuses []string
	for fuse, rank := range holoFuseRanks {
		if rank <= level {
			fuses = append(fuses, fuse)
		}
	}
	slices.Sort(fuses)
	return fuses
}

func TestTheRanksHoldHolosFusesUpToTheirLevel(t *testing.T) {
	q := New(openTestDB(t))
	want := map[string]int{"HabboX": 6, "Silver Hobba": 10, "Gold Hobba": 16, "Moderator": 22, "Administrator": 31}
	groups := must(q.ListAccessGroups(t.Context()))
	for _, group := range groups {
		got := slices.DeleteFunc(must(q.ListAccessGroupAttributes(t.Context(), group.ID)), func(name string) bool {
			return !strings.HasPrefix(name, "fuse_")
		})
		if !slices.Equal(got, fusesUpTo(group.Level)) || len(got) != want[group.Name] {
			t.Errorf("%s (level %d) holds the fuses %v, want the %d of Holo's ranks up to its level", group.Name, group.Level, got, want[group.Name])
		}
	}
}

func TestAHotelsOwnGroupsGetHolosFusesByLevel(t *testing.T) {
	db := baselineDB(t)
	ctx := t.Context()
	for _, statement := range []string{
		`INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (1, 'Players', 0, '2026-11-03 21:00:00+00:00', '2026-11-03 21:00:00+00:00')`,
		`INSERT INTO access_groups (id, name, level, created_at, updated_at) VALUES (2, 'Guards', 4, '2026-11-03 21:00:00+00:00', '2026-11-03 21:00:00+00:00')`,
		`INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (2, 'fuse_kick')`,
	} {
		if _, err := db.ExecContext(ctx, statement); err != nil {
			t.Fatal(err)
		}
	}

	applyEveryUpdate(t, db)
	q := New(db)
	if got := must(q.ListAccessGroupAttributes(ctx, 1)); len(got) != 0 {
		t.Errorf("Players (level 0) holds %v, want nothing", got)
	}
	if got := must(q.ListAccessGroupAttributes(ctx, 2)); !slices.Equal(got, fusesUpTo(4)) {
		t.Errorf("Guards (level 4) holds %v, want %v", got, fusesUpTo(4))
	}
}
