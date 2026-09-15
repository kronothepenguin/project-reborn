package router

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/account"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/authstore"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/status"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type errorStatus struct{}

func (errorStatus) Snapshot(context.Context) (status.Status, error) {
	return status.Status{}, errors.New("game server unreachable")
}

type indexEnv struct {
	router   *Router
	db       *store.Store
	username string
	password string
	userID   int64
}

func newIndexEnv(t *testing.T, tweak func(*Deps)) *indexEnv {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "store.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() {
		if err := db.Close(); err != nil {
			t.Errorf("Close: %v", err)
		}
	})

	const username = "NewHabbo"
	const password = "secret123"
	hasher := account.NewHasher(4)
	hash, err := hasher.Hash(password)
	if err != nil {
		t.Fatalf("Hash: %v", err)
	}
	userID, err := db.CreateUser(t.Context(), store.CreateUserParams{
		Username:          username,
		UsernameCanonical: account.Canonical(username),
		PasswordHash:      hash,
		Email:             "new@example.com",
		EmailCanonical:    "new@example.com",
		BirthDate:         631152000,
		Avatar:            "female",
		TermsAcceptedAt:   1700000000,
		CreatedAt:         1700000000,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}

	base, err := url.Parse("http://localhost:8080")
	if err != nil {
		t.Fatalf("parse base URL: %v", err)
	}
	deps := Deps{
		Resolver: NewTestResolver(),
		Accounts: account.NewService(db, hasher, account.LoginPolicy{
			MaxFailures: 2,
			Window:      15 * time.Minute,
			Lock:        15 * time.Minute,
		}),
		Sessions: authstore.New(db),
		Status:   status.Sample{},
		BaseURL:  base,
		Links: Links{
			Help:    "http://help.example",
			Terms:   "http://terms.example",
			Privacy: "http://privacy.example",
		},
	}
	if tweak != nil {
		tweak(&deps)
	}
	return &indexEnv{router: New(deps), db: db, username: username, password: password, userID: userID}
}

func postSignIn(t *testing.T, env *indexEnv, username, password string) *httptest.ResponseRecorder {
	t.Helper()
	form := url.Values{"username": {username}, "password": {password}}
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rec := httptest.NewRecorder()
	env.router.HandleIndexLogin(rec, req)
	return rec
}

func TestIndexViewRendersStatusAndLinks(t *testing.T) {
	env := newIndexEnv(t, nil)
	rec := httptest.NewRecorder()

	env.router.HandleIndexView(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	body := rec.Body.String()
	for _, want := range []string{"12345", "online", "http://terms.example", "http://privacy.example"} {
		if !strings.Contains(body, want) {
			t.Errorf("body does not contain %q", want)
		}
	}
}

func TestIndexViewOfflineFromFailingProvider(t *testing.T) {
	env := newIndexEnv(t, func(d *Deps) {
		d.Status = errorStatus{}
	})
	rec := httptest.NewRecorder()

	env.router.HandleIndexView(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "offline") {
		t.Errorf("body does not show the offline state: %q", body)
	}
	if strings.Contains(body, ">online<") {
		t.Errorf("body still shows the online state: %q", body)
	}
}

func TestIndexLoginSucceedsAndCreatesSession(t *testing.T) {
	env := newIndexEnv(t, nil)

	rec := postSignIn(t, env, env.username, env.password)

	if rec.Code != http.StatusSeeOther {
		t.Fatalf("status = %d, want 303 (body %q)", rec.Code, rec.Body.String())
	}
	if location := rec.Header().Get("Location"); location != "/me" {
		t.Errorf("Location = %q, want /me", location)
	}

	var session *http.Cookie
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == "session" && cookie.Value != "" {
			session = cookie
		}
	}
	if session == nil {
		t.Fatal("response did not set a session cookie")
	}
	if !session.HttpOnly {
		t.Error("session cookie is not HttpOnly")
	}
}

func TestIndexLoginFailureKeepsUsernameAndHidesPassword(t *testing.T) {
	env := newIndexEnv(t, nil)
	const attemptedPassword = "wrong-password"

	rec := postSignIn(t, env, env.username, attemptedPassword)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	body := rec.Body.String()
	if !strings.Contains(body, `value="`+env.username+`"`) {
		t.Errorf("body does not retain the username: %q", body)
	}
	if !strings.Contains(body, "Invalid username or password.") {
		t.Errorf("body does not carry the generic sign-in error: %q", body)
	}
	if strings.Contains(body, attemptedPassword) {
		t.Errorf("body echoed the attempted password: %q", body)
	}
}

func TestIndexLoginThrottlesRepeatedFailures(t *testing.T) {
	env := newIndexEnv(t, nil)

	for i := range 2 {
		rec := postSignIn(t, env, env.username, "wrong-password")
		if rec.Code != http.StatusOK {
			t.Fatalf("failure %d status = %d, want 200", i+1, rec.Code)
		}
	}

	rec := postSignIn(t, env, env.username, env.password)
	if rec.Code != http.StatusOK {
		t.Fatalf("locked attempt status = %d, want 200", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "Too many attempts. Try again later.") {
		t.Errorf("body does not carry the throttle message: %q", rec.Body.String())
	}
}
