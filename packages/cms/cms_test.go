package cms

import (
	"database/sql"
	"html/template"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

var testNow = time.Date(2026, time.October, 27, 21, 0, 0, 0, time.UTC)

// config.Load reads config.json once per process, so the whole package shares
// one file, created with the defaults before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "cms-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	if _, err := config.Load(); err != nil {
		log.Fatal(err)
	}
	m.Run()
}

// printPage stands in for the built pages: it names the page and prints its
// data, so a test can tell which page a handler rendered.
func printPage(name string) (*template.Template, error) {
	return template.New(name).Delims("[[", "]]").Parse(name + ` [[ printf "%+v" . ]]`)
}

func habbo(t *testing.T, db *sql.DB, email, name string) int64 {
	t.Helper()
	q := store.New(db)
	user, err := q.CreateUser(t.Context(), store.CreateUserParams{
		Email:     email,
		BornOn:    time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		CreatedIP: "127.0.0.1",
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	err = q.UpsertCredential(t.Context(), store.UpsertCredentialParams{UserID: user.ID, PasswordHash: auth.HashPassword("secret123"), UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("UpsertCredential: %v", err)
	}
	_, err = q.CreateAvatar(t.Context(), store.CreateAvatarParams{UserID: user.ID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	return user.ID
}

func secondHabbo(t *testing.T, db *sql.DB, userID int64, name string) {
	t.Helper()
	_, err := store.New(db).CreateAvatar(t.Context(), store.CreateAvatarParams{UserID: userID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
}

func grant(t *testing.T, db *sql.DB, userID int64, attribute auth.Attribute) {
	t.Helper()
	q := store.New(db)
	group, err := q.CreateAccessGroup(t.Context(), store.CreateAccessGroupParams{Name: "Staff", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	if err := q.AddAccessGroupAttribute(t.Context(), store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)}); err != nil {
		t.Fatalf("AddAccessGroupAttribute: %v", err)
	}
	if err := q.AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID, GrantedAt: testNow}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
}

func login(t *testing.T, db *sql.DB, name string) *http.Cookie {
	t.Helper()
	rec := httptest.NewRecorder()
	if _, err := auth.Login(rec, httptest.NewRequest(http.MethodPost, "/", nil), db, name, "secret123", false); err != nil {
		t.Fatalf("Login %s: %v", name, err)
	}
	cookies := rec.Result().Cookies()
	if len(cookies) != 1 {
		t.Fatalf("Login %s set %d cookies", name, len(cookies))
	}
	return cookies[0]
}

// newSite mounts a CMS with printPage's pages on a new database.
func newSite(t *testing.T) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	New(db, WithResolver(printPage), WithStatic(static)).Mount(mux)
	return db, mux
}

// serve sends a request to mux; a form makes it a form post.
func serve(mux *http.ServeMux, method, path string, cookie *http.Cookie, form url.Values) *httptest.ResponseRecorder {
	r := httptest.NewRequest(method, path, strings.NewReader(form.Encode()))
	if form != nil {
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func sessionCookie(rec *httptest.ResponseRecorder) *http.Cookie {
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == "reborn_session" {
			return cookie
		}
	}
	return nil
}

func credentials(name, password string) url.Values {
	return url.Values{"username": {name}, "password": {password}}
}

func setMaintenance(t *testing.T, db *sql.DB, on bool) {
	t.Helper()
	if err := settings.Set(t.Context(), db, 0, "site.maintenance", on); err != nil {
		t.Fatalf("set site.maintenance to %t: %v", on, err)
	}
}

func wantRedirect(t *testing.T, rec *httptest.ResponseRecorder, location string) {
	t.Helper()
	if rec.Code != http.StatusSeeOther || rec.Header().Get("Location") != location {
		t.Errorf("got %d to %q, want a redirect to %q: %s", rec.Code, rec.Header().Get("Location"), location, rec.Body)
	}
}

func wantPage(t *testing.T, rec *httptest.ResponseRecorder, status int, texts ...string) {
	t.Helper()
	if rec.Code != status {
		t.Errorf("got %d, want %d: %s", rec.Code, status, rec.Body)
	}
	for _, text := range texts {
		if !strings.Contains(rec.Body.String(), text) {
			t.Errorf("the page does not contain %q: %s", text, rec.Body)
		}
	}
}

func TestSignIn(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	rec := serve(mux, "POST", "/", nil, credentials("  admin ", "secret123"))
	wantRedirect(t, rec, "/me")
	cookie := sessionCookie(rec)
	if cookie == nil {
		t.Fatal("no session cookie")
	}
	if cookie.MaxAge != 0 {
		t.Errorf("a session without remember me has Max-Age %d", cookie.MaxAge)
	}

	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK,
		"me.html", "Name:Admin", "Figure:hd-180-1", "ImagingURL:https://www.habbo.com/habbo-imaging/avatarimage")
}

func TestSignInRemembersWhenAsked(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	form := credentials("Admin", "secret123")
	form.Set("remember", "on")
	cookie := sessionCookie(serve(mux, "POST", "/", nil, form))
	if cookie == nil || cookie.MaxAge <= 0 {
		t.Errorf("session cookie = %+v, want one with a Max-Age", cookie)
	}
}

func TestSignInFailures(t *testing.T) {
	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"no name", url.Values{"password": {"secret123"}}, "Please do not leave any fields blank."},
		{"blank name", credentials("   ", "secret123"), "Please do not leave any fields blank."},
		{"no password", url.Values{"username": {"Admin"}}, "Please do not leave any fields blank."},
		{"wrong password", credentials("Admin", "wrong-secret"), "Invalid username or password."},
		{"unknown habbo", credentials("Nobody", "secret123"), "Invalid username or password."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			habbo(t, db, "admin@example.com", "Admin")

			rec := serve(mux, "POST", "/", nil, c.form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "index.html", c.want, "Username:"+strings.TrimSpace(c.form.Get("username")))
			if sessionCookie(rec) != nil {
				t.Error("a failed sign-in set a cookie")
			}
		})
	}
}

func TestSignInShowsTheBan(t *testing.T) {
	inAnHour := time.Now().UTC().Add(time.Hour)
	for _, c := range []struct {
		name      string
		expiresAt sql.NullTime
		want      string
	}{
		{"with an end", sql.NullTime{Time: inAnHour, Valid: true}, "The ban will expire at " + inAnHour.Format("2006-01-02 15:04") + " UTC."},
		{"permanent", sql.NullTime{}, "This ban does not expire."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			userID := habbo(t, db, "admin@example.com", "Admin")
			_, err := db.ExecContext(t.Context(), `INSERT INTO bans (user_id, reason, created_at, expires_at) VALUES (?, ?, ?, ?)`,
				userID, "Scamming", time.Now().UTC().Add(-time.Minute), c.expiresAt)
			if err != nil {
				t.Fatalf("insert ban: %v", err)
			}

			rec := serve(mux, "POST", "/", nil, credentials("Admin", "secret123"))
			wantPage(t, rec, http.StatusUnprocessableEntity, "index.html", "The reason for this ban is &#34;Scamming&#34;.", c.want)
			if sessionCookie(rec) != nil {
				t.Error("a banned sign-in set a cookie")
			}
		})
	}
}

func TestSignInIsThrottled(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	for range settings.GetInt("auth.loginMaxFailures") {
		wantPage(t, serve(mux, "POST", "/", nil, credentials("Admin", "wrong-secret")),
			http.StatusUnprocessableEntity, "Invalid username or password.")
	}

	rec := serve(mux, "POST", "/", nil, credentials("Admin", "secret123"))
	wantPage(t, rec, http.StatusUnprocessableEntity, "Too many failed attempts.")
	if sessionCookie(rec) != nil {
		t.Error("a throttled sign-in set a cookie")
	}
}

func TestSignedInVisitorsGoToMe(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantRedirect(t, serve(mux, "GET", "/", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "POST", "/", cookie, credentials("Admin", "secret123")), "/me")

	var sessions int
	if err := db.QueryRowContext(t.Context(), `SELECT COUNT(*) FROM sessions`).Scan(&sessions); err != nil {
		t.Fatalf("count sessions: %v", err)
	}
	if sessions != 1 {
		t.Errorf("%d sessions, want the sign-in form to start no second one", sessions)
	}
}

func TestMeNeedsASession(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/me", nil, nil), "/")
}

func TestSignOut(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	rec := serve(mux, "POST", "/logout", cookie, url.Values{})
	wantRedirect(t, rec, "/")
	if cleared := sessionCookie(rec); cleared == nil || cleared.MaxAge >= 0 {
		t.Errorf("session cookie = %+v, want it cleared", cleared)
	}
	wantRedirect(t, serve(mux, "GET", "/me", cookie, nil), "/")
	wantPage(t, serve(mux, "GET", "/", cookie, nil), http.StatusOK, "index.html")
}

func TestSignOutWithoutASession(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "POST", "/logout", nil, url.Values{}), "/")
}

