package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type groupAnswer struct {
	Message string `json:"message"`
	Error   string `json:"error"`
}

// ownedGroup is a group of access owned by a new habbo, with its owner's row.
func ownedGroup(t *testing.T, db *sql.DB, name, access string) store.Group {
	t.Helper()
	owner := strings.ToLower(strings.ReplaceAll(name, " ", "")) + "-owner"
	habbo(t, db, owner+"@example.com", owner)
	ownerID := avatarID(t, db, owner)
	q := store.New(db)
	g, err := q.CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: ownerID, Name: name, Badge: badge.Default, Access: access, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: g.ID, AvatarID: ownerID, Role: "admin", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatal(err)
	}
	if _, err := q.CreateGroupHome(t.Context(), store.CreateGroupHomeParams{GroupID: g.ID, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	return g
}

func groupAction(mux *http.ServeMux, cookie *http.Cookie, groupID int64, action string) *httptest.ResponseRecorder {
	return edit(mux, cookie, fmt.Sprintf("/groups/%d/%s", groupID, action), map[string]any{})
}

func joined(t *testing.T, db *sql.DB, groupID, avatar int64) (store.GroupMember, bool) {
	t.Helper()
	row, err := store.New(db).GetGroupMember(t.Context(), store.GetGroupMemberParams{GroupID: groupID, AvatarID: avatar})
	if store.IsNotFound(err) {
		return row, false
	}
	if err != nil {
		t.Fatal(err)
	}
	return row, true
}

func TestJoiningAnswersAsJoingroupDid(t *testing.T) {
	db, mux := newSite(t)
	regular := ownedGroup(t, db, "Regular", "open")
	exclusive := ownedGroup(t, db, "Exclusive", "moderated")
	private := ownedGroup(t, db, "Private", "closed")
	unlimited := ownedGroup(t, db, "Unlimited", "unlimited")
	habbo(t, db, "frank@example.com", "Frank")
	frank := avatarID(t, db, "Frank")
	cookie := login(t, db, "Frank")

	for _, c := range []struct {
		group  store.Group
		want   string
		joined bool
		row    bool
	}{
		{regular, "You have now joined this group.", true, true},
		{exclusive, "A request to join this group has been made. The group owner will have to accept you before you join this group.", false, true},
		{private, "Sorry, but this group is closed. No one can join this group!", false, false},
		{unlimited, "You have now joined this group.", true, true},
		{regular, "You are already a member of this group or a request to join this group has already been made.", true, true},
		{exclusive, "You are already a member of this group or a request to join this group has already been made.", false, true},
	} {
		rec := groupAction(mux, cookie, c.group.ID, "join")
		if rec.Code != http.StatusOK {
			t.Fatalf("joining %s = %d %s", c.group.Name, rec.Code, rec.Body)
		}
		if got := decode[groupAnswer](t, rec).Message; got != c.want {
			t.Errorf("joining %s = %q, want %q", c.group.Name, got, c.want)
		}
		row, ok := joined(t, db, c.group.ID, frank)
		if ok != c.row || row.JoinedAt.Valid != c.joined || (ok && row.Role != "member") {
			t.Errorf("after joining %s the row = %+v, %t", c.group.Name, row, ok)
		}
	}
}

func TestAFullRegularGroupTakesNoOne(t *testing.T) {
	db, mux := newSite(t)
	regular := ownedGroup(t, db, "Regular", "open")
	unlimited := ownedGroup(t, db, "Unlimited", "unlimited")
	if err := settings.Set(t.Context(), db, 0, "groups.maxMembers", 2); err != nil {
		t.Fatal(err)
	}
	q := store.New(db)
	for _, name := range []string{"First", "Gone"} {
		habbo(t, db, strings.ToLower(name)+"@example.com", name)
		for _, g := range []store.Group{regular, unlimited} {
			if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: g.ID, AvatarID: avatarID(t, db, name), Role: "member", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
				t.Fatal(err)
			}
		}
	}
	gone := avatarID(t, db, "Gone")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, gone); err != nil {
		t.Fatal(err)
	}
	habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "late@example.com", "Late")

	// Owner and First fill it; the archived member does not count.
	if got := decode[groupAnswer](t, groupAction(mux, login(t, db, "Frank"), regular.ID, "join")).Message; got != "This group is full." {
		t.Errorf("joining a full group = %q", got)
	}
	if got := decode[groupAnswer](t, groupAction(mux, login(t, db, "Late"), unlimited.ID, "join")).Message; got != "You have now joined this group." {
		t.Errorf("joining an Unlimited group past the limit = %q", got)
	}
	if _, err := db.ExecContext(t.Context(), `DELETE FROM group_members WHERE avatar_id = ? AND group_id = ?`, avatarID(t, db, "First"), regular.ID); err != nil {
		t.Fatal(err)
	}
	if got := decode[groupAnswer](t, groupAction(mux, login(t, db, "Frank"), regular.ID, "join")).Message; got != "You have now joined this group." {
		t.Errorf("joining once there is room = %q", got)
	}
}

