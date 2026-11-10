package game

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Account is what the client shows of the user behind a habbo, whose habbos all share it: the wallet, and whether the
// user takes the newsletter, which the user object sends as direct mail.
type Account struct {
	Credits, Tickets, Film int64
	Newsletter             bool
}

// UserAccount reads the account of userID from the store, where every change to the wallet goes at once.
func UserAccount(ctx context.Context, db *sql.DB, userID int64) (Account, error) {
	q := store.New(db)
	user, err := q.GetUser(ctx, userID)
	if err != nil {
		return Account{}, fmt.Errorf("game: account: %w", err)
	}
	wallet, err := q.GetWallet(ctx, userID)
	if err != nil {
		return Account{}, fmt.Errorf("game: account: %w", err)
	}
	return Account{Credits: wallet.Credits, Tickets: wallet.Tickets, Film: wallet.Film, Newsletter: user.Newsletter}, nil
}
