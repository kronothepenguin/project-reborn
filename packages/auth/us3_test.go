package auth

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestUS3ListRevokeAndRevokeAll(t *testing.T) {
	store := newMemStore()
	sink := &memSink{}
	opts := []Option{WithEventSink(sink)}

	var cookies []*http.Cookie
	var auths []*Auth
	for i, agent := range []string{"agent-a", "agent-b", "agent-c"} {
		request := newTestRequest("POST", "/login", "")
		request.Header.Set("User-Agent", agent)
		request.RemoteAddr = fmt.Sprintf("10.0.0.%d:1234", i+1)
		rec := httptest.NewRecorder()
		a, err := Create(rec, request, 7, store, store, opts...)
		if err != nil {
			t.Fatalf("Create() error = %v", err)
		}
		cookies = append(cookies, setCookieFrom(t, rec))
		auths = append(auths, a)
	}

	sessions, err := List(t.Context(), 7, store, opts...)
	if err != nil || len(sessions) != 3 {
		t.Fatalf("List() = %d sessions, %v; want 3", len(sessions), err)
	}
	agents := map[string]bool{}
	for _, session := range sessions {
		if session.CreatedAt.IsZero() || session.LastSeenAt.IsZero() {
			t.Fatalf("List() returned incomplete metadata: %+v", session)
		}
		if session.Address == "" {
			t.Fatalf("List() returned no origin metadata: %+v", session)
		}
		agents[session.UserAgent] = true
	}
	if !agents["agent-a"] || !agents["agent-b"] || !agents["agent-c"] {
		t.Fatalf("List() agents = %v, want all created origins", agents)
	}

	if err := Revoke(t.Context(), auths[0].Session.ID, store, opts...); err != nil {
		t.Fatalf("Revoke() error = %v", err)
	}
	if err := Revoke(t.Context(), auths[0].Session.ID, store, opts...); err != nil {
		t.Fatalf("Revoke() must be idempotent, error = %v", err)
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookies[0]), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("revoked session Validate() error = %v, want ErrNoSession", err)
	}
	if sessions, err = List(t.Context(), 7, store, opts...); err != nil || len(sessions) != 2 {
		t.Fatalf("List() after Revoke = %d sessions, %v; want 2", len(sessions), err)
	}

	if err := RevokeAll(t.Context(), 7, store, opts...); err != nil {
		t.Fatalf("RevokeAll() error = %v", err)
	}
	for i := 1; i < 3; i++ {
		if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookies[i]), store, store, opts...); !errors.Is(err, ErrNoSession) {
			t.Fatalf("session %d after RevokeAll error = %v, want ErrNoSession", i, err)
		}
	}
	if sessions, err = List(t.Context(), 7, store, opts...); err != nil || len(sessions) != 0 {
		t.Fatalf("List() after RevokeAll = %d sessions, %v; want 0", len(sessions), err)
	}

	events := sink.all()
	kinds := map[EventKind]int{}
	for _, event := range events {
		kinds[event.Kind]++
		if event.At.IsZero() {
			t.Errorf("event %+v has zero timestamp", event)
		}
		if event.Outcome != OutcomeOK {
			t.Errorf("event %+v has unexpected outcome", event)
		}
		for _, cookie := range cookies {
			if strings.Contains(fmt.Sprintf("%+v", event), cookie.Value) {
				t.Fatal("audit event contains a raw credential")
			}
		}
	}
	if kinds[EventCreated] != 3 || kinds[EventRevoked] != 4 {
		t.Fatalf("event kinds = %v, want 3 created and 4 revoked (one per revocation call)", kinds)
	}
}

func TestUS3PasswordChangedKeepsActingSession(t *testing.T) {
	store := newMemStore()
	sink := &memSink{}
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithEventSink(sink),
	}

	createSession := func(account AccountID) (*Auth, *http.Cookie) {
		rec := httptest.NewRecorder()
		a, err := Create(rec, newTestRequest("POST", "/login", ""), account, store, store, opts...)
		if err != nil {
			t.Fatalf("Create() error = %v", err)
		}
		return a, setCookieFrom(t, rec)
	}
	acting, actingCookie := createSession(9)
	_, otherCookie := createSession(9)
	_, unrelatedCookie := createSession(10)

	validated, err := Validate(withCookie(newTestRequest("GET", "/", ""), actingCookie), store, store, opts...)
	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
	if validated.Session.ID != acting.Session.ID {
		t.Fatal("validated acting session differs from created one")
	}

	now = now.Add(time.Minute)
	rec := httptest.NewRecorder()
	rotated, err := PasswordChanged(rec, withCookie(newTestRequest("POST", "/password", ""), actingCookie), validated, store, store, store, opts...)
	if err != nil {
		t.Fatalf("PasswordChanged() error = %v", err)
	}
	newCookie := setCookieFrom(t, rec)
	if rotated.Session.AccountID != 9 || !rotated.Session.CreatedAt.Equal(acting.Session.CreatedAt) {
		t.Fatalf("PasswordChanged() did not preserve the acting session: %+v", rotated.Session)
	}

	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), otherCookie), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("other session after PasswordChanged error = %v, want ErrNoSession", err)
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), actingCookie), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("old acting credential after PasswordChanged error = %v, want ErrNoSession", err)
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), unrelatedCookie), store, store, opts...); err != nil {
		t.Fatalf("unrelated account session error = %v, want still valid", err)
	}
	survivor, err := Validate(withCookie(newTestRequest("GET", "/", ""), newCookie), store, store, opts...)
	if err != nil {
		t.Fatalf("rotated acting credential error = %v", err)
	}
	if survivor.Session.AccountID != 9 || !survivor.Session.CreatedAt.Equal(acting.Session.CreatedAt) {
		t.Fatalf("PasswordChanged() did not preserve the acting session: %+v", survivor.Session)
	}

	kinds := sink.kinds()
	var created, revoked, rotatedCount int
	for _, kind := range kinds {
		switch kind {
		case EventCreated:
			created++
		case EventRevoked:
			revoked++
		case EventRotated:
			rotatedCount++
		}
	}
	if created != 3 || revoked != 1 || rotatedCount != 1 {
		t.Fatalf("event kinds = %v, want 3 created, 1 revoked, 1 rotated", kinds)
	}
	for _, event := range sink.all() {
		for _, cookie := range []*http.Cookie{actingCookie, otherCookie, unrelatedCookie} {
			if strings.Contains(fmt.Sprintf("%+v", event), cookie.Value) {
				t.Fatal("audit event contains a raw credential")
			}
		}
	}
}

func TestUS3ListFiltersRecordsPastDeadline(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithIdleTimeout(10 * time.Second),
		WithAbsoluteTimeout(time.Hour),
		WithTouchInterval(time.Second),
		WithEventSink(&memSink{}),
	}

	create := func() {
		rec := httptest.NewRecorder()
		if _, err := Create(rec, newTestRequest("POST", "/login", ""), 3, store, store, opts...); err != nil {
			t.Fatalf("Create() error = %v", err)
		}
	}
	create()
	now = now.Add(11 * time.Second)
	create()

	sessions, err := List(t.Context(), 3, store, opts...)
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(sessions) != 1 {
		t.Fatalf("List() returned %d sessions, want only the live one", len(sessions))
	}
	if !sessions[0].CreatedAt.Equal(now) {
		t.Fatalf("List() returned a stale session: %+v", sessions[0])
	}
}
