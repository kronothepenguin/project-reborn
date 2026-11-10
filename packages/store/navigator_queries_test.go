package store

import (
	"slices"
	"strings"
	"testing"
)

// Holo's navigator, as the update 0010-navigator.sql seeds it (plans/server decision 0055).
func TestANewDatabaseHasHolosNavigator(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()

	categories := must(q.ListRoomCategories(ctx))
	if len(categories) != 15 {
		t.Errorf("%d categories, want Holo's 15 without BattleBall and SnowStorm", len(categories))
	}
	byID := map[int64]RoomCategory{}
	for _, c := range categories {
		byID[c.ID] = c
		if c.ID <= 0 {
			t.Errorf("category %q has the id %d, which ends the client's list of nodes", c.Name, c.ID)
		}
	}
	if byID[3].Name != "Public Rooms" || byID[3].Kind != "public" || byID[4].Name != "Guestrooms" || byID[4].Kind != "rooms" {
		t.Errorf("roots = %+v and %+v, want Public Rooms and Guestrooms", byID[3], byID[4])
	}
	if staff, mods := byID[10], byID[24]; staff.MinLevel != 7 || mods.MinLevel != 6 || !staff.Trading {
		t.Errorf("Staff's Rooms %+v and Moderators Rooms %+v, want levels 7 and 6", staff, mods)
	}
	if none := byID[2]; none.Name != "No category" || none.ParentID.Int64 != 4 {
		t.Errorf("No category = %+v, want id 2 under Guestrooms", none)
	}

	models := must(q.ListRoomModels(ctx))
	var habbo, club []string
	for _, m := range models {
		if m.HabboRooms {
			habbo = append(habbo, m.Name)
		}
		if m.ClubOnly {
			club = append(club, m.Name)
		}
		if strings.ContainsAny(m.Heightmap+m.PublicItems, "\r\x01") || strings.HasSuffix(m.Heightmap, "\n") {
			t.Errorf("model %s keeps a carriage return, a character 1 or an empty last row", m.Name)
		}
	}
	if len(models) != 42 || strings.Join(habbo, "") != "abcdefghijklmnopqr" || strings.Join(club, "") != "ghopqr" {
		t.Errorf("%d models, habbo rooms %v, club %v; want 42, a to r, and g, h, o to r", len(models), habbo, club)
	}

	public := must(q.ListPublicRooms(ctx))
	if len(public) != 12 || public[0].Name != "Welcome Lounge" || public[0].Unit != "welcome_lounge" || public[0].MaxVisitors != 35 {
		t.Fatalf("%d public rooms, the first %+v; want 12, the Welcome Lounge first", len(public), public[0])
	}
	for _, room := range public {
		if byID[room.RoomCategoryID].Kind != "public" || !slices.ContainsFunc(models, func(m RoomModel) bool { return m.ID == room.RoomModelID }) {
			t.Errorf("public room %s is in category %d or on model %d, which do not fit", room.Name, room.RoomCategoryID, room.RoomModelID)
		}
	}
}

