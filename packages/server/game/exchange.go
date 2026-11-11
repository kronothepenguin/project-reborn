package game

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// reasonExchange is the reason of a credit furni turned back into credits in the wallet's history.
const reasonExchange = "exchange"

// creditWorth reads what a credit furni is worth from its sprite, as Holo did: the number after CF_ or CFC_, 50 for
// CF_50_goldbar. It reports false for any other furni.
func creditWorth(sprite string) (int64, bool) {
	parts := strings.Split(sprite, "_")
	if kind := strings.ToLower(parts[0]); len(parts) < 2 || (kind != "cf" && kind != "cfc") {
		return 0, false
	}
	worth, err := strconv.ParseInt(parts[1], 10, 64)
	return worth, err == nil && worth > 0
}

// soldAs returns the name the catalogue sells the furni definition under, alone, and its sprite when no item does.
func soldAs(d store.FurniDefinition) string {
	for _, page := range catalogue.Pages() {
		for _, item := range page.Items {
			if !item.Deal() && len(item.Furni) == 1 && item.Furni[0].ID == d.ID {
				return item.Name
			}
		}
	}
	return d.Sprite
}

// RedeemFurni turns the credit furni id that stands in the room viewer is in back into credits
// (CONVERT_FURNI_TO_CREDITS), and returns the new balance of viewer's user. Only the room's owner redeems, as Holo had
// it (plans/server decision 0115). In one transaction the furni is destroyed, the wallet gets its worth and the
// credit history a line; then the room's copy changes and the room is told. It reports false for a furni that is not
// redeemed.
func RedeemFurni(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) (int64, bool, error) {
	r, item, ok := in(viewer, id)
	if !ok || !owns(r, viewer) {
		return 0, false, nil
	}
	worth, ok := creditWorth(item.Definition.Sprite)
	if !ok {
		return 0, false, nil
	}
	var balance int64
	redeemed := false
	err := r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		defer tx.Rollback()
		q := store.New(db).WithTx(tx)
		now := time.Now().UTC()
		n, err := q.DeleteRoomFurni(ctx, store.DeleteRoomFurniParams{ID: id, RoomID: r.Ref().ID})
		if err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		if n == 0 {
			return nil
		}
		if err := q.AddWalletCredits(ctx, store.AddWalletCreditsParams{UserID: viewer.UserID, Credits: worth, UpdatedAt: now}); err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID: viewer.UserID, AvatarID: sql.NullInt64{Int64: viewer.ID, Valid: true}, Credits: worth,
			Reason: reasonExchange, Detail: "Furni exchanged (" + soldAs(item.Definition) + ")", CreatedAt: now,
		})
		if err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		wallet, err := q.GetWallet(ctx, viewer.UserID)
		if err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("game: redeem furni: %w", err)
		}
		balance, redeemed = wallet.Credits, true
		if _, ok := r.RemoveFurni(id); ok {
			broadcast(r, FurniRemoved{ID: id})
			settle(r, item.Tiles())
		}
		return nil
	})
	return balance, redeemed, err
}