// joingroup.php checked the limit first, so a habbo at the limit hears of it even
// for a group it is in.
func TestTheMembershipLimitComesFirstAndCountsRequests(t *testing.T) {
	db, mux := newSite(t)
	exclusive := ownedGroup(t, db, "Exclusive", "moderated")
	regular := ownedGroup(t, db, "Regular", "open")
	if err := settings.Set(t.Context(), db, 0, "groups.maxMemberships", 1); err != nil {
		t.Fatal(err)
	}
	habbo(t, db, "frank@example.com", "Frank")
	cookie := login(t, db, "Frank")
	if got := decode[groupAnswer](t, groupAction(mux, cookie, exclusive.ID, "join")).Message; !strings.HasPrefix(got, "A request") {
		t.Fatalf("the first request = %q", got)
	}
	for _, g := range []store.Group{regular, exclusive} {
		if got := decode[groupAnswer](t, groupAction(mux, cookie, g.ID, "join")).Message; got != "You are already a member/have pending requests of 1 or more groups." {
			t.Errorf("joining %s at the limit = %q", g.Name, got)
		}
	}
	if _, ok := joined(t, db, regular.ID, avatarID(t, db, "Frank")); ok {
		t.Error("a habbo at the limit joined")
	}
}

func TestLeavingAndTheFavourite(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	other := ownedGroup(t, db, "Other", "open")
	exclusive := ownedGroup(t, db, "Exclusive", "moderated")
	userID := habbo(t, db, "frank@example.com", "Frank")
	secondHabbo(t, db, userID, "FrankToo")
	frank, frankToo := avatarID(t, db, "Frank"), avatarID(t, db, "FrankToo")
	cookie := login(t, db, "Frank")
	for _, g := range []store.Group{club, other, exclusive} {
		groupAction(mux, cookie, g.ID, "join")
	}
	q := store.New(db)
	if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: club.ID, AvatarID: frankToo, Role: "member", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatal(err)
	}
	if err := q.ClearFavouriteGroup(t.Context(), frankToo); err != nil {
		t.Fatal(err)
	}
	if _, err := q.SetFavouriteGroup(t.Context(), store.SetFavouriteGroupParams{GroupID: club.ID, AvatarID: frankToo}); err != nil {
		t.Fatal(err)
	}

	for _, id := range []int64{other.ID, club.ID} {
		if rec := groupAction(mux, cookie, id, "favourite"); rec.Code != http.StatusOK {
			t.Fatalf("favouring %d = %d %s", id, rec.Code, rec.Body)
		}
	}
	if fav, err := q.GetFavouriteGroup(t.Context(), frank); err != nil || fav.ID != club.ID {
		t.Errorf("Frank's favourite = %+v, %v, want Club alone", fav, err)
	}
	if fav, err := q.GetFavouriteGroup(t.Context(), frankToo); err != nil || fav.ID != club.ID {
		t.Errorf("FrankToo's favourite = %+v, %v, want it untouched (0086)", fav, err)
	}
	if rec := groupAction(mux, cookie, exclusive.ID, "favourite"); rec.Code != http.StatusUnprocessableEntity {
		t.Errorf("favouring a group asked to join = %d, want 422", rec.Code)
	}
	if fav, _ := q.GetFavouriteGroup(t.Context(), frank); fav.ID != club.ID {
		t.Errorf("a refused favourite cleared the old one: %+v", fav)
	}
	if rec := groupAction(mux, cookie, club.ID, "unfavourite"); rec.Code != http.StatusOK {
		t.Fatalf("unfavouring = %d", rec.Code)
	}
	if _, err := q.GetFavouriteGroup(t.Context(), frank); !store.IsNotFound(err) {
		t.Errorf("Frank still has a favourite: %v", err)
	}
	if rec := groupAction(mux, cookie, exclusive.ID, "unfavourite"); rec.Code != http.StatusUnprocessableEntity {
		t.Errorf("unfavouring a group asked to join = %d, want 422", rec.Code)
	}

	rec := groupAction(mux, cookie, club.ID, "leave")
	if rec.Code != http.StatusOK || decode[groupAnswer](t, rec).Message != "You have successfully left this group." {
		t.Fatalf("leaving = %d %s", rec.Code, rec.Body)
	}
	if _, ok := joined(t, db, club.ID, frank); ok {
		t.Error("Frank is still in the club")
	}
	if _, ok := joined(t, db, club.ID, frankToo); !ok {
		t.Error("FrankToo left with Frank")
	}
	if rec := groupAction(mux, cookie, exclusive.ID, "leave"); rec.Code != http.StatusOK {
		t.Errorf("withdrawing a request = %d", rec.Code)
	}
	if rec := groupAction(mux, cookie, club.ID, "leave"); rec.Code != http.StatusUnprocessableEntity {
		t.Errorf("leaving again = %d, want 422", rec.Code)
	}
}