func TestOnlyARoomsOwnerChangesOrDeletesIt(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, owner := createUserWithHabbo(t, q, "owner@example.com", "Owner")
	_, other := createUserWithHabbo(t, q, "other@example.com", "Other")
	room := must(q.CreateRoom(ctx, CreateRoomParams{AvatarID: owner.ID, RoomCategoryID: 2, RoomModelID: 1, Name: "Den", Door: "open", ShowOwner: true, CreatedAt: testNow}))
	if room.CreatorAvatarID != owner.ID || room.OwnerAvatarID != owner.ID || room.MaxVisitors != 25 {
		t.Errorf("room = %+v, want Owner's, with 25 visitors", room)
	}

	if n := must(q.UpdateRoomInfo(ctx, UpdateRoomInfoParams{ID: room.ID, OwnerAvatarID: other.ID, Name: "Mine", Door: "closed", UpdatedAt: testNow})); n != 0 {
		t.Error("another habbo renamed the room")
	}
	if n := must(q.UpdateRoomInfo(ctx, UpdateRoomInfoParams{ID: room.ID, OwnerAvatarID: owner.ID, Name: "Lair", Door: "password", UpdatedAt: testNow})); n != 1 {
		t.Error("the owner could not rename the room")
	}
	if _, err := q.UpdateRoomInfo(ctx, UpdateRoomInfoParams{ID: room.ID, OwnerAvatarID: owner.ID, Name: "Lair", Door: "locked", UpdatedAt: testNow}); err == nil {
		t.Error("a door the client does not know was saved")
	}
	if got := must(q.GetRoom(ctx, room.ID)); got.Name != "Lair" || got.Door != "password" || got.OwnerName != "Owner" {
		t.Errorf("room = %+v, want Lair behind a password, Owner's", got)
	}

	if err := q.AddFavouriteRoom(ctx, AddFavouriteRoomParams{AvatarID: other.ID, RoomID: room.ID, CreatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	if n := must(q.DeleteRoom(ctx, DeleteRoomParams{ID: room.ID, OwnerAvatarID: other.ID})); n != 0 {
		t.Error("another habbo deleted the room")
	}
	if n := must(q.DeleteRoom(ctx, DeleteRoomParams{ID: room.ID, OwnerAvatarID: owner.ID})); n != 1 {
		t.Error("the owner could not delete the room")
	}
	if n := must(q.CountFavouriteRooms(ctx, other.ID)); n != 0 {
		t.Errorf("the deleted room is still a favourite of %d", n)
	}
}

func TestAFavouriteNamesOneRoomOnce(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	room := must(q.CreateRoom(ctx, CreateRoomParams{AvatarID: frank.ID, RoomCategoryID: 2, RoomModelID: 1, Name: "Den", Door: "open", CreatedAt: testNow}))

	for range 2 {
		if err := q.AddFavouritePublicRoom(ctx, AddFavouritePublicRoomParams{AvatarID: frank.ID, PublicRoomID: 101, CreatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
		if err := q.AddFavouriteRoom(ctx, AddFavouriteRoomParams{AvatarID: frank.ID, RoomID: room.ID, CreatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	if n := must(q.CountFavouriteRooms(ctx, frank.ID)); n != 2 {
		t.Errorf("%d favourites, want the public room and the room once each", n)
	}
	if got := must(q.ListFavouritePublicRooms(ctx, frank.ID)); !slices.Equal(got, []int64{101}) {
		t.Errorf("favourite public rooms = %v, want 101", got)
	}
	if got := must(q.ListFavouriteRooms(ctx, frank.ID)); len(got) != 1 || got[0].ID != room.ID {
		t.Errorf("favourite rooms = %+v, want Den", got)
	}

	for _, statement := range []string{
		`INSERT INTO favourite_rooms (avatar_id, public_room_id, room_id, created_at) VALUES (?, 101, ?, ?)`,
		`INSERT INTO favourite_rooms (avatar_id, public_room_id, room_id, created_at) VALUES (?, NULL, NULL, ?)`,
	} {
		args := []any{frank.ID, room.ID, testNow}
		if strings.Count(statement, "?") == 2 {
			args = []any{frank.ID, testNow}
		}
		if _, err := db.ExecContext(ctx, statement, args...); err == nil {
			t.Errorf("a favourite naming both rooms or neither was saved: %s", statement)
		}
	}
}

func TestSearchRoomsMatchesTheNameOrTheOwner(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, frank := createUserWithHabbo(t, q, "frank@example.com", "Frank")
	_, party := createUserWithHabbo(t, q, "party@example.com", "Party")
	for _, room := range []struct {
		owner int64
		name  string
	}{{frank.ID, "Party Hall"}, {frank.ID, "100% fun"}, {frank.ID, "Quiet"}, {party.ID, "Lounge"}} {
		must(q.CreateRoom(ctx, CreateRoomParams{AvatarID: room.owner, RoomCategoryID: 2, RoomModelID: 1, Name: room.name, Door: "open", ShowOwner: true, CreatedAt: testNow}))
	}

	names := func(rows []SearchRoomsRow) []string {
		var got []string
		for _, r := range rows {
			got = append(got, r.Name)
		}
		return got
	}
	if got := names(must(q.SearchRooms(ctx, SearchRoomsParams{NamePattern: "%party%", OwnerName: "party", MaxRooms: 30}))); !slices.Equal(got, []string{"Party Hall", "Lounge"}) {
		t.Errorf("a search for party found %v, want the room named so and the rooms of Party, whose name matches without case", got)
	}
	if got := names(must(q.SearchRooms(ctx, SearchRoomsParams{NamePattern: "%none%", OwnerName: "Party", MaxRooms: 30}))); !slices.Equal(got, []string{"Lounge"}) {
		t.Errorf("a search for Party's rooms found %v, want Lounge", got)
	}
	if got := names(must(q.SearchRooms(ctx, SearchRoomsParams{NamePattern: "%!%%", OwnerName: "%", MaxRooms: 30}))); !slices.Equal(got, []string{"100% fun"}) {
		t.Errorf("a search for %% found %v, want only the room with a %% in its name", got)
	}
	if got := must(q.SearchRooms(ctx, SearchRoomsParams{NamePattern: "%", OwnerName: "", MaxRooms: 2})); len(got) != 2 {
		t.Errorf("a search capped at 2 found %d rooms", len(got))
	}
}

// A room that hides its owner never comes up in a search for the owner's name, except for the owner and for a viewer
// who sees hidden owners; its own name still finds it.
func TestASearchNeverGivesAHiddenOwnerAway(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, shy := createUserWithHabbo(t, q, "shy@example.com", "Shy")
	_, other := createUserWithHabbo(t, q, "other@example.com", "Other")
	must(q.CreateRoom(ctx, CreateRoomParams{AvatarID: shy.ID, RoomCategoryID: 2, RoomModelID: 1, Name: "Hideout", Door: "open", ShowOwner: false, CreatedAt: testNow}))

	search := func(viewer int64, seeHidden int64, owner, pattern string) int {
		return len(must(q.SearchRooms(ctx, SearchRoomsParams{OwnerName: owner, ViewerAvatarID: viewer, SeeHiddenOwners: seeHidden, NamePattern: pattern, MaxRooms: 30})))
	}
	if n := search(other.ID, 0, "Shy", "%Shy%"); n != 0 {
		t.Errorf("a search for Shy found %d rooms of Shy's that hide their owner", n)
	}
	if n := search(other.ID, 0, "Hideout", "%Hideout%"); n != 1 {
		t.Errorf("a search for the room's name found %d rooms, want 1", n)
	}
	if n := search(shy.ID, 0, "Shy", "%Shy%"); n != 1 {
		t.Errorf("Shy's search for its own name found %d rooms, want its room", n)
	}
	if n := search(other.ID, 1, "Shy", "%Shy%"); n != 1 {
		t.Errorf("a viewer who sees hidden owners found %d rooms, want 1", n)
	}
}
