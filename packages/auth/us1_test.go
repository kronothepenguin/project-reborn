package auth

import (
	"fmt"
	"net/http"
	"testing"
	"time"
)

func TestUS1LoginStayRecognizedLogout(t *testing.T) {
	store := newMemStore()
	sink := &memSink{}
	opts := []Option{WithEventSink(sink)}

	var created *Auth
	mux := http.NewServeMux()
	mux.Handle("POST /login", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		a, err := Create(w, r, 7, store, store, opts...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		created = a
		w.WriteHeader(http.StatusNoContent)
	}))
	mux.Handle("POST /login-failed", http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
	}))
	mux.Handle("POST /logout", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := Logout(w, r, store, opts...); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	mux.Handle("GET /protected", Protect(store, store, opts...)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		a, ok := FromContext(r.Context())
		if !ok {
			http.Error(w, "auth missing from context", http.StatusInternalServerError)
			return
		}
		fmt.Fprintf(w, "account=%d", a.Session.AccountID)
	})))

	// No session: protected access is denied.
	if rec := serve(mux, newTestRequest("GET", "/protected", "")); rec.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated access status = %d, want 401", rec.Code)
	}

	// Failed credential verification: the app never calls Create, so no
	// session is issued.
	rec := serve(mux, newTestRequest("POST", "/login-failed", ""))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("failed login status = %d, want 401", rec.Code)
	}
	if got := len(store.snapshot()); got != 0 {
		t.Fatalf("failed verification stored %d sessions, want 0", got)
	}

	// Successful login establishes identity.
	rec = serve(mux, newTestRequest("POST", "/login", ""))
	if rec.Code != http.StatusNoContent {
		t.Fatalf("login status = %d, want 204", rec.Code)
	}
	cookie := setCookieFrom(t, rec)
	if created == nil || created.Session.AccountID != 7 {
		t.Fatalf("Create() = %+v, want account 7", created)
	}

	// Later protected requests are recognized with the correct identity.
	rec = serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie))
	if rec.Code != http.StatusOK || rec.Body.String() != "account=7" {
		t.Fatalf("protected access = %d %q, want 200 account=7", rec.Code, rec.Body.String())
	}

	// Revoked sessions are denied.
	if err := store.Revoke(t.Context(), created.Session.ID); err != nil {
		t.Fatalf("store.Revoke() error = %v", err)
	}
	rec = serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("revoked access status = %d, want 401", rec.Code)
	}

	// Logout clears the cookie and rejects replay of the old credential.
	rec = serve(mux, newTestRequest("POST", "/login", ""))
	cookie = setCookieFrom(t, rec)
	rec = serve(mux, withCookie(newTestRequest("POST", "/logout", ""), cookie))
	if rec.Code != http.StatusNoContent {
		t.Fatalf("logout status = %d, want 204", rec.Code)
	}
	if !clearedCookie(rec, cookie.Name) {
		t.Fatal("logout did not clear the session cookie")
	}
	rec = serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("replayed credential status = %d, want 401", rec.Code)
	}
}

func TestUS1IdleExpiryDeniesAccess(t *testing.T) {
	store := newMemStore()
	now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
	opts := []Option{
		WithClock(func() time.Time { return now }),
		WithIdleTimeout(10 * time.Second),
		WithAbsoluteTimeout(time.Hour),
		WithTouchInterval(time.Second),
		WithEventSink(&memSink{}),
	}

	mux := http.NewServeMux()
	mux.Handle("POST /login", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := Create(w, r, 11, store, store, opts...); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}))
	mux.Handle("GET /protected", Protect(store, store, opts...)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})))

	rec := serve(mux, newTestRequest("POST", "/login", ""))
	cookie := setCookieFrom(t, rec)

	// Continuous activity stays inside the idle window.
	now = now.Add(5 * time.Second)
	rec = serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie))
	if rec.Code != http.StatusNoContent {
		t.Fatalf("active session status = %d, want 204", rec.Code)
	}

	// Inactivity beyond the idle timeout denies access.
	now = now.Add(11 * time.Second)
	rec = serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie))
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expired session status = %d, want 401", rec.Code)
	}
}
