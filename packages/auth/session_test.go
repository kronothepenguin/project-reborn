package auth

import (
	"context"
	"encoding/base64"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestSessionsLoadTheSession(t *testing.T) {
	f := newFixture(t)
	userID, avatarID := f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	session, ok, _ := f.visit(t, cookie)
	if !ok || session.UserID != userID || session.AvatarID != avatarID {
		t.Errorf("session = %+v, %t, want user %d with habbo %d", session, ok, userID, avatarID)
	}
	if _, ok, _ := f.visit(t, nil); ok {
		t.Error("a request without a cookie has a session")
	}
}

func TestSessionsClearBadAndExpiredCookies(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	for name, bad := range map[string]*http.Cookie{
		"malformed": {Name: cookieName, Value: "not-a-token"},
		"unknown":   {Name: cookieName, Value: base64.RawURLEncoding.EncodeToString(make([]byte, 32))},
	} {
		_, ok, rec := f.visit(t, bad)
		if ok {
			t.Errorf("a %s cookie has a session", name)
		}
		if cleared := sessionCookie(rec); cleared == nil || cleared.MaxAge >= 0 {
			t.Errorf("a %s cookie was not cleared: %+v", name, cleared)
		}
	}

	f.advance(31 * time.Minute)
	_, ok, rec := f.visit(t, cookie)
	if ok {
		t.Error("an idle session is still active after 31 minutes")
	}
	if cleared := sessionCookie(rec); cleared == nil || cleared.MaxAge >= 0 {
		t.Errorf("the cookie of an expired session was not cleared: %+v", cleared)
	}
}

func TestSessionsSlideTheExpiry(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)
	id, _ := digest(cookie.Value)

	f.advance(30 * time.Second)
	if _, ok, rec := f.visit(t, cookie); !ok || sessionCookie(rec) != nil {
		t.Fatalf("visit within a minute: session %t, cookie %+v", ok, sessionCookie(rec))
	}
	if row := f.sessions(t)[id]; !row.LastSeenAt.Equal(testNow) || !row.ExpiresAt.Equal(testNow.Add(30*time.Minute)) {
		t.Errorf("a visit within a minute wrote the session: %+v", row)
	}

	f.advance(90 * time.Second)
	visited := f.now
	session, ok, rec := f.visit(t, cookie)
	if !ok || sessionCookie(rec) != nil {
		t.Fatalf("visit after two minutes: session %t, cookie %+v, want no new cookie for a browser session", ok, sessionCookie(rec))
	}
	row := f.sessions(t)[id]
	if !row.LastSeenAt.Equal(visited) || !row.ExpiresAt.Equal(visited.Add(30*time.Minute)) || !session.ExpiresAt.Equal(row.ExpiresAt) {
		t.Errorf("session row = %+v, session = %+v, want the expiry slid to 30 minutes after %s", row, session, visited)
	}

	f.advance(29 * time.Minute)
	if _, ok, _ := f.visit(t, cookie); !ok {
		t.Error("the session ended at its first expiry although it slid")
	}
}

func TestRememberedSessionsRenewTheirCookie(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", true)

	f.advance(24 * time.Hour)
	_, ok, rec := f.visit(t, cookie)
	renewed := sessionCookie(rec)
	if !ok || renewed == nil || renewed.Value != cookie.Value || renewed.MaxAge != 100*24*60*60 {
		t.Errorf("visit a day later: session %t, cookie %+v, want the same token with a fresh 100-day Max-Age", ok, renewed)
	}
}

func TestLogoutEndsTheSession(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	r := httptest.NewRequest(http.MethodPost, "/logout", nil)
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()
	if err := f.auth.Logout(rec, r); err != nil {
		t.Fatalf("Logout: %v", err)
	}
	if cleared := sessionCookie(rec); cleared == nil || cleared.MaxAge >= 0 {
		t.Errorf("Logout did not clear the cookie: %+v", cleared)
	}
	if n := len(f.sessions(t)); n != 0 {
		t.Errorf("%d sessions remain after Logout", n)
	}
	if _, ok, _ := f.visit(t, cookie); ok {
		t.Error("the cookie still has a session after Logout")
	}
}

func TestLogoutEverywhereEndsEverySessionOfTheUser(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.habbo(t, "other@example.com", "Other", testPassword)
	first := f.mustLogin(t, "Admin", false)
	second := f.mustLogin(t, "Admin", true)
	other := f.mustLogin(t, "Other", false)

	if err := f.auth.LogoutEverywhere(t.Context(), userID); err != nil {
		t.Fatalf("LogoutEverywhere: %v", err)
	}
	for name, cookie := range map[string]*http.Cookie{"first": first, "second": second} {
		if _, ok, _ := f.visit(t, cookie); ok {
			t.Errorf("the %s session of the user survived", name)
		}
	}
	if _, ok, _ := f.visit(t, other); !ok {
		t.Error("the session of another user ended")
	}
}

func TestSwitchHabbo(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	second := f.avatar(t, userID, "AdminToo")
	_, foreign := f.habbo(t, "other@example.com", "Other", testPassword)
	cookie := f.mustLogin(t, "Admin", false)
	session, _, _ := f.visit(t, cookie)
	ctx := context.WithValue(t.Context(), contextKey{}, session)

	if err := f.auth.SwitchHabbo(ctx, second); err != nil {
		t.Fatalf("SwitchHabbo to an own habbo: %v", err)
	}
	if got, _, _ := f.visit(t, cookie); got.AvatarID != second {
		t.Errorf("active habbo = %d, want %d", got.AvatarID, second)
	}
	if err := f.auth.SwitchHabbo(ctx, foreign); !errors.Is(err, ErrNotOwner) {
		t.Errorf("SwitchHabbo to another user's habbo = %v, want ErrNotOwner", err)
	}
	if got, _, _ := f.visit(t, cookie); got.AvatarID != second {
		t.Errorf("active habbo = %d after a refused switch, want %d", got.AvatarID, second)
	}
	if err := f.auth.SwitchHabbo(t.Context(), second); !errors.Is(err, ErrNoSession) {
		t.Errorf("SwitchHabbo without a session = %v, want ErrNoSession", err)
	}
}

func TestRequireSession(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)
	handler := f.auth.Sessions(RequireSession(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})))

	for _, c := range []struct {
		name     string
		cookie   *http.Cookie
		accept   string
		status   int
		location string
	}{
		{"page without a session", nil, "text/html", http.StatusSeeOther, "/"},
		{"JSON without a session", nil, "application/json", http.StatusUnauthorized, ""},
		{"with a session", cookie, "text/html", http.StatusNoContent, ""},
	} {
		r := httptest.NewRequest(http.MethodGet, "/me", nil)
		r.Header.Set("Accept", c.accept)
		if c.cookie != nil {
			r.AddCookie(c.cookie)
		}
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, r)
		if rec.Code != c.status || rec.Header().Get("Location") != c.location {
			t.Errorf("%s: %d to %q, want %d to %q", c.name, rec.Code, rec.Header().Get("Location"), c.status, c.location)
		}
	}
}
