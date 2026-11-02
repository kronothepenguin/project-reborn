package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

func habboURL(id int64) string {
	return fmt.Sprintf("/housekeeping/habbos/%d", id)
}

// signIn records a sign-in of a habbo from ip, as the login does.
func signIn(t *testing.T, db *sql.DB, userID, avatarID int64, ip string) {
	t.Helper()
	_, err := db.ExecContext(t.Context(),
		`INSERT INTO login_attempts (user_id, avatar_id, ip, succeeded, created_at) VALUES (?, ?, ?, TRUE, ?)`,
		userID, avatarID, ip, testNow)
	if err != nil {
		t.Fatalf("insert login attempt: %v", err)
	}
}

func TestHabbosTakeTheirAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)

	wantPage(t, serve(mux, "GET", "/housekeeping/habbos", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "GET", habboURL(1), cookie, nil), http.StatusForbidden, "access-denied.html")
}

func TestTheListShowsHabbosButNotWhatIsPrivate(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	userID := habbo(t, db, "frank@example.com", "Frank")
	signIn(t, db, userID, habboOf(t, db, "Frank").ID, "10.0.0.7")

	rec := serve(mux, "GET", "/housekeeping/habbos", cookie, nil)
	wantPage(t, rec, http.StatusOK, "habbos.html", "Name:Frank", "Private:false", "ago")
	for _, secret := range []string{"frank@example.com", "10.0.0.7"} {
		if strings.Contains(rec.Body.String(), secret) {
			t.Errorf("the list shows %s without housekeeping.usersPrivate", secret)
		}
	}
}

func TestThePrivateAttributeShowsAddresses(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersPrivate)
	userID := habbo(t, db, "frank@example.com", "Frank")
	signIn(t, db, userID, habboOf(t, db, "Frank").ID, "10.0.0.7")
	habbo(t, db, "never@example.com", "Never")

	wantPage(t, serve(mux, "GET", "/housekeeping/habbos", cookie, nil), http.StatusOK, "Private:true", "Email:frank@example.com", "IP:10.0.0.7", "IP:No IP Found")
}

func TestSearching(t *testing.T) {
	db, mux := newSite(t)
	_, plain := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	_, private := staff(t, db, "Seer", auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersPrivate)
	frank := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	habbo(t, db, "other@example.com", "Other")
	signIn(t, db, frank, id, "10.0.0.7")

	for _, c := range []struct {
		name   string
		cookie *http.Cookie
		query  string
		found  bool
	}{
		{"part of a name", plain, "ran", true},
		{"a name in another case", plain, "FRANK", true},
		{"an id", plain, fmt.Sprint(id), true},
		{"an email needs the attribute", plain, "frank@example.com", false},
		{"an address needs the attribute", plain, "10.0.0.7", false},
		{"an email", private, "frank@example.com", true},
		{"an address finds clones", private, "10.0.0.7", true},
		{"nothing", private, "nobody", false},
	} {
		t.Run(c.name, func(t *testing.T) {
			rec := serve(mux, "GET", "/housekeeping/habbos?q="+c.query, c.cookie, nil)
			wantPage(t, rec, http.StatusOK, "habbos.html")
			if got := strings.Contains(rec.Body.String(), "Name:Frank"); got != c.found {
				t.Errorf("found = %t, want %t", got, c.found)
			}
			if c.found && strings.Contains(rec.Body.String(), "Name:Other") {
				t.Error("the search let another habbo through")
			}
		})
	}
}

// The page count would otherwise tell someone without housekeeping.usersPrivate
// that an address or an email they searched for belongs to somebody.
func TestPagesDoNotCountWhatTheSearchHides(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	frank := habbo(t, db, "frank@example.com", "Frank")
	signIn(t, db, frank, habboOf(t, db, "Frank").ID, "10.0.0.7")
	for i := range 100 {
		secondHabbo(t, db, frank, fmt.Sprintf("Habbo%03d", i))
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/habbos?q=10.0.0.7", cookie, nil), http.StatusOK, "Older:0 Newer:0")
}

func TestTheListComesInPages(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	for i := range 100 {
		secondHabbo(t, db, userID, fmt.Sprintf("Habbo%03d", i))
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/habbos", cookie, nil), http.StatusOK, "Older:2 Newer:0", "Name:Habbo000")
	rec := serve(mux, "GET", "/housekeeping/habbos?page=2", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Older:0 Newer:1", "Name:Mod")
	if strings.Contains(rec.Body.String(), "Name:Habbo000") {
		t.Error("the second page repeats the first")
	}
}

func TestArchivedHabbosStayListedForStaff(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	old := secondHabbo(t, db, userID, "OldOne")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, old.ID); err != nil {
		t.Fatalf("archive: %v", err)
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/habbos", cookie, nil), http.StatusOK, "Name:OldOne Archived:true")
	wantPage(t, serve(mux, "GET", habboURL(old.ID), cookie, nil), http.StatusOK, "Name:OldOne", "Archived:true")
	wantPage(t, serve(mux, "GET", habboURL(habboOf(t, db, "Mod").ID), cookie, nil), http.StatusOK, "Name:OldOne Archived:true")
}

func TestTheHabboPage(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	userID := habbo(t, db, "frank@example.com", "Frank")
	secondHabbo(t, db, userID, "FrankToo")
	id := habboOf(t, db, "Frank").ID
	signIn(t, db, userID, id, "10.0.0.7")

	rec := serve(mux, "GET", habboURL(id), cookie, nil)
	wantPage(t, rec, http.StatusOK, "habbos/id.html", "Name:Frank", "Name:FrankToo", fmt.Sprintf("ID:%d", userID))
	for _, secret := range []string{"frank@example.com", "10.0.0.7", "1990-05-01"} {
		if strings.Contains(rec.Body.String(), secret) {
			t.Errorf("the page shows %s without housekeeping.usersPrivate", secret)
		}
	}
}

func TestTheHabboPageShowsEachAddressOnce(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Seer", auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersPrivate)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	signIn(t, db, userID, id, "10.0.0.7")
	signIn(t, db, userID, id, "10.0.0.7")
	signIn(t, db, userID, id, "10.0.0.8")

	rec := serve(mux, "GET", habboURL(id), cookie, nil)
	wantPage(t, rec, http.StatusOK, "Email:frank@example.com", "BornOn:1990-05-01", "IP:10.0.0.8", "IP:10.0.0.7")
	if n := strings.Count(rec.Body.String(), "IP:10.0.0.7"); n != 1 {
		t.Errorf("the address is listed %d times, want once", n)
	}
}

func TestAHabboThatDoesNotExistIsNotFound(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	wantPage(t, serve(mux, "GET", habboURL(999), cookie, nil), http.StatusNotFound)
	wantPage(t, serve(mux, "GET", "/housekeeping/habbos/nonsense", cookie, nil), http.StatusNotFound)
}
