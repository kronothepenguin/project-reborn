package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type memberList struct {
	Members int64 `json:"members"`
	Pending int64 `json:"pending"`
	Page    int64 `json:"page"`
	Pages   int64 `json:"pages"`
	Total   int64 `json:"total"`
	Rows    []struct {
		ID    int64  `json:"id"`
		Name  string `json:"name"`
		Owner bool   `json:"owner"`
		Admin bool   `json:"admin"`
	} `json:"rows"`
}

// crowd adds habbos to a group, named prefix0, prefix1, ..., joined or asking.
func crowd(t *testing.T, db *sql.DB, group store.Group, prefix string, n int, role string, joined bool) []int64 {
	t.Helper()
	q := store.New(db)
	ids := make([]int64, 0, n)
	for i := range n {
		name := fmt.Sprintf("%s%d", prefix, i)
		habbo(t, db, strings.ToLower(name)+"@example.com", name)
		id := avatarID(t, db, name)
		at := testNow.Add(time.Duration(i+1) * time.Minute)
		if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: group.ID, AvatarID: id, Role: role, RequestedAt: at, JoinedAt: sql.NullTime{Time: at, Valid: joined}}); err != nil {
			t.Fatal(err)
		}
		ids = append(ids, id)
	}
	return ids
}

func membersPage(mux *http.ServeMux, cookie *http.Cookie, groupID int64, query string) *httptest.ResponseRecorder {
	return getJSON(mux, fmt.Sprintf("/groups/%d/members%s", groupID, query), cookie)
}

func memberAction(mux *http.ServeMux, cookie *http.Cookie, groupID, member int64, action string) *httptest.ResponseRecorder {
	return edit(mux, cookie, fmt.Sprintf("/groups/%d/members/%d/%s", groupID, member, action), map[string]any{})
}

func TestTheMemberListComesTwelveAPage(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "moderated")
	crowd(t, db, club, "Admin", 2, "admin", true)
	crowd(t, db, club, "Member", 13, "member", true)
	crowd(t, db, club, "Asker", 3, "member", false)
	owner := login(t, db, "club-owner")

	first := decode[memberList](t, membersPage(mux, owner, club.ID, ""))
	if first.Members != 16 || first.Pending != 3 || first.Total != 16 || first.Pages != 2 || first.Page != 1 || len(first.Rows) != 12 {
		t.Fatalf("the first page = %+v", first)
	}
	if r := first.Rows[0]; r.Name != "club-owner" || !r.Owner || !r.Admin {
		t.Errorf("the first row = %+v, want the owner", r)
	}
	if r := first.Rows[1]; r.Name != "Admin0" || r.Owner || !r.Admin {
		t.Errorf("the second row = %+v, want an admin", r)
	}
	if r := first.Rows[3]; r.Name != "Member0" || r.Admin {
		t.Errorf("the fourth row = %+v, want the first member", r)
	}
	second := decode[memberList](t, membersPage(mux, owner, club.ID, "?page=2"))
	if second.Page != 2 || len(second.Rows) != 4 || second.Rows[3].Name != "Member12" {
		t.Errorf("the second page = %+v", second)
	}
	for _, query := range []string{"?page=3", "?page=0", "?page=x"} {
		if got := decode[memberList](t, membersPage(mux, owner, club.ID, query)); got.Page != 1 {
			t.Errorf("%s gave page %d, want Holo's first", query, got.Page)
		}
	}
	pending := decode[memberList](t, membersPage(mux, owner, club.ID, "?pending=true"))
	if pending.Total != 3 || len(pending.Rows) != 3 || pending.Rows[0].Name != "Asker0" || pending.Rows[0].Admin {
		t.Errorf("the requests = %+v", pending)
	}
}

