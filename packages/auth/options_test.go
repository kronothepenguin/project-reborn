package auth

import (
	"errors"
	"net/http/httptest"
	"testing"
	"time"
)

func TestOptionsRejectInvalidConfigurationThroughPublicFunctions(t *testing.T) {
	cases := []struct {
		name string
		opts []Option
	}{
		{"empty cookie name", []Option{WithCookieName("")}},
		{"__Host- rule violation", []Option{WithCookieName("__Host-session"), WithCookieDomain("example.com")}},
		{"non-positive idle timeout", []Option{WithIdleTimeout(0)}},
		{"non-positive absolute timeout", []Option{WithAbsoluteTimeout(-1)}},
		{"non-positive remember timeout", []Option{WithRememberTimeout(0)}},
		{"token bytes below minimum", []Option{WithTokenBytes(8)}},
		{"touch interval beyond idle", []Option{WithIdleTimeout(time.Minute), WithTouchInterval(time.Hour)}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			store := newMemStore()
			rec := httptest.NewRecorder()
			request := newTestRequest("POST", "/login", "")
			if _, err := Create(rec, request, 1, store, store, c.opts...); !errors.Is(err, ErrConfig) {
				t.Fatalf("Create() error = %v, want ErrConfig", err)
			}
			if _, err := Validate(request, store, store, c.opts...); !errors.Is(err, ErrConfig) {
				t.Fatalf("Validate() error = %v, want ErrConfig", err)
			}
			if err := Logout(rec, request, store, c.opts...); !errors.Is(err, ErrConfig) {
				t.Fatalf("Logout() error = %v, want ErrConfig", err)
			}
		})
	}
}

func TestProtectPanicsAtConstructionOnInvalidOptions(t *testing.T) {
	defer func() {
		recovered := recover()
		if recovered == nil {
			t.Fatal("Protect() did not panic on invalid options")
		}
		err, ok := recovered.(error)
		if !ok {
			t.Fatalf("Protect() panic value = %v (%T), want error", recovered, recovered)
		}
		if !errors.Is(err, ErrConfig) {
			t.Fatalf("Protect() panic error = %v, want ErrConfig", err)
		}
	}()
	store := newMemStore()
	Protect(store, store, WithTokenBytes(1))
}

func TestProtectAcceptsValidOptions(t *testing.T) {
	store := newMemStore()
	middleware := Protect(store, store, WithCookieName("session"), WithCookieSecure(false))
	if middleware == nil {
		t.Fatal("Protect() returned nil middleware")
	}
}
