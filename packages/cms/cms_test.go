package cms

import (
	"database/sql"
	"html/template"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
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

func TestMaintenance(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	grant(t, db, habbo(t, db, "staff@example.com", "Staff"), auth.SiteMaintenanceBypass)
	habbo(t, db, "player@example.com", "Player")

	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	New(db, WithResolver(printPage), WithStatic(static)).Mount(mux)
	staff, player := login(t, db, "Staff"), login(t, db, "Player")

	serve := func(method, path string, cookie *http.Cookie) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, path, nil)
		if cookie != nil {
			r.AddCookie(cookie)
		}
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)
		return rec
	}

	if err := settings.Set(t.Context(), db, 0, "site.maintenance", true); err != nil {
		t.Fatalf("turn maintenance on: %v", err)
	}
	for _, c := range []struct {
		name   string
		method string
		path   string
		cookie *http.Cookie
		status int
		body   string
	}{
		{"guest home", "GET", "/", nil, 503, "maintenance.html {ShortName:Holo}"},
		{"guest registration", "GET", "/register", nil, 503, "maintenance.html"},
		{"guest registration form", "POST", "/register", nil, 503, "maintenance.html"},
		{"sign-in form", "POST", "/", nil, 200, "index.html"},
		{"static file", "GET", "/favicon.svg", nil, 200, "static"},
		{"player without the bypass", "GET", "/", player, 503, "maintenance.html"},
		{"staff with the bypass", "GET", "/", staff, 200, "index.html"},
	} {
		rec := serve(c.method, c.path, c.cookie)
		if rec.Code != c.status || !strings.Contains(rec.Body.String(), c.body) {
			t.Errorf("%s: %d %q, want %d containing %q", c.name, rec.Code, rec.Body, c.status, c.body)
		}
	}

	if err := settings.Set(t.Context(), db, 0, "site.maintenance", false); err != nil {
		t.Fatalf("turn maintenance off: %v", err)
	}
	if rec := serve("GET", "/", nil); rec.Code != 200 || !strings.Contains(rec.Body.String(), "index.html") {
		t.Errorf("guest home after maintenance: %d %q, want the index page", rec.Code, rec.Body)
	}
}
