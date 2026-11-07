package router

import (
	"context"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// clubBadge is Holo's club badge, which every habbo of a member holds (0103).
const clubBadge = "HC1"

// clubPage is what club.php's My Membership box reads: the club and the purse of
// a signed-in user, and the club's prices.
type clubPage struct {
	community
	ClubDays     int
	Credits      int64
	Price1Month  int
	Price3Months int
	Price6Months int
	DaysPerMonth int
}

// HandleClubView renders GET /club, club.php, which guests read too.
func (r *Router) HandleClubView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	layout, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := clubPage{
		community:    layout,
		Price1Month:  settings.GetInt("club.price1Month"),
		Price3Months: settings.GetInt("club.price3Months"),
		Price6Months: settings.GetInt("club.price6Months"),
		DaysPerMonth: settings.GetInt("club.daysPerMonth"),
	}
	if session, ok := auth.FromContext(ctx); ok {
		if page.ClubDays, err = r.clubDays(ctx, session.UserID, time.Now().UTC()); err != nil {
			r.fail(w, err)
			return
		}
		wallet, err := r.deps.Queries.GetWallet(ctx, session.UserID)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Credits = wallet.Credits
	}
	astro.WriteTemplate(w, r.deps.Resolver, "club.html", page)
}

// endClub takes HC1 from every habbo of a user whose periods have all ended, as
// Holo's IsHCMember did once it found the club over, while a user with no period
// keeps an HC1 staff gave. It reads the periods again in its transaction, so that
// a purchase made since the club was read keeps its badge.
func (r *Router) endClub(ctx context.Context, userID int64, now time.Time) error {
	return r.inTx(ctx, func(q *store.Queries) error {
		end, err := q.GetLatestClubEnd(ctx, userID)
		switch {
		case store.IsNotFound(err):
			return nil
		case err != nil:
			return err
		case end.After(now):
			return nil
		}
		_, err = q.DeleteBadgeFromUserAvatars(ctx, store.DeleteBadgeFromUserAvatarsParams{Code: clubBadge, UserID: userID})
		return err
	})
}
