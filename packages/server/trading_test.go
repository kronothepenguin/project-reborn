package server

import (
	"fmt"
	"strings"
	"testing"
)

// offered writes a floor furni of one tile as a trade lists it, at its place on its side.
func offered(id int64, position int, sprite string) string {
	return fmt.Sprintf("SI\x1e%d\x1e%d\x1eS\x1e%d\x1e%s\x1e1\x1e1\x1e\x1e0,0,0\x1e1/", id, position, id, sprite)
}

// trade writes 108 as the habbo me receives it: its own side first.
func trade(me, meAccepted, meItems, other, otherAccepted, otherItems string) string {
	return me + "\t" + meAccepted + "\t" + meItems + "\r" + other + "\t" + otherAccepted + "\t" + otherItems
}

// Two habbos in a room offer furni from their hands and accept; when both have, every furni changes hands at once.
// A furni on offer is locked in its hand, a furni that is not tradeable is never offered, and adding a furni takes
// the accepts away (plans/server decisions 0092, 0113 and 0114).
func TestTrading(t *testing.T) {
	merchantID := habboWithTickets(t, "Merchant", "merchant")
	hagglerID := habboWithTickets(t, "Haggler", "haggler")
	flat := newRoom(t, merchantID, 2, "Market", true)
	throne := giveFurni(t, merchantID, 1152, "")
	lamp := giveFurni(t, merchantID, 1279, "")
	box := giveFurni(t, merchantID, 1372, "")
	pad := giveFurni(t, merchantID, 97, "20")
	chair := giveFurni(t, hagglerID, 463, "")

	m, _ := login(t, "merchant")
	h, _ := login(t, "haggler")
	both := []*client{m, h}
	m.enterFlat(t, flat, 47, 42)
	h.enterFlat(t, flat)
	m.nextBody(t, 28)
	m.nextBody(t, 34)
	if items, _ := hand(t, m, "new"); len(items) != 4 || !strings.Contains(items[3], fmt.Sprintf("\x1eI\x1e%d\x1epost.it\x1e20\x1e", pad)) {
		t.Errorf("the hand lists %q, want the pad of post-its with its 20 notes", items)
	}
	// each wants the two to receive 108 with the two sides, each its own first.
	each := func(merchantAccepted, merchantItems, hagglerAccepted, hagglerItems string) {
		t.Helper()
		m.expectChat(t, 108, trade("Merchant", merchantAccepted, merchantItems, "Haggler", hagglerAccepted, hagglerItems))
		h.expectChat(t, 108, trade("Haggler", hagglerAccepted, hagglerItems, "Merchant", merchantAccepted, merchantItems))
	}

	h.send(t, 72, fmt.Sprint(chair))
	h.send(t, 69, "")
	m.send(t, 71, "0")
	m.send(t, 71, "1")
	each("false", "", "false", "")
	if line := m.awaitStatus(t, "1", "/trd/"); !strings.HasPrefix(line, "1 ") {
		t.Errorf("the haggler's status is %q, want it trading", line)
	}
	// Each trades with one habbo at a time.
	m.send(t, 71, "1")
	h.send(t, 71, "0")

	m.send(t, 72, fmt.Sprint(throne))
	each("false", offered(throne, 0, "throne"), "false", "")
	// Twice, a present, which is not tradeable, and the other's furni: nothing. A furni on offer is not placed.
	m.send(t, 72, fmt.Sprint(throne))
	m.send(t, 72, fmt.Sprint(box))
	m.send(t, 72, fmt.Sprint(chair))
	m.send(t, 90, fmt.Sprintf("%d 6 6 0", throne))
	h.send(t, 72, fmt.Sprint(chair))
	each("false", offered(throne, 0, "throne"), "false", offered(chair, 0, "rclr_chair"))
	if row := furniRow(t, throne); row.AvatarID.Int64 != merchantID || row.RoomID.Valid {
		t.Errorf("the throne on offer is stored as %+v, want it still in the merchant's hand", row)
	}

	m.send(t, 69, "")
	expectAll(t, both, 109, "Merchant/true")
	m.send(t, 72, fmt.Sprint(lamp))
	each("false", offered(throne, 0, "throne")+offered(lamp, 1, "rclr_lamp"), "false", offered(chair, 0, "rclr_chair"))
	h.send(t, 69, "")
	expectAll(t, both, 109, "Haggler/true")
	h.send(t, 68, "")
	expectAll(t, both, 109, "Haggler/false")
	h.send(t, 69, "")
	expectAll(t, both, 109, "Haggler/true")
	m.send(t, 69, "")
	expectAll(t, both, 109, "Merchant/true")
	expectAll(t, both, 110, "")

	for _, id := range []int64{throne, lamp} {
		if row := furniRow(t, id); row.AvatarID.Int64 != hagglerID || row.UserID != userOf(t, hagglerID) {
			t.Errorf("after the trade the furni %d is stored as %+v, want it in the haggler's hand and its user's", id, row)
		}
	}
	if row := furniRow(t, chair); row.AvatarID.Int64 != merchantID || row.UserID != userOf(t, merchantID) {
		t.Errorf("after the trade the chair is stored as %+v, want it in the merchant's hand and its user's", row)
	}
	// The trade is over: the chair is placed like any furni of the hand.
	m.send(t, 90, fmt.Sprintf("%d 6 6 0", chair))
	expectAll(t, both, 93, object(t, chair, "rclr_chair", 6, 6, 1, 1, 0, "0", "0,0,0"))
}

