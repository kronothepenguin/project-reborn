package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"reflect"
	"strings"
	"testing"
	"time"
)

func TestErrorSentinelsAreDistinctAndWrapped(t *testing.T) {
	sentinels := []error{ErrNoSession, ErrExpired, ErrRevoked, ErrCSRF, ErrConfig, ErrNotFound}
	for i, a := range sentinels {
		if a == nil {
			t.Fatalf("sentinel %d is nil", i)
		}
		for j, b := range sentinels {
			if i != j && errors.Is(a, b) {
				t.Fatalf("sentinels %v and %v overlap", a, b)
			}
		}
		if !errors.Is(fmt.Errorf("wrapped: %w", a), a) {
			t.Fatalf("sentinel %v is not matchable through wrapping", a)
		}
	}
}

func TestResolveDefaults(t *testing.T) {
	s, err := resolve()
	if err != nil {
		t.Fatalf("resolve() error = %v", err)
	}
	checks := []struct {
		name string
		got  any
		want any
	}{
		{"cookieName", s.cookieName, "__Host-session"},
		{"cookiePath", s.cookiePath, "/"},
		{"cookieDomain", s.cookieDomain, ""},
		{"sameSite", s.sameSite, http.SameSiteStrictMode},
		{"cookieSecure", s.cookieSecure, true},
		{"remember", s.remember, false},
		{"idleTimeout", s.idleTimeout, 30 * time.Minute},
		{"absoluteTimeout", s.absoluteTimeout, 12 * time.Hour},
		{"rememberTimeout", s.rememberTimeout, 30 * 24 * time.Hour},
		{"touchInterval", s.touchInterval, time.Minute},
		{"tokenBytes", s.tokenBytes, 32},
		{"csrfHeader", s.csrfHeader, "X-CSRF-Token"},
		{"csrfParam", s.csrfParam, "csrf_token"},
	}
	for _, c := range checks {
		if !reflect.DeepEqual(c.got, c.want) {
			t.Errorf("%s = %v, want %v", c.name, c.got, c.want)
		}
	}
	if s.now == nil || s.eventSink == nil || s.unauthorizedHandler == nil || s.forbiddenHandler == nil {
		t.Fatal("defaults must populate clock, event sink, and denial handlers")
	}
}

func TestResolveOptions(t *testing.T) {
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	s, err := resolve(
		WithCookieName("session"),
		WithCookiePath("/app"),
		WithCookieDomain("example.com"),
		WithSameSite(http.SameSiteLaxMode),
		WithCookieSecure(false),
		WithRemember(true),
		WithIdleTimeout(time.Minute),
		WithAbsoluteTimeout(time.Hour),
		WithRememberTimeout(48*time.Hour),
		WithTouchInterval(30*time.Second),
		WithTokenBytes(minTokenBytes),
		WithCSRFHeader("X-XSRF-Token"),
		WithCSRFParam("_csrf"),
		WithClock(func() time.Time { return now }),
	)
	if err != nil {
		t.Fatalf("resolve() error = %v", err)
	}
	checks := []struct {
		name string
		got  any
		want any
	}{
		{"cookieName", s.cookieName, "session"},
		{"cookiePath", s.cookiePath, "/app"},
		{"cookieDomain", s.cookieDomain, "example.com"},
		{"sameSite", s.sameSite, http.SameSiteLaxMode},
		{"cookieSecure", s.cookieSecure, false},
		{"remember", s.remember, true},
		{"idleTimeout", s.idleTimeout, time.Minute},
		{"absoluteTimeout", s.absoluteTimeout, time.Hour},
		{"rememberTimeout", s.rememberTimeout, 48 * time.Hour},
		{"touchInterval", s.touchInterval, 30 * time.Second},
		{"tokenBytes", s.tokenBytes, minTokenBytes},
		{"csrfHeader", s.csrfHeader, "X-XSRF-Token"},
		{"csrfParam", s.csrfParam, "_csrf"},
	}
	for _, c := range checks {
		if !reflect.DeepEqual(c.got, c.want) {
			t.Errorf("%s = %v, want %v", c.name, c.got, c.want)
		}
	}
	if !s.now().Equal(now) {
		t.Errorf("clock = %v, want %v", s.now(), now)
	}
}

func TestResolveRejectsInvalidConfiguration(t *testing.T) {
	cases := []struct {
		name string
		opts []Option
	}{
		{"empty cookie name", []Option{WithCookieName("")}},
		{"__Host- path not root", []Option{WithCookieName("__Host-session"), WithCookiePath("/sub")}},
		{"__Host- domain set", []Option{WithCookieName("__Host-session"), WithCookieDomain("example.com")}},
		{"__Host- insecure", []Option{WithCookieName("__Host-session"), WithCookieSecure(false)}},
		{"zero idle timeout", []Option{WithIdleTimeout(0)}},
		{"negative idle timeout", []Option{WithIdleTimeout(-time.Second)}},
		{"zero absolute timeout", []Option{WithAbsoluteTimeout(0)}},
		{"zero remember timeout", []Option{WithRememberTimeout(0)}},
		{"zero touch interval", []Option{WithTouchInterval(0)}},
		{"token bytes below minimum", []Option{WithTokenBytes(minTokenBytes - 1)}},
		{"touch interval beyond idle", []Option{WithIdleTimeout(time.Minute), WithTouchInterval(2 * time.Minute)}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if _, err := resolve(c.opts...); !errors.Is(err, ErrConfig) {
				t.Fatalf("resolve() error = %v, want ErrConfig", err)
			}
		})
	}
}

