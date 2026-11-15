package store

import (
	"database/sql"
	"testing"
	"time"
)

func insertProfileHome(t *testing.T, db *sql.DB, avatarID int64) (profileID, homeID int64) {
	t.Helper()
	ctx := t.Context()
	now := time.Now().UTC()

	res, err := db.ExecContext(ctx, `INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (?, ?, ?)`, avatarID, now, now)
	if err != nil {
		t.Fatalf("insert profile: %v", err)
	}
	if profileID, err = res.LastInsertId(); err != nil {
		t.Fatalf("profile id: %v", err)
	}
	res, err = db.ExecContext(ctx, `INSERT INTO homes (profile_id, updated_at) VALUES (?, ?)`, profileID, now)
	if err != nil {
		t.Fatalf("insert home: %v", err)
	}
	if homeID, err = res.LastInsertId(); err != nil {
		t.Fatalf("home id: %v", err)
	}
	return profileID, homeID
}

func insertGroup(t *testing.T, db *sql.DB, ownerID int64, name string) int64 {
	t.Helper()
	now := time.Now().UTC()

	res, err := db.ExecContext(t.Context(),
		`INSERT INTO groups (avatar_id, name, badge, created_at, updated_at) VALUES (?, ?, 'b0503Xs09114s05013s05015', ?, ?)`,
		ownerID, name, now, now)
	if err != nil {
		t.Fatalf("insert group %s: %v", name, err)
	}
	groupID, err := res.LastInsertId()
	if err != nil {
		t.Fatalf("group id: %v", err)
	}
	return groupID
}

func TestHomeHasExactlyOneOwner(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	profileID, _ := insertProfileHome(t, db, avatarID)
	groupID := insertGroup(t, db, avatarID, "Builders")
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO homes (profile_id, group_id, updated_at) VALUES (?, ?, ?)`, profileID, groupID, now); err == nil {
		t.Error("home owned by a profile and a group was accepted")
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO homes (updated_at) VALUES (?)`, now); err == nil {
		t.Error("home without owner was accepted")
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO homes (profile_id, updated_at) VALUES (?, ?)`, profileID, now); !IsConflict(err) {
		t.Errorf("second home for one profile: err = %v, want a conflict", err)
	}
}

func TestStoreItemsInUseCannotBeDeleted(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	userID, _ := insertHabbo(t, db, "krono@example.com", "Krono")

	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_categories (id, name) VALUES (1, 'General')`); err != nil {
		t.Fatalf("insert category: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_items (id, home_store_category_id, kind, asset, name, price) VALUES (1000, 1, 'sticker', 'sticker_star', 'Star', 2)`); err != nil {
		t.Fatalf("insert item: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO home_inventories (user_id, home_store_item_id, quantity) VALUES (?, 1000, 3)`, userID); err != nil {
		t.Fatalf("insert inventory: %v", err)
	}

	_, err := db.ExecContext(ctx, `DELETE FROM home_store_items WHERE id = 1000`)
	if !IsForeignKey(err) {
		t.Fatalf("deleting an owned store item: err = %v, want a foreign-key error", err)
	}
}

func TestBanNeedsAUserOrAnIP(t *testing.T) {
	db := openTestDB(t)

	_, err := db.ExecContext(t.Context(), `INSERT INTO bans (reason, created_at) VALUES ('spam', ?)`, time.Now().UTC())
	if err == nil {
		t.Fatal("ban without user and IP was accepted")
	}
}

func TestClubPeriodEndsAfterItStarts(t *testing.T) {
	db := openTestDB(t)
	userID, _ := insertHabbo(t, db, "krono@example.com", "Krono")
	now := time.Now().UTC()

	_, err := db.ExecContext(t.Context(),
		`INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, now, now.Add(-time.Hour), now)
	if err == nil {
		t.Fatal("club period ending before it starts was accepted")
	}
}