// A trade that is closed, or whose habbo leaves the room, ends for both and nothing changes hands.
func TestATradeCutShortLosesNothing(t *testing.T) {
	peddlerID := habboWithTickets(t, "Peddler", "peddler")
	habboWithTickets(t, "Dawdler", "dawdler")
	flat := newRoom(t, peddlerID, 2, "Stall", true)
	lamp := giveFurni(t, peddlerID, 1279, "")

	p, _ := login(t, "peddler")
	b, _ := login(t, "dawdler")
	both := []*client{p, b}
	p.enterFlat(t, flat, 47, 42)
	b.enterFlat(t, flat)
	p.nextBody(t, 28)
	p.nextBody(t, 34)

	p.send(t, 71, "1")
	p.expectChat(t, 108, trade("Peddler", "false", "", "Dawdler", "false", ""))
	b.expectChat(t, 108, trade("Dawdler", "false", "", "Peddler", "false", ""))
	p.send(t, 72, fmt.Sprint(lamp))
	p.expectChat(t, 108, trade("Peddler", "false", offered(lamp, 0, "rclr_lamp"), "Dawdler", "false", ""))
	b.expectChat(t, 108, trade("Dawdler", "false", "", "Peddler", "false", offered(lamp, 0, "rclr_lamp")))
	b.send(t, 69, "")
	expectAll(t, both, 109, "Dawdler/true")
	p.send(t, 70, "")
	expectAll(t, both, 110, "")

	b.send(t, 71, "0")
	b.expectChat(t, 108, trade("Dawdler", "false", "", "Peddler", "false", ""))
	p.expectChat(t, 108, trade("Peddler", "false", "", "Dawdler", "false", ""))
	p.send(t, 72, fmt.Sprint(lamp))
	b.expectChat(t, 108, trade("Dawdler", "false", "", "Peddler", "false", offered(lamp, 0, "rclr_lamp")))
	b.send(t, 69, "")
	b.expectChat(t, 109, "Dawdler/true")
	p.send(t, 53, "")
	if id, body := b.nextSkipping(t, 34, 29); id != 110 {
		t.Fatalf("when the other habbo left, the trader received %d %q, want the trade closed, 110", id, body)
	}
	if row := furniRow(t, lamp); row.AvatarID.Int64 != peddlerID || row.UserID != userOf(t, peddlerID) {
		t.Errorf("after the trade was cut short the lamp is stored as %+v, want it in the peddler's hand", row)
	}
}
