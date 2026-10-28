package auth

import (
	"database/sql"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual"
)

const testPassword = "secret123"

var (
	testConfig *config.Config
	testNow    = time.Date(2026, time.October, 27, 21, 0, 0, 0, time.UTC)
)

// config.Load reads config.json once per process, so the whole package shares
// one file, created with the defaults before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "auth-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	if testConfig, err = config.Load(); err != nil {
		log.Fatal(err)
	}
	m.Run()
}

type fixture struct {
	auth     *Auth
	db       *sql.DB
	settings *virtual.Settings
	now      time.Time
}

func newFixture(t *testing.T) *fixture {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	settings, err := virtual.LoadSettings(t.Context(), testConfig, db)
	if err != nil {
		t.Fatalf("LoadSettings: %v", err)
	}
	f := &fixture{db: db, settings: settings, now: testNow}
	f.auth = New(db, settings)
	f.auth.now = func() time.Time { return f.now }
	return f
}

func (f *fixture) advance(d time.Duration) {
	f.now = f.now.Add(d)
}

func (f *fixture) set(t *testing.T, key string, value any) {
	t.Helper()
	if err := f.settings.Set(t.Context(), f.db, 0, key, value); err != nil {
		t.Fatalf("Set %s: %v", key, err)
	}
}

func (f *fixture) habbo(t *testing.T, email, name, password string) (userID, avatarID int64) {
	t.Helper()
	q := store.New(f.db)
	user, err := q.CreateUser(t.Context(), store.CreateUserParams{
		Email:     email,
		BornOn:    time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		CreatedIP: "127.0.0.1",
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateUser %s: %v", email, err)
	}
	f.setHash(t, user.ID, HashPassword(password))
	return user.ID, f.avatar(t, user.ID, name)
}

func (f *fixture) avatar(t *testing.T, userID int64, name string) int64 {
	t.Helper()
	avatar, err := store.New(f.db).CreateAvatar(t.Context(), store.CreateAvatarParams{
		UserID:    userID,
		Name:      name,
		Figure:    "hd-180-1.ch-215-82.lg-270-82",
		Gender:    "M",
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateAvatar %s: %v", name, err)
	}
	return avatar.ID
}

func (f *fixture) setHash(t *testing.T, userID int64, hash string) {
	t.Helper()
	err := store.New(f.db).UpsertCredential(t.Context(), store.UpsertCredentialParams{UserID: userID, PasswordHash: hash, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("UpsertCredential: %v", err)
	}
}

func (f *fixture) login(t *testing.T, ip, name, password string, remember bool) (*http.Cookie, Session, error) {
	t.Helper()
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	r.RemoteAddr = ip + ":51234"
	r.Header.Set("User-Agent", "test-agent")
	rec := httptest.NewRecorder()
	session, err := f.auth.Login(rec, r, name, password, remember)
	return sessionCookie(rec), session, err
}

func (f *fixture) mustLogin(t *testing.T, name string, remember bool) *http.Cookie {
	t.Helper()
	cookie, _, err := f.login(t, "10.0.0.1", name, testPassword, remember)
	if err != nil {
		t.Fatalf("Login %s: %v", name, err)
	}
	return cookie
}

func sessionCookie(rec *httptest.ResponseRecorder) *http.Cookie {
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Name == cookieName {
			return cookie
		}
	}
	return nil
}

// visit sends a request with cookie through Sessions and reports the session
// the next handler saw.
func (f *fixture) visit(t *testing.T, cookie *http.Cookie) (Session, bool, *httptest.ResponseRecorder) {
	t.Helper()
	var session Session
	var ok bool
	handler := f.auth.Sessions(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, ok = FromContext(r.Context())
	}))
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, r)
	if rec.Code != http.StatusOK {
		t.Fatalf("Sessions answered %d", rec.Code)
	}
	return session, ok, rec
}

func (f *fixture) sessions(t *testing.T) map[string]store.Session {
	t.Helper()
	rows, err := f.db.QueryContext(t.Context(),
		`SELECT id, user_id, avatar_id, remember, ip, user_agent, created_at, last_seen_at, expires_at FROM sessions`)
	if err != nil {
		t.Fatalf("query sessions: %v", err)
	}
	defer rows.Close()
	out := make(map[string]store.Session)
	for rows.Next() {
		var s store.Session
		if err := rows.Scan(&s.ID, &s.UserID, &s.AvatarID, &s.Remember, &s.IP, &s.UserAgent, &s.CreatedAt, &s.LastSeenAt, &s.ExpiresAt); err != nil {
			t.Fatalf("scan session: %v", err)
		}
		out[s.ID] = s
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("read sessions: %v", err)
	}
	return out
}

func (f *fixture) attempts(t *testing.T) []store.LoginAttempt {
	t.Helper()
	rows, err := f.db.QueryContext(t.Context(), `SELECT user_id, avatar_id, ip, succeeded FROM login_attempts ORDER BY id`)
	if err != nil {
		t.Fatalf("query login attempts: %v", err)
	}
	defer rows.Close()
	var out []store.LoginAttempt
	for rows.Next() {
		var a store.LoginAttempt
		if err := rows.Scan(&a.UserID, &a.AvatarID, &a.IP, &a.Succeeded); err != nil {
			t.Fatalf("scan login attempt: %v", err)
		}
		out = append(out, a)
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("read login attempts: %v", err)
	}
	return out
}

func (f *fixture) count(t *testing.T, query string, args ...any) int {
	t.Helper()
	var n int
	if err := f.db.QueryRowContext(t.Context(), query, args...).Scan(&n); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return n
}
