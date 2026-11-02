package cms

import (
	"database/sql"
	"encoding/json"
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

// member registers a habbo through the site, so that it has a wallet, and signs
// it in.
func member(t *testing.T, db *sql.DB, mux *http.ServeMux) (cookie *http.Cookie, avatarID, userID int64) {
	t.Helper()
	rec := serve(mux, "POST", "/register", nil, registration())
	wantRedirect(t, rec, "/me")
	avatar, err := store.New(db).GetAvatarByName(t.Context(), "Newbie")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}
	return sessionCookie(rec), avatar.ID, avatar.UserID
}

func saveMotto(mux *http.ServeMux, cookie *http.Cookie, motto string) *httptest.ResponseRecorder {
	body, _ := json.Marshal(map[string]string{"motto": motto})
	r := httptest.NewRequest("POST", "/me/motto", strings.NewReader(string(body)))
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Accept", "application/json")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func alert(t *testing.T, db *sql.DB, avatarID int64, sender any, message string) int64 {
	t.Helper()
	result, err := db.ExecContext(t.Context(), `INSERT INTO alerts (avatar_id, sender_user_id, message, created_at) VALUES (?, ?, ?, ?)`,
		avatarID, sender, message, time.Now().UTC())
	if err != nil {
		t.Fatalf("insert alert: %v", err)
	}
	id, _ := result.LastInsertId()
	return id
}

func TestMeShowsTheHabbo(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "me.html", "Habbo:Newbie", "Credits:500", "ClubDays:0", "OpenHelp:0", "Alerts:[]", "Motto: ")
}

func TestMeSendsGuestsHome(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/me", nil, nil), "/")
}

func TestMeCountsClubDays(t *testing.T) {
	for _, c := range []struct {
		name string
		left time.Duration
		want string
	}{
		{"a few hours left", 5 * time.Hour, "ClubDays:1"},
		{"ten days and a bit", 10*24*time.Hour + time.Hour, "ClubDays:11"},
		{"over", -time.Hour, "ClubDays:0"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, userID := member(t, db, mux)
			now := time.Now().UTC()
			_, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
				userID, now.Add(-30*24*time.Hour), now.Add(c.left), now)
			if err != nil {
				t.Fatalf("insert subscription: %v", err)
			}
			wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, c.want)
		})
	}
}

func TestMeShowsTheOldestAlert(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, userID := member(t, db, mux)
	first := alert(t, db, avatarID, nil, "first")
	alert(t, db, avatarID, userID, "second")

	rec := serve(mux, "GET", "/me", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Message:first", "Staff:false")
	if strings.Contains(rec.Body.String(), "Message:second") {
		t.Error("the feed shows more than the oldest alert")
	}

	wantRedirect(t, serve(mux, "POST", fmt.Sprintf("/me/alerts/%d/dismiss", first), cookie, url.Values{}), "/me")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Message:second", "Staff:true")
}

func TestMeCannotDismissAnotherHabbosAlert(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	userID := habbo(t, db, "other@example.com", "Other")
	other, err := store.New(db).ListUserAvatars(t.Context(), userID)
	if err != nil {
		t.Fatalf("ListUserAvatars: %v", err)
	}
	id := alert(t, db, other[0].ID, nil, "private")

	wantRedirect(t, serve(mux, "POST", fmt.Sprintf("/me/alerts/%d/dismiss", id), cookie, url.Values{}), "/me")
	if n := count(t, db, `SELECT COUNT(*) FROM alerts WHERE dismissed_at IS NULL`); n != 1 {
		t.Errorf("%d undismissed alerts, want the other habbo's to stay", n)
	}
}

func TestMeBirthday(t *testing.T) {
	today := time.Now().UTC()
	// January and March both have every possible day of the month.
	otherMonth := time.January
	if today.Month() == time.January {
		otherMonth = time.March
	}
	for _, c := range []struct {
		name string
		born time.Time
		on   bool
		want string
	}{
		{"the same day of another month", time.Date(today.Year()-23, otherMonth, today.Day(), 0, 0, 0, 0, time.UTC), true, "Birthday: "},
		{"today", today.AddDate(-23, 0, 0), true, "Birthday:23rd"},
		{"an eleventh", today.AddDate(-11, 0, 0), true, "Birthday:11th"},
		{"a thirty-first", today.AddDate(-31, 0, 0), true, "Birthday:31st"},
		{"a twelfth", today.AddDate(-12, 0, 0), true, "Birthday:12th"},
		{"another day", today.AddDate(-23, 0, 1), true, "Birthday: "},
		{"switched off", today.AddDate(-23, 0, 0), false, "Birthday: "},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)
			setSetting(t, db, "features.birthdayNotifications", c.on)
			if _, err := db.ExecContext(t.Context(), `UPDATE users SET born_on = ?`, c.born); err != nil {
				t.Fatalf("update: %v", err)
			}
			wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, c.want)
		})
	}
}

func TestMeShowsTheHelpCountToHelpStaff(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, userID := member(t, db, mux)
	for _, closed := range []any{nil, nil, time.Now().UTC()} {
		_, err := db.ExecContext(t.Context(), `INSERT INTO help_tickets (subject, message, ip, created_at, closed_at) VALUES ('s', 'm', 'i', ?, ?)`, time.Now().UTC(), closed)
		if err != nil {
			t.Fatalf("insert ticket: %v", err)
		}
	}

	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "OpenHelp:0")
	grant(t, db, userID, auth.HousekeepingHelp)
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "OpenHelp:2", "OneOpenHelp:false")
}

func TestMeShowsTheLastSignIn(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	want := time.Now().UTC().Format("02-01-2006")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "LastSignIn:"+want)
}

func TestMottoSaves(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	rec := saveMotto(mux, cookie, `<b>Hello</b>`)
	wantPage(t, rec, http.StatusOK, `"motto":"<b>Hello</b>"`)
	if got := rec.Header().Get("Content-Type"); got != "application/json" {
		t.Errorf("Content-Type = %q", got)
	}
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Motto:&lt;b&gt;Hello&lt;/b&gt;")
}

func TestMottoKeepsTheOldOneWhenTooLong(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	saveMotto(mux, cookie, "short")

	wantPage(t, saveMotto(mux, cookie, strings.Repeat("a", 38)), http.StatusOK, `"motto":"`+strings.Repeat("a", 38)+`"`)
	wantPage(t, saveMotto(mux, cookie, strings.Repeat("a", 39)), http.StatusOK, `"motto":"`+strings.Repeat("a", 38)+`"`)
}

func TestMottoNeedsASession(t *testing.T) {
	_, mux := newSite(t)
	if rec := saveMotto(mux, nil, "hello"); rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}
