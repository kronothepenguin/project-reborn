package auth

import (
	"encoding/base64"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestUS2CredentialsAreHighEntropyUniqueAndStoredAsDigests(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	const samples = 64
	credentials := make(map[string]struct{}, samples)
	ids := make(map[string]struct{}, samples)
	for i := range samples {
		rec := httptest.NewRecorder()
		a, err := Create(rec, newTestRequest("POST", "/login", ""), AccountID(i), store, store, opts...)
		if err != nil {
			t.Fatalf("Create() error = %v", err)
		}
		credential := setCookieFrom(t, rec).Value
		raw, err := base64.RawURLEncoding.DecodeString(credential)
		if err != nil {
			t.Fatalf("credential %q is not base64url: %v", credential, err)
		}
		if len(raw)*8 < 128 {
			t.Fatalf("credential entropy = %d bits, want >= 128", len(raw)*8)
		}
		if _, dup := credentials[credential]; dup {
			t.Fatalf("credential issued twice: %q", credential)
		}
		credentials[credential] = struct{}{}
		if _, dup := ids[a.Session.ID]; dup {
			t.Fatalf("session digest issued twice: %q", a.Session.ID)
		}
		ids[a.Session.ID] = struct{}{}
		if a.Session.ID != digest(credential) {
			t.Fatalf("stored id %q is not the credential digest", a.Session.ID)
		}
	}

	for id, record := range store.snapshot() {
		if id != record.ID || len(id) != 43 {
			t.Fatalf("stored record %q has an unexpected id %q", id, record.ID)
		}
		if _, replayable := credentials[id]; replayable {
			t.Fatalf("store contains a replayable credential: %q", id)
		}
		for _, field := range []string{record.ID, record.UserAgent, record.Address} {
			for credential := range credentials {
				if strings.Contains(field, credential) {
					t.Fatal("store snapshot contains raw credential material")
				}
			}
		}
	}
}

func TestUS2FixationDefense(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	first := httptest.NewRecorder()
	original, err := Create(first, newTestRequest("POST", "/login", ""), 1, store, store, opts...)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	presented := setCookieFrom(t, first)

	second := httptest.NewRecorder()
	replacement, err := Create(second, withCookie(newTestRequest("POST", "/login", ""), presented), 1, store, store, opts...)
	if err != nil {
		t.Fatalf("Create() with presented credential error = %v", err)
	}
	issued := setCookieFrom(t, second)

	if issued.Value == presented.Value {
		t.Fatal("Create() adopted the client-supplied credential")
	}
	if replacement.Session.ID == original.Session.ID {
		t.Fatal("Create() reused the presented session id")
	}
	if replacement.Session.ID != digest(issued.Value) {
		t.Fatal("replacement session id is not the digest of the new credential")
	}
	old := store.snapshot()[original.Session.ID]
	if old.RevokedAt.IsZero() {
		t.Fatal("Create() did not revoke the presented session")
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), presented), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("presented credential after Create() error = %v, want ErrNoSession", err)
	}
}

func TestUS2CookieHardening(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)
	if cookie.Name != "__Host-session" {
		t.Errorf("cookie name = %q, want __Host-session", cookie.Name)
	}
	if cookie.Path != "/" {
		t.Errorf("cookie path = %q, want /", cookie.Path)
	}
	if cookie.Domain != "" {
		t.Errorf("cookie domain = %q, want empty", cookie.Domain)
	}
	if !cookie.HttpOnly {
		t.Error("cookie must be HttpOnly")
	}
	if !cookie.Secure {
		t.Error("cookie must be Secure by default")
	}
	if cookie.SameSite != http.SameSiteStrictMode {
		t.Errorf("cookie SameSite = %v, want Strict", cookie.SameSite)
	}
	if cookie.MaxAge != 0 || !cookie.Expires.IsZero() {
		t.Errorf("default cookie must be browser-session, got MaxAge=%d Expires=%v", cookie.MaxAge, cookie.Expires)
	}
	if header := rec.Header().Get("Set-Cookie"); strings.Contains(header, "Domain=") {
		t.Errorf("__Host- cookie must not set Domain: %q", header)
	}

	insecure := httptest.NewRecorder()
	if _, err := Create(insecure, newTestRequest("POST", "/login", ""), 1, store, store,
		WithCookieName("session"), WithCookieSecure(false), WithEventSink(&memSink{})); err != nil {
		t.Fatalf("Create() with WithCookieSecure(false) error = %v", err)
	}
	cookie = setCookieFrom(t, insecure)
	if cookie.Secure {
		t.Error("WithCookieSecure(false) must drop the Secure attribute")
	}
	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteStrictMode || cookie.Path != "/" {
		t.Error("WithCookieSecure(false) must only change the Secure attribute")
	}
}

func TestUS2PlainHTTPIsAuthenticatedNormally(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)
	if cookie.Secure != true {
		t.Fatal("default cookie must be marked Secure")
	}
	a, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...)
	if err != nil {
		t.Fatalf("plain HTTP Validate() error = %v; the library must not inspect transport", err)
	}
	if a.Session.AccountID != 1 {
		t.Fatalf("AccountID = %d, want 1", a.Session.AccountID)
	}
}

