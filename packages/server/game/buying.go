package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math/rand/v2"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Why Buy refuses an order.
var (
	// ErrNotForSale: the page does not exist, the buyer does not see it, or it sells no such item.
	ErrNotForSale = errors.New("game: the catalogue does not sell that")
	// ErrClubOnly: the page sells only to club members (decision server/0102).
	ErrClubOnly = errors.New("game: the page sells only to club members")
	// ErrNotEnoughCredits: the user's wallet does not hold the price.
	ErrNotEnoughCredits = errors.New("game: not enough credits")
)

// NoSuchHabboError refuses a present for a name that no habbo has.
type NoSuchHabboError struct{ Name string }

func (e NoSuchHabboError) Error() string { return "game: no habbo is named " + e.Name }

// HandChanged tells a habbo that its hand holds something new, such as a present.
type HandChanged struct{}

// Order is what a habbo asks the catalogue for: a page and one of its items, by their codes, and the extra value the
// page's layout adds, a trophy's inscription or the pattern of a wallpaper, a floor or a landscape. A gift goes to the
// habbo named Receiver, in a box with Note on it (decision server/0094).
type Order struct {
	Page, Item, Extra string
	Gift              bool
	Receiver, Note    string
}

// The layouts whose items keep the order's extra value as their state.
const (
	trophiesLayout = "ctlg_trophies"
	spacesLayout   = "ctlg_spaces"
)

// trophyInscriptionMax is the longest inscription the client's trophies page takes.
const trophyInscriptionMax = 150

// reasonCatalogue is the reason of a purchase in the wallet's history.
const reasonCatalogue = "catalogue"

// presentBoxes is how many boxes a present comes in, present_gen1 to present_gen6, drawn at random as in Holo.
const presentBoxes = 6

// presentNote starts the state of a box, before its note, as the client's present reads it.
const presentNote = "!"

var spacesPattern = regexp.MustCompile(`^[0-9]{1,6}(\.[0-9]{1,6})?$`)

// Buy buys the item for buyer with its user's credits, and returns what the wallet holds after: the wallet pays the
// price, its history gets a line that names the item, and every furni the item gives lands in buyer's hand, all in one
// transaction. The level and the club are read from the store, like the wallet. A gift lands in its receiver's hand
// in place of the buyer's, inside a box with the note; the receiver may be offline, and a name that no habbo has
// charges nothing (NoSuchHabboError).
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
	owner, holder, detail := buyer.UserID, sql.NullInt64{Int64: buyer.ID, Valid: true}, "Catalogue purchase ("+item.Name+")"
	var receiver store.Avatar
	if order.Gift {
		receiver, err = store.New(db).GetAvatarByName(ctx, order.Receiver)
		if store.IsNotFound(err) || err == nil && receiver.ArchivedAt.Valid {
			return 0, NoSuchHabboError{Name: order.Receiver}
		}
		if err != nil {
			return 0, fmt.Errorf("game: buy: %w", err)
		}
		owner, detail = receiver.UserID, detail+", a present for "+receiver.Name
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
			Reason: reasonCatalogue, Detail: detail, CreatedAt: now,
		})
		if err != nil {
			return 0, fmt.Errorf("game: buy: %w", err)
		}
	}
	var box sql.NullInt64
	if order.Gift {
		wrapping, ok := furni.BySprite("present_gen" + strconv.Itoa(rand.IntN(presentBoxes)+1))
		if !ok {
			return 0, errors.New("game: buy: the catalogue has no present box")
		}
		wrapped, err := q.CreateFurni(ctx, store.CreateFurniParams{
			FurniDefinitionID: wrapping.ID, UserID: owner, AvatarID: sql.NullInt64{Int64: receiver.ID, Valid: true},
			State: presentNote + note(order.Note), CreatedAt: now,
		})
		if err != nil {
			return 0, fmt.Errorf("game: buy: %w", err)
		}
		box, holder = sql.NullInt64{Int64: wrapped.ID, Valid: true}, sql.NullInt64{}
	}
	for _, f := range item.Furni {
		for range f.Amount {
			err := furni.Create(ctx, q, f.Sprite, store.CreateFurniParams{
				FurniDefinitionID: f.ID, UserID: owner, AvatarID: holder, BoxFurniID: box, State: state, CreatedAt: now,
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
	if order.Gift {
		// In a room the receiver's hand comes up with the box, as Holo opened it.
		if online, ok := habbo.Get(receiver.ID); ok {
			if _, in := room.In(receiver.ID); in {
				online.Session.Notify(HandChanged{})
			}
		}
	}
	return wallet.Credits, nil
}

// note cuts a present's note at game.presentNoteMaxLength characters (decision server/0106), its control
// characters turned into spaces.
func note(text string) string {
	clean := []rune(strings.Map(func(r rune) rune {
		if r < ' ' {
			return ' '
		}
		return r
	}, text))
	if most := settings.GetIntOr("game.presentNoteMaxLength", 200); len(clean) > most {
		clean = clean[:most]
	}
	return string(clean)
}

// OpenPresent opens the box id that stands in the room viewer is in, and returns the last furni that waited in it,
// which the box's card shows. Only the room's owner opens a box (decision server/0105): what waited in it goes
// to the owner's hand, and the box goes. It reports false for a box that may not be opened, or that held nothing.
func OpenPresent(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) (store.FurniDefinition, bool, error) {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || !owns(r, viewer) {
		return store.FurniDefinition{}, false, nil
	}
	var last store.FurniDefinition
	held := false
	err := r.Furnish(func() error {
		box, ok := r.FurniByID(id)
		if !ok || !strings.HasPrefix(box.Definition.Sprite, "present_gen") {
			return nil
		}
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("game: open present: %w", err)
		}
		defer tx.Rollback()
		q := store.New(db).WithTx(tx)
		contents, err := q.ListBoxFurni(ctx, id)
		if err != nil {
			return fmt.Errorf("game: open present: %w", err)
		}
		if err := q.UnboxFurni(ctx, store.UnboxFurniParams{BoxFurniID: id, UserID: viewer.UserID, AvatarID: viewer.ID}); err != nil {
			return fmt.Errorf("game: open present: %w", err)
		}
		n, err := q.DeleteRoomFurni(ctx, store.DeleteRoomFurniParams{ID: id, RoomID: r.Ref().ID})
		if err != nil {
			return fmt.Errorf("game: open present: %w", err)
		}
		if n == 0 {
			return nil
		}
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("game: open present: %w", err)
		}
		if _, ok := r.RemoveFurni(id); ok {
			broadcast(r, FurniRemoved{ID: id})
			settle(r, box.Tiles())
		}
		if len(contents) > 0 {
			last, held = furni.Get(contents[len(contents)-1].FurniDefinitionID)
		}
		return nil
	})
	return last, held, err
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
