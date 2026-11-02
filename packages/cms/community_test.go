package cms

import (
	"net/http"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

func TestCommunityShowsTheHousekeepingTabToStaff(t *testing.T) {
	db, mux := newSite(t)
	admin := habbo(t, db, "admin@example.com", "Admin")
	habbo(t, db, "player@example.com", "Player")
	grant(t, db, admin, auth.HousekeepingAccess)

	wantPage(t, serve(mux, "GET", "/me", login(t, db, "Admin"), nil), http.StatusOK, "Staff:true", "HousekeepingURL:http://localhost:18465/housekeeping")
	wantPage(t, serve(mux, "GET", "/me", login(t, db, "Player"), nil), http.StatusOK, "Staff:false")
}

func TestARunningCMSReadsNewSettings(t *testing.T) {
	db, mux := newSite(t)
	if rec := serve(mux, "GET", "/privacy", nil, nil); rec.Code != http.StatusOK {
		t.Fatalf("got %d, want an open site", rec.Code)
	}

	_, err := db.ExecContext(t.Context(), `INSERT INTO settings (key, value, updated_at) VALUES ('site.maintenance', 'true', ?)`, time.Now().UTC())
	if err != nil {
		t.Fatalf("insert setting: %v", err)
	}
	for range 40 {
		if serve(mux, "GET", "/privacy", nil, nil).Code == http.StatusServiceUnavailable {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Error("the CMS did not read the row within 4 seconds, with cms.refresh at 1")
}

func TestHousekeepingLinkFollowsItsSetting(t *testing.T) {
	db, mux := newSite(t)
	admin := habbo(t, db, "admin@example.com", "Admin")
	grant(t, db, admin, auth.HousekeepingAccess)
	setSetting(t, db, "site.housekeepingUrl", "http://localhost:18000/housekeeping")

	wantPage(t, serve(mux, "GET", "/me", login(t, db, "Admin"), nil), http.StatusOK, "HousekeepingURL:http://localhost:18000/housekeeping")
}

func TestSignedOutFooterShowsHousekeepingToStaff(t *testing.T) {
	db, mux := newSite(t)
	admin := habbo(t, db, "admin@example.com", "Admin")
	habbo(t, db, "player@example.com", "Player")
	grant(t, db, admin, auth.HousekeepingAccess)

	for _, path := range []string{"/disclaimer", "/privacy", "/forgot"} {
		wantPage(t, serve(mux, "GET", path, login(t, db, "Admin"), nil), http.StatusOK, "Staff:true")
		wantPage(t, serve(mux, "GET", path, login(t, db, "Player"), nil), http.StatusOK, "Staff:false")
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "Staff:false")
	}
}

func TestCommunityAlertsStaffDuringMaintenance(t *testing.T) {
	db, mux := newSite(t)
	admin := habbo(t, db, "admin@example.com", "Admin")
	grant(t, db, admin, auth.SiteMaintenanceBypass)
	cookie := login(t, db, "Admin")

	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "SiteClosed:false")
	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "SiteClosed:true")
}

func TestCommunityOffersTheSwitchWithSeveralHabbos(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "SignedIn:true", "SeveralHabbos:false")
	secondHabbo(t, db, userID, "Second")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "SeveralHabbos:true")
}
