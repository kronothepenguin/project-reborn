package server

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// S5's first exit criterion, with the hand of the second: a Go test client opens Holo's catalogue, reads a page and
// buys a furni, a deal, a trophy and a wallpaper; the user's wallet pays, the credit history shows each purchase, and
// what was bought is in the buyer's hand, read from the database.
func TestAHabboShopsInHolosCatalogue(t *testing.T) {
	me := habboWithTickets(t, "Bargainer", "bargainer")
	giveCredits(t, me, 100)
	c, _ := login(t, "bargainer")

	names, codes := catalogueIndex(t, c)
	if names["Rollers"] != "Rollers" || names["Recycler"] != "Ecotron" || len(codes) < 40 {
		t.Fatalf("the catalogue's index lists %d pages, %v; want Holo's, with Rollers and the Ecotron", len(codes), names)
	}
	c.send(t, 102, "production/Rollers/en")
	if page := c.nextBody(t, 127); !strings.Contains(page, "p:White Habbo Roller\tThe power of movement\t5\t") {
		t.Fatalf("the Rollers page = %q, want the White Habbo Roller for 5 credits", page)
	}

	balance := 100
	for _, purchase := range []struct {
		page, item, extra string
		price             int
	}{
		{"Rollers", "465", "-", 5},
		{"Pet Accesories", "deal97", "-", 2},
		{"Trophies", "600", "Well done", 12},
		{"Spaces", "3", "107", 3},
	} {
		if id, body := buy(t, c, purchase.page, purchase.item, purchase.extra); id != 67 {
			t.Fatalf("buying %s on %s got %d %q, want the purchase done, 67", purchase.item, purchase.page, id, body)
		}
		balance -= purchase.price
		c.expectMessage(t, 6, fmt.Sprint(balance))
	}
	if got := credits(t, me); got != 78 {
		t.Errorf("the wallet holds %d credits, want 100 less 5, 2, 12 and 3", got)
	}

	history, err := store.New(testDB).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userOf(t, me), RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	lines := map[string]int64{}
	for _, row := range history {
		if row.Reason != "catalogue" || row.Habbo.String != "Bargainer" {
			t.Errorf("the credit history's line %+v is not a purchase of the habbo's", row)
		}
		lines[row.Detail] = row.Credits
	}
	for detail, paid := range map[string]int64{
		"Catalogue purchase (White Habbo Roller)": -5,
		"Catalogue purchase (Doggy Bones)":        -2,
		"Catalogue purchase (Classic trophy)":     -12,
		"Catalogue purchase (wallpaper)":          -3,
	} {
		if lines[detail] != paid {
			t.Errorf("the credit history shows %d for %q, want %d: %+v", lines[detail], detail, paid, history)
		}
	}

	hand := handOf(t, me)
	if len(hand) != 9 {
		t.Fatalf("the hand holds %d furni, want the roller, the deal's six, the trophy and the wallpaper", len(hand))
	}
	trophy, wallpaper := hand[7], hand[8]
	if hand[0].FurniDefinitionID != 465 || hand[6].FurniDefinitionID != 41 || wallpaper.State != "107" ||
		trophy.State != "Bargainer\t"+time.Now().Format("02-01-2006")+"\tWell done" {
		t.Errorf("the hand = %+v; want the roller first, pet food, the trophy with its inscription and the wallpaper 107", hand)
	}
}

// S5's third exit criterion, where it speaks of what stays: furni that a habbo placed, moved, turned and switched on
// is in the store, so it comes back as it was after the room unloads, which is all a restart leaves of a room too
// (plans/server decision 0010).
func TestFurniAndItsStateComeBackWithTheRoom(t *testing.T) {
	owner := habboWithTickets(t, "Homemaker", "homemaker")
	flat := newRoom(t, owner, 2, "Bungalow", true)
	lamp := giveFurni(t, owner, 1279, "")
	poster := giveFurni(t, owner, 105, "")
	ref := room.Ref{ID: flat}

	c, _ := login(t, "homemaker")
	c.enterFlat(t, flat, 47, 42)
	c.send(t, 90, fmt.Sprintf("%d 6 6 0", lamp))
	c.expectChat(t, 93, object(t, lamp, "rclr_lamp", 6, 6, 1, 1, 0, "0", "0,0,0"))
	c.send(t, 73, fmt.Sprintf("%d 7 7 2", lamp))
	c.expectChat(t, 95, object(t, lamp, "rclr_lamp", 7, 7, 1, 1, 2, "0", "0,0,0"))
	c.send(t, 74, b64String(t, fmt.Sprint(lamp))+b64String(t, "ON"))
	if id, body := c.nextSkipping(t, 34); id != 88 || !strings.Contains(body, "ON") {
		t.Fatalf("switching the lamp on answered %d %q, want its new state, 88", id, body)
	}
	c.send(t, 90, fmt.Sprintf("%d :w=3,2 l=9,63 l", poster))
	c.expectChat(t, 83, fmt.Sprintf("%d\tposter\t \t:w=3,2 l=9,63 l\t44\r", poster))

	c.send(t, 53, "")
	for wait := 0; ; wait++ {
		if _, loaded := room.Loaded(ref); !loaded {
			break
		}
		if wait > 100 {
			t.Fatal("the room did not unload after its last habbo left")
		}
		time.Sleep(20 * time.Millisecond)
	}
	if row := furniRow(t, lamp); row.RoomID.Int64 != flat || row.X != 7 || row.Y != 7 || row.Direction != 2 || row.State != "ON" {
		t.Errorf("the lamp is stored as %+v, want it in the room at 7,7, turned to 2 and on", row)
	}

	c.extendDeadline(t)
	c.knock(t, flat, "")
	c.expectNext(t, 41, "\x02")
	c.goToFlat(t, flat, 47, 42)
	c.send(t, 60, "")
	c.nextBody(t, 31)
	c.send(t, 61, "")
	c.nextBody(t, 28)
	c.send(t, 62, "")
	c.nextBody(t, 30)
	objects := c.nextBody(t, 32)
	placed := fmt.Sprintf("%d\x02rclr_lamp\x02%s", lamp, vl64String(t, 7, 7, 1, 1, 2))
	_, after, found := strings.Cut(objects, placed)
	if !strings.HasPrefix(objects, vl64String(t, 1)) || !found || !strings.Contains(after, "ON\x02") {
		t.Errorf("the room's floor furni, 32 = %q; want the lamp alone, at 7,7 turned to 2 and on", objects)
	}
	c.send(t, 63, "")
	if items, want := c.nextBody(t, 45), fmt.Sprintf("%d\tposter\t \t:w=3,2 l=9,63 l\t44\r", poster); items != want {
		t.Errorf("the room's wall items, 45 = %q, want %q", items, want)
	}
}
