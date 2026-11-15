package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A pad's post-its go on a wall one at a time. Anyone reads a note, a habbo with rights writes it, and the room's
// owner or a holder of fuse_remove_stickies deletes it (decisions server/0108 and server/0109).
func TestPostIts(t *testing.T) {
	ownerID := habboWithTickets(t, "Scribbler", "scribbler")
	habboWithTickets(t, "Notetaker", "notetaker")
	habboWithTickets(t, "Passerby", "passerby")
	janitorID := habboWithTickets(t, "Janitor", "janitor")
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Janitors", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: "fuse_remove_stickies"}); err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userOf(t, janitorID), GrantedAt: now}); err != nil {
		t.Fatal(err)
	}
	flat := newRoom(t, ownerID, 2, "Pinboard", true)
	pad := giveFurni(t, ownerID, 97, "2")

	owner, _ := login(t, "scribbler")
	helper, _ := login(t, "notetaker")
	passerby, _ := login(t, "passerby")
	janitor, _ := login(t, "janitor")
	all := []*client{owner, helper, passerby, janitor}
	owner.enterFlat(t, flat, 47, 42)
	helper.enterFlat(t, flat)
	passerby.enterFlat(t, flat)
	janitor.enterFlat(t, flat)
	for _, c := range []*client{owner, owner, owner, helper, helper, passerby} {
		c.nextBody(t, 28)
		c.nextBody(t, 34)
	}
	owner.send(t, 96, "Notetaker")
	helper.expectChat(t, 42, "")
	for _, c := range all {
		c.extendDeadline(t)
	}

	// hang sends the pad to a place on the wall and returns the note everyone sees there.
	hang := func(position string) int64 {
		t.Helper()
		owner.send(t, 90, fmt.Sprintf("%d %s", pad, position))
		id, body := owner.nextSkipping(t, 34)
		name, rest, _ := strings.Cut(body, "\t")
		note, err := strconv.ParseInt(name, 10, 64)
		if id != 83 || err != nil || rest != "post.it\t \t"+position+"\tFFFF33\r" {
			t.Fatalf("hanging a post-it answered %d %q, want 83 with a yellow note at %s", id, body, position)
		}
		expectAll(t, all[1:], 83, body)
		owner.expectChat(t, 101, "")
		return note
	}
	first := hang(":w=3,2 l=9,63 l")
	if row := furniRow(t, pad); row.State != "1" || row.AvatarID.Int64 != ownerID {
		t.Errorf("after one note the pad is stored as %+v, want it in the hand with 1 note left", row)
	}
	second := hang(":w=4,2 l=9,63 l")
	if hand := handOf(t, ownerID); len(hand) != 0 {
		t.Errorf("after its last note the pad is still in the hand: %+v", hand)
	}
	if row := furniRow(t, first); row.RoomID.Int64 != flat || row.UserID != userOf(t, ownerID) || row.FurniDefinitionID != 97 {
		t.Errorf("the note is stored as %+v, want a post-it of the owner's user in the room", row)
	}
	// The pad is gone, and a note is never picked up.
	owner.send(t, 90, fmt.Sprintf("%d :w=5,2 l=9,63 l", pad))
	owner.send(t, 67, fmt.Sprintf("new item %d", first))

	passerby.send(t, 83, strconv.FormatInt(first, 10))
	passerby.expectChat(t, 48, fmt.Sprintf("%d\tFFFF33 ", first))

	// Without rights, in a colour the window does not have, and longer than the setting lets a note be: nothing.
	passerby.send(t, 84, fmt.Sprintf("%d/FF9CFF hello", first))
	helper.send(t, 84, fmt.Sprintf("%d/123456 hello", first))
	helper.send(t, 84, fmt.Sprintf("%d/FF9CFF %s", first, strings.Repeat("a", 685)))
	helper.send(t, 84, fmt.Sprintf("%d/FF9CFF party at 8\rbring cake", first))
	expectAll(t, all, 85, fmt.Sprintf("%d\tpost.it\t \t:w=3,2 l=9,63 l\tFF9CFF", first))
	janitor.send(t, 83, strconv.FormatInt(first, 10))
	janitor.expectChat(t, 48, fmt.Sprintf("%d\tFF9CFF party at 8\rbring cake", first))
	if text, err := q.GetFurniNote(ctx, first); err != nil || text != "party at 8\rbring cake" {
		t.Errorf("the note's text is stored as %q (%v)", text, err)
	}

	// A habbo with rights deletes nothing; the staff with the fuse and the owner do.
	helper.send(t, 85, strconv.FormatInt(first, 10))
	passerby.send(t, 85, strconv.FormatInt(first, 10))
	janitor.send(t, 85, strconv.FormatInt(first, 10))
	expectAll(t, all, 84, strconv.FormatInt(first, 10))
	if _, err := q.GetFurni(ctx, first); !store.IsNotFound(err) {
		t.Errorf("the deleted note is still stored (%v)", err)
	}
	if _, err := q.GetFurniNote(ctx, first); !store.IsNotFound(err) {
		t.Errorf("the deleted note's text is still stored (%v)", err)
	}
	owner.send(t, 85, strconv.FormatInt(second, 10))
	expectAll(t, all, 84, strconv.FormatInt(second, 10))
}

// A deleted room's post-its go with it: a note never comes into a hand.
func TestADeletedRoomsPostItsGo(t *testing.T) {
	ownerID := habboWithTickets(t, "Eraser", "eraser")
	flat := newRoom(t, ownerID, 2, "Blackboard", true)
	note := giveFurni(t, ownerID, 97, "FFFF33")
	if _, err := testDB.ExecContext(t.Context(), `UPDATE furni SET avatar_id = NULL, room_id = ?, wall_position = ':w=3,2 l=9,63 l' WHERE id = ?`, flat, note); err != nil {
		t.Fatal(err)
	}
	c, _ := login(t, "eraser")
	c.send(t, 23, strconv.FormatInt(flat, 10))
	c.send(t, 65, "new")
	if body := c.nextBody(t, 140); !strings.HasSuffix(body, "\r0") {
		t.Fatalf("after deleting its room the owner's hand is %q, want it empty", body)
	}
	if _, err := store.New(testDB).GetFurni(t.Context(), note); !store.IsNotFound(err) {
		t.Errorf("the deleted room's post-it is still stored (%v)", err)
	}
}
