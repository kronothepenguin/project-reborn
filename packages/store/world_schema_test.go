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

func TestRegistrationRowsCommitInOneTransaction(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	now := time.Now().UTC()

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		t.Fatalf("begin: %v", err)
	}
	defer tx.Rollback()

	res, err := tx.ExecContext(ctx,
		`INSERT INTO users (email, born_on, created_ip, created_at, updated_at) VALUES ('krono@example.com', ?, '127.0.0.1', ?, ?)`,
		time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC), now, now)
	if err != nil {
		t.Fatalf("insert user: %v", err)
	}
	userID, _ := res.LastInsertId()
	res, err = tx.ExecContext(ctx,
		`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at) VALUES (?, 'Krono', 'hd-180-1', 'M', ?, ?)`,
		userID, now, now)
	if err != nil {
		t.Fatalf("insert avatar: %v", err)
	}
	avatarID, _ := res.LastInsertId()
	res, err = tx.ExecContext(ctx, `INSERT INTO profiles (avatar_id, created_at, updated_at) VALUES (?, ?, ?)`, avatarID, now, now)
	if err != nil {
		t.Fatalf("insert profile: %v", err)
	}
	profileID, _ := res.LastInsertId()
	if _, err := tx.ExecContext(ctx, `INSERT INTO homes (profile_id, updated_at) VALUES (?, ?)`, profileID, now); err != nil {
		t.Fatalf("insert home: %v", err)
	}
	if _, err := tx.ExecContext(ctx, `INSERT INTO wallets (avatar_id, credits, updated_at) VALUES (?, 100, ?)`, avatarID, now); err != nil {
		t.Fatalf("insert wallet: %v", err)
	}
	if _, err := tx.ExecContext(ctx, `INSERT INTO wallet_transactions (avatar_id, credits, reason, created_at) VALUES (?, 100, 'registration', ?)`, avatarID, now); err != nil {
		t.Fatalf("insert ledger row: %v", err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("commit: %v", err)
	}

	for _, table := range []string{"users", "avatars", "profiles", "homes", "wallets", "wallet_transactions"} {
		if n := countRows(t, db, `SELECT COUNT(*) FROM `+table); n != 1 {
			t.Errorf("%s has %d rows, want 1", table, n)
		}
	}
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

func TestHabboHasAtMostOneFavouriteGroup(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	first := insertGroup(t, db, avatarID, "Builders")
	second := insertGroup(t, db, avatarID, "Traders")
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at) VALUES (?, ?, 'admin', TRUE, ?, ?)`, first, avatarID, now, now); err != nil {
		t.Fatalf("join first group: %v", err)
	}
	_, err := db.ExecContext(ctx, `INSERT INTO group_members (group_id, avatar_id, role, favourite, requested_at, joined_at) VALUES (?, ?, 'admin', TRUE, ?, ?)`, second, avatarID, now, now)
	if !IsConflict(err) {
		t.Fatalf("second favourite group: err = %v, want a conflict", err)
	}
}

func TestDeletingAGroupDeletesItsHomeAndMembers(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	groupID := insertGroup(t, db, avatarID, "Builders")
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO homes (group_id, updated_at) VALUES (?, ?)`, groupID, now); err != nil {
		t.Fatalf("insert group home: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO group_members (group_id, avatar_id, role, requested_at, joined_at) VALUES (?, ?, 'admin', ?, ?)`, groupID, avatarID, now, now); err != nil {
		t.Fatalf("insert owner membership: %v", err)
	}

	if _, err := db.ExecContext(ctx, `DELETE FROM groups WHERE id = ?`, groupID); err != nil {
		t.Fatalf("delete group: %v", err)
	}

	if n := countRows(t, db, `SELECT COUNT(*) FROM homes WHERE group_id = ?`, groupID); n != 0 {
		t.Errorf("group home survived its group (%d rows)", n)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM group_members WHERE group_id = ?`, groupID); n != 0 {
		t.Errorf("memberships survived their group (%d rows)", n)
	}
}

func TestWalletCreditsNeverGoNegative(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")

	if _, err := db.ExecContext(ctx, `INSERT INTO wallets (avatar_id, credits, updated_at) VALUES (?, 5, ?)`, avatarID, time.Now().UTC()); err != nil {
		t.Fatalf("insert wallet: %v", err)
	}
	if _, err := db.ExecContext(ctx, `UPDATE wallets SET credits = credits - 10 WHERE avatar_id = ?`, avatarID); err == nil {
		t.Fatal("wallet went below zero credits")
	}
}

func TestStoreItemsInUseCannotBeDeleted(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")

	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_categories (id, name) VALUES (1, 'General')`); err != nil {
		t.Fatalf("insert category: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO home_store_items (id, home_store_category_id, kind, asset, name, price) VALUES (1, 1, 'sticker', 'sticker_star', 'Star', 2)`); err != nil {
		t.Fatalf("insert item: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO home_inventory (avatar_id, home_store_item_id, quantity) VALUES (?, 1, 3)`, avatarID); err != nil {
		t.Fatalf("insert inventory: %v", err)
	}

	_, err := db.ExecContext(ctx, `DELETE FROM home_store_items WHERE id = 1`)
	if !IsForeignKey(err) {
		t.Fatalf("deleting an owned store item: err = %v, want a foreign-key error", err)
	}
}

func TestVoucherCodesIgnoreCase(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO vouchers (code, credits, created_at) VALUES ('ABC123', 50, ?)`, now); err != nil {
		t.Fatalf("insert voucher: %v", err)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM vouchers WHERE code = 'abc123'`); n != 1 {
		t.Errorf("lookup of abc123 found %d vouchers, want 1", n)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO vouchers (code, credits, created_at) VALUES ('abc123', 50, ?)`, now); !IsConflict(err) {
		t.Errorf("voucher abc123 next to ABC123: err = %v, want a conflict", err)
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
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	now := time.Now().UTC()

	_, err := db.ExecContext(t.Context(),
		`INSERT INTO club_subscriptions (avatar_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		avatarID, now, now.Add(-time.Hour), now)
	if err == nil {
		t.Fatal("club period ending before it starts was accepted")
	}
}
