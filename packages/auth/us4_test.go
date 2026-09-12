package auth

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestUS4ProtectRequiresSynchronizerTokenOnUnsafeMethods(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	var acting *Auth
	handlerRan := 0
	handler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		handlerRan++
		w.WriteHeader(http.StatusNoContent)
	})

	protect := Protect(store, store, opts...)
	mux := http.NewServeMux()
	mux.Handle("POST /login", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		a, err := Create(w, r, 4, store, store, opts...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		acting = a
	}))
	mux.Handle("/protected", protect(handler))

	loginRec := serve(mux, newTestRequest("POST", "/login", ""))
	cookie := setCookieFrom(t, loginRec)
	if acting == nil || acting.CSRF == "" {
		t.Fatal("login did not produce a CSRF token")
	}

	// Safe methods need no token.
	if rec := serve(mux, withCookie(newTestRequest("GET", "/protected", ""), cookie)); rec.Code != http.StatusNoContent || handlerRan != 1 {
		t.Fatalf("safe method = %d, handlerRan=%d; want 204 and handler run", rec.Code, handlerRan)
	}

	// Missing, forged, and wrong-session tokens are rejected without running
	// the handler.
	if rec := serve(mux, withCookie(newTestRequest("POST", "/protected", ""), cookie)); rec.Code != http.StatusForbidden || handlerRan != 1 {
		t.Fatalf("missing token = %d, handlerRan=%d; want 403 and no handler", rec.Code, handlerRan)
	}
	forged := withCookie(newTestRequest("POST", "/protected", ""), cookie)
	forged.Header.Set("X-CSRF-Token", "forged-token")
	if rec := serve(mux, forged); rec.Code != http.StatusForbidden || handlerRan != 1 {
		t.Fatalf("forged token = %d, handlerRan=%d; want 403 and no handler", rec.Code, handlerRan)
	}

	otherRec := httptest.NewRecorder()
	other, err := Create(otherRec, newTestRequest("POST", "/login-other", ""), 5, store, store, opts...)
	if err != nil {
		t.Fatalf("Create() other session error = %v", err)
	}
	wrongSession := withCookie(newTestRequest("POST", "/protected", ""), cookie)
	wrongSession.Header.Set("X-CSRF-Token", other.CSRF)
	if rec := serve(mux, wrongSession); rec.Code != http.StatusForbidden || handlerRan != 1 {
		t.Fatalf("wrong-session token = %d, handlerRan=%d; want 403 and no handler", rec.Code, handlerRan)
	}

	// The correct header token is accepted.
	withHeader := withCookie(newTestRequest("POST", "/protected", ""), cookie)
	withHeader.Header.Set("X-CSRF-Token", acting.CSRF)
	if rec := serve(mux, withHeader); rec.Code != http.StatusNoContent || handlerRan != 2 {
		t.Fatalf("header token = %d, handlerRan=%d; want 204 and handler run", rec.Code, handlerRan)
	}

	// The correct form-field token is accepted.
	form := url.Values{"csrf_token": {acting.CSRF}}.Encode()
	withForm := withCookie(newTestRequest("POST", "/protected", form), cookie)
	withForm.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if rec := serve(mux, withForm); rec.Code != http.StatusNoContent || handlerRan != 3 {
		t.Fatalf("form token = %d, handlerRan=%d; want 204 and handler run", rec.Code, handlerRan)
	}

	// The token never travels in a cookie.
	for _, rec := range []*httptest.ResponseRecorder{loginRec, otherRec} {
		for _, header := range rec.Header().Values("Set-Cookie") {
			if strings.Contains(header, acting.CSRF) || strings.Contains(header, other.CSRF) {
				t.Fatalf("CSRF token leaked into a Set-Cookie header: %q", header)
			}
		}
	}
}

func TestUS4CheckCSRFDirect(t *testing.T) {
	a := &Auth{CSRF: "token-value"}

	if err := CheckCSRF(newTestRequest("GET", "/", ""), a); err != nil {
		t.Fatalf("safe method CheckCSRF() error = %v, want nil", err)
	}

	missing := newTestRequest("POST", "/", "")
	if err := CheckCSRF(missing, a); !errors.Is(err, ErrCSRF) {
		t.Fatalf("missing token CheckCSRF() error = %v, want ErrCSRF", err)
	}

	forged := newTestRequest("POST", "/", "")
	forged.Header.Set("X-CSRF-Token", "not-the-token")
	if err := CheckCSRF(forged, a); !errors.Is(err, ErrCSRF) {
		t.Fatalf("forged token CheckCSRF() error = %v, want ErrCSRF", err)
	}

	valid := newTestRequest("POST", "/", "")
	valid.Header.Set("X-CSRF-Token", "token-value")
	if err := CheckCSRF(valid, a); err != nil {
		t.Fatalf("valid token CheckCSRF() error = %v, want nil", err)
	}

	custom := newTestRequest("POST", "/", "")
	custom.Header.Set("X-Custom-Token", "token-value")
	if err := CheckCSRF(custom, a, WithCSRFHeader("X-Custom-Token")); err != nil {
		t.Fatalf("custom header CheckCSRF() error = %v, want nil", err)
	}
}