func TestTheOwnerCannotLeave(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	cookie := login(t, db, "club-owner")
	if rec := groupAction(mux, cookie, club.ID, "leave"); rec.Code != http.StatusUnprocessableEntity {
		t.Errorf("the owner leaving = %d, want 422", rec.Code)
	}
	if _, ok := joined(t, db, club.ID, club.AvatarID); !ok {
		t.Error("the owner's row is gone")
	}
}

func TestMembershipActionsNeedASessionAndAGroup(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	for _, action := range []string{"join", "leave", "favourite", "unfavourite"} {
		if rec := groupAction(mux, nil, club.ID, action); rec.Code != http.StatusUnauthorized {
			t.Errorf("a guest's %s = %d, want 401", action, rec.Code)
		}
		if rec := groupAction(mux, login(t, db, "club-owner"), 9999, action); rec.Code != http.StatusNotFound {
			t.Errorf("%s on no group = %d, want 404", action, rec.Code)
		}
	}
}

func TestThePageOffersWhatTheActiveHabboMayDo(t *testing.T) {
	db, mux := newSite(t)
	groups := map[string]store.Group{}
	for name, access := range map[string]string{"Regular": "open", "Exclusive": "moderated", "Private": "closed", "Unlimited": "unlimited"} {
		groups[name] = ownedGroup(t, db, name, access)
	}
	habbo(t, db, "frank@example.com", "Frank")
	cookie := login(t, db, "Frank")
	page := func(name string, cookie *http.Cookie) string {
		t.Helper()
		return serve(mux, "GET", fmt.Sprintf("/groups/%d", groups[name].ID), cookie, nil).Body.String()
	}
	for name, want := range map[string]string{
		"Regular":   "Viewer:{Join:join Favourite: Leave:false Owner:false}",
		"Exclusive": "Viewer:{Join:request Favourite: Leave:false Owner:false}",
		"Private":   "Viewer:{Join: Favourite: Leave:false Owner:false}",
		"Unlimited": "Viewer:{Join:join Favourite: Leave:false Owner:false}",
	} {
		if body := page(name, cookie); !strings.Contains(body, want) {
			t.Errorf("a stranger on %s lacks %q", name, want)
		}
	}
	if body := page("Regular", nil); !strings.Contains(body, "Viewer:{Join: Favourite: Leave:false Owner:false}") {
		t.Error("a guest is offered something")
	}
	groupAction(mux, cookie, groups["Exclusive"].ID, "join")
	if body := page("Exclusive", cookie); !strings.Contains(body, "Viewer:{Join: Favourite: Leave:false Owner:false}") {
		t.Errorf("a habbo with a waiting request is offered to join again: %s", body)
	}
	groupAction(mux, cookie, groups["Regular"].ID, "join")
	if body := page("Regular", cookie); !strings.Contains(body, "Viewer:{Join: Favourite:make Leave:true Owner:false}") {
		t.Errorf("a member lacks Make favourite and Leave group: %s", body)
	}
	groupAction(mux, cookie, groups["Regular"].ID, "favourite")
	if body := page("Regular", cookie); !strings.Contains(body, "Viewer:{Join: Favourite:remove Leave:true Owner:false}") {
		t.Errorf("the favourite lacks Remove favourite: %s", body)
	}
	if body := page("Regular", login(t, db, "regular-owner")); !strings.Contains(body, "Viewer:{Join: Favourite:make Leave:false Owner:true}") {
		t.Errorf("the owner is offered to leave: %s", body)
	}
}
