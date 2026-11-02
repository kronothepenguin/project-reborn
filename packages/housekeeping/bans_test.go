package housekeeping

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func moderator(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return ranked(t, db, "Mod", 4, auth.HousekeepingAccess, auth.HousekeepingBans)
}

func banForm(user string) url.Values {
	return url.Values{"user": {user}, "reason": {"Being rude"}, "length": {"7d"}}
}

func oneBan(t *testing.T, db *sql.DB) store.Ban {
	t.Helper()
	var id int64
	if err := db.QueryRowContext(t.Context(), `SELECT id FROM bans ORDER BY id DESC LIMIT 1`).Scan(&id); err != nil {
		t.Fatalf("find the ban: %v", err)
	}
	ban, err := store.New(db).GetBan(t.Context(), id)
	if err != nil {
		t.Fatalf("GetBan: %v", err)
	}
	return ban
}

func countBans(t *testing.T, db *sql.DB) int {
	t.Helper()
	return count(t, db, `SELECT COUNT(*) FROM bans`)
}

func TestBansTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	habbo(t, db, "frank@example.com", "Frank")

	wantPage(t, serve(mux, "GET", "/housekeeping/bans", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank")), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/bans/1/lift", cookie, url.Values{"x": {"1"}}), http.StatusForbidden, "access-denied.html")
	if got := countBans(t, db); got != 0 {
		t.Errorf("%d bans", got)
	}
}

func TestBanningAUser(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := moderator(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank"))
	ban := oneBan(t, db)
	wantRedirect(t, rec, fmt.Sprintf("/housekeeping/bans?banned=%d&habbo=%d", ban.ID, id))

	if ban.UserID.Int64 != userID || ban.Reason != "Being rude" || ban.IP.Valid || ban.IssuedByUserID.Int64 != actor {
		t.Errorf("ban = %+v", ban)
	}
	until := ban.ExpiresAt.Time.UTC().Format("02-01-2006 15:04:05")
	wantPage(t, serve(mux, "GET", rec.Header().Get("Location"), cookie, nil), http.StatusOK,
		"bans.html", "User Frank has been banned untill "+until+" successfully.", "Habbo:Frank", "Reason:Being rude")
	wantOneLog(t, db, "bans.create", "Being rude until "+until, userID, id)
}

func TestAUsersIDBansThemToo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	secondHabbo(t, db, userID, "FrankToo")

	wantRedirect(t, serve(mux, "POST", "/housekeeping/bans", cookie, banForm(fmt.Sprint(userID))),
		fmt.Sprintf("/housekeeping/bans?banned=1&habbo=%d", habboOf(t, db, "Frank").ID))
	if got := oneBan(t, db).UserID.Int64; got != userID {
		t.Errorf("banned user %d", got)
	}
}

func TestEveryLengthOfHolosForm(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	for _, c := range []struct {
		length string
		want   func(time.Time) time.Time
	}{
		{"2h", func(n time.Time) time.Time { return n.Add(2 * time.Hour) }},
		{"4h", func(n time.Time) time.Time { return n.Add(4 * time.Hour) }},
		{"12h", func(n time.Time) time.Time { return n.Add(12 * time.Hour) }},
		{"1d", func(n time.Time) time.Time { return n.AddDate(0, 0, 1) }},
		{"2d", func(n time.Time) time.Time { return n.AddDate(0, 0, 2) }},
		{"7d", func(n time.Time) time.Time { return n.AddDate(0, 0, 7) }},
		{"2w", func(n time.Time) time.Time { return n.AddDate(0, 0, 14) }},
		{"1m", func(n time.Time) time.Time { return n.AddDate(0, 1, 0) }},
		{"6m", func(n time.Time) time.Time { return n.AddDate(0, 6, 0) }},
		{"1y", func(n time.Time) time.Time { return n.AddDate(1, 0, 0) }},
		{"perm", func(n time.Time) time.Time { return n.AddDate(25, 0, 0) }},
	} {
		t.Run(c.length, func(t *testing.T) {
			form := banForm("Frank")
			form.Set("length", c.length)
			serve(mux, "POST", "/housekeeping/bans", cookie, form)
			ban := oneBan(t, db)
			want := c.want(ban.CreatedAt)
			if !ban.ExpiresAt.Valid || !ban.ExpiresAt.Time.Equal(want) {
				t.Errorf("expires at %v, want %v", ban.ExpiresAt.Time, want)
			}
		})
	}
}

func TestBanningAnAddress(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	for _, c := range []struct{ posted, want string }{
		{"10.0.0.7", "10.0.0.7"},
		{" 10.0.0.8 ", "10.0.0.8"},
		{"::ffff:10.0.0.9", "10.0.0.9"},
		{"2001:0db8::0001", "2001:db8::1"},
	} {
		form := banForm("Frank")
		form.Set("ip", c.posted)
		serve(mux, "POST", "/housekeeping/bans", cookie, form)
		if got := oneBan(t, db).IP.String; got != c.want {
			t.Errorf("%q saved as %q, want %q", c.posted, got, c.want)
		}
	}
}

