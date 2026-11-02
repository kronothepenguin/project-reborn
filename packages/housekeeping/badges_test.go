package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func badgesURL(id int64) string {
	return fmt.Sprintf("/housekeeping/habbos/%d/badges", id)
}

func wornBadges(t *testing.T, db *sql.DB, id int64) (all, worn []string) {
	t.Helper()
	badges, err := store.New(db).ListAvatarBadges(t.Context(), id)
	if err != nil {
		t.Fatalf("ListAvatarBadges: %v", err)
	}
	for _, badge := range badges {
		all = append(all, badge.Code)
		if badge.Worn {
			worn = append(worn, badge.Code)
		}
	}
	return all, worn
}

func TestBadgesTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	wantPage(t, serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"ADM"}}), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", badgesURL(id)+"/ADM/delete", cookie, url.Values{"x": {"1"}}), http.StatusForbidden, "access-denied.html")
	if all, _ := wornBadges(t, db, id); len(all) != 0 {
		t.Errorf("badges = %v", all)
	}
}

func TestGivingABadgeWearsIt(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"ADM"}})
	wantRedirect(t, rec, habboURL(id)+"?given=1&badge=ADM")
	wantPage(t, serve(mux, "GET", habboURL(id)+"?given=1&badge=ADM", cookie, nil), http.StatusOK,
		"Gave the user this badge (ADM) and set it as current badge successfully.", "Code:ADM Worn:true")
	wantOneLog(t, db, "badges.give", "ADM", userID, id)

	wantRedirect(t, serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"XM8"}}), habboURL(id)+"?given=1&badge=XM8")
	all, worn := wornBadges(t, db, id)
	if len(all) != 2 || len(worn) != 1 || worn[0] != "XM8" {
		t.Errorf("badges = %v, worn = %v", all, worn)
	}
}

func TestABadgeTheHabboHasBecomesTheWornOne(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"ADM"}})
	serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"XM8"}})

	rec := serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"adm"}})
	wantRedirect(t, rec, habboURL(id)+"?worn=1&badge=ADM")
	wantPage(t, serve(mux, "GET", habboURL(id)+"?worn=1&badge=ADM", cookie, nil), http.StatusOK,
		"This user already has this badge; the badge (ADM) has been set as the user&#39;s current badge successfully.")
	all, worn := wornBadges(t, db, id)
	if len(all) != 2 || len(worn) != 1 || worn[0] != "ADM" {
		t.Errorf("badges = %v, worn = %v", all, worn)
	}
	wantOneLog(t, db, "badges.wear", "ADM", userID, id)
}

func TestABadCodeIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	for _, code := range []string{"", "AD", "ADMIN", "A D", "../", "A/B"} {
		rec := serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {code}})
		wantPage(t, rec, http.StatusUnprocessableEntity, "habbos/id.html", "Invalid badge. Badge codes may only be 3-4 characters long.")
	}
	if all, _ := wornBadges(t, db, id); len(all) != 0 {
		t.Errorf("badges = %v", all)
	}
	wantRedirect(t, serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"ABCD"}}), habboURL(id)+"?given=1&badge=ABCD")
}

func TestAMessageShowsOnlyACode(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "GET", habboURL(id)+"?given=1&badge=Hacked+by+me", cookie, nil)
	wantPage(t, rec, http.StatusOK, "habbos/id.html")
	if strings.Contains(rec.Body.String(), "Hacked") {
		t.Error("the message repeats text from the address")
	}
}

func TestRemovingABadge(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"ADM"}})

	rec := serve(mux, "POST", badgesURL(id)+"/ADM/delete", cookie, url.Values{"x": {"1"}})
	wantRedirect(t, rec, habboURL(id)+"?removed=1&badge=ADM")
	wantPage(t, serve(mux, "GET", habboURL(id)+"?removed=1&badge=ADM", cookie, nil), http.StatusOK, "Removed the badge (ADM)")
	if all, _ := wornBadges(t, db, id); len(all) != 0 {
		t.Errorf("badges = %v", all)
	}
	wantOneLog(t, db, "badges.delete", "ADM", userID, id)

	wantPage(t, serve(mux, "POST", badgesURL(id)+"/ADM/delete", cookie, url.Values{"x": {"1"}}), http.StatusNotFound)
	if rows := logsOf(t, db, "badges.delete"); len(rows) != 1 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestStaffChangeOnlyTheBadgesOfUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	ranked(t, db, "Peer", 4)
	id := habboOf(t, db, "Peer").ID
	if _, err := store.New(db).GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: id, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatalf("GrantAvatarBadge: %v", err)
	}

	wantPage(t, serve(mux, "POST", badgesURL(id), cookie, url.Values{"badge": {"XM8"}}), http.StatusUnprocessableEntity, "below your level")
	wantPage(t, serve(mux, "POST", badgesURL(id)+"/ADM/delete", cookie, url.Values{"x": {"1"}}), http.StatusUnprocessableEntity, "below your level")
	if all, _ := wornBadges(t, db, id); len(all) != 1 || all[0] != "ADM" {
		t.Errorf("badges = %v", all)
	}
	if rows := logsOf(t, db, "users.refused"); len(rows) != 2 {
		t.Errorf("%d refusals logged, want 2", len(rows))
	}
}
