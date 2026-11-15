package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func saveSettings(mux *http.ServeMux, cookie *http.Cookie, groupID int64, name, description, access string) *httptest.ResponseRecorder {
	return edit(mux, cookie, fmt.Sprintf("/groups/%d/settings", groupID), map[string]string{"name": name, "description": description, "access": access})
}

func TestTheOwnerChangesTheSettings(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	owner := login(t, db, "club-owner")

	rec := saveSettings(mux, owner, club.ID, "  New Club  ", "  New text  ", "moderated")
	if rec.Code != http.StatusOK || decode[groupAnswer](t, rec).Message != "Editing group settings successful" {
		t.Fatalf("saving = %d %s", rec.Code, rec.Body)
	}
	got, err := store.New(db).GetGroup(t.Context(), club.ID)
	if err != nil || got.Name != "New Club" || got.Description != "New text" || got.Access != "moderated" {
		t.Errorf("the group = %+v, %v", got, err)
	}
	if rec := saveSettings(mux, owner, club.ID, "new club", "", "moderated"); rec.Code != http.StatusOK {
		t.Errorf("keeping its own name in other case and emptying the text = %d %s", rec.Code, rec.Body)
	}
	if got, _ := store.New(db).GetGroup(t.Context(), club.ID); got.Name != "new club" || got.Description != "" {
		t.Errorf("the group = %+v", got)
	}
}

func TestTheSettingsRefuseAsHoloDid(t *testing.T) {
	for _, c := range []struct {
		name   string
		from   string
		group  string
		text   string
		access string
		want   string
	}{
		{"leaving Unlimited", "unlimited", "Club", "Text", "open", "You may not change the group type if it is set to 3."},
		{"leaving Unlimited with a bad name too", "unlimited", "", "Text", "moderated", "You may not change the group type if it is set to 3."},
		{"a type that is none", "open", "Club", "Text", "secret", "Invalid group type."},
		{"a name over 25", "open", strings.Repeat("x", 26), "Text", "open", "Name too long"},
		{"a text over 200", "open", "Club", strings.Repeat("y", 201), "open", "Description too long"},
		{"a blank name", "open", "   ", "Text", "open", "Please give a name"},
		{"a taken name", "open", "oTHER", "Text", "open", "A group with this name already exists."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			club := ownedGroup(t, db, "Club", c.from)
			ownedGroup(t, db, "Other", "open")
			rec := saveSettings(mux, login(t, db, "club-owner"), club.ID, c.group, c.text, c.access)
			if rec.Code != http.StatusUnprocessableEntity || decode[groupAnswer](t, rec).Error != c.want {
				t.Errorf("saving = %d %s, want %q", rec.Code, rec.Body, c.want)
			}
			if got, _ := store.New(db).GetGroup(t.Context(), club.ID); got.Name != "Club" || got.Access != c.from {
				t.Errorf("the group changed: %+v", got)
			}
		})
	}
}

func TestAnUnlimitedGroupStaysUnlimited(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "unlimited")
	if rec := saveSettings(mux, login(t, db, "club-owner"), club.ID, "Club", "Text", "unlimited"); rec.Code != http.StatusOK {
		t.Errorf("saving an Unlimited group as Unlimited = %d %s", rec.Code, rec.Body)
	}
	open := ownedGroup(t, db, "Open", "open")
	if rec := saveSettings(mux, login(t, db, "open-owner"), open.ID, "Open", "Text", "unlimited"); rec.Code != http.StatusOK {
		t.Errorf("choosing Unlimited = %d %s", rec.Code, rec.Body)
	}
}

// Holo removed a request only when its habbo next viewed the group; the port
// removes them all when the type leaves Exclusive.
func TestLeavingExclusiveRemovesTheRequests(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "moderated")
	q := store.New(db)
	for i, name := range []string{"Member", "Asker"} {
		habbo(t, db, strings.ToLower(name)+"@example.com", name)
		err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: club.ID, AvatarID: avatarID(t, db, name), Role: "member", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: i == 0}})
		if err != nil {
			t.Fatal(err)
		}
	}
	owner := login(t, db, "club-owner")
	saveSettings(mux, owner, club.ID, "Club", "Text", "moderated")
	if n := countRows(t, db, "SELECT COUNT(*) FROM group_members WHERE group_id = ? AND joined_at IS NULL", club.ID); n != 1 {
		t.Fatalf("staying Exclusive left %d requests, want 1", n)
	}
	saveSettings(mux, owner, club.ID, "Club", "Text", "closed")
	if n := countRows(t, db, "SELECT COUNT(*) FROM group_members WHERE group_id = ?", club.ID); n != 2 {
		t.Errorf("%d rows left, want the owner and the member", n)
	}
}

