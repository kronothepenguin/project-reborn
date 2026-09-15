package router

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

func TestMeViewIsProtected(t *testing.T) {
	env := newIndexEnv(t, nil)
	deps := env.router.deps
	protected := auth.Protect(
		deps.Sessions,
		deps.Sessions,
		append(env.router.authOptions, auth.WithUnauthorizedHandler(http.RedirectHandler("/", http.StatusSeeOther)))...,
	)(http.HandlerFunc(env.router.HandleMeView))

	t.Run("anonymous request redirects to the homepage", func(t *testing.T) {
		rec := httptest.NewRecorder()
		protected.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/me", nil))

		if rec.Code != http.StatusSeeOther {
			t.Fatalf("status = %d, want 303", rec.Code)
		}
		if location := rec.Header().Get("Location"); location != "/" {
			t.Errorf("Location = %q, want /", location)
		}
	})

	t.Run("signed-in request renders the username", func(t *testing.T) {
		loginRec := postSignIn(t, env, env.username, env.password)
		if loginRec.Code != http.StatusSeeOther {
			t.Fatalf("sign-in status = %d, want 303", loginRec.Code)
		}

		req := httptest.NewRequest(http.MethodGet, "/me", nil)
		for _, cookie := range loginRec.Result().Cookies() {
			req.AddCookie(cookie)
		}
		rec := httptest.NewRecorder()
		protected.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("status = %d, want 200 (body %q)", rec.Code, rec.Body.String())
		}
		if !strings.Contains(rec.Body.String(), env.username) {
			t.Errorf("body does not show the username: %q", rec.Body.String())
		}
	})
}