func TestCrossSitePostsAreRefused(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	for _, path := range []string{"/", "/logout", "/register", "/register/check-name", "/forgot", "/reset/token"} {
		r := httptest.NewRequest("POST", path, strings.NewReader(credentials("Admin", "secret123").Encode()))
		r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		r.Header.Set("Sec-Fetch-Site", "cross-site")
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)
		if rec.Code != http.StatusForbidden {
			t.Errorf("cross-site POST %s = %d, want 403", path, rec.Code)
		}
		if sessionCookie(rec) != nil {
			t.Errorf("cross-site POST %s set a cookie", path)
		}
	}
}

func TestMaintenance(t *testing.T) {
	db, mux := newSite(t)
	grant(t, db, habbo(t, db, "staff@example.com", "Staff"), auth.SiteMaintenanceBypass)
	habbo(t, db, "player@example.com", "Player")
	staff, player := login(t, db, "Staff"), login(t, db, "Player")

	setMaintenance(t, db, true)
	for _, c := range []struct {
		name   string
		method string
		path   string
		cookie *http.Cookie
		status int
		body   string
	}{
		{"guest home", "GET", "/", nil, 503, "maintenance.html {ShortName:Holo"},
		{"guest me", "GET", "/me", nil, 503, "maintenance.html"},
		{"guest registration", "GET", "/register", nil, 503, "maintenance.html"},
		{"guest registration form", "POST", "/register", nil, 503, "maintenance.html"},
		{"guest name check", "POST", "/register/check-name", nil, 503, "maintenance.html"},
		{"guest forgot page", "GET", "/forgot", nil, 503, "maintenance.html"},
		{"guest forgot form", "POST", "/forgot", nil, 503, "maintenance.html"},
		{"guest reset page", "GET", "/reset/token", nil, 503, "maintenance.html"},
		{"guest reset form", "POST", "/reset/token", nil, 503, "maintenance.html"},
		{"guest promo feed", "GET", "/xml/promo-habbos.xml", nil, 503, "maintenance.html"},
		{"guest terms of service", "GET", "/disclaimer", nil, 503, "maintenance.html"},
		{"guest privacy policy", "GET", "/privacy", nil, 503, "maintenance.html"},
		{"static file", "GET", "/favicon.svg", nil, 200, "static"},
		{"player without the bypass", "GET", "/", player, 503, "maintenance.html"},
		{"player's me without the bypass", "GET", "/me", player, 503, "maintenance.html"},
		{"staff with the bypass", "GET", "/me", staff, 200, "me.html"},
	} {
		wantPage(t, serve(mux, c.method, c.path, c.cookie, nil), c.status, c.body)
	}
	wantRedirect(t, serve(mux, "GET", "/", staff, nil), "/me")

	setMaintenance(t, db, false)
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html")
}

func TestSignInDuringMaintenance(t *testing.T) {
	db, mux := newSite(t)
	grant(t, db, habbo(t, db, "staff@example.com", "Staff"), auth.SiteMaintenanceBypass)
	setMaintenance(t, db, true)

	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"wrong password", credentials("Staff", "wrong-secret"), "Invalid username or password."},
		{"blank fields", credentials("Staff", ""), "Please do not leave any fields blank."},
	} {
		wantPage(t, serve(mux, "POST", "/", nil, c.form), http.StatusServiceUnavailable,
			"maintenance.html", "Username:Staff", c.want)
	}

	rec := serve(mux, "POST", "/", nil, credentials("Staff", "secret123"))
	wantRedirect(t, rec, "/me")
	wantPage(t, serve(mux, "GET", "/me", sessionCookie(rec), nil), http.StatusOK, "me.html")
	wantRedirect(t, serve(mux, "POST", "/logout", sessionCookie(rec), url.Values{}), "/")
}
