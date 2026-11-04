package housekeeping

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"path/filepath"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

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

// releaseUpdates are the updates this release carries, so that the tests follow
// the ones a release adds.
func releaseUpdates(t *testing.T) []store.Update {
	t.Helper()
	updates, err := store.Updates()
	if err != nil {
		t.Fatal(err)
	}
	return updates
}

func updateNumber(update store.Update) string {
	return fmt.Sprintf("%04d-%s", update.Version, update.Name)
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

	updates := releaseUpdates(t)
	newest := updates[len(updates)-1]
	rec := serve(mux, "GET", "/housekeeping/updates", cookie, nil)
	wantPage(t, rec, http.StatusOK, "updates.html",
		html.EscapeString(fmt.Sprintf("Waiting:[] Applied:[{Number:%s Title:%s Date:", updateNumber(newest), newest.Title)))
	if strings.Index(rec.Body.String(), "Number:"+updateNumber(newest)) > strings.Index(rec.Body.String(), "Number:0001-baseline") {
		t.Error("the applied updates are not newest first")
	}

	older, mux := waitingSite(t, 3)
	_, cookie = staff(t, older, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", cookie, nil), http.StatusOK,
		html.EscapeString("Waiting:[{Number:0003-ranks Title:Holo's staff ranks as access groups, for a hotel that has no access group yet. Date:} {Number:0004-database-attribute"),
		html.EscapeString("Applied:[{Number:0002-home-store Title:Holo's home store: its 20 categories and 298 items, with Holo's ids. Date:"))
}

func TestApplyingUpdatesSavesACopyFirst(t *testing.T) {
	db, mux := waitingSite(t, 3)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", cookie, nil), "/housekeeping/updates?applied=1")
	updates := releaseUpdates(t)
	if got := versionsApplied(t, db); len(got) != len(updates) {
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
	var detail []string
	for _, update := range updates[2:] {
		detail = append(detail, "applied "+updateNumber(update))
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "database.update" || logs[0].Detail != strings.Join(append(detail, "copy "+saved[0]), "; ") {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates?applied=1", cookie, nil), http.StatusOK,
		"Message:The updates were applied. A copy of the database from before them was saved beside it.")
}

func TestAFailingUpdateSaysWhichOne(t *testing.T) {
	db, mux := waitingSite(t, 3)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	if _, err := db.ExecContext(t.Context(), `CREATE TRIGGER refuse_grants BEFORE INSERT ON access_group_attributes BEGIN SELECT RAISE(ABORT, 'grants refused'); END`); err != nil {
		t.Fatal(err)
	}

	rec := serve(mux, "POST", "/housekeeping/updates", cookie, nil)
	saved := copies(t, db)
	if len(saved) != 1 {
		t.Fatalf("copies = %v, want one", saved)
	}
	wantPage(t, rec, http.StatusInternalServerError, "Error:Update 0004-database-attribute failed: ", "grants refused",
		"The updates before it were applied, and the copy of the database from before them is "+saved[0]+".",
		"Waiting:[{Number:0004-database-attribute")
	if got := versionsApplied(t, db); len(got) != 3 {
		t.Errorf("applied = %v, want the three before the failure", got)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || !strings.HasPrefix(logs[0].Detail, "applied 0003-ranks; 0004-database-attribute failed: ") ||
		!strings.Contains(logs[0].Detail, "grants refused") || !strings.HasSuffix(logs[0].Detail, "; copy "+saved[0]) {
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
	db, mux := waitingSite(t, 4)
	_, moderator := staff(t, db, "Moderator", auth.HousekeepingAccess, auth.HousekeepingSettings, auth.HousekeepingLogs)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)
	_, manager := staff(t, db, "Manager", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)

	wantPage(t, serve(mux, "GET", "/housekeeping/updates", moderator, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/updates", moderator, nil), http.StatusForbidden, "access-denied.html")
	if got := versionsApplied(t, db); len(got) != 3 {
		t.Errorf("applied = %v after a refused post, want the update still waiting", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", keeper, nil), http.StatusOK, "updates.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", manager, nil), http.StatusOK, "updates.html")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", manager, nil), "/housekeeping/updates?applied=1")
}
