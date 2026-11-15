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

func (f groupFixture) habbo(userID int64, name string) int64 {
	f.t.Helper()
	a, err := f.q.CreateAvatar(f.t.Context(), CreateAvatarParams{UserID: userID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		f.t.Fatalf("CreateAvatar %s: %v", name, err)
	}
	return a.ID
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

func (f groupFixture) count(query string, args ...any) int64 {
	f.t.Helper()
	var n int64
	if err := f.db.QueryRowContext(f.t.Context(), query, args...).Scan(&n); err != nil {
		f.t.Fatal(err)
	}
	return n
}

func TestGroupNamesIgnoreCase(t *testing.T) {
	f := newGroupFixture(t)
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Cool Kids")

	found, err := f.q.GetGroupByName(t.Context(), "cOOL kIDS")
	if err != nil || found.ID != g.ID {
		t.Errorf("GetGroupByName = %+v, %v, want the group", found, err)
	}
	_, err = f.q.CreateGroup(t.Context(), CreateGroupParams{AvatarID: owner, Name: "COOL KIDS", Badge: "b", Access: "open", CreatedAt: testNow, UpdatedAt: testNow})
	if !IsConflict(err) {
		t.Errorf("a second Cool Kids = %v, want a conflict", err)
	}
}

func TestOwnedGroupsCountForTheUserAndMembershipsForTheHabbo(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	userID, first := f.user("owner@example.com", "Owner")
	second := f.habbo(userID, "OwnerToo")
	_, stranger := f.user("stranger@example.com", "Stranger")
	f.group(first, "One")
	two, _ := f.group(second, "Two")
	f.group(stranger, "Theirs")

	if n, err := f.q.CountUserOwnedGroups(ctx, userID); err != nil || n != 2 {
		t.Errorf("CountUserOwnedGroups = %d, %v, want both habbos' groups", n, err)
	}

	f.member(two.ID, first, "member", testNow, false)
	if n, err := f.q.CountAvatarMemberships(ctx, first); err != nil || n != 2 {
		t.Errorf("CountAvatarMemberships = %d, %v, want its own group and its request", n, err)
	}
	if n, err := f.q.CountAvatarMemberships(ctx, second); err != nil || n != 1 {
		t.Errorf("CountAvatarMemberships of the other habbo = %d, %v, want 1", n, err)
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

func TestMembersComeAdminsFirstInTheOrderTheyAsked(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	at := func(minutes int) time.Time { return testNow.Add(time.Duration(minutes) * time.Minute) }
	for _, c := range []struct {
		name string
		role string
		at   time.Time
	}{
		{"Early", "member", at(1)},
		{"LateAdmin", "admin", at(5)},
		{"Middle", "member", at(3)},
		{"EarlyAdmin", "admin", at(2)},
		{"Last", "member", at(9)},
	} {
		_, id := f.user(c.name+"@example.com", c.name)
		f.member(g.ID, id, c.role, c.at, true)
	}

	all, err := f.q.ListGroupMembers(ctx, ListGroupMembersParams{GroupID: g.ID, RowLimit: 50})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"Owner", "EarlyAdmin", "LateAdmin", "Early", "Middle", "Last"}
	if names := memberNames(all); !slices.Equal(names, want) {
		t.Errorf("ListGroupMembers = %v, want %v", names, want)
	}
	page, err := f.q.ListGroupMembers(ctx, ListGroupMembersParams{GroupID: g.ID, RowLimit: 2, RowOffset: 2})
	if err != nil {
		t.Fatal(err)
	}
	if names := memberNames(page); !slices.Equal(names, want[2:4]) {
		t.Errorf("the second page of two = %v, want %v", names, want[2:4])
	}
	if all[0].Role != "admin" || all[3].Role != "member" || all[0].Figure != "hd-180-1.ch-215-82.lg-270-82" {
		t.Errorf("the rows lack their roles or figures: %+v", all)
	}
}

func TestRequestsComeInTheOrderTheyWereMadeAPageAtATime(t *testing.T) {
	f := newGroupFixture(t)
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	for i, name := range []string{"Third", "First", "Second"} {
		_, id := f.user(name+"@example.com", name)
		f.member(g.ID, id, "member", testNow.Add(time.Duration([]int{3, 1, 2}[i])*time.Minute), false)
	}
	page, err := f.q.ListGroupRequests(t.Context(), ListGroupRequestsParams{GroupID: g.ID, RowLimit: 2, RowOffset: 1})
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	for _, r := range page {
		names = append(names, r.Name)
	}
	if !slices.Equal(names, []string{"Second", "Third"}) {
		t.Errorf("ListGroupRequests = %v", names)
	}
}

func TestAcceptAndDeclineTouchOnlyRequests(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	_, member := f.user("member@example.com", "Member")
	_, asking := f.user("asking@example.com", "Asking")
	_, declined := f.user("declined@example.com", "Declined")
	f.member(g.ID, member, "member", testNow, true)
	f.member(g.ID, asking, "member", testNow, false)
	f.member(g.ID, declined, "member", testNow, false)

	later := testNow.Add(time.Hour)
	if n, err := f.q.AcceptGroupRequest(ctx, AcceptGroupRequestParams{GroupID: g.ID, AvatarID: member, JoinedAt: sql.NullTime{Time: later, Valid: true}}); err != nil || n != 0 {
		t.Errorf("accepting a member = %d, %v, want nothing changed", n, err)
	}
	if n, err := f.q.DeclineGroupRequest(ctx, DeclineGroupRequestParams{GroupID: g.ID, AvatarID: member}); err != nil || n != 0 {
		t.Errorf("declining a member = %d, %v, want nothing changed", n, err)
	}
	if n, err := f.q.AcceptGroupRequest(ctx, AcceptGroupRequestParams{GroupID: g.ID, AvatarID: asking, JoinedAt: sql.NullTime{Time: later, Valid: true}}); err != nil || n != 1 {
		t.Errorf("accepting a request = %d, %v", n, err)
	}
	if n, err := f.q.DeclineGroupRequest(ctx, DeclineGroupRequestParams{GroupID: g.ID, AvatarID: declined}); err != nil || n != 1 {
		t.Errorf("declining a request = %d, %v", n, err)
	}

	row, err := f.q.GetGroupMember(ctx, GetGroupMemberParams{GroupID: g.ID, AvatarID: asking})
	if err != nil || !row.JoinedAt.Valid || !row.JoinedAt.Time.Equal(later) {
		t.Errorf("the accepted row = %+v, %v", row, err)
	}
	if _, err := f.q.GetGroupMember(ctx, GetGroupMemberParams{GroupID: g.ID, AvatarID: declined}); !IsNotFound(err) {
		t.Errorf("the declined row = %v, want it gone", err)
	}
	if n, err := f.q.CountGroupMembers(ctx, g.ID); err != nil || n != 3 {
		t.Errorf("CountGroupMembers = %d, %v, want 3", n, err)
	}
}

func TestTheOwnerKeepsItsRow(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	_, member := f.user("member@example.com", "Member")
	_, asking := f.user("asking@example.com", "Asking")
	f.member(g.ID, member, "member", testNow, true)
	f.member(g.ID, asking, "member", testNow, false)

	for name, change := range map[string]func(int64) (int64, error){
		"demoted": func(id int64) (int64, error) {
			return f.q.SetGroupMemberRole(ctx, SetGroupMemberRoleParams{GroupID: g.ID, AvatarID: id, Role: "member"})
		},
		"removed": func(id int64) (int64, error) {
			return f.q.RemoveGroupMember(ctx, RemoveGroupMemberParams{GroupID: g.ID, AvatarID: id})
		},
		"leaving": func(id int64) (int64, error) {
			return f.q.LeaveGroup(ctx, LeaveGroupParams{GroupID: g.ID, AvatarID: id})
		},
	} {
		if n, err := change(owner); err != nil || n != 0 {
			t.Errorf("the owner %s = %d, %v, want nothing changed", name, n, err)
		}
	}
	if row, err := f.q.GetGroupMember(ctx, GetGroupMemberParams{GroupID: g.ID, AvatarID: owner}); err != nil || row.Role != "admin" {
		t.Errorf("the owner's row = %+v, %v", row, err)
	}

	if n, err := f.q.SetGroupMemberRole(ctx, SetGroupMemberRoleParams{GroupID: g.ID, AvatarID: asking, Role: "admin"}); err != nil || n != 0 {
		t.Errorf("promoting a request = %d, %v, want nothing changed", n, err)
	}
	if n, err := f.q.RemoveGroupMember(ctx, RemoveGroupMemberParams{GroupID: g.ID, AvatarID: asking}); err != nil || n != 0 {
		t.Errorf("removing a request = %d, %v, want nothing changed", n, err)
	}
	if n, err := f.q.SetGroupMemberRole(ctx, SetGroupMemberRoleParams{GroupID: g.ID, AvatarID: member, Role: "admin"}); err != nil || n != 1 {
		t.Errorf("promoting a member = %d, %v", n, err)
	}
	if n, err := f.q.RemoveGroupMember(ctx, RemoveGroupMemberParams{GroupID: g.ID, AvatarID: member}); err != nil || n != 1 {
		t.Errorf("removing a member = %d, %v", n, err)
	}
	if n, err := f.q.LeaveGroup(ctx, LeaveGroupParams{GroupID: g.ID, AvatarID: asking}); err != nil || n != 1 {
		t.Errorf("withdrawing a request = %d, %v", n, err)
	}
}

func TestAHabboHasOneFavouriteAmongItsGroups(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	one, _ := f.group(owner, "One")
	two, _ := f.group(owner, "Two")
	_, other := f.user("other@example.com", "Other")
	asked, _ := f.group(other, "Asked")
	f.member(asked.ID, owner, "member", testNow, false)

	favourite := func(groupID int64) int64 {
		t.Helper()
		if err := f.q.ClearFavouriteGroup(ctx, owner); err != nil {
			t.Fatal(err)
		}
		n, err := f.q.SetFavouriteGroup(ctx, SetFavouriteGroupParams{GroupID: groupID, AvatarID: owner})
		if err != nil {
			t.Fatal(err)
		}
		return n
	}
	if n := favourite(one.ID); n != 1 {
		t.Errorf("favouring One = %d", n)
	}
	if n := favourite(two.ID); n != 1 {
		t.Errorf("favouring Two = %d", n)
	}
	if got, err := f.q.GetFavouriteGroup(ctx, owner); err != nil || got.ID != two.ID || got.Badge == "" {
		t.Errorf("GetFavouriteGroup = %+v, %v, want Two", got, err)
	}
	if n := f.count(`SELECT COUNT(*) FROM group_members WHERE avatar_id = ? AND favourite`, owner); n != 1 {
		t.Errorf("%d favourites", n)
	}
	if n := favourite(asked.ID); n != 0 {
		t.Errorf("favouring a group it only asked to join = %d, want nothing changed", n)
	}
	if n, err := f.q.UnfavouriteGroup(ctx, UnfavouriteGroupParams{GroupID: one.ID, AvatarID: owner}); err != nil || n != 0 {
		t.Errorf("removing a favourite it does not have = %d, %v", n, err)
	}
	favourite(one.ID)
	if n, err := f.q.UnfavouriteGroup(ctx, UnfavouriteGroupParams{GroupID: one.ID, AvatarID: owner}); err != nil || n != 1 {
		t.Errorf("removing the favourite = %d, %v", n, err)
	}
	if _, err := f.q.GetFavouriteGroup(ctx, owner); !IsNotFound(err) {
		t.Errorf("GetFavouriteGroup after removing = %v, want none", err)
	}
}

func TestAHabbosGroupsAreTheOnesItJoined(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	own, _ := f.group(owner, "Own")
	_, other := f.user("other@example.com", "Other")
	joined, _ := f.group(other, "Joined")
	asked, _ := f.group(other, "Asked")
	f.member(asked.ID, owner, "member", testNow.Add(time.Minute), false)
	f.member(joined.ID, owner, "admin", testNow.Add(2*time.Minute), true)
	if err := f.q.ClearFavouriteGroup(ctx, owner); err != nil {
		t.Fatal(err)
	}
	if _, err := f.q.SetFavouriteGroup(ctx, SetFavouriteGroupParams{GroupID: joined.ID, AvatarID: owner}); err != nil {
		t.Fatal(err)
	}

	groups, err := f.q.ListAvatarGroups(ctx, owner)
	if err != nil {
		t.Fatal(err)
	}
	if len(groups) != 2 || groups[0].ID != own.ID || groups[1].ID != joined.ID {
		t.Fatalf("ListAvatarGroups = %+v, want Own then Joined", groups)
	}
	if g := groups[0]; g.OwnerAvatarID != owner || g.Role != "admin" || g.Favourite || g.Badge == "" {
		t.Errorf("its own group = %+v", g)
	}
	if g := groups[1]; g.OwnerAvatarID != other || g.Role != "admin" || !g.Favourite {
		t.Errorf("the joined group = %+v", g)
	}
}

func TestTypeChangesRemoveOnlyRequests(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	_, owner := f.user("owner@example.com", "Owner")
	g, _ := f.group(owner, "Club")
	_, member := f.user("member@example.com", "Member")
	_, asking := f.user("asking@example.com", "Asking")
	f.member(g.ID, member, "member", testNow, true)
	f.member(g.ID, asking, "member", testNow, false)

	err := f.q.UpdateGroup(ctx, UpdateGroupParams{ID: g.ID, Name: "Renamed", Description: "Now open", Access: "open", UpdatedAt: testNow.Add(time.Hour)})
	if err != nil {
		t.Fatal(err)
	}
	if err := f.q.DeleteGroupRequests(ctx, g.ID); err != nil {
		t.Fatal(err)
	}
	if n := f.count(`SELECT COUNT(*) FROM group_members WHERE group_id = ?`, g.ID); n != 2 {
		t.Errorf("%d rows left, want the owner and the member", n)
	}
	if got, err := f.q.GetGroup(ctx, g.ID); err != nil || got.Name != "Renamed" || got.Description != "Now open" {
		t.Errorf("GetGroup = %+v, %v", got, err)
	}
}

func TestDeletingAGroupReturnsItsHomesItemsToThoseWhoPlacedThem(t *testing.T) {
	f := newGroupFixture(t)
	ctx := t.Context()
	ownerUser, owner := f.user("owner@example.com", "Owner")
	adminUser, admin := f.user("admin@example.com", "Admin")
	g, home := f.group(owner, "Club")
	f.member(g.ID, admin, "admin", testNow, true)
	if _, err := f.db.ExecContext(ctx, `INSERT INTO home_store_categories (id, name, staff_only, position) VALUES (900, 'Test', FALSE, 90)`); err != nil {
		t.Fatal(err)
	}
	item := func(kind, name string) int64 {
		t.Helper()
		it, err := f.q.CreateHomeStoreItem(ctx, CreateHomeStoreItemParams{HomeStoreCategoryID: 900, Kind: kind, Asset: name, Name: name, Price: 1, Quantity: 1, Enabled: true})
		if err != nil {
			t.Fatal(err)
		}
		return it.ID
	}
	star, note := item("sticker", "star"), item("note", "note")
	place := func(kind string, storeItem int64, widget string, by int64) {
		t.Helper()
		_, err := f.q.CreateHomeItem(ctx, CreateHomeItemParams{
			HomeID:            home.ID,
			Kind:              kind,
			HomeStoreItemID:   sql.NullInt64{Int64: storeItem, Valid: storeItem != 0},
			Widget:            sql.NullString{String: widget, Valid: widget != ""},
			Skin:              "defaultskin",
			Body:              "text",
			CreatedByAvatarID: sql.NullInt64{Int64: by, Valid: by != 0},
			CreatedAt:         testNow,
			UpdatedAt:         testNow,
		})
		if err != nil {
			t.Fatal(err)
		}
	}
	place("widget", 0, "group_info", 0)
	place("widget", 0, "members", owner)
	place("sticker", star, "", owner)
	place("sticker", star, "", admin)
	place("sticker", star, "", admin)
	place("note", note, "", admin)
	if err := f.q.AddHomeInventory(ctx, AddHomeInventoryParams{UserID: adminUser, HomeStoreItemID: star, Quantity: 4}); err != nil {
		t.Fatal(err)
	}

	if err := f.q.ReturnHomeItemsToPlacers(ctx, home.ID); err != nil {
		t.Fatalf("ReturnHomeItemsToPlacers: %v", err)
	}
	if n, err := f.q.DeleteGroup(ctx, g.ID); err != nil || n != 1 {
		t.Fatalf("DeleteGroup = %d, %v", n, err)
	}

	for _, c := range []struct {
		user, item int64
		want       int64
	}{
		{ownerUser, star, 1},
		{adminUser, star, 6},
		{adminUser, note, 1},
		{ownerUser, note, 0},
	} {
		if n := f.count(`SELECT COALESCE(SUM(quantity), 0) FROM home_inventories WHERE user_id = ? AND home_store_item_id = ?`, c.user, c.item); n != c.want {
			t.Errorf("user %d holds %d of item %d, want %d", c.user, n, c.item, c.want)
		}
	}
	for table, query := range map[string]string{
		"group_members": `SELECT COUNT(*) FROM group_members WHERE group_id = ?`,
		"homes":         `SELECT COUNT(*) FROM homes WHERE group_id = ?`,
	} {
		if n := f.count(query, g.ID); n != 0 {
			t.Errorf("%d rows left in %s", n, table)
		}
	}
	if n := f.count(`SELECT COUNT(*) FROM home_items WHERE home_id = ?`, home.ID); n != 0 {
		t.Errorf("%d items left on the home", n)
	}
}

func TestRandomGroupsTakeTheirCount(t *testing.T) {
	f := newGroupFixture(t)
	_, owner := f.user("owner@example.com", "Owner")
	for _, name := range []string{"A", "B", "C"} {
		f.group(owner, name)
	}
	got, err := f.q.ListRandomGroups(t.Context(), 2)
	if err != nil || len(got) != 2 {
		t.Errorf("ListRandomGroups = %+v, %v, want 2", got, err)
	}
}

func memberNames(rows []ListGroupMembersRow) []string {
	names := make([]string, 0, len(rows))
	for _, r := range rows {
		names = append(names, r.Name)
	}
	return names
}
