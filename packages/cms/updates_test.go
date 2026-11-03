package cms

import (
	"database/sql"
	"io"
	"net/http"
	"path/filepath"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// waitingSite starts the CMS on a database that lacks the updates from version
// on, as after a release that brings them.
func waitingSite(t *testing.T, from int64) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := db.ExecContext(t.Context(), `DELETE FROM migrations WHERE version >= ?`, from); err != nil {
		t.Fatal(err)
	}
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	New(db, WithResolver(printPage), WithStatic(static)).Mount(mux)
	return db, mux
}

func applyWaiting(t *testing.T, db *sql.DB) {
	t.Helper()
	updates, err := store.Updates()
	if err != nil {
		t.Fatal(err)
	}
	waiting, err := store.WaitingUpdates(t.Context(), db, updates)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.ApplyUpdates(t.Context(), db, waiting); err != nil {
		t.Fatal(err)
	}
}

func TestTheHotelClosesWhileUpdatesWait(t *testing.T) {
	db, mux := waitingSite(t, 4)
	grant(t, db, habbo(t, db, "staff@example.com", "Staff"), auth.SiteMaintenanceBypass)
	staff := login(t, db, "Staff")

	for _, path := range []string{"/", "/register", "/disclaimer", "/home/Staff", "/xml/promo-habbos.xml"} {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusServiceUnavailable, "maintenance.html", "UpdatesURL:}")
	}
	wantPage(t, serve(mux, "GET", "/me", staff, nil), http.StatusServiceUnavailable, "maintenance.html")
	wantPage(t, serve(mux, "GET", "/web-gallery/styles.css", nil, nil), http.StatusOK, "static")
}

func TestThoseWhoApplyUpdatesSignInAndFindTheWay(t *testing.T) {
	db, mux := waitingSite(t, 4)
	grant(t, db, habbo(t, db, "admin@example.com", "Admin"), auth.HousekeepingAccessGroups)
	grant(t, db, habbo(t, db, "keeper@example.com", "Keeper"), auth.HousekeepingDatabase)
	habbo(t, db, "player@example.com", "Player")

	wantPage(t, serve(mux, "POST", "/", nil, credentials("Admin", "wrong-secret")), http.StatusServiceUnavailable,
		"maintenance.html", "Username:Admin", "Invalid username or password.")
	for _, name := range []string{"Admin", "Keeper"} {
		rec := serve(mux, "POST", "/", nil, credentials(name, "secret123"))
		wantRedirect(t, rec, "/me")
		wantPage(t, serve(mux, "GET", "/me", sessionCookie(rec), nil), http.StatusServiceUnavailable,
			"maintenance.html", "UpdatesURL:http://localhost:18465/housekeeping/updates}")
	}
	rec := serve(mux, "POST", "/", nil, credentials("Player", "secret123"))
	wantRedirect(t, rec, "/me")
	wantPage(t, serve(mux, "GET", "/me", sessionCookie(rec), nil), http.StatusServiceUnavailable, "maintenance.html", "UpdatesURL:}")
}

func TestTheHotelOpensOnceTheUpdatesAreApplied(t *testing.T) {
	db, mux := waitingSite(t, 3)
	wantPage(t, serve(mux, "GET", "/disclaimer", nil, nil), http.StatusServiceUnavailable, "maintenance.html")

	applyWaiting(t, db)
	wantPage(t, serve(mux, "GET", "/disclaimer", nil, nil), http.StatusOK, "disclaimer.html")
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html")
}

// A database whose updates cannot be read fails the start-up, like an automatic
// update that fails, and every page but the files waits for the administrator.
func TestAFailedStartClosesEveryPage(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	for _, statement := range []string{"DROP TABLE migrations", "CREATE TABLE migrations (note TEXT)"} {
		if _, err := db.ExecContext(t.Context(), statement); err != nil {
			t.Fatal(err)
		}
	}
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	New(db, WithResolver(printPage), WithStatic(static)).Mount(mux)

	for _, route := range []struct{ method, path string }{
		{"GET", "/"}, {"POST", "/"}, {"POST", "/logout"}, {"GET", "/logout"}, {"GET", "/me"}, {"GET", "/account/looks"},
		{"GET", "/home/Admin"}, {"POST", "/home-store/items/1/purchase"}, {"GET", "/register"}, {"POST", "/register/check-name"},
		{"GET", "/forgot"}, {"GET", "/reset/token"}, {"GET", "/disclaimer"}, {"GET", "/xml/promo-habbos.xml"},
	} {
		wantPage(t, serve(mux, route.method, route.path, nil, nil), http.StatusServiceUnavailable, "update-failed.html {ShortName:Holo}")
	}
	wantPage(t, serve(mux, "GET", "/web-gallery/styles.css", nil, nil), http.StatusOK, "static")
}
