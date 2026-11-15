package server

import (
	"fmt"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

// gift sends GPRC for an item of a page as a present, and returns the first answer.
func gift(t *testing.T, c *client, page, item, receiver, note string) (id int, body string) {
	t.Helper()
	c.send(t, 100, strings.Join([]string{"production", page, "en", item, "-", "1", receiver, note, ""}, "\r"))
	return c.next(t)
}

// A present waits in its receiver's hand, online or not, in one of the six boxes with its note, cut at 200
// characters; the buyer pays, and its credit history names the furni and the receiver. A name that no habbo has
// charges nothing (decisions server/0094 and server/0106).
func TestAPresentWaitsInItsReceiversHand(t *testing.T) {
	santa := habboWithTickets(t, "Santa", "santa")
	rudolph := habboWithTickets(t, "Rudolph", "rudolph")
	giveCredits(t, santa, 20)
	c, _ := login(t, "santa")

	if id, body := gift(t, c, "Rollers", "465", "Nobody", "Hello"); id != 76 || body != "Nobody" {
		t.Errorf("a present for a name no habbo has got %d %q, want 76 with the name", id, body)
	}
	if got := credits(t, santa); got != 20 {
		t.Errorf("the refused present left %d credits, want all 20", got)
	}

	long := strings.Repeat("Merry Xmas", 25)
	if id, body := gift(t, c, "Rollers", "465", "rudolph", long+"\tand more"); id != 67 {
		t.Fatalf("a present for Rudolph got %d %q, want 67", id, body)
	}
	c.expectMessage(t, 6, "15")
	if hand := handOf(t, santa); len(hand) != 0 {
		t.Errorf("the buyer's hand holds %d furni, want none of the present", len(hand))
	}
	hand := handOf(t, rudolph)
	if len(hand) != 1 {
		t.Fatalf("the receiver's hand holds %d furni, want the box", len(hand))
	}
	box := hand[0]
	wrapping, _ := furni.Get(box.FurniDefinitionID)
	if !strings.HasPrefix(wrapping.Sprite, "present_gen") || box.UserID != userOf(t, rudolph) || box.State != "!"+long[:200] {
		t.Errorf("the box is %+v, a %s; want a present box of the receiver's user with the note's first 200 characters", box, wrapping.Sprite)
	}
	inside, err := store.New(testDB).ListBoxFurni(t.Context(), box.ID)
	if err != nil || len(inside) != 1 || inside[0].FurniDefinitionID != 465 || inside[0].AvatarID.Valid || inside[0].UserID != userOf(t, rudolph) {
		t.Errorf("the box holds %+v, %v; want the roller, in no hand", inside, err)
	}
	history, err := store.New(testDB).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userOf(t, santa), RowLimit: 10})
	if err != nil || len(history) != 1 || history[0].Credits != -5 || history[0].Detail != "Catalogue purchase (White Habbo Roller), a present for Rudolph" {
		t.Errorf("the buyer's credit history = %+v, %v; want one line that names the roller and Rudolph", history, err)
	}
}

// Only the room's owner opens a box that stands in its room: the furni inside goes to its hand and the box goes
// (decision server/0105). A habbo in a room hears of a present that arrives.
func TestOpeningAPresent(t *testing.T) {
	giver := habboWithTickets(t, "Grinch", "grinch")
	owner := habboWithTickets(t, "Cindy", "cindy")
	habboWithTickets(t, "Maxdog", "maxdog")
	giveCredits(t, giver, 20)
	flat := newRoom(t, owner, 2, "Whoville", true)
	g, _ := login(t, "grinch")
	cindy, _ := login(t, "cindy")
	visitor, _ := login(t, "maxdog")
	cindy.enterFlat(t, flat, 47, 42)
	visitor.enterFlat(t, flat)
	cindy.nextBody(t, 28)
	cindy.nextBody(t, 34)

	if id, _ := gift(t, g, "Rollers", "465", "Cindy", "Sorry about the tree"); id != 67 {
		t.Fatalf("the present got %d, want 67", id)
	}
	if id, body := cindy.nextSkipping(t, 34); id != 101 || body != "" {
		t.Fatalf("in her room the receiver got %d %q, want 101, her hand changed", id, body)
	}
	box := handOf(t, owner)[0]
	cindy.send(t, 90, fmt.Sprintf("%d 7 7 0", box.ID))
	placed := cindy.nextBody(t, 93)
	visitor.nextBody(t, 93)
	if !strings.HasSuffix(placed, "!Sorry about the tree\x02") {
		t.Errorf("the box stands as %q, want its note after an exclamation mark as its state", placed)
	}

	visitor.send(t, 78, strconv.FormatInt(box.ID, 10))
	cindy.send(t, 78, strconv.FormatInt(box.ID, 10))
	expectAll(t, []*client{cindy, visitor}, 94, strconv.FormatInt(box.ID, 10))
	if id, body := cindy.nextSkipping(t, 34); id != 129 || body != "queue_tile1*0\rqueue_tile1*0\r#ffffff,#ffffff,#ffffff,#ffffff" {
		t.Errorf("opening the box answered %d %q, want 129 with the roller", id, body)
	}
	if id, body := cindy.nextSkipping(t, 34); id != 140 || !strings.Contains(body, "\x1equeue_tile1*0\x1e") || !strings.HasSuffix(body, "\r1") {
		t.Errorf("after the box the owner received %d %q, want her hand with the roller alone", id, body)
	}
	hand := handOf(t, owner)
	if len(hand) != 1 || hand[0].FurniDefinitionID != 465 || hand[0].BoxFurniID.Valid {
		t.Errorf("the owner's hand = %+v, want the roller, out of its box", hand)
	}
	if _, err := store.New(testDB).GetFurni(t.Context(), box.ID); !store.IsNotFound(err) {
		t.Errorf("the opened box is still stored: %v", err)
	}
}
