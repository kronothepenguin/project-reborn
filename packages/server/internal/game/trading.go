package game

import (
	"context"
	"database/sql"
	"fmt"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// TradeOpening is what TRADE_OPEN did.
type TradeOpening int

const (
	// TradeNotOpened: nothing to trade with, or one of the two trades already.
	TradeNotOpened TradeOpening = iota
	TradeOpened
	// TradeNotAllowed: the habbo holds no fuse_trade; OtherNotAllowed: the other habbo holds none.
	TradeNotAllowed
	OtherNotAllowed
)

// TradeChanged shows a habbo its trade: its own side first, then the other's. TradeAccepted tells it that the habbo
// Name accepted, or no longer does, and TradeClosed that the trade ended, done or not.
type (
	TradeChanged struct{ Sides [2]TradeOffer }
	TradeOffer   struct {
		Name     string
		Accepted bool
		Items    []HandItem
	}
	TradeAccepted struct {
		Name     string
		Accepted bool
	}
	TradeClosed struct{}
)

// OpenTrade opens a trade between viewer and the habbo that has index in viewer's room (TRADE_OPEN), in any room, as
// Holo did (decision server/0112): both show the status trd and see the empty trade. A habbo trades with one
// habbo at a time, and both must hold fuse_trade.
func OpenTrade(ctx context.Context, db *sql.DB, viewer habbo.Habbo, index int) (TradeOpening, error) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return TradeNotOpened, nil
	}
	if !hasFuse(viewer, auth.FuseTrade) {
		return TradeNotAllowed, nil
	}
	for _, o := range r.Occupants() {
		if other, ok := habbo.Get(o.AvatarID); ok && o.Index == index && o.AvatarID != viewer.ID && !hasFuse(other, auth.FuseTrade) {
			return OtherNotAllowed, nil
		}
	}
	t, ok := r.OpenTrade(viewer.ID, index)
	if !ok {
		return TradeNotOpened, nil
	}
	for _, side := range t.Sides {
		r.Update(side.AvatarID, func(o *room.Occupant) {
			o.Statuses, o.Changed = setStatus(o.Statuses, room.Status{Action: "trd"}), true
		})
	}
	return TradeOpened, showTrade(ctx, db, r, t)
}

// OfferFurni puts the furni id of viewer's hand on its side of the trade (TRADE_ADDITEM), which takes both accepts
// away, and shows both the trade. Only a tradeable furni is offered, once, and a side offers game.maxTradeFurni at
// most (decision server/0113). The furni stays in the hand, locked, until the trade ends (decision
// server/0114).
func OfferFurni(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, ok := room.In(viewer.ID)
	if !ok {
		return nil
	}
	if _, ok := r.TradeOf(viewer.ID); !ok {
		return nil
	}
	q := store.New(db)
	row, err := q.GetFurni(ctx, id)
	if store.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("game: offer furni: %w", err)
	}
	if d, ok := furni.Get(row.FurniDefinitionID); !ok || !d.Tradeable || !row.AvatarID.Valid || row.AvatarID.Int64 != viewer.ID {
		return nil
	}
	t, ok := r.OfferFurni(viewer.ID, id, settings.Int(ctx, q, "game.maxTradeFurni"))
	if !ok {
		return nil
	}
	return showTrade(ctx, db, r, t)
}

// AcceptTrade accepts viewer's trade (TRADE_ACCEPT), and both see it. Once both have accepted, every furni on offer
// changes hands in one transaction (decision server/0092) and the trade ends; when a furni is no longer in its
// habbo's hand, nothing changes hands and the trade ends all the same.
func AcceptTrade(ctx context.Context, db *sql.DB, viewer habbo.Habbo) error {
	r, ok := room.In(viewer.ID)
	if !ok {
		return nil
	}
	was, is, ok := r.AcceptTrade(viewer.ID, true)
	if !ok {
		return nil
	}
	tellAccepts(r, was, is)
	if !is.Sides[0].Accepted || !is.Sides[1].Accepted {
		return nil
	}
	// Whoever closes the trade swaps the furni: two accepts at once swap them once.
	t, ok := r.CloseTrade(viewer.ID)
	if !ok {
		return nil
	}
	err := swap(ctx, db, t)
	endTrade(r, t)
	return err
}

