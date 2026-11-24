package game

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// PurseChanged tells a habbo's session the purse its user holds now, with the habbo the user object shows beside it.
type PurseChanged struct {
	Habbo   habbo.Habbo
	Account Account
}

// SendPurse reads the purse of userID again after a change outside the game, and tells each of the user's habbos in
// the hotel its credits, tickets and film, PurseChanged. A user with no habbo in the hotel gets nothing: its next
// login reads the store.
func SendPurse(ctx context.Context, db *sql.DB, userID int64) error {
	avatars, err := store.New(db).ListUserAvatars(ctx, userID)
	if err != nil {
		return fmt.Errorf("game: send purse: %w", err)
	}
	var online []habbo.Habbo
	for _, a := range avatars {
		if h, ok := habbo.Get(a.ID); ok {
			online = append(online, h)
		}
	}
	if len(online) == 0 {
		return nil
	}
	account, err := UserAccount(ctx, db, userID)
	if err != nil {
		return fmt.Errorf("game: send purse: %w", err)
	}
	for _, h := range online {
		h.Session.Notify(PurseChanged{Habbo: h, Account: account})
	}
	return nil
}
