package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// newInstance wires one independent "app instance" over a shared store.
func newInstance(store *memStore, account AccountID, opts ...Option) *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("POST /login", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := Create(w, r, account, store, store, opts...); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}))
	mux.Handle("POST /logout", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := Logout(w, r, store, opts...); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}))
	mux.Handle("/protected", Protect(store, store, opts...)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		a, ok := FromContext(r.Context())
		if !ok {
			http.Error(w, "auth missing", http.StatusInternalServerError)
			return
		}
		if a.Session.AccountID != account {
			http.Error(w, "wrong account", http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})))
	return mux
}

func TestUS5SharedStoreAcrossInstancesAndRestart(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	instanceA := newInstance(store, 6, opts...)
	instanceB := newInstance(store, 6, opts...)

	loginRec := serve(instanceA, newTestRequest("POST", "/login", ""))
	cookie := setCookieFrom(t, loginRec)

	// A session created through one call site is accepted by the other.
	if rec := serve(instanceB, withCookie(newTestRequest("GET", "/protected", ""), cookie)); rec.Code != http.StatusNoContent {
		t.Fatalf("second instance status = %d, want 204", rec.Code)
	}

	// Revocation through one instance is honored by the other.
	logoutRec := serve(instanceB, withCookie(newTestRequest("POST", "/logout", ""), cookie))
	if !clearedCookie(logoutRec, cookie.Name) {
		t.Fatal("logout did not clear the session cookie")
	}
	if rec := serve(instanceA, withCookie(newTestRequest("GET", "/protected", ""), cookie)); rec.Code != http.StatusUnauthorized {
		t.Fatalf("revocation was not honored across instances: %d, want 401", rec.Code)
	}

	// A fresh reconstruction over the same store recognizes live sessions
	// (process restart).
	loginRec = serve(instanceA, newTestRequest("POST", "/login", ""))
	cookie = setCookieFrom(t, loginRec)
	restarted := newInstance(store, 6, opts...)
	if rec := serve(restarted, withCookie(newTestRequest("GET", "/protected", ""), cookie)); rec.Code != http.StatusNoContent {
		t.Fatalf("restarted instance status = %d, want 204", rec.Code)
	}
}

func TestUS5PurgeRemovesOnlyRevokedAndExpiredRecords(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithIdleTimeout(10 * time.Second),
		WithAbsoluteTimeout(time.Hour),
		WithTouchInterval(time.Second),
		WithEventSink(&memSink{}),
	}

	createSession := func(account AccountID) *Auth {
		rec := httptest.NewRecorder()
		a, err := Create(rec, newTestRequest("POST", "/login", ""), account, store, store, opts...)
		if err != nil {
			t.Fatalf("Create() error = %v", err)
		}
		return a
	}
	createSession(1)
	revoked := createSession(2)
	if err := store.Revoke(t.Context(), revoked.Session.ID); err != nil {
		t.Fatalf("store.Revoke() error = %v", err)
	}

	now = now.Add(11 * time.Second)
	live := createSession(3)

	removed, err := Purge(t.Context(), store, opts...)
	if err != nil {
		t.Fatalf("Purge() error = %v", err)
	}
	if removed != 2 {
		t.Fatalf("Purge() removed %d records, want 2", removed)
	}
	snapshot := store.snapshot()
	if len(snapshot) != 1 {
		t.Fatalf("store holds %d records after Purge, want 1", len(snapshot))
	}
	if _, ok := snapshot[live.Session.ID]; !ok {
		t.Fatal("Purge() removed an active session")
	}

	if removed, err = Purge(t.Context(), store, opts...); err != nil || removed != 0 {
		t.Fatalf("second Purge() = %d, %v; want 0, nil", removed, err)
	}
}