// UnacceptTrade takes both accepts of viewer's trade away (TRADE_UNACCEPT), as Holo did, and both see it.
func UnacceptTrade(viewer habbo.Habbo) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return
	}
	if was, is, ok := r.AcceptTrade(viewer.ID, false); ok {
		tellAccepts(r, was, is)
	}
}

// CloseTrade ends viewer's trade for both (TRADE_CLOSE): nothing changes hands.
func CloseTrade(viewer habbo.Habbo) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return
	}
	if t, ok := r.CloseTrade(viewer.ID); ok {
		endTrade(r, t)
	}
}

// onOffer reports whether the furni id is on viewer's side of an open trade, where it is locked (decision
// server/0114).
func onOffer(viewer habbo.Habbo, id int64) bool {
	r, ok := room.In(viewer.ID)
	if !ok {
		return false
	}
	t, ok := r.TradeOf(viewer.ID)
	if !ok {
		return false
	}
	own, _ := t.Side(viewer.ID)
	return slices.Contains(own.Furni, id)
}

// swap gives each side's furni to the other side's habbo and its user, in one transaction. A furni that its habbo's
// hand no longer holds undoes it all.
func swap(ctx context.Context, db *sql.DB, t room.Trade) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("game: trade: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	for i, giver := range t.Sides {
		taker, ok := habbo.Get(t.Sides[1-i].AvatarID)
		if !ok {
			return nil
		}
		for _, id := range giver.Furni {
			n, err := q.TradeFurni(ctx, store.TradeFurniParams{ID: id, FromAvatarID: giver.AvatarID, UserID: taker.UserID, ToAvatarID: taker.ID})
			if err != nil {
				return fmt.Errorf("game: trade: %w", err)
			}
			if n == 0 {
				return nil
			}
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("game: trade: %w", err)
	}
	return nil
}

// endTrade tells both habbos of a closed trade that it ended, and takes their status trd away. One that left the
// room is told nothing.
func endTrade(r *room.Room, t room.Trade) {
	for _, side := range t.Sides {
		r.Update(side.AvatarID, func(o *room.Occupant) {
			o.Statuses, o.Changed = without(o.Statuses, "trd"), true
		})
		if o, ok := r.Occupant(side.AvatarID); ok {
			o.Session.Notify(TradeClosed{})
		}
	}
}

func tellAccepts(r *room.Room, was, is room.Trade) {
	for i, side := range is.Sides {
		if side.Accepted == was.Sides[i].Accepted {
			continue
		}
		h, ok := habbo.Get(side.AvatarID)
		if !ok {
			continue
		}
		for _, to := range is.Sides {
			if o, ok := r.Occupant(to.AvatarID); ok {
				o.Session.Notify(TradeAccepted{Name: h.Name, Accepted: side.Accepted})
			}
		}
	}
}

// showTrade sends each habbo of the trade both sides, its own first, with every furni on offer as the store has it.
func showTrade(ctx context.Context, db *sql.DB, r *room.Room, t room.Trade) error {
	var offers [2]TradeOffer
	q := store.New(db)
	for i, side := range t.Sides {
		h, ok := habbo.Get(side.AvatarID)
		if !ok {
			return nil
		}
		offers[i] = TradeOffer{Name: h.Name, Accepted: side.Accepted}
		for position, id := range side.Furni {
			row, err := q.GetFurni(ctx, id)
			if store.IsNotFound(err) {
				continue
			}
			if err != nil {
				return fmt.Errorf("game: trade: %w", err)
			}
			if d, ok := furni.Get(row.FurniDefinitionID); ok {
				offers[i].Items = append(offers[i].Items, HandItem{Furni: row, Definition: d, Position: position})
			}
		}
	}
	for i, side := range t.Sides {
		if o, ok := r.Occupant(side.AvatarID); ok {
			o.Session.Notify(TradeChanged{Sides: [2]TradeOffer{offers[i], offers[1-i]}})
		}
	}
	return nil
}
