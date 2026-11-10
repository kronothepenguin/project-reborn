package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// S3's second exit criterion, in one session: a Go test client browses the public categories with Holo's public
// rooms and a category of habbo rooms, at most 30; a category's parents and the categories its level may use; its
// own rooms; a search, at most 30 rooms; three recommended rooms; and its favourites, adding and removing one, with
// 33 past 30.
func TestAClientBrowsesTheNavigator(t *testing.T) {
	owner := habboWithTickets(t, "Navigator", "navigator")
	var rooms []int64
	for i := range 31 {
		rooms = append(rooms, newRoom(t, owner, 29, fmt.Sprintf("Theme %02d", i), true))
	}
	c, _ := login(t, "navigator")

	if _, nodes := navigate(t, c, 0, 3); len(nodes) != 4 || nodes[3].Name != "Welcome Lounge" {
		t.Errorf("Public Rooms = %+v, want its two categories and the Welcome Lounge", nodes)
	}
	if _, nodes := navigate(t, c, 0, 29); nodes[0].Name != "Theme Rooms" || len(nodes[0].Flats) != 30 {
		t.Errorf("Theme Rooms lists %d rooms, want 30 of its 31", len(nodes[0].Flats))
	}
	c.send(t, 156, vl64String(t, 29))
	if id, body := c.next(t); id != 227 || !strings.HasPrefix(body, vl64String(t, 29)+"Theme Rooms\x02"+vl64String(t, 4)+"Guestrooms\x02") {
		t.Errorf("parent chain %d %q, want Theme Rooms under Guestrooms", id, body)
	}
	c.send(t, 151, "")
	if id, body := c.next(t); id != 221 || len(readCategories(t, body)) != 7 {
		t.Errorf("GETUSERFLATCATS got %d with %v, want the seven a level 0 habbo may use", id, readCategories(t, body))
	}
	c.send(t, 16, "Navigator")
	if id, body := c.next(t); id != 16 || len(readFlatLines(t, body)) != 31 {
		t.Errorf("own rooms: %d with %d rooms, want 16 with 31", id, len(readFlatLines(t, body)))
	}
	c.send(t, 17, "Theme")
	if id, body := c.next(t); id != 55 || len(readFlatLines(t, body)) != 30 {
		t.Errorf("a search for Theme got %d with %d rooms, want 55 with 30", id, len(readFlatLines(t, body)))
	}
	c.send(t, 264, "")
	if id, body := c.next(t); id != 351 || readInt(t, strings.NewReader(body)) != 3 {
		t.Errorf("recommended rooms: %d %q, want three", id, body)
	}

	for _, id := range rooms[:30] {
		c.send(t, 19, vl64String(t, 0, int32(id)))
	}
	c.send(t, 19, vl64String(t, 0, int32(rooms[30])))
	if id, body := c.next(t); id != 33 || body != "Only 10 favorite rooms allowed!" {
		t.Errorf("the 31st favourite got %d %q, want 33", id, body)
	}
	c.send(t, 20, vl64String(t, 0, int32(rooms[0])))
	if flats, _ := favourites(t, c); len(flats) != 29 {
		t.Errorf("%d favourites, want 29 after removing one", len(flats))
	}
}

// S3's third exit criterion: a habbo creates a room with the room-o-matic, up to 50, with a club model only with the
// club fuse and in a category its level allows; sets its description, its password, stored hashed, its furniture
// rights and its visitors; changes its name, door and category; and deletes it.
func TestAHabboBuildsChangesAndDeletesARoom(t *testing.T) {
	builder := habboWithTickets(t, "Mason", "mason")
	for i := range 49 {
		newRoom(t, builder, 2, fmt.Sprintf("Old %02d", i), true)
	}
	c, _ := login(t, "mason")

	if got, _ := createFlat(t, c, "Club villa", "g", "open"); got != 33 {
		t.Errorf("a club model without the club fuse got %d, want 33", got)
	}
	got, body := createFlat(t, c, "Fiftieth", "b", "open")
	if got != 59 {
		t.Fatalf("the 50th room got %d, want 59", got)
	}
	id := createdID(t, body)
	flat := strconv.FormatInt(id, 10)
	if got, _ := createFlat(t, c, "Fifty-first", "b", "open"); got != 33 {
		t.Errorf("the 51st room got %d, want 33", got)
	}

	c.send(t, 153, vl64String(t, int32(id), 10))
	c.send(t, 153, vl64String(t, int32(id), 28))
	c.send(t, 25, "/"+flat+"/\rdescription=Built\rpassword=letmein\rallsuperuser=1")
	settle(t, c)
	r := getRoom(t, id)
	if r.RoomCategoryID != 28 || r.Description != "Built" || !r.OthersMoveFurni {
		t.Errorf("room = %+v, want Chil Rooms, Built and others moving furniture; Staff's Rooms is above the habbo", r)
	}
	if ok, _ := auth.VerifyPassword(r.PasswordHash.String, "letmein"); !ok {
		t.Error("the password is not stored as a hash of letmein")
	}

	c.send(t, 24, flat+"/Renamed/password/0")
	c.send(t, 25, flat+"/\rdescription=Built\rallsuperuser=0\rmaxvisitors=15")
	c.send(t, 153, vl64String(t, int32(id), 29))
	settle(t, c)
	if r := getRoom(t, id); r.Name != "Renamed" || r.Door != "password" || r.ShowOwner || r.MaxVisitors != 15 || r.RoomCategoryID != 29 {
		t.Errorf("room = %+v, want Renamed, behind its password, its owner hidden, 15 visitors, in Theme Rooms", r)
	}

	c.send(t, 23, flat)
	c.send(t, 16, "Mason")
	if id, body := c.next(t); id != 16 || len(readFlatLines(t, body)) != 49 {
		t.Errorf("own rooms after the deletion: %d with %d, want 49", id, len(readFlatLines(t, body)))
	}
}
