package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func grantor(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return ranked(t, db, "Grantor", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingAccessGroups)
}

func attributesPath(userID int64) string {
	return fmt.Sprintf("/housekeeping/users/%d/attributes", userID)
}

func directOf(t *testing.T, db *sql.DB, userID int64) []string {
	t.Helper()
	direct, err := store.New(db).ListDirectUserAttributes(t.Context(), userID)
	if err != nil {
		t.Fatalf("ListDirectUserAttributes: %v", err)
	}
	return direct
}

func TestDirectAttributesTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Editor", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	form := url.Values{"habbo": {fmt.Sprint(id)}, "attribute": {"housekeeping.logs"}}
	wantPage(t, serve(mux, "POST", attributesPath(userID), cookie, form), http.StatusForbidden, "access-denied.html")
	if got := directOf(t, db, userID); len(got) != 0 {
		t.Errorf("direct = %v", got)
	}
	wantPage(t, serve(mux, "GET", habboURL(id), cookie, nil), http.StatusOK, "CanGrant:false", "Attributes:[]")
}

func TestGivingDirectAttributes(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := grantor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	form := url.Values{"habbo": {fmt.Sprint(id)}, "attribute": {"housekeeping.logs", "housekeeping.bans"}}
	wantRedirect(t, serve(mux, "POST", attributesPath(userID), cookie, form), habboURL(id)+"?saved=1")

	if got := directOf(t, db, userID); !slices.Equal(got, []string{"housekeeping.bans", "housekeeping.logs"}) {
		t.Errorf("direct = %v", got)
	}
	attributes, err := auth.Attributes(t.Context(), db, userID)
	if err != nil {
		t.Fatalf("Attributes: %v", err)
	}
	if !slices.Contains(attributes, auth.HousekeepingLogs) {
		t.Errorf("attributes = %v", attributes)
	}
	var grantedBy sql.NullInt64
	if err := db.QueryRowContext(t.Context(), `SELECT granted_by_user_id FROM user_attributes WHERE user_id = ? LIMIT 1`, userID).Scan(&grantedBy); err != nil {
		t.Fatalf("read grant: %v", err)
	}
	if grantedBy.Int64 != actor {
		t.Errorf("granted by %d, want %d", grantedBy.Int64, actor)
	}
	wantOneLog(t, db, "users.attributes", "direct: +housekeeping.bans, +housekeeping.logs", userID, id)
	wantPage(t, serve(mux, "GET", habboURL(id), cookie, nil), http.StatusOK, "Name:housekeeping.logs Description:reading the staff log Held:true", "Name:housekeeping.news Description:writing and deleting news Held:false")
}

func TestTheTickedBoxesReplaceTheDirectAttributes(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := grantor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	grant(t, db, userID, auth.HousekeepingNews)
	path := attributesPath(userID)
	serve(mux, "POST", path, cookie, url.Values{"habbo": {fmt.Sprint(id)}, "attribute": {"housekeeping.logs", "housekeeping.bans"}})

	wantRedirect(t, serve(mux, "POST", path, cookie, url.Values{"habbo": {fmt.Sprint(id)}, "attribute": {"housekeeping.bans"}}), habboURL(id)+"?saved=1")
	if got := directOf(t, db, userID); !slices.Equal(got, []string{"housekeeping.bans"}) {
		t.Errorf("direct = %v", got)
	}

	wantRedirect(t, serve(mux, "POST", path, cookie, url.Values{"habbo": {fmt.Sprint(id)}}), habboURL(id)+"?saved=1")
	if got := directOf(t, db, userID); len(got) != 0 {
		t.Errorf("direct = %v", got)
	}
	attributes, err := auth.Attributes(t.Context(), db, userID)
	if err != nil {
		t.Fatalf("Attributes: %v", err)
	}
	if !slices.Contains(attributes, auth.HousekeepingNews) {
		t.Error("the user lost an attribute of their group")
	}
}

func TestDirectAttributesAreOneUsersAlone(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := grantor(t, db)
	frank := habbo(t, db, "frank@example.com", "Frank")
	other := habbo(t, db, "other@example.com", "Other")
	frankHabbo, otherHabbo := habboOf(t, db, "Frank").ID, habboOf(t, db, "Other").ID

	serve(mux, "POST", attributesPath(other), cookie, url.Values{"habbo": {fmt.Sprint(otherHabbo)}, "attribute": {"housekeeping.news"}})
	wantPage(t, serve(mux, "GET", habboURL(frankHabbo), cookie, nil), http.StatusOK, "Name:housekeeping.news Description:writing and deleting news Held:false")

	serve(mux, "POST", attributesPath(frank), cookie, url.Values{"habbo": {fmt.Sprint(frankHabbo)}, "attribute": {"housekeeping.logs"}})
	if got := directOf(t, db, other); !slices.Equal(got, []string{"housekeeping.news"}) {
		t.Errorf("the other user holds %v", got)
	}
}

func TestOnlyTheCatalogueCanBeGivenDirectly(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := grantor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	form := url.Values{"habbo": {fmt.Sprint(id)}, "attribute": {"housekeeping.everything"}}
	wantPage(t, serve(mux, "POST", attributesPath(userID), cookie, form), http.StatusUnprocessableEntity, "Only the attributes of the catalogue can be given.")
	if got := directOf(t, db, userID); len(got) != 0 {
		t.Errorf("direct = %v", got)
	}
}

func TestStaffGiveAttributesOnlyToUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := grantor(t, db)
	peer, _ := ranked(t, db, "Peer", 4)

	for _, c := range []struct {
		name   string
		userID int64
		habbo  string
	}{
		{"a peer", peer, "Peer"},
		{"themselves", actor, "Grantor"},
	} {
		t.Run(c.name, func(t *testing.T) {
			form := url.Values{"habbo": {fmt.Sprint(habboOf(t, db, c.habbo).ID)}, "attribute": {"housekeeping.settings"}}
			wantPage(t, serve(mux, "POST", attributesPath(c.userID), cookie, form), http.StatusUnprocessableEntity, "below your level")
			if got := directOf(t, db, c.userID); len(got) != 0 {
				t.Errorf("direct = %v", got)
			}
		})
	}
	if rows := logsOf(t, db, "users.refused"); len(rows) != 2 {
		t.Errorf("%d refusals logged, want 2", len(rows))
	}
}

func TestAttributesNameOneOfTheUsersHabbos(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := grantor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "other@example.com", "Other")

	form := url.Values{"habbo": {fmt.Sprint(habboOf(t, db, "Other").ID)}, "attribute": {"housekeeping.logs"}}
	wantPage(t, serve(mux, "POST", attributesPath(userID), cookie, form), http.StatusNotFound)
}
