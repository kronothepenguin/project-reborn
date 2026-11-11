package server

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The room's owner turns a credit furni that stands in the room back into credits: the furni goes, the wallet gets
// its worth, read from its name, and the credit history a line. Nobody else redeems, and no other furni is redeemed
// (plans/server decision 0115).
func TestRedeemingCreditFurni(t *testing.T) {
	ownerID := habboWithTickets(t, "Banker", "banker")
	habboWithTickets(t, "Cashier", "cashier")
	flat := newRoom(t, ownerID, 2, "Vault", true)
	bar := giveFurni(t, ownerID, 277, "")
	coin := giveFurni(t, ownerID, 278, "")
	lamp := giveFurni(t, ownerID, 1279, "")
	inHand := giveFurni(t, ownerID, 277, "")
	standFurni(t, bar, flat, 6, 6, 0)
	standFurni(t, coin, flat, 7, 7, 0)
	standFurni(t, lamp, flat, 8, 8, 0)
	before := credits(t, ownerID)

	owner, _ := login(t, "banker")
	guest, _ := login(t, "cashier")
	both := []*client{owner, guest}
	for i, c := range both {
		c.knock(t, flat, "")
		c.expectNext(t, 41, "\x02")
		if i == 0 {
			c.goToFlat(t, flat, 47, 42)
		} else {
			c.goToFlat(t, flat)
		}
		c.arrive(t)
	}
	owner.nextBody(t, 28)
	owner.nextBody(t, 34)

	// A habbo that does not own the room, a furni that is worth nothing, and one that stands in no room: nothing.
	guest.send(t, 183, vl64String(t, int32(bar)))
	owner.send(t, 183, vl64String(t, int32(lamp)))
	owner.send(t, 183, vl64String(t, int32(inHand)))
	owner.send(t, 183, vl64String(t, int32(bar)))
	expectAll(t, both, 94, strconv.FormatInt(bar, 10))
	owner.expectChat(t, 6, fmt.Sprint(before+50))
	owner.send(t, 183, vl64String(t, int32(coin)))
	expectAll(t, both, 94, strconv.FormatInt(coin, 10))
	owner.expectChat(t, 6, fmt.Sprint(before+60))

	if got := credits(t, ownerID); got != before+60 {
		t.Errorf("the wallet holds %d, want %d: a gold bar's 50 and a bronze coin's 10", got, before+60)
	}
	q := store.New(testDB)
	for _, id := range []int64{bar, coin} {
		if _, err := q.GetFurni(t.Context(), id); !store.IsNotFound(err) {
			t.Errorf("the redeemed furni %d is still stored (%v)", id, err)
		}
	}
	if row := furniRow(t, inHand); row.AvatarID.Int64 != ownerID {
		t.Errorf("the gold bar in the hand is stored as %+v, want it untouched", row)
	}
	history, err := q.ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userOf(t, ownerID), RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(history) != 2 || history[1].Credits != 50 || history[1].Reason != "exchange" || history[1].Detail != "Furni exchanged (Gold Bar)" || history[1].Habbo.String != "Banker" {
		t.Errorf("the credit history = %+v, want two lines, the older of 50 for the Gold Bar, by Banker", history)
	}
}