func TestUS2RememberMeCookieAndDeadline(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	base := []Option{
		WithClock(func() time.Time { return now }),
		WithEventSink(&memSink{}),
	}

	rememberRec := httptest.NewRecorder()
	remember, err := Create(rememberRec, newTestRequest("POST", "/login", ""), 1, store, store,
		append(base, WithRemember(true), WithRememberTimeout(48*time.Hour))...)
	if err != nil {
		t.Fatalf("Create() remember error = %v", err)
	}
	cookie := setCookieFrom(t, rememberRec)
	if cookie.MaxAge != int((48 * time.Hour).Seconds()) {
		t.Errorf("remember cookie MaxAge = %d, want %d", cookie.MaxAge, int((48 * time.Hour).Seconds()))
	}
	if !cookie.Expires.Equal(now.Add(48 * time.Hour)) {
		t.Errorf("remember cookie Expires = %v, want %v", cookie.Expires, now.Add(48*time.Hour))
	}
	if !remember.Session.Remember {
		t.Error("remember session must set Session.Remember")
	}
	if !remember.Session.AbsoluteExpiresAt.Equal(now.Add(48 * time.Hour)) {
		t.Errorf("remember absolute deadline = %v, want %v", remember.Session.AbsoluteExpiresAt, now.Add(48*time.Hour))
	}

	defaultRec := httptest.NewRecorder()
	defaultAuth, err := Create(defaultRec, newTestRequest("POST", "/login", ""), 1, store, store, base...)
	if err != nil {
		t.Fatalf("Create() default error = %v", err)
	}
	if got := setCookieFrom(t, defaultRec); got.MaxAge != 0 || !got.Expires.IsZero() {
		t.Errorf("default cookie must stay browser-session, got MaxAge=%d Expires=%v", got.MaxAge, got.Expires)
	}
	if defaultAuth.Session.Remember {
		t.Error("default session must not be remember-me")
	}
	if !defaultAuth.Session.AbsoluteExpiresAt.Equal(now.Add(12 * time.Hour)) {
		t.Errorf("default absolute deadline = %v, want %v", defaultAuth.Session.AbsoluteExpiresAt, now.Add(12*time.Hour))
	}
}

func TestUS2IdleExpiry(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithIdleTimeout(10 * time.Second),
		WithAbsoluteTimeout(time.Hour),
		WithTouchInterval(time.Second),
		WithEventSink(&memSink{}),
	}
	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)

	now = now.Add(11 * time.Second)
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); !errors.Is(err, ErrExpired) {
		t.Fatalf("idle-expired Validate() error = %v, want ErrExpired", err)
	}
}

func TestUS2AbsoluteDeadlineIsNotExtendedByActivity(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithIdleTimeout(20 * time.Second),
		WithAbsoluteTimeout(30 * time.Second),
		WithTouchInterval(time.Second),
		WithEventSink(&memSink{}),
	}
	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)

	now = now.Add(15 * time.Second)
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); err != nil {
		t.Fatalf("activity within idle window error = %v", err)
	}
	now = now.Add(10 * time.Second)
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); err != nil {
		t.Fatalf("activity within idle window error = %v", err)
	}
	now = now.Add(6 * time.Second)
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); !errors.Is(err, ErrExpired) {
		t.Fatalf("past absolute deadline Validate() error = %v, want ErrExpired", err)
	}
}

func TestUS2RotatePreservesSessionAndRejectsOldCredential(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithEventSink(&memSink{}),
	}
	rec := httptest.NewRecorder()
	original, err := Create(rec, newTestRequest("POST", "/login", ""), 5, store, store, opts...)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	oldCookie := setCookieFrom(t, rec)

	acting, err := Validate(withCookie(newTestRequest("GET", "/", ""), oldCookie), store, store, opts...)
	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	now = now.Add(2 * time.Minute)
	rotateRec := httptest.NewRecorder()
	rotated, err := Rotate(rotateRec, withCookie(newTestRequest("POST", "/rotate", ""), oldCookie), acting, store, store, opts...)
	if err != nil {
		t.Fatalf("Rotate() error = %v", err)
	}
	newCookie := setCookieFrom(t, rotateRec)

	if newCookie.Value == oldCookie.Value || rotated.Session.ID == original.Session.ID {
		t.Fatal("Rotate() reused the old credential")
	}
	if rotated.CSRF == acting.CSRF {
		t.Fatal("Rotate() must rotate the CSRF token")
	}
	if rotated.Session.AccountID != original.Session.AccountID ||
		!rotated.Session.CreatedAt.Equal(original.Session.CreatedAt) ||
		!rotated.Session.AbsoluteExpiresAt.Equal(original.Session.AbsoluteExpiresAt) ||
		rotated.Session.Remember != original.Session.Remember {
		t.Fatalf("Rotate() did not preserve the logical session: %+v", rotated.Session)
	}

	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), oldCookie), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("old credential after Rotate() error = %v, want ErrNoSession", err)
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), newCookie), store, store, opts...); err != nil {
		t.Fatalf("new credential after Rotate() error = %v", err)
	}
}
