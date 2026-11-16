package game

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// OwnLookChanged tells a habbo's session its new look and motto, with the account its client shows beside them.
type OwnLookChanged struct {
	Habbo   habbo.Habbo
	Account Account
}

// LookChanged tells the habbos in a room the new figure, gender and motto of the habbo of that index.
type LookChanged struct {
	Index  int
	Figure string
	Gender string
	Motto  string
}

// SendLook reads the habbo avatarID again after a change outside the game, and, while it is online, updates the copy
// the game holds and shows its figure, gender and motto to it, OwnLookChanged, and to the room it is in, LookChanged
// (decision reborn/0013). An offline habbo gets nothing: its next login reads the store.
func SendLook(ctx context.Context, db *sql.DB, avatarID int64) error {
	q := store.New(db)
	avatar, err := q.GetAvatar(ctx, avatarID)
	if store.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("game: send look: %w", err)
	}
	h, ok := habbo.Get(avatarID)
	if !ok {
		return nil
	}
	account, err := UserAccount(ctx, db, h.UserID)
	if err != nil {
		return fmt.Errorf("game: send look: %w", err)
	}
	// A second login since Get read the store itself, so the session it replaced gets nothing.
	if !habbo.Update(avatarID, h.Session, func(h *habbo.Habbo) {
		h.Figure, h.Gender, h.Motto = avatar.Figure, avatar.Gender, avatar.Motto
	}) {
		return nil
	}
	h.Figure, h.Gender, h.Motto = avatar.Figure, avatar.Gender, avatar.Motto
	h.Session.Notify(OwnLookChanged{Habbo: h, Account: account})
	if r, ok := room.In(avatarID); ok {
		if o, ok := r.Occupant(avatarID); ok && o.Session == h.Session {
			broadcast(r, LookChanged{Index: o.Index, Figure: avatar.Figure, Gender: avatar.Gender, Motto: avatar.Motto})
		}
	}
	return nil
}
