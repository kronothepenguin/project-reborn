package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"testing"
	"time"
)

func TestLoginStartsASession(t *testing.T) {
	f := newFixture(t)
	userID, avatarID := f.habbo(t, "admin@example.com", "Admin", testPassword)

	cookie, session, err := f.login(t, "10.0.0.1", "Admin", testPassword, false)
	if err != nil {
		t.Fatalf("Login: %v", err)
	}
	expires := testNow.Add(30 * time.Minute)
	if session.UserID != userID || session.AvatarID != avatarID || session.Remember || !session.ExpiresAt.Equal(expires) {
		t.Errorf("session = %+v, want user %d, habbo %d, expiring at %s", session, userID, avatarID, expires)
	}

	if cookie == nil {
		t.Fatal("Login set no session cookie")
	}
	if !cookie.HttpOnly || !cookie.Secure || cookie.SameSite != http.SameSiteLaxMode || cookie.Path != "/" || cookie.MaxAge != 0 {
		t.Errorf("cookie = %+v, want HttpOnly, Secure, SameSite=Lax, Path=/ and no Max-Age", cookie)
	}

	id, ok := digest(cookie.Value)
	rows := f.sessions(t)
	row, stored := rows[id]
	if !ok || !stored || len(rows) != 1 || id == cookie.Value {
		t.Fatalf("sessions = %+v, want one row keyed by the digest of the cookie", rows)
	}
	if row.UserID != userID || row.AvatarID != avatarID || row.IP != "10.0.0.1" || row.UserAgent != "test-agent" ||
		!row.LastSeenAt.Equal(testNow) || !row.ExpiresAt.Equal(expires) {
		t.Errorf("session row = %+v", row)
	}

	attempts := f.attempts(t)
	if len(attempts) != 1 || !attempts[0].Succeeded || attempts[0].UserID.Int64 != userID ||
		attempts[0].AvatarID.Int64 != avatarID || attempts[0].IP != "10.0.0.1" {
		t.Errorf("login attempts = %+v, want one success of user %d with habbo %d", attempts, userID, avatarID)
	}
}

func TestLoginActivatesTheNamedHabbo(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	second := f.avatar(t, userID, "AdminToo")

	_, session, err := f.login(t, "10.0.0.1", "admintoo", testPassword, false)
	if err != nil {
		t.Fatalf("Login: %v", err)
	}
	if session.UserID != userID || session.AvatarID != second {
		t.Errorf("session = %+v, want habbo %d of user %d, named case-insensitively", session, second, userID)
	}
}

func TestRememberMeSessionsLastRememberDays(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)

	cookie, session, err := f.login(t, "10.0.0.1", "Admin", testPassword, true)
	if err != nil {
		t.Fatalf("Login: %v", err)
	}
	lifetime := 100 * 24 * time.Hour
	if cookie.MaxAge != int(lifetime/time.Second) {
		t.Errorf("cookie Max-Age = %d, want %d", cookie.MaxAge, int(lifetime/time.Second))
	}
	if !session.Remember || !session.ExpiresAt.Equal(testNow.Add(lifetime)) {
		t.Errorf("session = %+v, want a remembered session for 100 days", session)
	}
}

func TestSecureCookiesFollowTheSetting(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.set(t, "auth.secureCookies", false)

	if cookie := f.mustLogin(t, "Admin", false); cookie.Secure {
		t.Error("the cookie is Secure although auth.secureCookies is false")
	}
}

func TestLoginRejectsWrongPasswordsAndUnknownHabbos(t *testing.T) {
	f := newFixture(t)
	userID, avatarID := f.habbo(t, "admin@example.com", "Admin", testPassword)

	for name, password := range map[string]string{"Admin": "wrong", "Nobody": testPassword} {
		cookie, _, err := f.login(t, "10.0.0.1", name, password, false)
		if !errors.Is(err, ErrInvalidCredentials) {
			t.Errorf("Login(%s) = %v, want ErrInvalidCredentials", name, err)
		}
		if cookie != nil {
			t.Errorf("Login(%s) set a cookie", name)
		}
	}

	var ofUser, ofNobody int
	for _, attempt := range f.attempts(t) {
		switch {
		case attempt.Succeeded:
			t.Errorf("attempt %+v succeeded", attempt)
		case attempt.UserID == (sql.NullInt64{Int64: userID, Valid: true}) && attempt.AvatarID.Int64 == avatarID:
			ofUser++
		case !attempt.UserID.Valid && !attempt.AvatarID.Valid:
			ofNobody++
		}
	}
	if ofUser != 1 || ofNobody != 1 {
		t.Errorf("failed attempts: %d of the user and %d of nobody, want 1 and 1", ofUser, ofNobody)
	}
	if n := len(f.sessions(t)); n != 0 {
		t.Errorf("%d sessions exist after failed logins", n)
	}
}

