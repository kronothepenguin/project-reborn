package server

import (
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The client's badge window sets five slots at once: a badge the habbo has, once, in the first slot that names it.
// The room learns them in 228, the user lines and 229 carry them, and the store keeps them (decision
// server/0083).
func TestWearingFiveBadges(t *testing.T) {
	collectorID := habboWithTickets(t, "Decorated", "decorated", "decorated-again")
	habboWithTickets(t, "Onlooker", "onlooker")
	q := store.New(testDB)
	for i, code := range []string{"HC1", "ADM", "NWB"} {
		if err := q.TakeOffAvatarBadge(t.Context(), collectorID); err != nil {
			t.Fatal(err)
		}
		if _, err := q.GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: collectorID, Code: code, GrantedAt: time.Now().UTC().Add(time.Duration(i) * time.Second)}); err != nil {
			t.Fatal(err)
		}
	}
	flat := newRoom(t, collectorID, 2, "Trophy Room", true)
	collector, _ := login(t, "decorated")
	onlooker, _ := login(t, "onlooker")
	collector.enterFlat(t, flat, 47, 42)
	onlooker.enterFlat(t, flat)

	slots := ""
	for i, code := range []string{"", "HC1", "ADM", "ADM", "ZZZ"} {
		slots += vl64String(t, int32(i+1)) + b64String(t, code)
	}
	collector.send(t, 158, slots)
	want := strconv.FormatInt(collectorID, 10) + "\x02" + vl64String(t, 2, 2) + "HC1\x02" + vl64String(t, 3) + "ADM\x02"
	for _, c := range []*client{collector, onlooker} {
		if got := c.nextChatBody(t, 228); got != want {
			t.Errorf("228 %q, want HC1 in slot 2 and ADM in slot 3", got)
		}
	}

	onlooker.send(t, 61, "")
	if id, users := onlooker.nextSkipping(t, 34); id != 28 || !strings.Contains(users, "n:Decorated\rf:hd-180-1\rl:3 5 0\rc:Hello\rs:M\rb:2:HC1,3:ADM\r") {
		t.Errorf("users %d %q, want Decorated wearing 2:HC1,3:ADM", id, users)
	}
	badges, err := q.ListAvatarBadges(t.Context(), collectorID)
	if err != nil {
		t.Fatal(err)
	}
	slotOf := map[string]int64{}
	for _, b := range badges {
		slotOf[b.Code] = b.Slot
	}
	if slotOf["HC1"] != 2 || slotOf["ADM"] != 3 || slotOf["NWB"] != 0 {
		t.Errorf("saved slots %v, want HC1 2, ADM 3 and NWB none", slotOf)
	}

	again, _ := login(t, "decorated-again")
	again.send(t, 157, "")
	if got := again.nextChatBody(t, 229); got != vl64String(t, 3)+"HC1\x02ADM\x02NWB\x02"+vl64String(t, 2, 2)+"HC1\x02"+vl64String(t, 3)+"ADM\x02" {
		t.Errorf("229 %q, want the 3 badges and the 2 worn with their slots", got)
	}
}
