package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

func staffLogs(t *testing.T, db *sql.DB) []store.ListStaffLogsRow {
	t.Helper()
	rows, err := store.New(db).ListStaffLogs(t.Context(), store.ListStaffLogsParams{RowLimit: 100})
	if err != nil {
		t.Fatalf("ListStaffLogs: %v", err)
	}
	return rows
}

func settingRow(t *testing.T, db *sql.DB, key string) (store.Setting, bool) {
	t.Helper()
	rows, err := store.New(db).ListSettings(t.Context())
	if err != nil {
		t.Fatalf("ListSettings: %v", err)
	}
	for _, row := range rows {
		if row.Key == key {
			return row, true
		}
	}
	return store.Setting{}, false
}

func TestTheDashboardCounts(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	otherID := habbo(t, db, "other@example.com", "Other")

	avatar, err := store.New(db).GetAvatarByName(t.Context(), "Other")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}
	now := time.Now().UTC()
	_, err = db.ExecContext(t.Context(), `INSERT INTO groups (avatar_id, name, badge, created_at, updated_at) VALUES (?, 'Cool', 'b', ?, ?)`, avatar.ID, now, now)
	if err != nil {
		t.Fatalf("insert group: %v", err)
	}
	for _, ban := range []struct {
		createdAt time.Time
		expiresAt sql.NullTime
		liftedAt  sql.NullTime
	}{
		{createdAt: now.Add(-time.Hour)},
		{createdAt: now.Add(-time.Hour), expiresAt: sql.NullTime{Time: now.Add(time.Hour), Valid: true}},
		{createdAt: now.Add(-time.Hour), expiresAt: sql.NullTime{Time: now.Add(-time.Minute), Valid: true}},
		{createdAt: now.Add(-time.Hour), liftedAt: sql.NullTime{Time: now.Add(-time.Minute), Valid: true}},
		{createdAt: now.Add(time.Hour)},
	} {
		_, err := db.ExecContext(t.Context(), `INSERT INTO bans (user_id, reason, created_at, expires_at, lifted_at) VALUES (?, 'x', ?, ?, ?)`,
			otherID, ban.createdAt, ban.expiresAt, ban.liftedAt)
		if err != nil {
			t.Fatalf("insert ban: %v", err)
		}
	}
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), Action: "settings.update", IP: "10.0.0.1"})
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), Action: "settings.update", IP: "10.0.0.1"})
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), Action: "settings.update", IP: "10.0.0.1"})

	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK,
		"index.html", "Habbos:2 Groups:1 ActiveBans:2 StaffLogs:3")
}

func TestTheDashboardListsTheHoldersOfAccessGroups(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Zed", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	staff(t, db, "Abe", auth.HousekeepingAccessGroups)
	staff(t, db, "Moderator", auth.HousekeepingAccess)

	rec := serve(mux, "GET", "/housekeeping/", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Name:Abe", "Name:Zed")
	body := rec.Body.String()
	if strings.Contains(body, "Name:Moderator") {
		t.Errorf("a user without the attribute is listed: %s", body)
	}
	if strings.Index(body, "Name:Abe") > strings.Index(body, "Name:Zed") {
		t.Errorf("the holders are not sorted by name: %s", body)
	}
}

func TestAHolderShowsTheDisplayHabbo(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "admin@example.com", "First")
	second := secondHabbo(t, db, userID, "Staffname")
	group := grant(t, db, userID, auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	cookie := login(t, db, "First")

	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK, "Name:First")

	_, err := db.ExecContext(t.Context(), `UPDATE access_group_members SET display_avatar_id = ? WHERE access_group_id = ?`, second.ID, group)
	if err != nil {
		t.Fatalf("set the display habbo: %v", err)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK, "Name:Staffname")
}

func TestTheDashboardShowsTwentyHolders(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	for i := range 20 {
		staff(t, db, fmt.Sprintf("Holder%02d", i), auth.HousekeepingAccessGroups)
	}
	body := serve(mux, "GET", "/housekeeping/", cookie, nil).Body.String()
	if got := strings.Count(body, " Name:"); got != 20 {
		t.Errorf("the dashboard lists %d holders, want 20", got)
	}
}

func TestAddressesTakeTheUsersAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, plain := staff(t, db, "Plain", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	_, seer := staff(t, db, "Seer", auth.HousekeepingAccess, auth.HousekeepingUsers)

	rec := serve(mux, "GET", "/housekeeping/", plain, nil)
	wantPage(t, rec, http.StatusOK, "Name:Plain")
	if strings.Contains(rec.Body.String(), "plain@example.com") {
		t.Errorf("the address reached a viewer without housekeeping.users: %s", rec.Body)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/", seer, nil), http.StatusOK, "Email:plain@example.com")
}

func TestTheNoteIsSavedAndLogged(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	const note = "Back at <noon>\r\nDo not touch the \"ducks\""

	rec := serve(mux, "POST", "/housekeeping/note", cookie, url.Values{"notes": {note}})
	wantRedirect(t, rec, "/housekeeping/")
	if got := settings.GetString("housekeeping.note"); got != note {
		t.Errorf("the note is %q, want %q", got, note)
	}
	row, ok := settingRow(t, db, "housekeeping.note")
	if !ok || row.UpdatedByUserID.Int64 != adminID {
		t.Errorf("the settings row = %+v, %t, want one by the user", row, ok)
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 {
		t.Fatalf("got %d staff log rows, want 1: %+v", len(logs), logs)
	}
	if got := logs[0]; got.Action != "note.update" || got.UserID.Int64 != adminID || got.IP != "192.0.2.1" || got.Detail != "" {
		t.Errorf("the staff log row = %+v", got)
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK, "Note:Back at &lt;noon&gt;")
}

func TestAnEmptyNoteDeletesTheRow(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	serve(mux, "POST", "/housekeeping/note", cookie, url.Values{"notes": {"Remember"}})
	if _, ok := settingRow(t, db, "housekeeping.note"); !ok {
		t.Fatal("the note has no row")
	}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/note", cookie, url.Values{"notes": {""}}), "/housekeeping/")
	if row, ok := settingRow(t, db, "housekeeping.note"); ok {
		t.Errorf("the row is still there: %+v", row)
	}
	if got := len(staffLogs(t, db)); got != 2 {
		t.Errorf("got %d staff log rows, want 2", got)
	}
}

func TestSavingTheSameNoteChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	for range 3 {
		serve(mux, "POST", "/housekeeping/note", cookie, url.Values{"notes": {"Same"}})
	}
	if got := len(staffLogs(t, db)); got != 1 {
		t.Errorf("got %d staff log rows, want 1", got)
	}
}

func TestACrossOriginNoteChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	r := postFrom("https://evil.example.com", "/housekeeping/note", cookie, url.Values{"notes": {"Hacked"}})
	rec := record(mux, r)
	wantPage(t, rec, http.StatusForbidden)
	if got := settings.GetString("housekeeping.note"); got != "" {
		t.Errorf("the note is %q", got)
	}
	if got := len(staffLogs(t, db)); got != 0 {
		t.Errorf("got %d staff log rows", got)
	}
}
