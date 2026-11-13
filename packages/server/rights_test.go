package server

import (
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// The owner gives and takes rights; a habbo with rights kicks, as the client shows it the button, but never an owner,
// and only the owner bans (decisions server/0067 and server/0079).
func TestRightsKicksAndBans(t *testing.T) {
	ownerID := habboWithTickets(t, "Squire", "squire")
	stewardID := habboWithTickets(t, "Steward", "steward")
	trespasserID := habboWithTickets(t, "Trespasser", "trespasser")
	flat := newRoom(t, ownerID, 2, "Manor", true)
	q := store.New(testDB)
	owner, _ := login(t, "squire")
	steward, _ := login(t, "steward")
	trespasser, _ := login(t, "trespasser")
	owner.enterFlat(t, flat, 47, 42)
	steward.enterFlat(t, flat)
	trespasser.enterFlat(t, flat)
	for _, c := range []*client{owner, owner, steward} {
		c.nextBody(t, 28)
		c.nextBody(t, 34)
	}
	for _, c := range []*client{owner, steward, trespasser} {
		c.extendDeadline(t)
	}

	owner.send(t, 96, "Steward")
	steward.expectChat(t, 42, "")
	if line := statusLines(trespasser.nextBody(t, 34))["1"]; !strings.HasSuffix(line, "/flatctrl/") {
		t.Errorf("Steward's status %q, want flatctrl with no level, which the client reads as furniture", line)
	}
	if ok, err := q.HasRoomRights(t.Context(), store.HasRoomRightsParams{RoomID: flat, AvatarID: stewardID}); err != nil || !ok {
		t.Errorf("Steward's rights were not saved: %v", err)
	}

	steward.send(t, 95, "Squire")
	steward.send(t, 320, "Trespasser")
	// Squire and Steward step off the door, whose tile they would block, and Trespasser 4 tiles away from it.
	r, _ := room.Loaded(room.Ref{ID: flat})
	r.Update(ownerID, func(o *room.Occupant) { o.X, o.Y = 5, 8 })
	r.Update(stewardID, func(o *room.Occupant) { o.X, o.Y = 6, 8 })
	r.Update(trespasserID, func(o *room.Occupant) { o.X = 7 })
	steward.send(t, 95, "Trespasser")
	trespasser.send(t, 75, b64Short(t, 11)+b64Short(t, 13))
	start := time.Now()
	trespasser.expectChat(t, 18, "")
	owner.expectChat(t, 29, "2")
	steward.expectChat(t, 29, "2")
	if took := time.Since(start); took < 1500*time.Millisecond {
		t.Errorf("Trespasser left after %v, want it to walk the 4 tiles to the door first", took)
	}
	if _, ok := r.Occupant(ownerID); !ok {
		t.Error("the habbo with rights kicked the owner")
	}
	if _, err := q.GetRoomBanEnd(t.Context(), store.GetRoomBanEndParams{RoomID: flat, AvatarID: trespasserID, Now: time.Now().UTC()}); !store.IsNotFound(err) {
		t.Errorf("a habbo with rights banned Trespasser: %v", err)
	}

	trespasser.enterFlat(t, flat)
	for _, c := range []*client{owner, steward} {
		if id, body := c.nextSkipping(t, 34); id != 28 {
			t.Fatalf("received %d %q, want Trespasser back, 28", id, body)
		}
	}
	owner.send(t, 320, "Trespasser")
	trespasser.expectChat(t, 18, "")
	owner.expectChat(t, 29, "2")
	steward.expectChat(t, 29, "2")
	trespasser.knock(t, flat, "")
	trespasser.expectNext(t, 224, vl64String(t, 4))
	end, err := q.GetRoomBanEnd(t.Context(), store.GetRoomBanEndParams{RoomID: flat, AvatarID: trespasserID, Now: time.Now().UTC()})
	if err != nil || time.Until(end) < 14*time.Minute || time.Until(end) > 15*time.Minute {
		t.Errorf("the ban ends at %v, %v; want in 15 minutes", end, err)
	}

	owner.send(t, 97, "Steward")
	steward.expectChat(t, 43, "")
	owner.send(t, 96, "Steward")
	steward.expectChat(t, 42, "")
	owner.send(t, 155, vl64String(t, int32(flat)))
	steward.expectChat(t, 43, "")
	if ok, _ := q.HasRoomRights(t.Context(), store.HasRoomRightsParams{RoomID: flat, AvatarID: stewardID}); ok || r.HasRights(stewardID) {
		t.Error("Steward kept its rights after REMOVEALLRIGHTS")
	}
	steward.send(t, 155, vl64String(t, int32(flat)))
	steward.send(t, 52, b64String(t, "still here "+strconv.FormatInt(flat, 10)))
	steward.expectChat(t, 24, chatLine(t, 1, "still here "+strconv.FormatInt(flat, 10)))
}
