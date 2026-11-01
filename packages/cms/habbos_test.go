package cms

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func newHabbo(name string) url.Values {
	return url.Values{"name": {name}, "figure": {"hd-205-6"}, "gender": {"M"}}
}

func TestHabbosNeedASession(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/account/habbos", nil, nil), "/")
	wantRedirect(t, serve(mux, "POST", "/account/habbos", nil, newHabbo("Second")), "/")
	wantRedirect(t, serve(mux, "POST", "/account/habbos/1/switch", nil, url.Values{}), "/")
}

func TestHabbosListsTheUsersHabbos(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, userID := member(t, db, mux)
	secondHabbo(t, db, userID, "Second")
	habbo(t, db, "other@example.com", "Other")

	rec := serve(mux, "GET", "/account/habbos", cookie, nil)
	wantPage(t, rec, http.StatusOK, "account/habbos.html", "Name:Newbie", "Active:true", "Name:Second", "Active:false", "CanAdd:true")
	if strings.Contains(rec.Body.String(), "Name:Other") {
		t.Error("the page lists another user's habbo")
	}
}

func TestAddHabboWritesItsRowsWithoutCredits(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, userID := member(t, db, mux)

	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, newHabbo("Second")), http.StatusOK, "Result:Second is ready to use.", "Failed:false", "Name:Second")

	avatar, err := store.New(db).GetAvatarByName(t.Context(), "Second")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}
	if avatar.UserID != userID || avatar.Figure != "hd-205-6" || avatar.Gender != "M" {
		t.Errorf("avatar = %+v, want the form's look on the user", avatar)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallets WHERE avatar_id = ? AND credits = 0`, avatar.ID); n != 1 {
		t.Errorf("%d empty wallets, want 1", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE avatar_id = ?`, avatar.ID); n != 0 {
		t.Errorf("%d ledger rows, want none", n)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM homes JOIN profiles ON homes.profile_id = profiles.id WHERE avatar_id = ?`, avatar.ID); n != 1 {
		t.Errorf("%d homes, want 1", n)
	}
}

func TestAddHabboUsesTheDefaultLookWithoutAnEditor(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	setSetting(t, db, "registration.defaultFigure", "hd-205-6")

	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, url.Values{"name": {"Second"}}), http.StatusOK, "Second is ready to use.")
	if n := count(t, db, `SELECT COUNT(*) FROM avatars WHERE name = 'Second' AND figure = 'hd-205-6'`); n != 1 {
		t.Errorf("%d habbos with the default look, want 1", n)
	}
}

func TestAddHabboRefusals(t *testing.T) {
	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"taken name", newHabbo("newbie"), "This username is in use. Please choose another name."},
		{"no name", newHabbo(""), "Please enter a username."},
		{"invalid name", newHabbo("two words"), "Your username is invalid or contains invalid characters."},
		{"moderator name", newHabbo("MOD-Bob"), "This name is not allowed."},
		{"bad figure", url.Values{"name": {"Second"}, "figure": {"not a figure"}, "gender": {"M"}}, "An error occurred trying to process your request."},
		{"bad gender", url.Values{"name": {"Second"}, "figure": {"hd-205-6"}, "gender": {"U"}}, "An error occurred trying to process your request."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)

			wantPage(t, serve(mux, "POST", "/account/habbos", cookie, c.form), http.StatusUnprocessableEntity, c.want, "Failed:true")
			if n := count(t, db, `SELECT COUNT(*) FROM avatars`); n != 1 {
				t.Errorf("%d habbos after a refusal, want 1", n)
			}
		})
	}
}

func TestAddHabboStopsAtTheLimit(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	setSetting(t, db, "registration.maxHabbosPerUser", 2)

	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, newHabbo("Second")), http.StatusOK, "CanAdd:false")
	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, newHabbo("Third")), http.StatusUnprocessableEntity, "You can have 2 habbos at most.")
	if n := count(t, db, `SELECT COUNT(*) FROM avatars`); n != 2 {
		t.Errorf("%d habbos, want 2", n)
	}
}

func TestAddHabboKeepsTheLimitForRequestsAtOnce(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	setSetting(t, db, "registration.maxHabbosPerUser", 3)

	var wg sync.WaitGroup
	for i := range 8 {
		wg.Go(func() {
			serve(mux, "POST", "/account/habbos", cookie, newHabbo(fmt.Sprintf("Habbo-%d", i)))
		})
	}
	wg.Wait()
	if n := count(t, db, `SELECT COUNT(*) FROM avatars`); n != 3 {
		t.Errorf("%d habbos, want the limit of 3", n)
	}
}

func TestSwitchHabbo(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, newHabbo("Second")), http.StatusOK, "Second")
	second, err := store.New(db).GetAvatarByName(t.Context(), "Second")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}

	wantRedirect(t, serve(mux, "POST", fmt.Sprintf("/account/habbos/%d/switch", second.ID), cookie, url.Values{}), "/account/habbos")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Habbo:Second", "Figure:hd-205-6", "Credits:0")
}

func TestSwitchRefusesAnotherUsersHabbo(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	userID := habbo(t, db, "other@example.com", "Other")
	other, err := store.New(db).ListUserAvatars(t.Context(), userID)
	if err != nil {
		t.Fatalf("ListUserAvatars: %v", err)
	}

	if rec := serve(mux, "POST", fmt.Sprintf("/account/habbos/%d/switch", other[0].ID), cookie, url.Values{}); rec.Code != http.StatusForbidden {
		t.Errorf("got %d, want 403", rec.Code)
	}
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Habbo:Newbie")
}

func TestANewHabboSignsIn(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	serve(mux, "POST", "/account/habbos", cookie, newHabbo("Second"))

	rec := serve(mux, "POST", "/", nil, credentials("Second", "secret123"))
	wantRedirect(t, rec, "/me")
	wantPage(t, serve(mux, "GET", "/me", sessionCookie(rec), nil), http.StatusOK, "Habbo:Second")
}
