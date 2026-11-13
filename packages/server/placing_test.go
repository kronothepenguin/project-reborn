package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// object writes a floor furni as 32, 93 and 95 carry one, with no state.
func object(t *testing.T, id int64, sprite string, x, y, length, width, direction int32, altitude, colours string) string {
	t.Helper()
	return fmt.Sprintf("%d\x02%s\x02%s%s\x02%s\x02\x02%s\x02", id, sprite, vl64String(t, x, y, length, width, direction), altitude, colours, vl64String(t, 0))
}

// expectAll wants every client's next message that is not a status to be id with body.
func expectAll(t *testing.T, clients []*client, id int, body string) {
	t.Helper()
	for i, c := range clients {
		if gotID, gotBody := c.nextSkipping(t, 34); gotID != id || gotBody != body {
			t.Fatalf("client %d received %d %q, want %d %q", i, gotID, gotBody, id, body)
		}
	}
}

// awaitStatus reads the client's statuses until the habbo of that index has one that holds part.
func (c *client) awaitStatus(t *testing.T, index, part string) string {
	t.Helper()
	for {
		if line := statusLines(c.nextBody(t, 34))[index]; strings.Contains(line, part) {
			return line
		}
	}
}

func furniRow(t *testing.T, id int64) store.Furni {
	t.Helper()
	f, err := store.New(testDB).GetFurni(t.Context(), id)
	if err != nil {
		t.Fatalf("GetFurni: %v", err)
	}
	return f
}

