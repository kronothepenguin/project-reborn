package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// Why Buy refuses an order.
var (
	// ErrNotForSale: the page does not exist, the buyer does not see it, or it sells no such item.
	ErrNotForSale = errors.New("game: the catalogue does not sell that")
	// ErrClubOnly: the page sells only to club members (plans/server decision 0102).
	ErrClubOnly = errors.New("game: the page sells only to club members")
	// ErrNotEnoughCredits: the user's wallet does not hold the price.
	ErrNotEnoughCredits = errors.New("game: not enough credits")
)

// Order is what a habbo asks the catalogue for: a page and one of its items, by their codes, and the extra value the
// page's layout adds, a trophy's inscription or the pattern of a wallpaper, a floor or a landscape.
type Order struct {
	Page, Item, Extra string
}

// The layouts whose items keep the order's extra value as their state.
const (
	trophiesLayout = "ctlg_trophies"
	spacesLayout   = "ctlg_spaces"
)

// postItPadNotes is how many notes a new pad of post-its holds, as Holo's did.
const postItPadNotes = "20"

// trophyInscriptionMax is the longest inscription the client's trophies page takes.
const trophyInscriptionMax = 150

// reasonCatalogue is the reason of a purchase in the wallet's history.
const reasonCatalogue = "catalogue"

var spacesPattern = regexp.MustCompile(`^[0-9]{1,6}(\.[0-9]{1,6})?$`)

// Buy buys the item for buyer with its user's credits, and returns what the wallet holds after: the wallet pays the
// price, its history gets a line that names the item, and every furni the item gives lands in buyer's hand, all in one
// transaction. The level and the club are read from the store, like the wallet.
func Buy(ctx context.Context, db *sql.DB, buyer habbo.Habbo, order Order) (credits int64, err error) {
	page, ok := catalogue.Get(order.Page)
	if !ok {
		return 0, ErrNotForSale
	}
	level, member, err := levelAndClub(ctx, db, buyer.UserID)
	if err != nil {
		return 0, fmt.Errorf("game: buy: %w", err)
	}
	i := slices.IndexFunc(page.Items, func(item catalogue.Item) bool { return item.Code == order.Item })
	if !seesPage(page, level, member) || i < 0 {
		return 0, ErrNotForSale
	}
	item := page.Items[i]
	state, ok := newFurniState(page, buyer, order.Extra, time.Now())
	if !ok {
		return 0, ErrNotForSale
	}
	if page.ClubOnly && !member {
		return 0, ErrClubOnly
	}

	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("game: buy: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	now := time.Now().UTC()
	if item.Price > 0 {
		paid, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{UserID: buyer.UserID, Credits: -item.Price, UpdatedAt: now})
		if err != nil {
			return 0, fmt.Errorf("game: buy: %w", err)
		}
		if paid == 0 {
			return 0, ErrNotEnoughCredits
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID: buyer.UserID, AvatarID: sql.NullInt64{Int64: buyer.ID, Valid: true}, Credits: -item.Price,
			Reason: reasonCatalogue, Detail: "Catalogue purchase (" + item.Name + ")", CreatedAt: now,
		})
		if err != nil {
			return 0, fmt.Errorf("game: buy: %w", err)
		}
	}
	for _, f := range item.Furni {
		pieceState := state
		if pieceState == "" && strings.HasPrefix(f.Sprite, "post.it") {
			pieceState = postItPadNotes
		}
		for range f.Amount {
			_, err := q.CreateFurni(ctx, store.CreateFurniParams{
				FurniDefinitionID: f.ID, UserID: buyer.UserID, AvatarID: sql.NullInt64{Int64: buyer.ID, Valid: true}, State: pieceState, CreatedAt: now,
			})
			if err != nil {
				return 0, fmt.Errorf("game: buy: %w", err)
			}
		}
	}
	wallet, err := q.GetWallet(ctx, buyer.UserID)
	if err != nil {
		return 0, fmt.Errorf("game: buy: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("game: buy: %w", err)
	}
	return wallet.Credits, nil
}

// newFurniState returns the state a furni bought on page starts with, and false for an extra value its layout cannot
// take. A trophy keeps its buyer's name, the day and the inscription, tab-separated, as the client's trophy reads
// them; a wallpaper, a floor and a landscape keep the pattern the buyer chose.
func newFurniState(page catalogue.Page, buyer habbo.Habbo, extra string, now time.Time) (string, bool) {
	switch page.Layout {
	case trophiesLayout:
		inscription := strings.Map(func(r rune) rune {
			if r < ' ' {
				return ' '
			}
			return r
		}, extra)
		if r := []rune(inscription); len(r) > trophyInscriptionMax {
			inscription = string(r[:trophyInscriptionMax])
		}
		return buyer.Name + "\t" + now.Format("02-01-2006") + "\t" + inscription, true
	case spacesLayout:
		return extra, spacesPattern.MatchString(extra)
	}
	return "", true
}
