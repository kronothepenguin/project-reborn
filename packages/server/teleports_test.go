package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"
)

// A teleport is bought as a pair whose two name each other. A habbo steps into one from the tile in front of it and
// comes out of the other: in the same room at once, and in another room past its closed door, its ban and its last
// place (decisions server/0110 and server/0111). A teleport whose partner stands in no room leads nowhere.
func TestTeleports(t *testing.T) {
	ownerID := habboWithTickets(t, "Beamer", "beamer")
	travellerID := habboWithTickets(t, "Traveller", "traveller")
	giveCredits(t, ownerID, 15)
	owner, _ := login(t, "beamer")
	for range 3 {
		if id, body := buy(t, owner, "Teleport", "535", "-"); id != 67 {
			t.Fatalf("buying a teleport got %d %q, want 67", id, body)
		}
		owner.nextBody(t, 6)
	}
	hand := handOf(t, ownerID)
	if len(hand) != 6 {
		t.Fatalf("three teleports left %d furni in the hand, want three pairs", len(hand))
	}
	for i := 0; i < 6; i += 2 {
		if hand[i].PartnerFurniID.Int64 != hand[i+1].ID || hand[i+1].PartnerFurniID.Int64 != hand[i].ID {
			t.Fatalf("the teleports %+v and %+v do not name each other", hand[i], hand[i+1])
		}
	}
	a, b, c, d, e := hand[0].ID, hand[1].ID, hand[2].ID, hand[3].ID, hand[4].ID

	here := newRoom(t, ownerID, 2, "Departures", true)
	there := newRoom(t, ownerID, 2, "Arrivals", true)
	standFurni(t, a, here, 6, 6, 2)
	standFurni(t, b, there, 8, 8, 4)
	standFurni(t, c, here, 6, 9, 2)
	standFurni(t, d, here, 10, 9, 2)
	standFurni(t, e, here, 6, 11, 2)
	ctx := t.Context()
	if _, err := testDB.ExecContext(ctx, `UPDATE rooms SET door = 'closed', max_visitors = 1 WHERE id = ?`, there); err != nil {
		t.Fatal(err)
	}
	if _, err := testDB.ExecContext(ctx, `INSERT INTO room_bans (room_id, avatar_id, expires_at) VALUES (?, ?, ?)`, there, travellerID, time.Now().UTC().Add(time.Hour)); err != nil {
		t.Fatal(err)
	}
	owner.knock(t, there, "")
	owner.expectNext(t, 41, "\x02")
	owner.goToFlat(t, there, 47, 42)
	owner.arrive(t)

	tr, _ := login(t, "traveller")
	tr.knock(t, here, "")
	tr.expectNext(t, 41, "\x02")
	tr.goToFlat(t, here)
	tr.arrive(t)
	// into steps the traveller into a teleport from the tile in front of it.
	into := func(id int64, x, y int) {
		t.Helper()
		tr.walkTo(t, "0", x+1, y)
		tr.extendDeadline(t)
		tr.send(t, 81, strconv.FormatInt(id, 10))
		tr.awaitStatus(t, "0", fmt.Sprintf("/mv %d,%d,0/", x, y))
		tr.awaitStatus(t, "0", fmt.Sprintf("0 %d,%d,0,", x, y))
		tr.extendDeadline(t)
	}

	// No passage was opened; the teleport is far; its partner is in a hand; and the habbo stands in another one.
	tr.send(t, 54, fmt.Sprintf("%d/%d", there, b))
	tr.send(t, 81, strconv.FormatInt(e, 10))
	tr.send(t, 28, strconv.FormatInt(e, 10))
	into(e, 6, 11)
	tr.send(t, 28, strconv.FormatInt(e, 10))
	tr.send(t, 28, strconv.FormatInt(c, 10))

	into(c, 6, 9)
	tr.send(t, 28, strconv.FormatInt(c, 10))
	tr.expectChat(t, 62, vl64String(t, int32(d), int32(here)))
	tr.send(t, 82, strconv.FormatInt(c, 10))
	tr.expectChat(t, 89, strconv.FormatInt(c, 10))
	tr.send(t, 54, fmt.Sprintf("%d/%d", here, d))
	if line := statusLines(tr.nextBody(t, 34))["0"]; !strings.HasPrefix(line, "0 10,9,0,2,2/") {
		t.Fatalf("out of the other teleport the status is %q, want the habbo at 10,9 facing its way", line)
	}
	tr.expectNext(t, 92, fmt.Sprintf("%d/Traveller", d))
	if tiles, _ := tr.walkTo(t, "0", 11, 9); tiles[len(tiles)-1] != "11,9" {
		t.Fatalf("out of the teleport the habbo walked %v, want it to the tile in front", tiles)
	}

	into(a, 6, 6)
	tr.send(t, 28, strconv.FormatInt(a, 10))
	tr.expectChat(t, 62, vl64String(t, int32(b), int32(there)))
	tr.send(t, 82, strconv.FormatInt(a, 10))
	tr.expectChat(t, 89, strconv.FormatInt(a, 10))
	tr.chooseRoom(t, false, there)
	tr.send(t, 54, fmt.Sprintf("%d/%d", there, b))
	tr.expectNext(t, 41, "\x02")
	tr.goToFlat(t, there)
	if arrived := tr.arrive(t); !strings.Contains(arrived.user, "l:8 8 0") || !strings.HasPrefix(statusLines(arrived.status)["1"], "1 8,8,0,4,4/") {
		t.Errorf("in the other room the habbo arrived as %q with the status %q, want it in the teleport at 8,8", arrived.user, arrived.status)
	}
	owner.extendDeadline(t)
	if id, body := owner.nextSkipping(t, 34); id != 28 || !strings.Contains(body, "n:Traveller") {
		t.Fatalf("the habbo in the other room received %d %q, want the traveller, 28", id, body)
	}
	owner.expectChat(t, 92, fmt.Sprintf("%d/Traveller", b))
}