func TestResolveAllowsInsecureNonHostCookie(t *testing.T) {
	if _, err := resolve(WithCookieName("session"), WithCookieSecure(false)); err != nil {
		t.Fatalf("resolve() error = %v, want nil", err)
	}
}

func TestCredentialEntropyUniquenessAndDigest(t *testing.T) {
	const samples = 256
	seen := make(map[string]struct{}, samples)
	for range samples {
		cred, err := newCredential(minTokenBytes)
		if err != nil {
			t.Fatalf("newCredential() error = %v", err)
		}
		raw, err := base64.RawURLEncoding.DecodeString(cred)
		if err != nil {
			t.Fatalf("credential %q is not base64url: %v", cred, err)
		}
		if got := len(raw) * 8; got < minTokenBytes*8 {
			t.Fatalf("credential entropy = %d bits, want >= %d", got, minTokenBytes*8)
		}
		if _, dup := seen[cred]; dup {
			t.Fatalf("duplicate credential issued: %q", cred)
		}
		seen[cred] = struct{}{}

		id := digest(cred)
		if id == cred {
			t.Fatal("digest must differ from the credential")
		}
		if len(id) != 43 {
			t.Fatalf("digest length = %d, want 43", len(id))
		}
		if _, err := base64.RawURLEncoding.DecodeString(id); err != nil {
			t.Fatalf("digest %q is not base64url: %v", id, err)
		}
		if digest(cred) != id {
			t.Fatal("digest must be deterministic")
		}
	}
}

func TestCSRFDerivationIsDeterministicAndCredentialBound(t *testing.T) {
	const cred = "credential-a"
	got := deriveCSRF(cred)
	if got != deriveCSRF(cred) {
		t.Fatal("deriveCSRF must be deterministic")
	}
	if got == deriveCSRF("credential-b") {
		t.Fatal("deriveCSRF must differ per credential")
	}
	if _, err := base64.RawURLEncoding.DecodeString(got); err != nil {
		t.Fatalf("CSRF token is not base64url: %v", err)
	}
	mac := hmac.New(sha256.New, []byte(cred))
	mac.Write([]byte(csrfMessage))
	want := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if got != want {
		t.Fatalf("deriveCSRF() = %q, want HMAC-SHA256 derivation %q", got, want)
	}
}

func TestAuthRedaction(t *testing.T) {
	const secret = "raw-credential-value"
	a := &Auth{
		Session:    Session{ID: digest(secret), AccountID: 42},
		CSRF:       deriveCSRF(secret),
		credential: secret,
	}
	rendered := []string{
		a.String(),
		fmt.Sprintf("%v", a),
		fmt.Sprintf("%s", a),
		fmt.Sprintf("%+v", a),
		fmt.Sprintf("%+v", *a),
		a.LogValue().String(),
	}
	for _, got := range rendered {
		if strings.Contains(got, secret) {
			t.Fatalf("formatted Auth leaked the credential: %q", got)
		}
	}

	var buf strings.Builder
	slog.New(slog.NewTextHandler(&buf, nil)).Info("auth", "a", a)
	if strings.Contains(buf.String(), secret) {
		t.Fatalf("slog output leaked the credential: %q", buf.String())
	}
}

func TestEventCarriesNoCredentialField(t *testing.T) {
	want := map[string]bool{
		"At": true, "Kind": true, "AccountID": true, "SessionID": true,
		"Outcome": true, "Address": true, "UserAgent": true,
	}
	rt := reflect.TypeOf(Event{})
	for i := range rt.NumField() {
		name := rt.Field(i).Name
		if !want[name] {
			t.Fatalf("Event has unexpected field %q; events must never carry credentials", name)
		}
		delete(want, name)
	}
	if len(want) != 0 {
		t.Fatalf("Event is missing fields %v", want)
	}
}

func TestDefaultEventSinkRecordsWithoutError(t *testing.T) {
	previous := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(io.Discard, nil)))
	t.Cleanup(func() { slog.SetDefault(previous) })

	sink := slogDefaultSink{}
	if err := sink.Record(t.Context(), Event{At: time.Now(), Kind: EventCreated, Outcome: OutcomeOK}); err != nil {
		t.Fatalf("default sink Record() error = %v", err)
	}
}
