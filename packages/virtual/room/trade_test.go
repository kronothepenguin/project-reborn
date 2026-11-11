package room

import (
	"slices"
	"testing"
)

// An open trade lives in the loaded room: a habbo trades with one habbo at a time, a furni is offered once and up to
// the most a side may, an offer takes the accepts away, and the trade ends for both when either closes it or leaves.
func TestATradeLivesInTheRoom(t *testing.T) {
	openHotel(t)
	ref := Ref{Public: true, ID: 101}
	sessions := map[int64]*session{9311: {}, 9312: {}, 9313: {}}
	r, _, _ := enter(t, ref, 9311, sessions[9311])
	enter(t, ref, 9312, sessions[9312])
	enter(t, ref, 9313, sessions[9313])

	if _, ok := r.OpenTrade(9311, 0); ok {
		t.Error("a habbo opened a trade with itself")
	}
	if _, ok := r.OpenTrade(9311, 7); ok {
		t.Error("a trade opened with nobody")
	}
	if trade, ok := r.OpenTrade(9311, 1); !ok || trade.Sides[0].AvatarID != 9311 || trade.Sides[1].AvatarID != 9312 {
		t.Fatalf("OpenTrade = %+v, %v; want a trade between the two", trade, ok)
	}
	if _, ok := r.OpenTrade(9313, 1); ok {
		t.Error("a habbo that trades opened a second trade")
	}
	r.AcceptTrade(9312, true)
	if _, ok := r.OfferFurni(9311, 5, 2); !ok {
		t.Fatal("OfferFurni refused a first furni")
	}
	if _, ok := r.OfferFurni(9311, 5, 2); ok {
		t.Error("a furni was offered twice")
	}
	r.OfferFurni(9311, 6, 2)
	if _, ok := r.OfferFurni(9311, 7, 2); ok {
		t.Error("a side offered more than the most it may")
	}
	trade, _ := r.TradeOf(9312)
	own, other := trade.Side(9312)
	if own.Accepted || !slices.Equal(other.Furni, []int64{5, 6}) {
		t.Errorf("the trade is %+v; want the offer to take the accept away and hold the furni 5 and 6", trade)
	}
	if was, is, ok := r.AcceptTrade(9311, true); !ok || was.Sides[0].Accepted || !is.Sides[0].Accepted {
		t.Errorf("AcceptTrade = %+v, %+v, %v; want the first side accepted", was, is, ok)
	}

	left, ok := Leave(9312, sessions[9312])
	if !ok || !left.Traded || left.Trade.Sides[0].AvatarID != 9311 {
		t.Fatalf("Leave = %+v, %v; want the trade it ended", left, ok)
	}
	if _, ok := r.TradeOf(9311); ok {
		t.Error("the trade stayed open after a habbo of it left")
	}
	if _, ok := r.OpenTrade(9311, 2); !ok {
		t.Error("a habbo whose trade ended could not open another")
	}
	if _, ok := r.CloseTrade(9313); !ok {
		t.Error("CloseTrade found no trade for the other side")
	}
	if _, ok := r.CloseTrade(9311); ok {
		t.Error("a trade was closed twice")
	}
	Leave(9311, sessions[9311])
	Leave(9313, sessions[9313])
}
