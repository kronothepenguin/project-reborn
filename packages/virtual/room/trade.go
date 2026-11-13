package room

import "slices"

// Trade is an open trade between two habbos of a room: what each offers from its hand, by furni id, and whether it
// accepted. It lives in memory, in the loaded room, and ends when either habbo leaves (decisions server/0092
// and server/0098).
type Trade struct{ Sides [2]TradeSide }

// TradeSide is one habbo's side of a trade.
type TradeSide struct {
	AvatarID int64
	Accepted bool
	Furni    []int64
}

// Side returns the side of the habbo avatarID and the other one.
func (t Trade) Side(avatarID int64) (own, other TradeSide) {
	if t.Sides[0].AvatarID == avatarID {
		return t.Sides[0], t.Sides[1]
	}
	return t.Sides[1], t.Sides[0]
}

func (t *Trade) clone() Trade {
	c := *t
	for i := range c.Sides {
		c.Sides[i].Furni = slices.Clone(c.Sides[i].Furni)
	}
	return c
}

func (t *Trade) side(avatarID int64) *TradeSide {
	if t.Sides[0].AvatarID == avatarID {
		return &t.Sides[0]
	}
	return &t.Sides[1]
}

// OpenTrade opens a trade between the habbo avatarID and the habbo that has index in the room, and returns it. It
// reports false when either is not in the room or trades already, and for a habbo with itself.
func (r *Room) OpenTrade(avatarID int64, index int) (Trade, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.occupants[avatarID]; !ok || r.unloaded || r.trades[avatarID] != nil {
		return Trade{}, false
	}
	for _, o := range r.occupants {
		if o.Index != index {
			continue
		}
		if o.AvatarID == avatarID || r.trades[o.AvatarID] != nil {
			return Trade{}, false
		}
		t := &Trade{Sides: [2]TradeSide{{AvatarID: avatarID}, {AvatarID: o.AvatarID}}}
		r.trades[avatarID], r.trades[o.AvatarID] = t, t
		return t.clone(), true
	}
	return Trade{}, false
}

// TradeOf returns the open trade of the habbo avatarID.
func (r *Room) TradeOf(avatarID int64) (Trade, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	t := r.trades[avatarID]
	if t == nil {
		return Trade{}, false
	}
	return t.clone(), true
}

// OfferFurni puts the furni on the side of the habbo avatarID, which takes both accepts away, and returns the trade.
// It reports false for a habbo that trades nothing, a furni already on offer, and a side that offers most already.
func (r *Room) OfferFurni(avatarID, furniID int64, most int) (Trade, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	t := r.trades[avatarID]
	if t == nil {
		return Trade{}, false
	}
	own := t.side(avatarID)
	if len(own.Furni) >= most || slices.Contains(own.Furni, furniID) {
		return Trade{}, false
	}
	own.Furni = append(own.Furni, furniID)
	t.Sides[0].Accepted, t.Sides[1].Accepted = false, false
	return t.clone(), true
}

// AcceptTrade accepts the trade for the habbo avatarID, or takes both accepts away, as Holo did when one side took
// its own away. It returns the trade as it was and as it is.
func (r *Room) AcceptTrade(avatarID int64, accept bool) (was, is Trade, ok bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	t := r.trades[avatarID]
	if t == nil {
		return Trade{}, Trade{}, false
	}
	was = t.clone()
	if accept {
		t.side(avatarID).Accepted = true
	} else {
		t.Sides[0].Accepted, t.Sides[1].Accepted = false, false
	}
	return was, t.clone(), true
}

// CloseTrade ends the trade of the habbo avatarID, for both sides, and returns it. Only one caller gets a trade that
// two habbos close at once.
func (r *Room) CloseTrade(avatarID int64) (Trade, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.closeTrade(avatarID)
}

// closeTrade runs under the room's lock.
func (r *Room) closeTrade(avatarID int64) (Trade, bool) {
	t := r.trades[avatarID]
	if t == nil {
		return Trade{}, false
	}
	delete(r.trades, t.Sides[0].AvatarID)
	delete(r.trades, t.Sides[1].AvatarID)
	return t.clone(), true
}
