package housekeeping

import (
	"database/sql"
	"html"
	"net/http"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// unapply makes the updates from version on wait again. Each of the first ones
// can run again on a database that has it.
func unapply(t *testing.T, db *sql.DB, from int64) {
	t.Helper()
	if _, err := db.ExecContext(t.Context(), `DELETE FROM migrations WHERE version >= ?`, from); err != nil {
		t.Fatal(err)
	}
}

func copies(t *testing.T, db *sql.DB) []string {
	t.Helper()
	var file string
	if err := db.QueryRowContext(t.Context(), `SELECT file FROM pragma_database_list WHERE name = 'main'`).Scan(&file); err != nil {
		t.Fatal(err)
	}
	found, err := filepath.Glob(file + ".backup-*")
	if err != nil {
		t.Fatal(err)
	}
	return found
}

func versionsApplied(t *testing.T, db *sql.DB) []int64 {
	t.Helper()
	applied, err := store.AppliedUpdates(t.Context(), db)
	if err != nil {
		t.Fatal(err)
	}
	var versions []int64
	for _, migration := range applied {
		versions = append(versions, migration.Version)
	}
	return versions
}

func TestTheUpdatePageListsWaitingAndAppliedUpdates(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	rec := serve(mux, "GET", "/housekeeping/updates", cookie, nil)
	wantPage(t, rec, http.StatusOK, "updates.html", "Waiting:[] Applied:[{Number:0004-database-attribute Title:Applying database updates")
	if strings.Index(rec.Body.String(), "Number:0004") > strings.Index(rec.Body.String(), "Number:0001-baseline") {
		t.Error("the applied updates are not newest first")
	}

	unapply(t, db, 3)
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", cookie, nil), http.StatusOK,
		html.EscapeString("Waiting:[{Number:0003-ranks Title:Holo's staff ranks as access groups, for a hotel that has no access group yet. Date:} {Number:0004-database-attribute"),
		html.EscapeString("Applied:[{Number:0002-home-store Title:Holo's home store: its 20 categories and 298 items, with Holo's ids. Date:"))
}

func TestApplyingUpdatesSavesACopyFirst(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)
	unapply(t, db, 3)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", cookie, nil), "/housekeeping/updates?applied=1")
	if got := versionsApplied(t, db); len(got) != 4 {
		t.Errorf("applied = %v, want every update", got)
	}
	saved := copies(t, db)
	if len(saved) != 1 {
		t.Fatalf("copies = %v, want one", saved)
	}
	before, err := store.Open(saved[0])
	if err != nil {
		t.Fatal(err)
	}
	defer before.Close()
	if got := versionsApplied(t, before); len(got) != 2 {
		t.Errorf("the copy has %v applied, want the database from before the updates", got)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "database.update" || logs[0].Detail != "applied 0003-ranks; applied 0004-database-attribute; copy "+saved[0] {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates?applied=1", cookie, nil), http.StatusOK,
		"Message:The updates were applied. A copy of the database from before them was saved beside it.")
}

func TestAFailingUpdateSaysWhichOne(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	unapply(t, db, 1)
	if _, err := db.ExecContext(t.Context(), `CREATE TRIGGER refuse_items BEFORE INSERT ON home_store_items BEGIN SELECT RAISE(ABORT, 'items refused'); END`); err != nil {
		t.Fatal(err)
	}

	rec := serve(mux, "POST", "/housekeeping/updates", cookie, nil)
	saved := copies(t, db)
	if len(saved) != 1 {
		t.Fatalf("copies = %v, want one", saved)
	}
	wantPage(t, rec, http.StatusInternalServerError, "Error:Update 0002-home-store failed: ", "items refused",
		"The updates before it were applied, and the copy of the database from before them is "+saved[0]+".",
		"Waiting:[{Number:0002-home-store")
	if got := versionsApplied(t, db); len(got) != 1 || got[0] != 1 {
		t.Errorf("applied = %v, want only 0001 before the failure", got)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || !strings.HasPrefix(logs[0].Detail, "applied 0001-baseline; 0002-home-store failed: ") ||
		!strings.Contains(logs[0].Detail, "items refused") || !strings.HasSuffix(logs[0].Detail, "; copy "+saved[0]) {
		t.Errorf("staff logs = %+v", logs)
	}
}

func TestNothingWaitingAppliesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", cookie, nil), "/housekeeping/updates")
	if saved := copies(t, db); len(saved) != 0 {
		t.Errorf("copies = %v, want none", saved)
	}
	if logs := staffLogs(t, db); len(logs) != 0 {
		t.Errorf("staff logs = %+v, want none", logs)
	}
}

func TestUpdatesAreForTheDatabaseAttributeOrAccessManagers(t *testing.T) {
	db, mux := newSite(t)
	_, moderator := staff(t, db, "Moderator", auth.HousekeepingAccess, auth.HousekeepingSettings, auth.HousekeepingLogs)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)
	_, manager := staff(t, db, "Manager", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	unapply(t, db, 4)

	wantPage(t, serve(mux, "GET", "/housekeeping/updates", moderator, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/updates", moderator, nil), http.StatusForbidden, "access-denied.html")
	if got := versionsApplied(t, db); len(got) != 3 {
		t.Errorf("applied = %v after a refused post, want the update still waiting", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", keeper, nil), http.StatusOK, "updates.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", manager, nil), http.StatusOK, "updates.html")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", manager, nil), "/housekeeping/updates?applied=1")
}