func TestLoginThrottlesFailuresPerUser(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.set(t, "auth.loginMaxFailures", 2)

	for i := range 2 {
		if _, _, err := f.login(t, fmt.Sprintf("10.0.0.%d", i+1), "Admin", "wrong", false); !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("failure %d: %v, want ErrInvalidCredentials", i+1, err)
		}
	}
	if _, _, err := f.login(t, "10.0.0.9", "Admin", testPassword, false); !errors.Is(err, ErrThrottled) {
		t.Fatalf("Login after 2 failures from other IPs = %v, want ErrThrottled", err)
	}

	f.advance(15*time.Minute + time.Second)
	if _, _, err := f.login(t, "10.0.0.9", "Admin", testPassword, false); err != nil {
		t.Errorf("Login after the window = %v, want a session", err)
	}
}

func TestLoginThrottlesFailuresPerIP(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.set(t, "auth.loginMaxFailures", 2)

	for _, name := range []string{"Nobody", "Someone"} {
		if _, _, err := f.login(t, "10.0.0.1", name, "guess", false); !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("Login(%s) = %v, want ErrInvalidCredentials", name, err)
		}
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); !errors.Is(err, ErrThrottled) {
		t.Errorf("Login from the failing IP = %v, want ErrThrottled", err)
	}
	if _, _, err := f.login(t, "10.0.0.2", "Admin", testPassword, false); err != nil {
		t.Errorf("Login from another IP = %v, want a session", err)
	}
}

func TestLoginRefusesBans(t *testing.T) {
	inAnHour := sql.NullTime{Time: testNow.Add(time.Hour), Valid: true}
	aMinuteAgo := sql.NullTime{Time: testNow.Add(-time.Minute), Valid: true}
	for _, c := range []struct {
		name      string
		ofUser    bool
		ip        string
		expiresAt sql.NullTime
		liftedAt  sql.NullTime
		banned    bool
	}{
		{name: "permanent user ban", ofUser: true, banned: true},
		{name: "temporary user ban", ofUser: true, expiresAt: inAnHour, banned: true},
		{name: "ban of the IP", ip: "10.0.0.1", banned: true},
		{name: "ban of another IP", ip: "10.0.0.2"},
		{name: "expired ban", ofUser: true, expiresAt: aMinuteAgo},
		{name: "lifted ban", ofUser: true, liftedAt: aMinuteAgo},
	} {
		t.Run(c.name, func(t *testing.T) {
			f := newFixture(t)
			userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
			f.ban(t, sql.NullInt64{Int64: userID, Valid: c.ofUser}, c.ip, c.expiresAt, c.liftedAt)

			cookie, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false)
			if !c.banned {
				if err != nil {
					t.Errorf("Login = %v, want a session", err)
				}
				return
			}
			ban, ok := errors.AsType[*BanError](err)
			if !ok || !errors.Is(err, ErrBanned) {
				t.Fatalf("Login = %v, want a *BanError matching ErrBanned", err)
			}
			if ban.Reason != "Scamming" || !ban.ExpiresAt.Equal(c.expiresAt.Time) {
				t.Errorf("ban = %+v, want reason Scamming expiring at %v", ban, c.expiresAt.Time)
			}
			if cookie != nil {
				t.Error("a banned login set a cookie")
			}
		})
	}
}

func TestLoginHidesBansFromWrongPasswords(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.ban(t, sql.NullInt64{Int64: userID, Valid: true}, "", sql.NullTime{}, sql.NullTime{})

	if _, _, err := f.login(t, "10.0.0.1", "Admin", "wrong", false); !errors.Is(err, ErrInvalidCredentials) {
		t.Errorf("Login with a wrong password = %v, want ErrInvalidCredentials", err)
	}
}

func TestLoginRehashesOldPasswords(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	old := hashWith(testPassword, argonParams{memory: 8 * 1024, time: 1, threads: 1})
	f.setHash(t, userID, old)

	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); err != nil {
		t.Fatalf("Login: %v", err)
	}
	var stored string
	if err := f.db.QueryRowContext(t.Context(), `SELECT password_hash FROM credentials WHERE user_id = ?`, userID).Scan(&stored); err != nil {
		t.Fatalf("read credential: %v", err)
	}
	if stored == old || NeedsRehash(stored) {
		t.Errorf("stored hash %q was not upgraded to the current parameters", stored)
	}
	if ok, err := VerifyPassword(stored, testPassword); err != nil || !ok {
		t.Errorf("the upgraded hash does not verify: %t, %v", ok, err)
	}
}

func (f *fixture) ban(t *testing.T, userID sql.NullInt64, ip string, expiresAt, liftedAt sql.NullTime) {
	t.Helper()
	_, err := f.db.ExecContext(t.Context(),
		`INSERT INTO bans (user_id, ip, reason, created_at, expires_at, lifted_at) VALUES (?, ?, ?, ?, ?, ?)`,
		userID, sql.NullString{String: ip, Valid: ip != ""}, "Scamming", testNow.Add(-time.Hour), expiresAt, liftedAt)
	if err != nil {
		t.Fatalf("insert ban: %v", err)
	}
}
