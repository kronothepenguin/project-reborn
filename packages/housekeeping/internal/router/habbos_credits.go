package router

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's one answer for all of it, and the description of its ledger rows.
const (
	amountInvalid = "Amount is not valid or this user does not exist!"
	staffTransfer = "Housekeeping transfer/refund"
	reasonStaff   = "staff"
)

// HandleHabboCreditsGive handles POST /housekeeping/habbos/{id}/credits, Holo's
// Give Credits / Refunds. The wallet is the user's, and the ledger row keeps the
// habbo the staff member acted on. A negative amount takes credits back, and only
// while the wallet can pay.
func (r *Router) HandleHabboCreditsGive(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "give credits", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}
	amount, err := strconv.ParseInt(req.PostFormValue("amount"), 10, 64)
	if err != nil || amount < -maxWalletAmount || amount > maxWalletAmount {
		r.refuseHabbo(w, req, avatar, amountInvalid)
		return
	}

	applied := false
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{
			UserID:    avatar.UserID,
			Credits:   amount,
			UpdatedAt: now,
		})
		if err != nil || changed == 0 {
			return err
		}
		applied = true
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    avatar.UserID,
			AvatarID:  sql.NullInt64{Int64: avatar.ID, Valid: true},
			Credits:   amount,
			Reason:    reasonStaff,
			Detail:    staffTransfer,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action:       actionCreditsGive,
			detail:       strconv.FormatInt(amount, 10),
			targetUser:   avatar.UserID,
			targetAvatar: avatar.ID,
		})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case !applied:
		r.refuseHabbo(w, req, avatar, amountInvalid)
	default:
		http.Redirect(w, req, habboPath(avatar.ID)+"?gave="+strconv.FormatInt(amount, 10), http.StatusSeeOther)
	}
}
