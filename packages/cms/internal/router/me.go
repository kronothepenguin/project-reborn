package router

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"math"
	"net/http"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	// maxMottoLength is the limit of Holo's inline editor. Its profile form
	// allows fewer characters, as maxProfileMottoLength says.
	maxMottoLength = 38
	maxMottoBody   = 4096
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
	wallet, err := q.GetWallet(ctx, session.AvatarID)
	if err != nil {
		return page, err
	}
	user, err := q.GetUser(ctx, session.UserID)
	if err != nil {
		return page, err
	}
	now := time.Now().UTC()
	days, err := r.clubDays(ctx, session.AvatarID, now)
	if err != nil {
		return page, err
	}
	page = mePage{
		community:  layout,
		Figure:     avatar.Figure,
		ImagingURL: settings.GetString("imaging.avatarUrl"),
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
	if settings.GetBool("features.birthdayNotifications") && user.BornOn.Month() == now.Month() && user.BornOn.Day() == now.Day() {
		page.Birthday = ordinal(now.Year() - user.BornOn.Year())
	}
	switch at, err := q.GetLastSignIn(ctx, sql.NullInt64{Int64: session.AvatarID, Valid: true}); {
	case err == nil:
		page.LastSignIn = at.UTC().Format("02-01-2006 15:04:05")
	case !store.IsNotFound(err):
		return page, err
	}
	return page, nil
}

// clubDays says how many days of the club the habbo has left, counting a day
// that has begun, and 0 for a habbo outside the club.
func (r *Router) clubDays(ctx context.Context, avatarID int64, now time.Time) (int, error) {
	end, err := r.deps.Queries.GetClubEnd(ctx, store.GetClubEndParams{AvatarID: avatarID, Now: now})
	if store.IsNotFound(err) {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	return int(math.Ceil(end.Sub(now).Hours() / 24)), nil
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

type mottoBody struct {
	Motto string `json:"motto"`
}

// HandleMeMotto handles POST /me/motto: it saves a motto and answers with the
// habbo's motto, which stays the old one when the new one is too long.
func (r *Router) HandleMeMotto(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body mottoBody
	if err := json.UnmarshalRead(http.MaxBytesReader(w, req.Body, maxMottoBody), &body); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	session, _ := auth.FromContext(ctx)
	if utf8.RuneCountInString(body.Motto) > maxMottoLength {
		avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
		if err != nil {
			r.fail(w, err)
			return
		}
		body.Motto = avatar.Motto
	} else {
		err := r.deps.Queries.UpdateAvatarMotto(ctx, store.UpdateAvatarMottoParams{ID: session.AvatarID, Motto: body.Motto, UpdatedAt: time.Now().UTC()})
		if err != nil {
			r.fail(w, err)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.MarshalWrite(w, body); err != nil {
		r.fail(w, err)
	}
}

// HandleMeAlertDismiss handles POST /me/alerts/{id}/dismiss. Another habbo's
// alert changes nothing.
func (r *Router) HandleMeAlertDismiss(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	session, _ := auth.FromContext(ctx)
	_, err = r.deps.Queries.DismissAlert(ctx, store.DismissAlertParams{
		ID:          id,
		AvatarID:    session.AvatarID,
		DismissedAt: sql.NullTime{Time: time.Now().UTC(), Valid: true},
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/me", http.StatusSeeOther)
}