func TestOnlyTheOwnersActiveHabboChangesOrDeletesTheGroup(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	ownerUser := countRows(t, db, "SELECT user_id FROM avatars WHERE id = ?", club.AvatarID)
	secondHabbo(t, db, ownerUser, "OwnerToo")
	habbo(t, db, "admin@example.com", "Admin")
	q := store.New(db)
	if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: club.ID, AvatarID: avatarID(t, db, "Admin"), Role: "admin", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatal(err)
	}
	ownerToo := login(t, db, "OwnerToo")
	for name, cookie := range map[string]*http.Cookie{"an admin": login(t, db, "Admin"), "the owner's other habbo": ownerToo} {
		if rec := saveSettings(mux, cookie, club.ID, "Mine", "Text", "open"); rec.Code != http.StatusForbidden {
			t.Errorf("%s saving = %d, want 403", name, rec.Code)
		}
		if rec := groupAction(mux, cookie, club.ID, "delete"); rec.Code != http.StatusForbidden {
			t.Errorf("%s deleting = %d, want 403", name, rec.Code)
		}
	}
	if rec := saveSettings(mux, nil, club.ID, "Mine", "Text", "open"); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest saving = %d, want 401", rec.Code)
	}
	if rec := groupAction(mux, nil, club.ID, "delete"); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest deleting = %d, want 401", rec.Code)
	}
	if got, _ := q.GetGroup(t.Context(), club.ID); got.Name != "Club" {
		t.Errorf("the group changed: %+v", got)
	}
	if body := serve(mux, "GET", fmt.Sprintf("/groups/%d", club.ID), login(t, db, "club-owner"), nil).Body.String(); !strings.Contains(body, "Admin:true Owner:true Me:") {
		t.Errorf("the owner's page lacks the Edit menu: %s", body)
	}
	if body := serve(mux, "GET", fmt.Sprintf("/groups/%d", club.ID), ownerToo, nil).Body.String(); !strings.Contains(body, "Admin:false Owner:false Me:") {
		t.Errorf("the owner's other habbo gets the Edit menu: %s", body)
	}
}

func TestDeletingAGroupReturnsItsItems(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	ownerUser := countRows(t, db, "SELECT user_id FROM avatars WHERE id = ?", club.AvatarID)
	memberUser := habbo(t, db, "member@example.com", "Member")
	member := avatarID(t, db, "Member")
	q := store.New(db)
	if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: club.ID, AvatarID: member, Role: "admin", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatal(err)
	}
	home, err := q.GetGroupHome(t.Context(), club.ID)
	if err != nil {
		t.Fatal(err)
	}
	var sticker int64
	if err := db.QueryRowContext(t.Context(), `SELECT id FROM home_store_items WHERE kind = 'sticker' LIMIT 1`).Scan(&sticker); err != nil {
		t.Fatal(err)
	}
	for _, by := range []int64{club.AvatarID, member, member} {
		if _, err := q.CreateHomeItem(t.Context(), store.CreateHomeItemParams{HomeID: home.ID, Kind: "sticker", HomeStoreItemID: sql.NullInt64{Int64: sticker, Valid: true}, X: 1, Y: 1, Z: 1, CreatedByAvatarID: sql.NullInt64{Int64: by, Valid: true}, CreatedAt: testNow, UpdatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	note := placeNote(t, db, home.ID, "Bye")
	if _, err := db.ExecContext(t.Context(), `UPDATE home_items SET created_by_avatar_id = ? WHERE id = ?`, member, note); err != nil {
		t.Fatal(err)
	}

	rec := groupAction(mux, login(t, db, "club-owner"), club.ID, "delete")
	if rec.Code != http.StatusOK || decode[groupAnswer](t, rec).Message != "The group has been deleted successfully." {
		t.Fatalf("deleting = %d %s", rec.Code, rec.Body)
	}
	if _, err := q.GetGroup(t.Context(), club.ID); !store.IsNotFound(err) {
		t.Errorf("the group is still there: %v", err)
	}
	for user, want := range map[int64]int64{ownerUser: 1, memberUser: 2} {
		if n := countRows(t, db, "SELECT COALESCE(SUM(quantity), 0) FROM home_inventories WHERE user_id = ? AND home_store_item_id = ?", user, sticker); n != want {
			t.Errorf("user %d got %d stickers back, want %d", user, n, want)
		}
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM home_inventories JOIN home_store_items ON home_store_items.id = home_inventories.home_store_item_id WHERE user_id = ? AND kind = 'note'", memberUser); n != 1 {
		t.Errorf("the member's note did not come back: %d", n)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM group_members WHERE group_id = ?", club.ID) + countRows(t, db, "SELECT COUNT(*) FROM homes WHERE group_id = ?", club.ID); n != 0 {
		t.Errorf("%d memberships or homes left", n)
	}
}
