package router

import (
	"context"
	"database/sql"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// meAlert is what the feed shows of an alert. A sender makes it a staff message,
// and an alert without one a notification, as Holo's two alert types.
type meAlert struct {
	ID      int64
	Staff   bool
	Message string
}

// mePage's Alerts holds at most one: like Holo, the feed shows the oldest.
type mePage struct {
	community
	Figure      string
	ImagingURL  string
	Motto       string
	Credits     int64
	ClubDays    int
	OpenHelp    int64
	OneOpenHelp bool
	Alerts      []meAlert
	Birthday    string
	LastSignIn  string
	// MyTags are the active habbo's, for the tags habblet, which offers room up
	// to MaxTags.
	MyTags     []string
	MaxTags    int
	Cloud      []cloudTag
	TopStories []topStory
	MoreNews   []newsLink
	Banners    []banner
	// Groups are the active habbo's, for the groups habblet, whose purchase
	// dialog opens on Purchase.
	Groups   []myGroup
	Purchase groupPurchase
}

// HandleMeView renders GET /me, which auth.RequireSession guards.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	page, err := r.newMePage(ctx, session)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", page)
}

func (r *Router) newMePage(ctx context.Context, session auth.Session) (mePage, error) {
	var page mePage
	layout, err := r.community(ctx)
	if err != nil {
		return page, err
	}
	q := r.deps.Queries
	avatar, err := q.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return page, err
	}
	wallet, err := q.GetWallet(ctx, session.UserID)
	if err != nil {
		return page, err
	}
	user, err := q.GetUser(ctx, session.UserID)
	if err != nil {
		return page, err
	}
	now := time.Now().UTC()
	days, err := r.clubDays(ctx, session.UserID, now)
	if err != nil {
		return page, err
	}
	page = mePage{
		community:  layout,
		Figure:     avatar.Figure,
		ImagingURL: settings.String(ctx, r.deps.Queries, "imaging.avatarUrl"),
		Motto:      avatar.Motto,
		Credits:    wallet.Credits,
		ClubDays:   days,
	}

	if r.holds(ctx, auth.HousekeepingHelp) {
		if page.OpenHelp, err = q.CountOpenHelpTickets(ctx); err != nil {
			return page, err
		}
		page.OneOpenHelp = page.OpenHelp == 1
	}
	switch alert, err := q.GetOldestAlert(ctx, session.AvatarID); {
	case err == nil:
		page.Alerts = []meAlert{{ID: alert.ID, Staff: alert.SenderUserID.Valid, Message: alert.Message}}
	case !store.IsNotFound(err):
		return page, err
	}
	if settings.Bool(ctx, r.deps.Queries, "features.birthdayNotifications") && user.BornOn.Month() == now.Month() && user.BornOn.Day() == now.Day() {
		page.Birthday = ordinal(now.Year() - user.BornOn.Year())
	}
	switch at, err := q.GetLastSignIn(ctx, sql.NullInt64{Int64: session.AvatarID, Valid: true}); {
	case err == nil:
		page.LastSignIn = at.UTC().Format("02-01-2006 15:04:05")
	case !store.IsNotFound(err):
		return page, err
	}
	profile, err := q.GetAvatarProfile(ctx, session.AvatarID)
	if err != nil {
		return page, err
	}
	if page.MyTags, err = q.ListProfileTags(ctx, profile.ID); err != nil {
		return page, err
	}
	page.MaxTags = settings.Int(ctx, r.deps.Queries, "homes.maxTags")
	if page.Groups, err = r.myGroups(ctx, session.AvatarID); err != nil {
		return page, err
	}
	if page.Purchase, err = r.groupPurchase(ctx, session.UserID); err != nil {
		return page, err
	}
	if page.Cloud, err = r.tagCloud(ctx); err != nil {
		return page, err
	}
	if page.TopStories, page.MoreNews, err = r.newsPromo(ctx); err != nil {
		return page, err
	}
	if page.Banners, err = r.banners(ctx); err != nil {
		return page, err
	}
	return page, nil
}

// clubDays says how many days of the club the user has left, counting a day that
// has begun, and 0 for a user outside the club, whose ended club takes its badge
// with it.
func (r *Router) clubDays(ctx context.Context, userID int64, now time.Time) (int, error) {
	end, err := r.deps.Queries.GetClubEnd(ctx, store.GetClubEndParams{UserID: userID, Now: now})
	if store.IsNotFound(err) {
		return 0, r.endClub(ctx, userID, now)
	}
	if err != nil {
		return 0, err
	}
	return daysLeft(end, now), nil
}

// daysLeft counts the days from now to end, a day that has begun among them.
func daysLeft(end, now time.Time) int {
	return int(math.Ceil(end.Sub(now).Hours() / 24))
}

func ordinal(n int) string {
	suffix := "th"
	if n%100 < 11 || n%100 > 13 {
		switch n % 10 {
		case 1:
			suffix = "st"
		case 2:
			suffix = "nd"
		case 3:
			suffix = "rd"
		}
	}
	return strconv.Itoa(n) + suffix
}
