package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const reasonClub = "club"

// Why a club purchase fails, which the dialog words as club_subscribe.php did.
const (
	subscriptionCredits = "credits"
	subscriptionLimit   = "limit"
)

type subscriptionBody struct {
	Months int `json:"months"`
}

// subscriptionAnswer is club_subscribe.php's answer, with the club and the purse
// as they stand after it, which the membership box shows as ajax_club.php did.
type subscriptionAnswer struct {
	Months    int    `json:"months,omitzero"`
	Error     string `json:"error,omitempty"`
	MaxMonths int    `json:"maxMonths,omitzero"`
	Days      int    `json:"days"`
	Credits   int64  `json:"credits"`
}

// clubOption is club_subscribe.php's choice: 1, 3 or 6 months at their price, and
// one month for any other number.
func (r *Router) clubOption(ctx context.Context, months int) (int, int) {
	switch months {
	case 3:
		return 3, settings.Int(ctx, r.deps.Queries, "club.price3Months")
	case 6:
		return 6, settings.Int(ctx, r.deps.Queries, "club.price6Months")
	}
	return 1, settings.Int(ctx, r.deps.Queries, "club.price1Month")
}

// HandleClubSubscriptionsPurchase handles POST /club/subscriptions,
// club_subscribe.php: the active habbo buys club months for the user from the
// shared purse. The debit, its ledger row, the period and HC1 for every habbo of
// the user are written together (0103).
func (r *Router) HandleClubSubscriptionsPurchase(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body subscriptionBody
	if !readEdit(w, req, &body) {
		return
	}
	session, _ := auth.FromContext(ctx)
	months, price := r.clubOption(ctx, body.Months)
	daysPerMonth := settings.Int(ctx, r.deps.Queries, "club.daysPerMonth")
	maxMonths := settings.Int(ctx, r.deps.Queries, "club.maxMonths")
	now := time.Now().UTC()

	var answer subscriptionAnswer
	err := r.inTx(ctx, func(q *store.Queries) error {
		wallet, err := q.GetWallet(ctx, session.UserID)
		if err != nil {
			return err
		}
		// A period bought during the club starts where the last one ends.
		start := now
		switch end, err := q.GetLatestClubEnd(ctx, session.UserID); {
		case err == nil && end.After(now):
			start = end
		case err != nil && !store.IsNotFound(err):
			return err
		}
		answer.Days, answer.Credits = daysLeft(start, now), wallet.Credits
		if wallet.Credits < int64(price) {
			answer.Error = subscriptionCredits
			return nil
		}
		// Holo's months_left counted the month under way as a whole one.
		monthsLeft := (answer.Days + daysPerMonth - 1) / daysPerMonth
		if maxMonths != 0 && monthsLeft+months > maxMonths {
			answer.Error, answer.MaxMonths = subscriptionLimit, maxMonths
			return nil
		}

		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{UserID: session.UserID, Credits: -int64(price), UpdatedAt: now})
		if err != nil {
			return err
		}
		if changed == 0 {
			answer.Error = subscriptionCredits
			return nil
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    session.UserID,
			AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Credits:   -int64(price),
			Reason:    reasonClub,
			Detail:    fmt.Sprintf("Club subscription (%d month(s))", months),
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		end := start.AddDate(0, 0, months*daysPerMonth)
		err = q.CreateClubSubscription(ctx, store.CreateClubSubscriptionParams{UserID: session.UserID, StartsAt: start, EndsAt: end, CreatedAt: now})
		if err != nil {
			return err
		}

		badges, err := q.ListAvatarBadges(ctx, session.AvatarID)
		if err != nil {
			return err
		}
		given := !slices.ContainsFunc(badges, func(b store.AvatarBadge) bool { return b.Code == clubBadge })
		_, err = q.GrantBadgeToUserAvatars(ctx, store.GrantBadgeToUserAvatarsParams{Code: clubBadge, GrantedAt: now, UserID: session.UserID})
		if err != nil {
			return err
		}
		// As Holo's GiveHC, the buyer wears the badge when it is given, in place of
		// the one it wore; the user's other habbos keep theirs.
		if given {
			if err := q.TakeOffAvatarBadge(ctx, session.AvatarID); err != nil {
				return err
			}
			if err := q.WearAvatarBadge(ctx, store.WearAvatarBadgeParams{AvatarID: session.AvatarID, Code: clubBadge}); err != nil {
				return err
			}
		}
		answer.Months, answer.Days, answer.Credits = months, daysLeft(end, now), wallet.Credits-int64(price)
		return nil
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case answer.Error != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, answer)
	default:
		r.sendPurse(ctx, session.UserID)
		r.answerJSON(w, http.StatusOK, answer)
	}
}
