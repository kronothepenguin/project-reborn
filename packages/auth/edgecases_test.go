package auth

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// createCookie creates one session and returns its cookie.
func createCookie(t testing.TB, store *memStore, opts []Option) *http.Cookie {
	t.Helper()
	rec := httptest.NewRecorder()
	if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	return setCookieFrom(t, rec)
}

func TestEdgeCookieDenialsAreGeneric(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}
	valid := createCookie(t, store, opts)

	protected := Protect(store, store, opts...)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	cases := []struct {
		name    string
		cookies []*http.Cookie
	}{
		{"absent", nil},
		{"duplicate", []*http.Cookie{valid, {Name: valid.Name, Value: "second-value"}}},
		{"empty", []*http.Cookie{{Name: valid.Name, Value: ""}}},
		{"oversized", []*http.Cookie{{Name: valid.Name, Value: strings.Repeat("a", maxCookieLength+1)}}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			request := newTestRequest("GET", "/", "")
			for _, cookie := range c.cookies {
				request.AddCookie(&http.Cookie{Name: cookie.Name, Value: cookie.Value})
			}
			rec := serve(protected, request)
			if rec.Code != http.StatusUnauthorized {
				t.Fatalf("status = %d, want 401", rec.Code)
			}
			body := rec.Body.String()
			if strings.Contains(body, "auth:") || strings.Contains(body, valid.Value) {
				t.Fatalf("denial leaked internal detail: %q", body)
			}
		})
	}
}

func TestEdgeFailingRoleDoublesDenyAccess(t *testing.T) {
	storageErr := errors.New("storage unavailable")
	newOpts := func() []Option {
		return []Option{WithEventSink(&memSink{})}
	}

	t.Run("validator", func(t *testing.T) {
		store := newMemStore()
		opts := newOpts()
		cookie := createCookie(t, store, opts)
		store.failValidate = storageErr
		if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("Validate() error = %v, want storage failure", err)
		}
		protected := Protect(store, store, opts...)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusNoContent)
		}))
		if rec := serve(protected, withCookie(newTestRequest("GET", "/", ""), cookie)); rec.Code != http.StatusUnauthorized {
			t.Fatalf("Protect() status = %d with failing validator, want 401", rec.Code)
		}
	})

	t.Run("toucher", func(t *testing.T) {
		store := newMemStore()
		now := time.Date(2026, 9, 11, 12, 0, 0, 0, time.UTC)
		opts := []Option{
			WithClock(func() time.Time { return now }),
			WithIdleTimeout(time.Minute),
			WithTouchInterval(time.Second),
			WithEventSink(&memSink{}),
		}
		cookie := createCookie(t, store, opts)
		now = now.Add(2 * time.Second)
		store.failTouch = storageErr
		if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("Validate() error = %v, want touch failure", err)
		}
	})

	t.Run("creator", func(t *testing.T) {
		store := newMemStore()
		store.failCreate = storageErr
		rec := httptest.NewRecorder()
		if _, err := Create(rec, newTestRequest("POST", "/login", ""), 1, store, store, newOpts()...); !errors.Is(err, storageErr) {
			t.Fatalf("Create() error = %v, want create failure", err)
		}
	})

	t.Run("revoker", func(t *testing.T) {
		store := newMemStore()
		opts := newOpts()
		cookie := createCookie(t, store, opts)
		store.failRevoke = storageErr
		rec := httptest.NewRecorder()
		if _, err := Create(rec, withCookie(newTestRequest("POST", "/login", ""), cookie), 2, store, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("Create() with presented cookie error = %v, want revoke failure", err)
		}
		if err := Logout(rec, withCookie(newTestRequest("POST", "/logout", ""), cookie), store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("Logout() error = %v, want revoke failure", err)
		}
	})

	t.Run("account revoker", func(t *testing.T) {
		store := newMemStore()
		opts := newOpts()
		cookie := createCookie(t, store, opts)
		acting, err := Validate(withCookie(newTestRequest("GET", "/", ""), cookie), store, store, opts...)
		if err != nil {
			t.Fatalf("Validate() error = %v", err)
		}
		store.failRevokeAccount = storageErr
		if err := RevokeAll(t.Context(), 1, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("RevokeAll() error = %v, want account revoke failure", err)
		}
		rec := httptest.NewRecorder()
		if _, err := PasswordChanged(rec, withCookie(newTestRequest("POST", "/password", ""), cookie), acting, store, store, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("PasswordChanged() error = %v, want account revoke failure", err)
		}
	})

	t.Run("lister", func(t *testing.T) {
		store := newMemStore()
		opts := newOpts()
		createCookie(t, store, opts)
		store.failList = storageErr
		if _, err := List(t.Context(), 1, store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("List() error = %v, want list failure", err)
		}
	})

	t.Run("purger", func(t *testing.T) {
		store := newMemStore()
		opts := newOpts()
		store.failPurge = storageErr
		if _, err := Purge(t.Context(), store, opts...); !errors.Is(err, storageErr) {
			t.Fatalf("Purge() error = %v, want purge failure", err)
		}
	})
}

