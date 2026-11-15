package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

type groupFixture struct {
	t  *testing.T
	db *sql.DB
	q  *Queries
}

func newGroupFixture(t *testing.T) groupFixture {
	db := openTestDB(t)
	return groupFixture{t: t, db: db, q: New(db)}
}

func (f groupFixture) user(email, name string) (int64, int64) {
	f.t.Helper()
	user, avatar := createUserWithHabbo(f.t, f.q, email, name)
	return user.ID, avatar.ID
}

// group buys a group for owner as the CMS does: the group, the owner's admin row
// and the home.
func (f groupFixture) group(owner int64, name string) (Group, Home) {
	f.t.Helper()
	ctx := f.t.Context()
	g, err := f.q.CreateGroup(ctx, CreateGroupParams{AvatarID: owner, Name: name, Badge: "b0503Xs09114s05013s05015", Access: "open", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		f.t.Fatalf("CreateGroup %s: %v", name, err)
	}
	f.member(g.ID, owner, "admin", testNow, true)
	home, err := f.q.CreateGroupHome(ctx, CreateGroupHomeParams{GroupID: g.ID, UpdatedAt: testNow})
	if err != nil {
		f.t.Fatalf("CreateGroupHome: %v", err)
	}
	return g, home
}

func (f groupFixture) member(groupID, avatarID int64, role string, at time.Time, joined bool) {
	f.t.Helper()
	err := f.q.AddGroupMember(f.t.Context(), AddGroupMemberParams{
		GroupID: groupID, AvatarID: avatarID, Role: role, RequestedAt: at, JoinedAt: sql.NullTime{Time: at, Valid: joined},
	})
	if err != nil {
		f.t.Fatalf("AddGroupMember: %v", err)
	}
}

func (f groupFixture) archive(avatarID int64) {
	f.t.Helper()
	if _, err := f.db.ExecContext(f.t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, avatarID); err != nil {
		f.t.Fatal(err)
	}
}

func TestMembersAndRequestsLeaveOutArchivedHabbos(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	_, member := f.user("member@example.com", "Member")
	_, gone := f.user("gone@example.com", "Gone")
	_, asking := f.user("asking@example.com", "Asking")
	_, goneAsking := f.user("gone-asking@example.com", "GoneAsking")
	f.member(g.ID, member, "member", testNow, true)
	f.member(g.ID, gone, "admin", testNow, true)
	f.member(g.ID, asking, "member", testNow, false)
	f.member(g.ID, goneAsking, "member", testNow, false)
	f.archive(gone)
	f.archive(goneAsking)

	if n, err := f.q.CountGroupMembers(ctx, g.ID); err != nil || n != 2 {
		t.Errorf("CountGroupMembers = %d, %v, want the owner and the member", n, err)
	}
	if n, err := f.q.CountGroupRequests(ctx, g.ID); err != nil || n != 1 {
		t.Errorf("CountGroupRequests = %d, %v, want the one live request", n, err)
	}
	members, err := f.q.ListGroupMembers(ctx, ListGroupMembersParams{GroupID: g.ID, RowLimit: 50})
	if err != nil {
		t.Fatal(err)
	}
	if names := memberNames(members); !slices.Equal(names, []string{"Owner", "Member"}) {
		t.Errorf("ListGroupMembers = %v", names)
	}
	requests, err := f.q.ListGroupRequests(ctx, ListGroupRequestsParams{GroupID: g.ID, RowLimit: 50})
	if err != nil || len(requests) != 1 || requests[0].Name != "Asking" {
		t.Errorf("ListGroupRequests = %+v, %v, want Asking alone", requests, err)
	}
}

func memberNames(rows []ListGroupMembersRow) []string {
	names := make([]string, 0, len(rows))
	for _, r := range rows {
		names = append(names, r.Name)
	}
	return names
}
