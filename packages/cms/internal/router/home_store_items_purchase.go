package router

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's answers of store.php, and the description of its ledger rows.
const (
	storeCannotBuy     = "Sorry, but you can not buy this item!"
	storeNoCredits     = "You do not have enough credits to buy this item."
	storeHasBackground = "You already have a background of this type in your inventory!"
	storePurchase      = "Webstore purchase"
	reasonStore        = "store"
)

type storeError struct {
	Error string `json:"error"`
}

type purchase struct {
	Credits int64 `json:"credits"`
}

// HandleHomeStoreItemsPurchase handles POST /home-store/items/{id}/purchase: the
// wallet pays, the ledger says so and the inventory grows, in one transaction.
// The checks come in Holo's order: the item, the credits, then a background the
// user has already ([0064] makes a background an unlock).
func (r *Router) HandleHomeStoreItemsPurchase(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{storeCannotBuy})
		return
	}
	item, ok, err := r.sellable(ctx, id)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !ok {
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{storeCannotBuy})
		return
	}

	refusal := ""
	var credits int64
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		if item.Kind == "background" {
			held, err := q.GetHomeInventoryQuantity(ctx, store.GetHomeInventoryQuantityParams{UserID: session.UserID, HomeStoreItemID: item.ID})
			switch {
			case err == nil && held > 0:
				refusal = storeHasBackground
				return nil
			case err != nil && !store.IsNotFound(err):
				return err
			}
		}
		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{
			UserID:    session.UserID,
			Credits:   -item.Price,
			UpdatedAt: now,
		})
		if err != nil {
			return err
		}
		if changed == 0 {
			refusal = storeNoCredits
			return nil
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    session.UserID,
			AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Credits:   -item.Price,
			Reason:    reasonStore,
			Detail:    storePurchase,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		err = q.AddHomeInventory(ctx, store.AddHomeInventoryParams{UserID: session.UserID, HomeStoreItemID: item.ID, Quantity: item.Quantity})
		if err != nil {
			return err
		}
		wallet, err := q.GetWallet(ctx, session.UserID)
		credits = wallet.Credits
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{refusal})
	default:
		r.sendPurse(ctx, session.UserID)
		r.answerJSON(w, http.StatusOK, purchase{Credits: credits})
	}
}

// sellable reports whether the habbo making the request may buy item id: it must
// exist, be sold, and sit in a category the habbo may see.
func (r *Router) sellable(ctx context.Context, id int64) (store.HomeStoreItem, bool, error) {
	item, err := r.deps.Queries.GetHomeStoreItem(ctx, id)
	if store.IsNotFound(err) {
		return item, false, nil
	}
	if err != nil {
		return item, false, err
	}
	category, err := r.deps.Queries.GetHomeStoreCategory(ctx, item.HomeStoreCategoryID)
	if err != nil {
		return item, false, err
	}
	return item, item.Enabled && r.shown(ctx, category), nil
}