func TestEdgeCreateFailsClosedWithNoPartialSession(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}
	store.failCreate = errors.New("account cannot be resolved")

	rec := httptest.NewRecorder()
	a, err := Create(rec, newTestRequest("POST", "/login", ""), 99, store, store, opts...)
	if err == nil || a != nil {
		t.Fatalf("Create() = %+v, %v; want nil Auth and an error", a, err)
	}
	if len(store.snapshot()) != 0 {
		t.Fatal("Create() stored a partial session after a failure")
	}
	if header := rec.Header().Get("Set-Cookie"); header != "" {
		t.Fatalf("Create() set a cookie after a failure: %q", header)
	}
}

func TestEdgeNoAddressOrUserAgentBinding(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}

	login := newTestRequest("POST", "/login", "")
	login.Header.Set("User-Agent", "agent-a")
	login.RemoteAddr = "10.0.0.1:1111"
	rec := httptest.NewRecorder()
	if _, err := Create(rec, login, 3, store, store, opts...); err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	cookie := setCookieFrom(t, rec)

	later := withCookie(newTestRequest("GET", "/", ""), cookie)
	later.Header.Set("User-Agent", "agent-b")
	later.RemoteAddr = "10.0.0.2:2222"
	a, err := Validate(later, store, store, opts...)
	if err != nil {
		t.Fatalf("Validate() with changed origin error = %v; sessions must not bind address or agent", err)
	}
	if a.Session.UserAgent != "agent-a" || a.Session.Address != "10.0.0.1:1111" {
		t.Fatalf("origin metadata changed by validation: %+v", a.Session)
	}
}

// hookRevoker blocks the first Revoke call until released, so the test can
// observe concurrent access while a rotation is in flight.
type hookRevoker struct {
	store   *memStore
	entered chan struct{}
	release chan struct{}
}

func (h *hookRevoker) Revoke(ctx context.Context, id string) error {
	close(h.entered)
	<-h.release
	return h.store.Revoke(ctx, id)
}

func TestEdgeConcurrentAccessDuringRotationYieldsAtMostOneValidCredential(t *testing.T) {
	store := newMemStore()
	opts := []Option{WithEventSink(&memSink{})}
	oldCookie := createCookie(t, store, opts)
	acting, err := Validate(withCookie(newTestRequest("GET", "/", ""), oldCookie), store, store, opts...)
	if err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	hook := &hookRevoker{store: store, entered: make(chan struct{}), release: make(chan struct{})}
	type rotation struct {
		auth *Auth
		rec  *httptest.ResponseRecorder
		err  error
	}
	done := make(chan rotation, 1)
	go func() {
		rec := httptest.NewRecorder()
		a, err := Rotate(rec, withCookie(newTestRequest("POST", "/rotate", ""), oldCookie), acting, hook, store, opts...)
		done <- rotation{auth: a, rec: rec, err: err}
	}()

	<-hook.entered
	// While the old record has not yet been revoked, it is still the one valid
	// credential; the replacement does not exist yet.
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), oldCookie), store, store, opts...); err != nil {
		t.Fatalf("old credential during rotation error = %v", err)
	}
	close(hook.release)

	result := <-done
	if result.err != nil {
		t.Fatalf("Rotate() error = %v", result.err)
	}
	newCookie := setCookieFrom(t, result.rec)

	// After rotation exactly the new credential is valid.
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), oldCookie), store, store, opts...); !errors.Is(err, ErrNoSession) {
		t.Fatalf("old credential after rotation error = %v, want ErrNoSession", err)
	}
	if _, err := Validate(withCookie(newTestRequest("GET", "/", ""), newCookie), store, store, opts...); err != nil {
		t.Fatalf("new credential after rotation error = %v", err)
	}
}