func TestOnlyAnAdminsActiveHabboSeesAndManagesTheMembers(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "moderated")
	member := crowd(t, db, club, "Member", 1, "member", true)[0]
	asker := crowd(t, db, club, "Asker", 1, "member", false)[0]
	ownerUser := countRows(t, db, "SELECT user_id FROM avatars WHERE id = ?", club.AvatarID)
	secondHabbo(t, db, ownerUser, "OwnerToo")
	for name, cookie := range map[string]*http.Cookie{
		"a member":                login(t, db, "Member0"),
		"a habbo asking":          login(t, db, "Asker0"),
		"the owner's other habbo": login(t, db, "OwnerToo"),
	} {
		if rec := membersPage(mux, cookie, club.ID, ""); rec.Code != http.StatusForbidden {
			t.Errorf("%s listing = %d, want 403", name, rec.Code)
		}
		if rec := memberAction(mux, cookie, club.ID, asker, "accept"); rec.Code != http.StatusForbidden {
			t.Errorf("%s accepting = %d, want 403", name, rec.Code)
		}
	}
	if rec := membersPage(mux, nil, club.ID, ""); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest listing = %d, want 401", rec.Code)
	}
	if row, _ := joined(t, db, club.ID, asker); row.JoinedAt.Valid {
		t.Error("someone without the right accepted the request")
	}

	owner := login(t, db, "club-owner")
	if rec := memberAction(mux, owner, club.ID, member, "promote"); rec.Code != http.StatusOK {
		t.Fatalf("promoting = %d %s", rec.Code, rec.Body)
	}
	// An admin who is not the owner manages the members too.
	if rec := memberAction(mux, login(t, db, "Member0"), club.ID, asker, "accept"); rec.Code != http.StatusOK {
		t.Errorf("an admin accepting = %d %s", rec.Code, rec.Body)
	}
}

func TestEachActionTouchesOnlyWhatHoloMeant(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "moderated")
	members := crowd(t, db, club, "Member", 3, "member", true)
	askers := crowd(t, db, club, "Asker", 2, "member", false)
	owner := login(t, db, "club-owner")
	act := func(member int64, action string) int {
		t.Helper()
		return memberAction(mux, owner, club.ID, member, action).Code
	}

	for _, c := range []struct {
		member int64
		action string
		want   int
	}{
		{askers[0], "accept", http.StatusOK},
		{members[0], "accept", http.StatusUnprocessableEntity},
		{askers[1], "decline", http.StatusOK},
		{members[1], "decline", http.StatusUnprocessableEntity},
		{members[1], "promote", http.StatusOK},
		{askers[1], "promote", http.StatusUnprocessableEntity},
		{members[1], "demote", http.StatusOK},
		{club.AvatarID, "demote", http.StatusUnprocessableEntity},
		{club.AvatarID, "remove", http.StatusUnprocessableEntity},
		{members[2], "remove", http.StatusOK},
		{members[2], "remove", http.StatusUnprocessableEntity},
	} {
		if got := act(c.member, c.action); got != c.want {
			t.Errorf("%s of %d = %d, want %d", c.action, c.member, got, c.want)
		}
	}
	for _, path := range []string{
		fmt.Sprintf("/groups/%d/members/%d/ban", club.ID, members[0]),
		fmt.Sprintf("/groups/%d/members/x/accept", club.ID),
		fmt.Sprintf("/groups/9999/members/%d/accept", members[0]),
	} {
		if rec := edit(mux, owner, path, map[string]any{}); rec.Code != http.StatusNotFound {
			t.Errorf("POST %s = %d, want 404", path, rec.Code)
		}
	}

	if row, ok := joined(t, db, club.ID, askers[0]); !ok || !row.JoinedAt.Valid {
		t.Errorf("the accepted request = %+v, %t", row, ok)
	}
	if _, ok := joined(t, db, club.ID, askers[1]); ok {
		t.Error("the declined request is still there")
	}
	if row, _ := joined(t, db, club.ID, members[1]); row.Role != "member" {
		t.Errorf("the demoted member = %+v", row)
	}
	if row, _ := joined(t, db, club.ID, club.AvatarID); row.Role != "admin" {
		t.Errorf("the owner = %+v, want still an admin", row)
	}
	if _, ok := joined(t, db, club.ID, members[2]); ok {
		t.Error("the removed member is still there")
	}
}
