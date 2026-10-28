package auth

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
)

func TestRealIP(t *testing.T) {
	trusted := proxy.Proxy{Enabled: true, Trusted: []string{"127.0.0.1", "::1", "10.0.0.0/8"}}
	for _, c := range []struct {
		name   string
		proxy  proxy.Proxy
		remote string
		header []string
		want   string
	}{
		{"disabled", proxy.Proxy{Trusted: []string{"127.0.0.1"}}, "127.0.0.1:5000", []string{"198.51.100.7"}, "127.0.0.1:5000"},
		{"trusted proxy", trusted, "127.0.0.1:5000", []string{"198.51.100.7"}, "198.51.100.7"},
		{"header from an untrusted peer", trusted, "203.0.113.9:5000", []string{"198.51.100.7"}, "203.0.113.9:5000"},
		{"forged left end of the chain", trusted, "127.0.0.1:5000", []string{"6.6.6.6, 198.51.100.7, 10.1.2.3"}, "198.51.100.7"},
		{"several headers", trusted, "127.0.0.1:5000", []string{"6.6.6.6", "198.51.100.7"}, "198.51.100.7"},
		{"only proxies", trusted, "127.0.0.1:5000", []string{"10.1.2.3"}, "127.0.0.1:5000"},
		{"no header", trusted, "127.0.0.1:5000", nil, "127.0.0.1:5000"},
		{"malformed entry", trusted, "127.0.0.1:5000", []string{"198.51.100.7, bogus"}, "127.0.0.1:5000"},
		{"IPv6 proxy", trusted, "[::1]:5000", []string{"2001:db8::7"}, "2001:db8::7"},
	} {
		middleware, err := RealIP(c.proxy)
		if err != nil {
			t.Fatalf("%s: RealIP: %v", c.name, err)
		}
		var got string
		handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			got = r.RemoteAddr
		}))
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.RemoteAddr = c.remote
		for _, value := range c.header {
			r.Header.Add("X-Forwarded-For", value)
		}
		handler.ServeHTTP(httptest.NewRecorder(), r)
		if got != c.want {
			t.Errorf("%s: RemoteAddr = %q, want %q", c.name, got, c.want)
		}
		if r.RemoteAddr != c.remote {
			t.Errorf("%s: the caller's request was changed to %q", c.name, r.RemoteAddr)
		}
	}
}

func TestRealIPRejectsInvalidTrustedEntries(t *testing.T) {
	if _, err := RealIP(proxy.Proxy{Enabled: true, Trusted: []string{"localhost"}}); err == nil {
		t.Error("RealIP accepted localhost as a trusted proxy")
	}
}

func TestRealIPThrottlesEachClientBehindOneProxy(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.set(t, "auth.loginMaxFailures", 2)
	middleware, err := RealIP(proxy.Proxy{Enabled: true, Trusted: []string{"127.0.0.1"}})
	if err != nil {
		t.Fatalf("RealIP: %v", err)
	}
	login := func(client, name, password string) error {
		var err error
		handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, err = f.auth.Login(w, r, name, password, false)
		}))
		r := httptest.NewRequest(http.MethodPost, "/", nil)
		r.RemoteAddr = "127.0.0.1:5000"
		r.Header.Set("X-Forwarded-For", client)
		handler.ServeHTTP(httptest.NewRecorder(), r)
		return err
	}

	for _, name := range []string{"Nobody", "Someone"} {
		if err := login("198.51.100.1", name, "guess"); !errors.Is(err, ErrInvalidCredentials) {
			t.Fatalf("Login(%s) = %v, want ErrInvalidCredentials", name, err)
		}
	}
	if err := login("198.51.100.1", "Admin", testPassword); !errors.Is(err, ErrThrottled) {
		t.Errorf("Login from the failing client = %v, want ErrThrottled", err)
	}
	if err := login("198.51.100.2", "Admin", testPassword); err != nil {
		t.Errorf("Login from another client behind the same proxy = %v, want a session", err)
	}
	for _, attempt := range f.attempts(t) {
		if attempt.IP == "127.0.0.1" {
			t.Errorf("an attempt recorded the proxy's address: %+v", attempt)
		}
	}
}
