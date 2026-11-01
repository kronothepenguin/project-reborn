package housekeeping

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

var testNow = time.Date(2026, time.October, 27, 21, 0, 0, 0, time.UTC)

// routes lists every route Mount registers, so that the access tests cover each
// of them.
var routes = []struct {
	method string
	path   string
}{
	{"GET", "/housekeeping/"},
	{"POST", "/housekeeping/note"},
	{"GET", "/housekeeping/settings"},
	{"POST", "/housekeeping/settings/site"},
	{"GET", "/housekeeping/access-groups"},
	{"POST", "/housekeeping/access-groups"},
	{"GET", "/housekeeping/access-groups/1"},
	{"POST", "/housekeeping/access-groups/1"},
	{"POST", "/housekeeping/users/1/access-groups"},
	{"GET", "/housekeeping/logs"},
	{"GET", "/housekeeping/_astro/page.css"},
	{"GET", "/housekeeping/index.html"},
}

// config.Load reads config.json once per process, so the whole package shares
// one file, created with the defaults before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "housekeeping-test-")
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

func printPath(name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, name, r.URL.Path)
	})
}

func openDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

// newSite mounts housekeeping alone, with printPage's pages, on a new database.
func newSite(t *testing.T) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	New(db, WithResolver(printPage), WithStatic(printPath("static"))).Mount(mux)
	return db, mux
}

// habbo creates an account through auth.CreateAccount, as a registration does, so
// that it holds everything the CMS reads, such as its wallet.
func habbo(t *testing.T, db *sql.DB, email, name string) int64 {
	t.Helper()
	userID, _, err := auth.CreateAccount(t.Context(), store.New(db), auth.Account{
		Email:        email,
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		IP:           "127.0.0.1",
		PasswordHash: auth.HashPassword("secret123"),
		Habbo:        auth.Habbo{Name: name, Figure: "hd-180-1", Gender: "M"},
	})
	if err != nil {
		t.Fatalf("CreateAccount %s: %v", name, err)
	}
	return userID
}

// secondHabbo gives userID another habbo, newer than the first.
func secondHabbo(t *testing.T, db *sql.DB, userID int64, name string) store.Avatar {
	t.Helper()
	later := time.Now().UTC().Add(time.Hour)
	avatar, err := store.New(db).CreateAvatar(t.Context(), store.CreateAvatarParams{UserID: userID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: later, UpdatedAt: later})
	if err != nil {
		t.Fatalf("CreateAvatar %s: %v", name, err)
	}
	return avatar
}

var groupCount atomic.Int64

// grant puts userID in a new group holding attributes and returns the group.
func grant(t *testing.T, db *sql.DB, userID int64, attributes ...auth.Attribute) int64 {
	t.Helper()
	q := store.New(db)
	group, err := q.CreateAccessGroup(t.Context(), store.CreateAccessGroupParams{
		Name:      fmt.Sprintf("Group %d", groupCount.Add(1)),
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateAccessGroup: %v", err)
	}
	for _, attribute := range attributes {
		err := q.AddAccessGroupAttribute(t.Context(), store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)})
		if err != nil {
			t.Fatalf("AddAccessGroupAttribute: %v", err)
		}
	}
	if err := q.AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID, GrantedAt: testNow}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
	return group.ID
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

// staff creates a habbo holding attributes, signed in.
func staff(t *testing.T, db *sql.DB, name string, attributes ...auth.Attribute) (int64, *http.Cookie) {
	t.Helper()
	userID := habbo(t, db, strings.ToLower(name)+"@example.com", name)
	grant(t, db, userID, attributes...)
	return userID, login(t, db, name)
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

// postFrom builds a form post a browser sends from a page on origin.
func postFrom(origin, path string, cookie *http.Cookie, form url.Values) *http.Request {
	r := httptest.NewRequest("POST", path, strings.NewReader(form.Encode()))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Set("Origin", origin)
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	return r
}

func record(mux *http.ServeMux, r *http.Request) *httptest.ResponseRecorder {
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

func TestGuestsGoToTheCMSToSignIn(t *testing.T) {
	db, mux := newSite(t)
	if err := settings.Set(t.Context(), db, 0, "site.url", "https://hotel.example.com"); err != nil {
		t.Fatalf("set site.url: %v", err)
	}
	for _, route := range routes {
		t.Run(route.method+" "+route.path, func(t *testing.T) {
			wantRedirect(t, serve(mux, route.method, route.path, nil, nil), "https://hotel.example.com")
		})
	}
}

func TestUsersWithoutAccessGet403(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "visitor@example.com", "Visitor")
	cookie := login(t, db, "Visitor")
	for _, route := range routes {
		t.Run(route.method+" "+route.path, func(t *testing.T) {
			wantPage(t, serve(mux, route.method, route.path, cookie, nil), http.StatusForbidden)
		})
	}
}

func TestAttributesOtherThanAccessDoNotOpenTheDoor(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Writer", auth.HousekeepingNews, auth.HousekeepingSettings, auth.HousekeepingAccessGroups, auth.HousekeepingLogs)
	for _, route := range routes {
		t.Run(route.method+" "+route.path, func(t *testing.T) {
			wantPage(t, serve(mux, route.method, route.path, cookie, nil), http.StatusForbidden)
		})
	}
}

func TestStaffEnter(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK, "index.html")
}

