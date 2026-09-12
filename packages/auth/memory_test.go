package auth

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

// memStore is an in-test implementation of all seven persistence roles,
// behaviorally matching contracts/store.md. Each fail* field is a
// failing-double seam: when non-nil, the matching method returns that error.
type memStore struct {
	mu       sync.Mutex
	sessions map[string]Session
	revokeAt time.Time

	failCreate        error
	failValidate      error
	failTouch         error
	failRevoke        error
	failRevokeAccount error
	failList          error
	failPurge         error
}

func newMemStore() *memStore {
	return &memStore{sessions: map[string]Session{}}
}

func (m *memStore) Create(_ context.Context, session *Session) error {
	if m.failCreate != nil {
		return m.failCreate
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, exists := m.sessions[session.ID]; exists {
		return fmt.Errorf("memstore: duplicate session %s", session.ID)
	}
	m.sessions[session.ID] = *session
	return nil
}

func (m *memStore) Validate(_ context.Context, id string) (*Session, error) {
	if m.failValidate != nil {
		return nil, m.failValidate
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	session, ok := m.sessions[id]
	if !ok || !session.RevokedAt.IsZero() {
		return nil, ErrNotFound
	}
	return &session, nil
}

func (m *memStore) Touch(_ context.Context, session *Session) error {
	if m.failTouch != nil {
		return m.failTouch
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	stored, ok := m.sessions[session.ID]
	if !ok {
		return ErrNotFound
	}
	stored.LastSeenAt = session.LastSeenAt
	stored.IdleExpiresAt = session.IdleExpiresAt
	m.sessions[session.ID] = stored
	return nil
}

func (m *memStore) Revoke(_ context.Context, id string) error {
	if m.failRevoke != nil {
		return m.failRevoke
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	stored, ok := m.sessions[id]
	if !ok {
		return nil
	}
	if stored.RevokedAt.IsZero() {
		stored.RevokedAt = m.now()
		m.sessions[id] = stored
	}
	return nil
}

func (m *memStore) RevokeAccount(_ context.Context, accountID AccountID, except string) ([]*Session, error) {
	if m.failRevokeAccount != nil {
		return nil, m.failRevokeAccount
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	var revoked []*Session
	for id, stored := range m.sessions {
		if stored.AccountID != accountID || id == except || !stored.RevokedAt.IsZero() {
			continue
		}
		stored.RevokedAt = m.now()
		m.sessions[id] = stored
		revoked = append(revoked, &stored)
	}
	return revoked, nil
}

func (m *memStore) List(_ context.Context, accountID AccountID) ([]*Session, error) {
	if m.failList != nil {
		return nil, m.failList
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	var active []*Session
	for _, stored := range m.sessions {
		if stored.AccountID == accountID && stored.RevokedAt.IsZero() {
			active = append(active, &stored)
		}
	}
	return active, nil
}

func (m *memStore) Purge(_ context.Context, now time.Time) (int, error) {
	if m.failPurge != nil {
		return 0, m.failPurge
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	removed := 0
	for id, stored := range m.sessions {
		if !stored.RevokedAt.IsZero() || !now.Before(stored.IdleExpiresAt) || !now.Before(stored.AbsoluteExpiresAt) {
			delete(m.sessions, id)
			removed++
		}
	}
	return removed, nil
}

func (m *memStore) now() time.Time {
	if m.revokeAt.IsZero() {
		return time.Now()
	}
	return m.revokeAt
}

// snapshot returns a copy of every stored record for assertion.
func (m *memStore) snapshot() map[string]Session {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make(map[string]Session, len(m.sessions))
	for id, session := range m.sessions {
		out[id] = session
	}
	return out
}

// memSink captures audit events for inspection.
type memSink struct {
	mu     sync.Mutex
	events []Event
}

func (s *memSink) Record(_ context.Context, event Event) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.events = append(s.events, event)
	return nil
}

func (s *memSink) all() []Event {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]Event(nil), s.events...)
}

func (s *memSink) kinds() []EventKind {
	var kinds []EventKind
	for _, event := range s.all() {
		kinds = append(kinds, event.Kind)
	}
	return kinds
}

// failSink is a failing-double seam for EventSink.
type failSink struct{ err error }

func (s failSink) Record(context.Context, Event) error { return s.err }

// newTestRequest builds an httptest request with an optional body string.
func newTestRequest(method, target, body string) *http.Request {
	var reader io.Reader
	if body != "" {
		reader = strings.NewReader(body)
	}
	return httptest.NewRequest(method, target, reader)
}

// serve runs one request through a handler and records the response.
func serve(h http.Handler, r *http.Request) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, r)
	return rec
}

// setCookieFrom returns the session cookie set by a response, failing the test
// when the response carries none.
func setCookieFrom(t testing.TB, rec *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Value != "" {
			return cookie
		}
	}
	t.Fatalf("response set no value cookie: %v", rec.Header().Values("Set-Cookie"))
	return nil
}

// withCookie adds a session cookie to a request.
func withCookie(r *http.Request, cookie *http.Cookie) *http.Request {
	r.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})
	return r
}

