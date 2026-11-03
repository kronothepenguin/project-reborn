package cms

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// oldHotel builds the database that an older release left: its updates up to
// count, and an administrator written with the columns of the first update, as
// any release could have written them.
func oldHotel(t *testing.T, updates []store.Update, count int) *sql.DB {
	t.Helper()
	db, err := store.Connect(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	if _, err := store.ApplyUpdates(t.Context(), db, updates[:count]); err != nil {
		t.Fatal(err)
	}
	now := "2026-11-03 21:00:00+00:00"
	for _, statement := range []string{
		`INSERT INTO users (id, email, born_on, created_ip, created_at, updated_at) VALUES (900, 'admin@example.com', '1990-05-01', '127.0.0.1', '` + now + `', '` + now + `')`,
		`INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (900, '` + auth.HashPassword("secret123") + `', '` + now + `')`,
		`INSERT INTO avatars (user_id, name, figure, gender, created_at, updated_at) VALUES (900, 'Admin', 'hd-180-1', 'M', '` + now + `', '` + now + `')`,
		`INSERT INTO access_groups (id, name, created_at, updated_at) VALUES (900, 'Owners', '` + now + `', '` + now + `')`,
		`INSERT INTO access_group_attributes (access_group_id, attribute) VALUES (900, 'housekeeping.accessGroups')`,
		`INSERT INTO access_group_members (access_group_id, user_id, granted_at) VALUES (900, 900, '` + now + `')`,
	} {
		if _, err := db.ExecContext(t.Context(), statement); err != nil {
			t.Fatalf("%s: %v", statement, err)
		}
	}
	return db
}

// The new code signs staff in on the database start-up leaves, which holds the
// updates up to the last automatic one, so that they reach the update page. A
// sign-in that reads what a later update adds fails here: mark that update
// automatic.
func TestSignInWorksOnTheDatabaseStartUpLeaves(t *testing.T) {
	updates, err := store.Updates()
	if err != nil {
		t.Fatal(err)
	}
	first := 1
	for i, update := range updates {
		if update.Automatic {
			first = i + 1
		}
	}
	for count := first; count <= len(updates); count++ {
		t.Run(fmt.Sprintf("updates up to %04d", count), func(t *testing.T) {
			db := oldHotel(t, updates, count)
			mux := http.NewServeMux()
			static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
			New(db, WithResolver(printPage), WithStatic(static)).Mount(mux)

			rec := serve(mux, "POST", "/", nil, credentials("Admin", "secret123"))
			wantRedirect(t, rec, "/me")
			if count < len(updates) {
				wantPage(t, serve(mux, "GET", "/disclaimer", sessionCookie(rec), nil), http.StatusServiceUnavailable,
					"maintenance.html", "UpdatesURL:http://localhost:18465/housekeeping/updates}")
			} else {
				wantPage(t, serve(mux, "GET", "/disclaimer", sessionCookie(rec), nil), http.StatusOK, "disclaimer.html")
			}
		})
	}
}