func TestTheLayoutSaysWhoIsLoggedIn(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK,
		"Habbo:Admin", "PreviousLogin: SiteName:Holo Hotel", "SiteURL:http://localhost:17387")

	err := store.New(db).CreateLoginAttempt(t.Context(), store.CreateLoginAttemptParams{
		UserID:    sql.NullInt64{Int64: userID, Valid: true},
		IP:        "84.51.55.15",
		Succeeded: true,
		CreatedAt: time.Date(2008, time.December, 7, 15, 2, 12, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("CreateLoginAttempt: %v", err)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK,
		"PreviousLogin:07-12-2008 15:02:12 from 84.51.55.15")
}

func TestABannedUserLosesTheSession(t *testing.T) {
	for _, c := range []struct {
		name string
		ban  func(userID int64) (sql.NullInt64, sql.NullString)
	}{
		{"by user", func(userID int64) (sql.NullInt64, sql.NullString) {
			return sql.NullInt64{Int64: userID, Valid: true}, sql.NullString{}
		}},
		// httptest requests come from 192.0.2.1.
		{"by address", func(int64) (sql.NullInt64, sql.NullString) {
			return sql.NullInt64{}, sql.NullString{String: "192.0.2.1", Valid: true}
		}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			userID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
			wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK)

			id, ip := c.ban(userID)
			_, err := db.ExecContext(t.Context(), `INSERT INTO bans (user_id, ip, reason, created_at) VALUES (?, ?, ?, ?)`,
				id, ip, "Scamming", time.Now().UTC().Add(-time.Minute))
			if err != nil {
				t.Fatalf("insert ban: %v", err)
			}

			rec := serve(mux, "GET", "/housekeeping/", cookie, nil)
			wantPage(t, rec, http.StatusForbidden)
			if ended := sessionCookie(rec); ended == nil || ended.MaxAge >= 0 {
				t.Errorf("the cookie was not cleared: %+v", ended)
			}
			var sessions int
			if err := db.QueryRowContext(t.Context(), `SELECT COUNT(*) FROM sessions`).Scan(&sessions); err != nil {
				t.Fatalf("count sessions: %v", err)
			}
			if sessions != 0 {
				t.Errorf("%d sessions are left", sessions)
			}
		})
	}
}

func TestStaticFilesLoseThePrefix(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "GET", "/housekeeping/_astro/page.css", cookie, nil), http.StatusOK, "static /_astro/page.css")
}

func TestTheAddressWithoutTheSlashWorks(t *testing.T) {
	_, mux := newSite(t)
	rec := serve(mux, "GET", "/housekeeping", nil, nil)
	if rec.Code < 300 || rec.Code > 399 || rec.Header().Get("Location") != "/housekeeping/" {
		t.Errorf("got %d to %q, want a redirect to /housekeeping/", rec.Code, rec.Header().Get("Location"))
	}
}

func TestAloneItLeavesTheRootAlone(t *testing.T) {
	_, mux := newSite(t)
	for _, path := range []string{"/", "/me", "/logs", "/housekeepingish"} {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusNotFound)
	}
}

func TestCrossOriginPostsAreRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess)
	wantPage(t, record(mux, postFrom("https://evil.example.com", "/housekeeping/", cookie, nil)), http.StatusForbidden)
}

func TestItWorksOnAnEmptyDatabase(t *testing.T) {
	db, mux := newSite(t)
	var users int
	if err := db.QueryRowContext(t.Context(), `SELECT COUNT(*) FROM users`).Scan(&users); err != nil {
		t.Fatalf("count users: %v", err)
	}
	if users != 0 {
		t.Fatalf("the new database has %d users", users)
	}
	wantRedirect(t, serve(mux, "GET", "/housekeeping/", nil, nil), "http://localhost:17387")
}

// One process mounts every program on one mux with one database, so each must
// keep its own routes, and the session of one must open the other.
func TestItSharesAMuxWithTheCMS(t *testing.T) {
	db := openDB(t)
	mux := http.NewServeMux()
	cms.New(db, cms.WithResolver(printPage), cms.WithStatic(printPath("cms"))).Mount(mux)
	New(db, WithResolver(printPage), WithStatic(printPath("housekeeping"))).Mount(mux)

	grant(t, db, habbo(t, db, "admin@example.com", "Admin"), auth.HousekeepingAccess)
	habbo(t, db, "visitor@example.com", "Visitor")

	signIn := func(name string) *http.Cookie {
		t.Helper()
		rec := serve(mux, "POST", "/", nil, url.Values{"username": {name}, "password": {"secret123"}})
		wantRedirect(t, rec, "/me")
		cookie := sessionCookie(rec)
		if cookie == nil {
			t.Fatalf("%s got no session cookie", name)
		}
		return cookie
	}
	admin, visitor := signIn("Admin"), signIn("Visitor")

	wantPage(t, serve(mux, "GET", "/housekeeping/", admin, nil), http.StatusOK, "index.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/page.css", admin, nil), http.StatusOK, "housekeeping /page.css")
	wantPage(t, serve(mux, "GET", "/housekeeping/", visitor, nil), http.StatusForbidden)
	wantRedirect(t, serve(mux, "GET", "/housekeeping/", nil, nil), "http://localhost:17387")

	wantPage(t, serve(mux, "GET", "/me", admin, nil), http.StatusOK, "me.html", "Habbo:Admin")
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html")
	wantPage(t, serve(mux, "GET", "/page.css", nil, nil), http.StatusOK, "cms /page.css")
}