func TestABanEndsTheUsersSessions(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	login(t, db, "Frank")
	login(t, db, "Frank")
	other := habbo(t, db, "other@example.com", "Other")
	login(t, db, "Other")

	serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank"))

	if got := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM sessions WHERE avatar_id = %d`, id)); got != 0 {
		t.Errorf("%d sessions left", got)
	}
	if got := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM sessions WHERE user_id = %d`, other)); got != 1 {
		t.Errorf("%d sessions of someone else left, want 1", got)
	}
}

func TestTheNextLoginShowsTheReasonAndTheExpiry(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank"))
	ban := oneBan(t, db)

	_, err := auth.Login(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/", nil), db, "Frank", "secret123", false)
	banned, ok := errors.AsType[*auth.BanError](err)
	if !ok {
		t.Fatalf("Login = %v, want a ban", err)
	}
	if banned.Reason != "Being rude" || !banned.ExpiresAt.Equal(ban.ExpiresAt.Time) {
		t.Errorf("ban = %+v", banned)
	}
}

func TestABadBanIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	for _, c := range []struct {
		name  string
		field string
		value string
		want  string
	}{
		{"an unknown habbo", "user", "Nobody", "Sorry, but this user does not exist!"},
		{"an unknown user id", "user", "999", "Sorry, but this user does not exist!"},
		{"no user", "user", "", "Sorry, but this user does not exist!"},
		{"an unknown length", "length", "9y", "Invalid ban length!"},
		{"no length", "length", "", "Invalid ban length!"},
		{"a bad address", "ip", "10.0.0", "Invalid IP Address"},
		{"a range", "ip", "10.0.0.0/8", "Invalid IP Address"},
	} {
		t.Run(c.name, func(t *testing.T) {
			form := banForm("Frank")
			form.Set(c.field, c.value)
			rec := serve(mux, "POST", "/housekeeping/bans", cookie, form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "bans.html", c.want, "Reason:Being rude")
		})
	}
	if got := countBans(t, db); got != 0 {
		t.Errorf("%d bans", got)
	}
	if rows := logsOf(t, db, "bans.create"); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestStaffBanOnlyUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	ranked(t, db, "Peer", 4)
	ranked(t, db, "Above", 5)
	ranked(t, db, "Lower", 3)

	for _, name := range []string{"Peer", "Above", "Mod"} {
		rec := serve(mux, "POST", "/housekeeping/bans", cookie, banForm(name))
		wantPage(t, rec, http.StatusUnprocessableEntity, "bans.html", "below your level")
	}
	if got := countBans(t, db); got != 0 {
		t.Errorf("%d bans", got)
	}
	if rows := logsOf(t, db, "users.refused"); len(rows) != 3 {
		t.Errorf("%d refusals logged, want 3", len(rows))
	}
	if got := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM staff_logs WHERE action = 'users.refused' AND detail = 'ban' AND target_avatar_id = %d`, habboOf(t, db, "Peer").ID)); got != 1 {
		t.Errorf("%d refusals name the peer, want 1", got)
	}

	rec := serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Lower"))
	if rec.Code != http.StatusSeeOther {
		t.Errorf("banning someone below answers %d", rec.Code)
	}
}

func TestTheListShowsActiveBans(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	active := habbo(t, db, "active@example.com", "Active")
	expired := habbo(t, db, "expired@example.com", "Expired")
	lifted := habbo(t, db, "lifted@example.com", "Lifted")
	future := sql.NullTime{Time: testNow.AddDate(50, 0, 0), Valid: true}
	q := store.New(db)
	create := func(userID int64, reason string, expires sql.NullTime) store.Ban {
		ban, err := q.CreateBan(t.Context(), store.CreateBanParams{
			UserID:    sql.NullInt64{Int64: userID, Valid: true},
			Reason:    reason,
			CreatedAt: testNow.AddDate(-1, 0, 0),
			ExpiresAt: expires,
		})
		if err != nil {
			t.Fatalf("CreateBan: %v", err)
		}
		return ban
	}
	create(active, "Reason A", future)
	create(expired, "Reason B", sql.NullTime{Time: testNow.AddDate(0, -1, 0), Valid: true})
	ban := create(lifted, "Reason C", future)
	if _, err := q.LiftBan(t.Context(), store.LiftBanParams{ID: ban.ID, LiftedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatalf("LiftBan: %v", err)
	}
	if _, err := q.CreateBan(t.Context(), store.CreateBanParams{
		IP:        sql.NullString{String: "10.0.0.7", Valid: true},
		Reason:    "Reason D",
		CreatedAt: testNow.AddDate(-1, 0, 0),
		ExpiresAt: future,
	}); err != nil {
		t.Fatalf("CreateBan: %v", err)
	}

	rec := serve(mux, "GET", "/housekeeping/bans", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Habbo:Active", "Reason:Reason A", "Reason:Reason D", "IP:10.0.0.7")
	for _, gone := range []string{"Reason B", "Reason C"} {
		if strings.Contains(rec.Body.String(), gone) {
			t.Errorf("the list shows %s", gone)
		}
	}
}

func TestTheFormStartsFromTheHabboPage(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)

	wantPage(t, serve(mux, "GET", "/housekeeping/bans?user=Frank", cookie, nil), http.StatusOK, "User:Frank")
}

func TestAMessageShowsOnlyARealBan(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "other@example.com", "Other")
	serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank"))
	ban := oneBan(t, db)

	for _, path := range []string{
		fmt.Sprintf("/housekeeping/bans?banned=999&habbo=%d", habboOf(t, db, "Frank").ID),
		fmt.Sprintf("/housekeeping/bans?banned=%d&habbo=999", ban.ID),
		fmt.Sprintf("/housekeeping/bans?banned=%d&habbo=%d", ban.ID, habboOf(t, db, "Other").ID),
		"/housekeeping/bans?banned=words&habbo=words",
		"/housekeeping/bans?lifted=words",
	} {
		rec := serve(mux, "GET", path, cookie, nil)
		wantPage(t, rec, http.StatusOK, "bans.html")
		if strings.Contains(rec.Body.String(), "has been banned") || strings.Contains(rec.Body.String(), "Operation applied") {
			t.Errorf("%s shows a message", path)
		}
	}
}

func TestLiftingABan(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := moderator(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	serve(mux, "POST", "/housekeeping/bans", cookie, banForm("Frank"))
	ban := oneBan(t, db)
	path := fmt.Sprintf("/housekeeping/bans/%d/lift", ban.ID)

	wantRedirect(t, serve(mux, "POST", path, cookie, url.Values{"x": {"1"}}), "/housekeeping/bans?lifted=1")
	wantPage(t, serve(mux, "GET", "/housekeeping/bans?lifted=1", cookie, nil), http.StatusOK, "Operation applied successfully. Affected bans: 1")

	after := oneBan(t, db)
	if !after.LiftedAt.Valid || after.LiftedByUserID.Int64 != actor {
		t.Errorf("ban = %+v", after)
	}
	wantOneLog(t, db, "bans.lift", fmt.Sprintf("%d: Being rude", ban.ID), userID, 0)

	login(t, db, "Frank")

	wantRedirect(t, serve(mux, "POST", path, cookie, url.Values{"x": {"1"}}), "/housekeeping/bans?lifted=0")
	if rows := logsOf(t, db, "bans.lift"); len(rows) != 1 {
		t.Errorf("%d log rows, want 1", len(rows))
	}
	wantPage(t, serve(mux, "POST", "/housekeeping/bans/999/lift", cookie, url.Values{"x": {"1"}}), http.StatusNotFound)
}

func TestStaffLiftOnlyTheBansOfUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := moderator(t, db)
	peer, _ := ranked(t, db, "Peer", 4)
	ban, err := store.New(db).CreateBan(t.Context(), store.CreateBanParams{
		UserID:    sql.NullInt64{Int64: peer, Valid: true},
		Reason:    "Reason",
		CreatedAt: testNow,
		ExpiresAt: sql.NullTime{Time: testNow.AddDate(50, 0, 0), Valid: true},
	})
	if err != nil {
		t.Fatalf("CreateBan: %v", err)
	}

	rec := serve(mux, "POST", fmt.Sprintf("/housekeeping/bans/%d/lift", ban.ID), cookie, url.Values{"x": {"1"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "bans.html", "below your level")
	if oneBan(t, db).LiftedAt.Valid {
		t.Error("the ban was lifted")
	}
	wantOneLog(t, db, "users.refused", "lift a ban", peer, 0)
}

// Staff without a group have level 0, and an address has no level to be above.
func TestABanOnAnAddressAloneCanBeLifted(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingBans)
	ban, err := store.New(db).CreateBan(t.Context(), store.CreateBanParams{
		IP:        sql.NullString{String: "10.0.0.7", Valid: true},
		Reason:    "Reason",
		CreatedAt: testNow,
		ExpiresAt: sql.NullTime{Time: testNow.AddDate(50, 0, 0), Valid: true},
	})
	if err != nil {
		t.Fatalf("CreateBan: %v", err)
	}

	wantRedirect(t, serve(mux, "POST", fmt.Sprintf("/housekeeping/bans/%d/lift", ban.ID), cookie, url.Values{"x": {"1"}}), "/housekeeping/bans?lifted=1")
}
