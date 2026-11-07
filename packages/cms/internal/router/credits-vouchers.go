package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's answers of redeemvoucher.php, and the description of its ledger rows.
const (
	voucherRedeemed = "You have redeemed %d credits successfully."
	voucherNotFound = "Your redeem code could not be found. Please try again."
	voucherRedeem   = "Credit voucher redeem"
	reasonVoucher   = "voucher"
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
// purse with a ledger row, in one transaction.
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
		credits, err := q.RedeemVoucher(ctx, store.RedeemVoucherParams{
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
			answer.Message = fmt.Sprintf(voucherRedeemed, credits)
			err = q.AddWalletCredits(ctx, store.AddWalletCreditsParams{UserID: session.UserID, Credits: credits, UpdatedAt: now})
			if err != nil {
				return err
			}
			err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
				UserID:    session.UserID,
				AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
				Credits:   credits,
				Reason:    reasonVoucher,
				Detail:    voucherRedeem,
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