// The owner and a habbo with rights place furni from their own hands and move the room's; only the owner picks up,
// and keeps what it picks up (decision server/0103). Furni stacks by Holo's rules, never stands on a habbo, and
// is still in its place when the room loads again.
func TestFurnishingARoom(t *testing.T) {
	ownerID := habboWithTickets(t, "Decorator", "decorator", "decorator-again")
	helperID := habboWithTickets(t, "Helper", "helper")
	habboWithTickets(t, "Bystander", "bystander")
	flat := newRoom(t, ownerID, 2, "Workshop", true)
	lamp := giveFurni(t, ownerID, 1279, "")
	second := giveFurni(t, ownerID, 1279, "")
	die := giveFurni(t, ownerID, 101, "")
	chair := giveFurni(t, ownerID, 463, "")
	poster := giveFurni(t, ownerID, 105, "")
	roller := giveFurni(t, helperID, 465, "")
	owner, _ := login(t, "decorator")
	helper, _ := login(t, "helper")
	bystander, _ := login(t, "bystander")
	all := []*client{owner, helper, bystander}
	owner.enterFlat(t, flat, 47, 42)
	helper.enterFlat(t, flat)
	bystander.enterFlat(t, flat)
	for _, c := range []*client{owner, owner, helper} {
		c.nextBody(t, 28)
		c.nextBody(t, 34)
	}
	owner.send(t, 96, "Helper")
	helper.expectChat(t, 42, "")
	bystander.walkTo(t, "2", 5, 5)
	for _, c := range all {
		c.extendDeadline(t)
	}

	owner.send(t, 90, fmt.Sprintf("%d 6 6 0", lamp))
	expectAll(t, all, 93, object(t, lamp, "rclr_lamp", 6, 6, 1, 1, 0, "0", "0,0,0"))
	owner.send(t, 90, fmt.Sprintf("%d 6 6 0", second))
	expectAll(t, all, 93, object(t, second, "rclr_lamp", 6, 6, 1, 1, 0, "1", "0,0,0"))
	owner.send(t, 90, fmt.Sprintf("%d 7 7 0", die))
	expectAll(t, all, 93, object(t, die, "edice", 7, 7, 1, 1, 0, "0", "0,0,0"))
	if row := furniRow(t, second); row.RoomID.Int64 != flat || row.AvatarID.Valid || row.X != 6 || row.Altitude != 1 {
		t.Errorf("the second lamp is stored as %+v, want it in the room at 6,6, 1 high", row)
	}

	// On a die, which carries nothing; on the door; off the floor; where a habbo stands; and an unknown furni.
	for _, refused := range []string{fmt.Sprintf("%d 7 7 0", chair), fmt.Sprintf("%d 3 5 0", chair), fmt.Sprintf("%d 20 20 0", chair), fmt.Sprintf("%d 5 5 0", chair), "999999 8 8 0", fmt.Sprintf("%d 8 8 9", chair)} {
		owner.send(t, 90, refused)
	}
	bystander.send(t, 90, fmt.Sprintf("%d 8 8 0", chair))
	bystander.send(t, 73, fmt.Sprintf("%d 9 9 0", lamp))
	owner.send(t, 90, fmt.Sprintf("%d 8 8 2", chair))
	expectAll(t, all, 93, object(t, chair, "rclr_chair", 8, 8, 1, 1, 2, "0", "0,0,0"))

	// A seat may come under a habbo, which then sits.
	owner.send(t, 73, fmt.Sprintf("%d 5 5 4", chair))
	expectAll(t, all, 95, object(t, chair, "rclr_chair", 5, 5, 1, 1, 4, "0", "0,0,0"))
	if line := owner.awaitStatus(t, "2", "/sit "); !strings.HasPrefix(line, "2 5,5,0,4,4/") || !strings.Contains(line, "/sit 1/") {
		t.Errorf("under the chair the bystander's status is %q, want it sitting at 5,5 facing south", line)
	}

	// A lamp does not stand on a chair: its mover gets it back where it is.
	owner.send(t, 73, fmt.Sprintf("%d 5 5 0", lamp))
	if id, body := owner.nextSkipping(t, 34); id != 95 || body != object(t, lamp, "rclr_lamp", 6, 6, 1, 1, 0, "0", "0,0,0") {
		t.Errorf("a refused move answered %d %q, want 95 with the lamp where it stands", id, body)
	}

	// A habbo with rights places its own furni and moves the room's, and picks nothing up.
	helper.send(t, 90, fmt.Sprintf("%d 10 10 0", roller))
	expectAll(t, all, 93, object(t, roller, "queue_tile1*0", 10, 10, 1, 1, 0, "0", "#ffffff,#ffffff,#ffffff,#ffffff"))
	helper.send(t, 73, fmt.Sprintf("%d 9 7 2", die))
	expectAll(t, all, 95, object(t, die, "edice", 9, 7, 1, 1, 2, "0", "0,0,0"))
	helper.send(t, 67, fmt.Sprintf("new stuff %d", die))

	// What the owner picks up is its own, whoever placed it.
	owner.send(t, 67, fmt.Sprintf("new stuff %d", roller))
	expectAll(t, all, 94, strconv.FormatInt(roller, 10))
	if id, body := owner.nextSkipping(t, 34); id != 140 || !strings.Contains(body, fmt.Sprintf("\x1e%d\x1equeue_tile1*0\x1e", roller)) {
		t.Errorf("after picking up, the owner received %d %q, want its hand with the roller", id, body)
	}
	if row := furniRow(t, roller); row.UserID != userOf(t, ownerID) || row.AvatarID.Int64 != ownerID || row.RoomID.Valid {
		t.Errorf("the roller the owner picked up is stored as %+v, want it in the owner's hand and its user's", row)
	}

	owner.send(t, 90, fmt.Sprintf("%d :w=3,2 l=9,63 l", poster))
	expectAll(t, all, 83, fmt.Sprintf("%d\tposter\t \t:w=3,2 l=9,63 l\t44\r", poster))
	owner.send(t, 90, fmt.Sprintf("%d :w=3,2 l=9,263 l", roller))
	owner.send(t, 67, fmt.Sprintf("new item %d", poster))
	expectAll(t, all, 84, strconv.FormatInt(poster, 10))
	owner.nextBody(t, 140)

	// The room holds four furni, and takes no fifth once that is its most (decision server/0104).
	setSetting(t, "game.maxRoomFurni", 4, 500)
	owner.send(t, 90, fmt.Sprintf("%d 10 10 0", roller))
	owner.send(t, 90, fmt.Sprintf("%d :w=3,2 l=9,63 l", poster))
	owner.send(t, 65, "new")
	if id, body := owner.nextSkipping(t, 34); id != 140 || !strings.HasSuffix(body, "\r2") {
		t.Errorf("with the room full, the owner received %d %q, want its hand still holding 2 furni", id, body)
	}

	for _, c := range all {
		c.send(t, 53, "")
	}
	back, _ := login(t, "decorator-again")
	back.knock(t, flat, "")
	back.expectNext(t, 41, "\x02")
	back.goToFlat(t, flat, 47, 42)
	back.send(t, 62, "")
	back.nextBody(t, 30)
	objects := back.nextBody(t, 32)
	for _, want := range []string{
		object(t, lamp, "rclr_lamp", 6, 6, 1, 1, 0, "0", "0,0,0"),
		object(t, second, "rclr_lamp", 6, 6, 1, 1, 0, "1", "0,0,0"),
		object(t, die, "edice", 9, 7, 1, 1, 2, "0", "0,0,0"),
		object(t, chair, "rclr_chair", 5, 5, 1, 1, 4, "0", "0,0,0"),
	} {
		if !strings.Contains(objects, want) {
			t.Errorf("the room loaded again shows %q, without %q", objects, want)
		}
	}
	if !strings.HasPrefix(objects, vl64String(t, 4)) {
		t.Errorf("the room loaded again shows %q, want 4 furni", objects)
	}
}

// A deleted room's furni goes to its owner's hand, whoever placed it (decisions server/0059 and server/0103).
func TestADeletedRoomsFurniGoesToItsOwner(t *testing.T) {
	ownerID := habboWithTickets(t, "Mover", "mover")
	guestID := habboWithTickets(t, "Guesty", "guesty")
	flat := newRoom(t, ownerID, 2, "Storage", true)
	own := giveFurni(t, ownerID, 463, "")
	guests := giveFurni(t, guestID, 105, "")
	standFurni(t, own, flat, 6, 6, 2)
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET avatar_id = NULL, room_id = ?, wall_position = ':w=3,2 l=9,63 l' WHERE id = ?`, flat, guests); err != nil {
		t.Fatal(err)
	}

	c, _ := login(t, "mover")
	c.send(t, 23, strconv.FormatInt(flat, 10))
	c.send(t, 65, "new")
	if body := c.nextBody(t, 140); !strings.HasSuffix(body, "\r2") {
		t.Fatalf("after deleting its room the owner's hand is %q, want the room's 2 furni", body)
	}
	for _, id := range []int64{own, guests} {
		if row := furniRow(t, id); row.UserID != userOf(t, ownerID) || row.AvatarID.Int64 != ownerID || row.RoomID.Valid || row.X != 0 || row.WallPosition != "" {
			t.Errorf("the furni %d is stored as %+v, want it in the owner's hand, with no place", id, row)
		}
	}
}
