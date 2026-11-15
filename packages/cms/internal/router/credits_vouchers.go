package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
)

// Holo's answers of redeemvoucher.php, and the descriptions of its ledger rows.
const (
	voucherRedeemed     = "You have redeemed %d credits successfully."
	voucherItemRedeemed = "You have redeemed this item of furniture successfully."
	voucherNotFound     = "Your redeem code could not be found. Please try again."
	voucherRedeem       = "Credit voucher redeem"
	voucherItemRedeem   = "Item voucher redeem"
	reasonVoucher       = "voucher"
)

type voucherBody struct {
	Code string `json:"code"`
}

// voucherAnswer takes the purse's place, as redeemvoucher.php's answer did: the
// balance and Holo's message, green with 200 and red with 422.
type voucherAnswer struct {
	Credits int64  `json:"credits"`
	Message string `json:"message"`
}

// HandleCreditsVouchersRedeem handles POST /credits/vouchers, redeemvoucher.php:
// the active habbo claims an unused voucher, and its credits go to the user's
// purse with a ledger row, in one transaction. An item voucher puts its furni in
// the active habbo's hand, as a purchase would give it (decision
// server/0125), and its ledger row holds 0 credits and the furni's name (decision
// server/0121).
func (r *Router) HandleCreditsVouchersRedeem(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body voucherBody
	if !readEdit(w, req, &body) {
		return
	}
	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	found := false
	var answer voucherAnswer
	err := r.inTx(ctx, func(q *store.Queries) error {
		// MySQL compared Holo's codes in any case, which the store does, and
		// without the spaces after them.
		voucher, err := q.RedeemVoucher(ctx, store.RedeemVoucherParams{
			RedeemedByAvatarID: session.AvatarID,
			RedeemedAt:         sql.NullTime{Time: now, Valid: true},
			Code:               strings.TrimRight(body.Code, " "),
		})
		switch {
		case store.IsNotFound(err):
		case err != nil:
			return err
		default:
			found = true
			answer.Message = fmt.Sprintf(voucherRedeemed, voucher.Credits)
			detail := voucherRedeem
			if voucher.FurniDefinitionID.Valid {
				name, err := giveFurni(ctx, q, voucher.FurniDefinitionID.Int64, session, now)
				if err != nil {
					return err
				}
				answer.Message, detail = voucherItemRedeemed, voucherItemRedeem+" ("+name+")"
			} else {
				err = q.AddWalletCredits(ctx, store.AddWalletCreditsParams{UserID: session.UserID, Credits: voucher.Credits, UpdatedAt: now})
				if err != nil {
					return err
				}
			}
			err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
				UserID:    session.UserID,
				AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
				Credits:   voucher.Credits,
				Reason:    reasonVoucher,
				Detail:    detail,
				CreatedAt: now,
			})
			if err != nil {
				return err
			}
		}
		wallet, err := q.GetWallet(ctx, session.UserID)
		answer.Credits = wallet.Credits
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case !found:
		answer.Message = voucherNotFound
		r.answerJSON(w, http.StatusUnprocessableEntity, answer)
	default:
		r.answerJSON(w, http.StatusOK, answer)
	}
}

// giveFurni puts the furni of the definition in the hand of the session's habbo,
// and returns the name the catalogue sells it under, or its sprite when no item
// sells it alone.
func giveFurni(ctx context.Context, q *store.Queries, definitionID int64, session auth.Session, now time.Time) (string, error) {
	item, err := q.GetFurniDefinition(ctx, definitionID)
	if err != nil {
		return "", err
	}
	err = furni.Create(ctx, q, item.Sprite, store.CreateFurniParams{
		FurniDefinitionID: item.ID, UserID: session.UserID,
		AvatarID: sql.NullInt64{Int64: session.AvatarID, Valid: true}, CreatedAt: now,
	})
	if err != nil {
		return "", err
	}
	name, err := q.GetFurniName(ctx, item.ID)
	if store.IsNotFound(err) {
		return item.Sprite, nil
	}
	return name, err
}
