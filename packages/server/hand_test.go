package server

import (
	"database/sql"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// giveFurni puts a new furni of the definition in the habbo's hand and returns its id.
func giveFurni(t *testing.T, avatarID, definitionID int64, state string) int64 {
	t.Helper()
	f, err := store.New(testDB).CreateFurni(t.Context(), store.CreateFurniParams{
		FurniDefinitionID: definitionID, UserID: userOf(t, avatarID), AvatarID: sql.NullInt64{Int64: avatarID, Valid: true}, State: state, CreatedAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("CreateFurni: %v", err)
	}
	return f.ID
}

// hand sends GETSTRIP with the mode and returns the furni 140 lists, without the slash that ends each, and the count
// on its last line.
func hand(t *testing.T, c *client, mode string) (items []string, count string) {
	t.Helper()
	c.send(t, 65, mode)
	body := c.nextBody(t, 140)
	list, count, ok := strings.Cut(body, "\r")
	if !ok {
		t.Fatalf("the hand %q has no line for its count", body)
	}
	if list != "" {
		items = strings.Split(strings.TrimSuffix(list, "/"), "/")
	}
	return items, count
}

// The hand comes nine furni at a time, the oldest first, read from the database each time (plans/server decision
// 0096): a floor furni with its size, state and colours, and a wall item with its data.
func TestTheHandComesAPageAtATime(t *testing.T) {
	carrier := habboWithTickets(t, "Carrier", "carrier")
	chair := giveFurni(t, carrier, 463, "")
	poster := giveFurni(t, carrier, 105, "")
	for range 9 {
		giveFurni(t, carrier, 465, "")
	}
	c, _ := login(t, "carrier")

	items, count := hand(t, c, "new")
	wantChair := fmt.Sprintf("SI\x1e%d\x1e0\x1eS\x1e%d\x1erclr_chair\x1e1\x1e1\x1e\x1e0,0,0\x1e1", chair, chair)
	wantPoster := fmt.Sprintf("SI\x1e%d\x1e1\x1eI\x1e%d\x1eposter\x1e44\x1e1", poster, poster)
	if len(items) != 9 || count != "11" || items[0] != wantChair || items[1] != wantPoster {
		t.Fatalf("the first page = %q with the count %q; want 9 of 11, %q and %q first", items, count, wantChair, wantPoster)
	}

	items, count = hand(t, c, "next")
	if len(items) != 2 || count != "11" || !strings.Contains(items[0], "\x1e9\x1eS\x1e") || !strings.Contains(items[1], "\x1e10\x1eS\x1e") {
		t.Errorf("the second page = %q, want the furni at the places 9 and 10", items)
	}
	if again, _ := hand(t, c, "next"); len(again) != 2 {
		t.Errorf("next on the last page lists %d furni, want the last page's 2 again", len(again))
	}

	last := giveFurni(t, carrier, 463, "")
	items, count = hand(t, c, "update")
	if len(items) != 3 || count != "12" || !strings.HasPrefix(items[2], fmt.Sprintf("SI\x1e%d\x1e11\x1e", last)) {
		t.Errorf("update after a new furni = %q with the count %q; want the same page with it, 3 of 12", items, count)
	}
	if first, _ := hand(t, c, "prev"); len(first) != 9 || first[0] != wantChair {
		t.Errorf("prev lists %d furni, want the first page's 9", len(first))
	}
	if first, _ := hand(t, c, "prev"); len(first) != 9 {
		t.Errorf("prev on the first page lists %d furni, want the first page's 9 again", len(first))
	}
}

func TestAnEmptyHand(t *testing.T) {
	habboWithTickets(t, "Emptyhand", "emptyhand")
	c, _ := login(t, "emptyhand")
	c.send(t, 65, "new")
	if body := c.nextBody(t, 140); body != "\r0" {
		t.Errorf("an empty hand = %q, want only its count, 0", body)
	}
}
