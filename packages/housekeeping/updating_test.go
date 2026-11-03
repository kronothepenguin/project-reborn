package housekeeping

import (
	"database/sql"
	"net/http"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// waitingSite starts housekeeping on a database that lacks the updates from
// version on, as after a release that brings them.
func waitingSite(t *testing.T, from int64) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	unapply(t, db, from)
	mux := http.NewServeMux()
	New(db, WithResolver(printPage), WithStatic(printPath("static"))).Mount(mux)
	return db, mux
}

func TestThoseWhoApplyUpdatesGoToTheUpdatePage(t *testing.T) {
	db, mux := waitingSite(t, 4)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase, auth.HousekeepingLogs)
	_, manager := staff(t, db, "Manager", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)

	for _, path := range []string{"/housekeeping/", "/housekeeping/logs", "/housekeeping/settings"} {
		wantRedirect(t, serve(mux, "GET", path, keeper, nil), "/housekeeping/updates")
	}
	wantRedirect(t, serve(mux, "POST", "/housekeeping/note", keeper, nil), "/housekeeping/updates")
	wantRedirect(t, serve(mux, "GET", "/housekeeping/access-groups", manager, nil), "/housekeeping/updates")
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", keeper, nil), http.StatusOK, "updates.html", "Waiting:[{Number:0004-database-attribute")
}

func TestOtherStaffAreToldTheHotelIsBeingUpdated(t *testing.T) {
	db, mux := waitingSite(t, 4)
	_, helper := staff(t, db, "Helper", auth.HousekeepingAccess, auth.HousekeepingSettings)

	for _, path := range []string{"/housekeeping/", "/housekeeping/settings"} {
		wantPage(t, serve(mux, "GET", path, helper, nil), http.StatusServiceUnavailable, "updating.html", "Habbo:Helper")
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/updates", helper, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/_astro/page.css", helper, nil), http.StatusOK, "static /_astro/page.css")
	if rec := serve(mux, "POST", "/housekeeping/logout", helper, nil); rec.Code == http.StatusServiceUnavailable {
		t.Errorf("signing out while updates wait = %d", rec.Code)
	}
}

func TestHousekeepingOpensOnceTheUpdatesAreApplied(t *testing.T) {
	db, mux := waitingSite(t, 3)
	_, keeper := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingDatabase)

	wantRedirect(t, serve(mux, "GET", "/housekeeping/", keeper, nil), "/housekeeping/updates")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/updates", keeper, nil), "/housekeeping/updates?applied=1")
	wantPage(t, serve(mux, "GET", "/housekeeping/", keeper, nil), http.StatusOK, "index.html")
}

// A database whose updates cannot be read fails the start-up, like an automatic
// update that fails, and every page waits for the administrator.
func TestAFailedStartClosesHousekeeping(t *testing.T) {
	db := openDB(t)
	for _, statement := range []string{"DROP TABLE migrations", "CREATE TABLE migrations (note TEXT)"} {
		if _, err := db.ExecContext(t.Context(), statement); err != nil {
			t.Fatal(err)
		}
	}
	mux := http.NewServeMux()
	New(db, WithResolver(printPage), WithStatic(printPath("static"))).Mount(mux)

	for _, route := range routes {
		if strings.HasPrefix(route.path, "/housekeeping/_astro/") || strings.HasSuffix(route.path, ".html") {
			continue
		}
		wantPage(t, serve(mux, route.method, route.path, nil, nil), http.StatusServiceUnavailable, "update-failed.html {SiteName:Holo Hotel}")
	}
}