// clearedCookie reports whether a response clears the named cookie.
func clearedCookie(rec *httptest.ResponseRecorder, name string) bool {
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == name && cookie.MaxAge < 0 {
			return true
		}
	}
	return false
}

func TestMemoryStoreMatchesStoreContract(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	base := Session{
		ID:                "digest-1",
		AccountID:         7,
		CreatedAt:         now,
		LastSeenAt:        now,
		IdleExpiresAt:     now.Add(time.Minute),
		AbsoluteExpiresAt: now.Add(time.Hour),
		UserAgent:         "agent",
		Address:           "10.0.0.1",
	}
	if err := store.Create(t.Context(), &base); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if err := store.Create(t.Context(), &base); err == nil {
		t.Fatal("Create() duplicate must fail (insert-only)")
	}

	got, err := store.Validate(t.Context(), base.ID)
	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
	touched := *got
	touched.CreatedAt = now.Add(24 * time.Hour)
	touched.AccountID = 99
	touched.AbsoluteExpiresAt = now.Add(24 * time.Hour)
	touched.Remember = true
	touched.LastSeenAt = now.Add(10 * time.Second)
	touched.IdleExpiresAt = now.Add(70 * time.Second)
	if err := store.Touch(t.Context(), &touched); err != nil {
		t.Fatalf("Touch() error = %v", err)
	}
	after, err := store.Validate(t.Context(), base.ID)
	if err != nil {
		t.Fatalf("Validate() after touch error = %v", err)
	}
	if !after.CreatedAt.Equal(base.CreatedAt) || after.AccountID != base.AccountID ||
		!after.AbsoluteExpiresAt.Equal(base.AbsoluteExpiresAt) || after.Remember {
		t.Fatalf("Touch() changed immutable fields: %+v", after)
	}
	if !after.LastSeenAt.Equal(touched.LastSeenAt) || !after.IdleExpiresAt.Equal(touched.IdleExpiresAt) {
		t.Fatalf("Touch() did not record activity: %+v", after)
	}

	if err := store.Revoke(t.Context(), base.ID); err != nil {
		t.Fatalf("Revoke() error = %v", err)
	}
	if err := store.Revoke(t.Context(), base.ID); err != nil {
		t.Fatalf("Revoke() must be idempotent, error = %v", err)
	}
	if _, err := store.Validate(t.Context(), base.ID); !errors.Is(err, ErrNotFound) {
		t.Fatalf("Validate() after revoke error = %v, want ErrNotFound", err)
	}

	second := base
	second.ID = "digest-2"
	second.AccountID = 8
	if err := store.Create(t.Context(), &second); err != nil {
		t.Fatalf("Create() second error = %v", err)
	}
	list, err := store.List(t.Context(), 8)
	if err != nil || len(list) != 1 {
		t.Fatalf("List() = %v, %v; want one active session", list, err)
	}
	revoked, err := store.RevokeAccount(t.Context(), 8, "")
	if err != nil || len(revoked) != 1 {
		t.Fatalf("RevokeAccount() = %v, %v; want one revoked record", revoked, err)
	}

	third := base
	third.ID = "digest-3"
	third.AccountID = 9
	third.IdleExpiresAt = now.Add(-time.Second)
	if err := store.Create(t.Context(), &third); err != nil {
		t.Fatalf("Create() third error = %v", err)
	}
	active := base
	active.ID = "digest-4"
	active.AccountID = 9
	if err := store.Create(t.Context(), &active); err != nil {
		t.Fatalf("Create() active error = %v", err)
	}
	removed, err := store.Purge(t.Context(), now)
	if err != nil || removed != 3 {
		t.Fatalf("Purge() = %d, %v; want 3 removed", removed, err)
	}
	if _, ok := store.snapshot()["digest-4"]; !ok {
		t.Fatal("Purge() removed an active session")
	}
}
