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
		"home_store_categories", "home_store_items", "home_inventory",
		"groups", "group_members", "wallets", "wallet_transactions", "vouchers", "club_subscriptions",
		"forum_threads", "forum_posts", "news_articles",
		"bans", "alerts", "help_tickets", "staff_logs", "banners",
	} {
		if !slices.Contains(tables, want) {
			t.Errorf("table %s was not created; tables: %v", want, tables)
		}
	}
}

func TestHabboNamesAreUniqueIgnoringCase(t *testing.T) {
	db := openTestDB(t)
	userID, _ := insertHabbo(t, db, "krono@example.com", "Krono")

	now := time.Now().UTC()
	_, err := db.ExecContext(t.Context(),
		`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at) VALUES (?, 'kRONO', 'hd-180-1', 'F', ?, ?)`,
		userID, now, now)
	if !IsConflict(err) {
		t.Fatalf("second habbo named kRONO: err = %v, want a conflict", err)
	}
}

func TestUserEmailsAreUniqueIgnoringCase(t *testing.T) {
	db := openTestDB(t)
	insertHabbo(t, db, "krono@example.com", "Krono")

	now := time.Now().UTC()
	_, err := db.ExecContext(t.Context(),
		`INSERT INTO users (email, born_on, created_ip, created_at, updated_at) VALUES ('KRONO@example.com', ?, '127.0.0.1', ?, ?)`,
		now, now, now)
	if !IsConflict(err) {
		t.Fatalf("second user with KRONO@example.com: err = %v, want a conflict", err)
	}
}

func TestHabboWearsAtMostOneBadge(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	_, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO avatar_badges (avatar_id, code, worn, granted_at) VALUES (?, 'HC1', TRUE, ?)`, avatarID, now); err != nil {
		t.Fatalf("insert worn badge: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO avatar_badges (avatar_id, code, worn, granted_at) VALUES (?, 'ADM', ?, ?)`, avatarID, false, now); err != nil {
		t.Fatalf("insert unworn badge: %v", err)
	}

	_, err := db.ExecContext(ctx, `UPDATE avatar_badges SET worn = ? WHERE avatar_id = ? AND code = 'ADM'`, true, avatarID)
	if !IsConflict(err) {
		t.Fatalf("wearing a second badge: err = %v, want a conflict", err)
	}
}

func TestHabboGenderIsMOrF(t *testing.T) {
	db := openTestDB(t)
	userID, _ := insertHabbo(t, db, "krono@example.com", "Krono")

	now := time.Now().UTC()
	_, err := db.ExecContext(t.Context(),
		`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at) VALUES (?, 'Other', 'hd-180-1', 'X', ?, ?)`,
		userID, now, now)
	if err == nil {
		t.Fatal("habbo with gender X was accepted")
	}
}

func TestDeletingAUserDeletesTheirIdentityRows(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	userID, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	now := time.Now().UTC()

	for _, stmt := range []struct {
		query string
		args  []any
	}{
		{`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (?, 'hash', ?)`, []any{userID, now}},
		{`INSERT INTO sessions (id, user_id, avatar_id, ip, user_agent, created_at, last_seen_at, expires_at) VALUES ('digest', ?, ?, '127.0.0.1', 'test', ?, ?, ?)`, []any{userID, avatarID, now, now, now.Add(time.Hour)}},
		{`INSERT INTO access_groups (id, name, created_at, updated_at) VALUES (1, 'Administrators', ?, ?)`, []any{now, now}},
		{`INSERT INTO access_group_members (access_group_id, user_id, display_avatar_id, granted_at) VALUES (1, ?, ?, ?)`, []any{userID, avatarID, now}},
	} {
		if _, err := db.ExecContext(ctx, stmt.query, stmt.args...); err != nil {
			t.Fatalf("%s: %v", stmt.query, err)
		}
	}

	if _, err := db.ExecContext(ctx, `DELETE FROM users WHERE id = ?`, userID); err != nil {
		t.Fatalf("delete user: %v", err)
	}

	for _, table := range []string{"avatars", "credentials", "sessions", "access_group_members"} {
		if n := countRows(t, db, `SELECT COUNT(*) FROM `+table+` WHERE user_id = ?`, userID); n != 0 {
			t.Errorf("%s still has %d rows of the deleted user", table, n)
		}
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM access_groups`); n != 1 {
		t.Errorf("access_groups has %d rows, want the group to survive its member", n)
	}
}

func TestDeletingADisplayHabboKeepsTheMembership(t *testing.T) {
	db := openTestDB(t)
	ctx := t.Context()
	userID, _ := insertHabbo(t, db, "krono@example.com", "Krono")
	staffID := insertAvatar(t, db, userID, "KronoStaff")
	now := time.Now().UTC()

	if _, err := db.ExecContext(ctx, `INSERT INTO access_groups (id, name, created_at, updated_at) VALUES (1, 'Moderators', ?, ?)`, now, now); err != nil {
		t.Fatalf("insert access group: %v", err)
	}
	if _, err := db.ExecContext(ctx, `INSERT INTO access_group_members (access_group_id, user_id, display_avatar_id, granted_at) VALUES (1, ?, ?, ?)`, userID, staffID, now); err != nil {
		t.Fatalf("insert membership: %v", err)
	}

	if _, err := db.ExecContext(ctx, `DELETE FROM avatars WHERE id = ?`, staffID); err != nil {
		t.Fatalf("delete display habbo: %v", err)
	}

	var display sql.NullInt64
	if err := db.QueryRowContext(ctx, `SELECT display_avatar_id FROM access_group_members WHERE access_group_id = 1 AND user_id = ?`, userID).Scan(&display); err != nil {
		t.Fatalf("read membership: %v", err)
	}
	if display.Valid {
		t.Errorf("display_avatar_id = %d, want NULL after the habbo was deleted", display.Int64)
	}
}
