package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

func restoreURL(id int64) string {
	return fmt.Sprintf("/housekeeping/habbos/%d/restore", id)
}

func archive(t *testing.T, db *sql.DB, id int64) {
	t.Helper()
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, id); err != nil {
		t.Fatalf("archive: %v", err)
	}
}

func TestRestoringTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	userID := habbo(t, db, "frank@example.com", "Frank")
	old := secondHabbo(t, db, userID, "Old")
	archive(t, db, old.ID)

	wantPage(t, serve(mux, "POST", restoreURL(old.ID), cookie, button), http.StatusForbidden, "access-denied.html")
	if !habboOf(t, db, "Old").ArchivedAt.Valid {
		t.Error("the habbo was restored")
	}
}

func TestRestoringAHabbo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	old := secondHabbo(t, db, userID, "Old")
	archive(t, db, old.ID)

	wantRedirect(t, serve(mux, "POST", restoreURL(old.ID), cookie, button), habboURL(old.ID)+"?restored=1")
	wantPage(t, serve(mux, "GET", habboURL(old.ID)+"?restored=1", cookie, nil), http.StatusOK, "Habbo restored successfully.")
	if habboOf(t, db, "Old").ArchivedAt.Valid {
		t.Error("the habbo stayed archived")
	}
	wantOneLog(t, db, "habbos.restore", "", userID, old.ID)
	login(t, db, "Old")
}

func TestAHabboThatIsNotArchivedIsNotRestored(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	rec := serve(mux, "POST", restoreURL(habboOf(t, db, "Frank").ID), cookie, button)
	wantPage(t, rec, http.StatusUnprocessableEntity, "habbos/id.html", "This habbo is not archived.")
	if rows := logsOf(t, db, "habbos.restore"); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestARestoredHabboNeedsAFreeSlot(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	old := secondHabbo(t, db, userID, "Old")
	archive(t, db, old.ID)
	for i := range 4 {
		secondHabbo(t, db, userID, fmt.Sprintf("Habbo%d", i))
	}

	rec := serve(mux, "POST", restoreURL(old.ID), cookie, button)
	wantPage(t, rec, http.StatusUnprocessableEntity, "habbos/id.html", "This user can have 5 habbos at most.")
	if !habboOf(t, db, "Old").ArchivedAt.Valid {
		t.Error("the habbo came back past the limit")
	}

	archive(t, db, habboOf(t, db, "Habbo0").ID)
	wantRedirect(t, serve(mux, "POST", restoreURL(old.ID), cookie, button), habboURL(old.ID)+"?restored=1")
}

func TestStaffRestoreOnlyTheHabbosOfUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	peer, _ := ranked(t, db, "Peer", 4)
	old := secondHabbo(t, db, peer, "Old")
	archive(t, db, old.ID)

	rec := serve(mux, "POST", restoreURL(old.ID), cookie, button)
	wantPage(t, rec, http.StatusUnprocessableEntity, "below your level")
	if !habboOf(t, db, "Old").ArchivedAt.Valid {
		t.Error("the habbo was restored")
	}
	wantOneLog(t, db, "users.refused", "restore a habbo", peer, old.ID)
}
