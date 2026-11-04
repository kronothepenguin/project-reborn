package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

func TestTheStaffListShowsEachMemberOnceUnderTheHighestListedGroup(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	group := func(name string, listed bool, level int64) int64 {
		t.Helper()
		g, err := q.CreateAccessGroup(ctx, CreateAccessGroupParams{Name: name, StaffListed: listed, Level: level, CreatedAt: testNow, UpdatedAt: testNow})
		if err != nil {
			t.Fatalf("CreateAccessGroup %s: %v", name, err)
		}
		return g.ID
	}
	member := func(groupID, userID int64, display int64) {
		t.Helper()
		err := q.AddAccessGroupMember(ctx, AddAccessGroupMemberParams{
			AccessGroupID:   groupID,
			UserID:          userID,
			DisplayAvatarID: sql.NullInt64{Int64: display, Valid: display != 0},
			GrantedAt:       testNow,
		})
		if err != nil {
			t.Fatalf("AddAccessGroupMember: %v", err)
		}
	}
	habbo := func(userID int64, name string, at time.Time) int64 {
		t.Helper()
		a, err := q.CreateAvatar(ctx, CreateAvatarParams{UserID: userID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: at, UpdatedAt: at})
		if err != nil {
			t.Fatalf("CreateAvatar %s: %v", name, err)
		}
		return a.ID
	}
	archive := func(avatarID int64) {
		t.Helper()
		if _, err := db.ExecContext(ctx, `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, avatarID); err != nil {
			t.Fatal(err)
		}
	}

	admins := group("Administrators", true, 10)
	moderators := group("Moderators", true, 5)
	helpers := group("Helpers", false, 1)
	equals := group("Equals", true, 10)

	krono, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	kronoToo := habbo(krono.ID, "KronoToo", testNow.Add(time.Hour))
	member(moderators, krono.ID, 0)
	member(admins, krono.ID, kronoToo)

	beta, _ := createUserWithHabbo(t, q, "beta@example.com", "Beta")
	member(moderators, beta.ID, 0)

	helper, _ := createUserWithHabbo(t, q, "helper@example.com", "Helper")
	member(helpers, helper.ID, 0)

	tied, _ := createUserWithHabbo(t, q, "tied@example.com", "Tied")
	member(equals, tied.ID, 0)
	member(admins, tied.ID, 0)

	moved, movedFirst := createUserWithHabbo(t, q, "moved@example.com", "Moved")
	gone := habbo(moved.ID, "Gone", testNow.Add(time.Hour))
	archive(gone)
	member(moderators, moved.ID, gone)

	ghost, ghostHabbo := createUserWithHabbo(t, q, "ghost@example.com", "Ghost")
	archive(ghostHabbo.ID)
	member(admins, ghost.ID, 0)

	if _, err := q.GrantAvatarBadge(ctx, GrantAvatarBadgeParams{AvatarID: kronoToo, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	if err := q.WearAvatarBadge(ctx, WearAvatarBadgeParams{AvatarID: kronoToo, Code: "ADM"}); err != nil {
		t.Fatal(err)
	}

	rows := must(q.ListStaff(ctx))
	var got []string
	for _, row := range rows {
		got = append(got, row.Name+"/"+row.GroupName+"/"+row.Badge)
	}
	want := []string{"Beta/Moderators/", "KronoToo/Administrators/ADM", "Moved/Moderators/", "Tied/Administrators/"}
	if !slices.Equal(got, want) {
		t.Errorf("the staff = %v, want %v", got, want)
	}
	for _, row := range rows {
		if row.Name == "Moved" && row.ID != movedFirst.ID {
			t.Errorf("Moved is shown as habbo %d, want its first habbo %d", row.ID, movedFirst.ID)
		}
		if row.Name == "KronoToo" && (!row.CreatedAt.Equal(testNow.Add(time.Hour)) || row.Figure != "hd-180-1") {
			t.Errorf("KronoToo = %+v", row)
		}
	}
}
