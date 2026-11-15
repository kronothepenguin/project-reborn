package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

func insertHabbo(t *testing.T, db *sql.DB, email, name string) (userID, avatarID int64) {
	t.Helper()
	ctx := t.Context()
	now := time.Now().UTC()

	res, err := db.ExecContext(ctx,
		`INSERT INTO users (email, born_on, created_ip, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
		email, time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC), "127.0.0.1", now, now)
	if err != nil {
		t.Fatalf("insert user %s: %v", email, err)
	}
	if userID, err = res.LastInsertId(); err != nil {
		t.Fatalf("user id: %v", err)
	}

	avatarID = insertAvatar(t, db, userID, name)
	return userID, avatarID
}

func insertAvatar(t *testing.T, db *sql.DB, userID int64, name string) int64 {
	t.Helper()
	now := time.Now().UTC()

	res, err := db.ExecContext(t.Context(),
		`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at) VALUES (?, ?, ?, 'M', ?, ?)`,
		userID, name, "hd-180-1.ch-215-82.lg-270-82", now, now)
	if err != nil {
		t.Fatalf("insert avatar %s: %v", name, err)
	}
	avatarID, err := res.LastInsertId()
	if err != nil {
		t.Fatalf("avatar id: %v", err)
	}
	return avatarID
}

func countRows(t *testing.T, db *sql.DB, query string, args ...any) int {
	t.Helper()
	var n int
	if err := db.QueryRowContext(t.Context(), query, args...).Scan(&n); err != nil {
		t.Fatalf("count %q: %v", query, err)
	}
	return n
}

func TestOpenCreatesEveryTable(t *testing.T) {
	db := openTestDB(t)

	rows, err := db.QueryContext(t.Context(), `SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name`)
	if err != nil {
		t.Fatalf("list tables: %v", err)
	}
	defer rows.Close()
	var tables []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			t.Fatalf("scan table name: %v", err)
		}
		tables = append(tables, name)
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("list tables: %v", err)
	}

	for _, want := range []string{
		"access_group_attributes", "access_group_members", "access_groups",
		"avatar_badges", "avatars", "credentials", "login_attempts", "password_resets",
		"referrals", "sessions", "settings", "sso_tickets", "users", "wardrobe_outfits",
		"profiles", "profile_tags", "homes", "home_items",
		"home_store_categories", "home_store_items", "home_inventories",
		"groups", "group_members", "wallets", "wallet_transactions", "vouchers", "club_subscriptions",
		"forum_threads", "forum_posts", "news_articles",
		"bans", "alerts", "help_tickets", "staff_logs", "banners",
	} {
		if !slices.Contains(tables, want) {
			t.Errorf("table %s was not created; tables: %v", want, tables)
		}
	}
}
