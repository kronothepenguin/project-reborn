package router

import (
	"context"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// onlineTimeout is how long the game has to say who is in the hotel.
const onlineTimeout = time.Second

type onlinePage struct {
	chrome
	Private bool
	// Answered is false when the game gave no answer.
	Answered bool
	Habbos   []habboRow
}

// HandleOnlineView renders GET /housekeeping/online, Holo's Online Users. It lists
// the habbos in the hotel now, where Holo listed those active in the past 600
// seconds, and what is private takes housekeeping.usersPrivate, as on User
// Listing.
func (r *Router) HandleOnlineView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	private, err := r.holds(req, auth.HousekeepingUsersPrivate)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := onlinePage{chrome: r.chrome(req), Private: private}

	ids, ok := r.online(ctx)
	if !ok {
		astro.WriteTemplate(w, r.deps.Resolver, "online.html", page)
		return
	}
	page.Answered = true
	rows, err := r.deps.Queries.ListHabbosByIDs(ctx, ids)
	if err != nil {
		r.fail(w, err)
		return
	}
	for _, row := range rows {
		seen, err := r.lastActivity(ctx, row.ID)
		if err != nil {
			r.fail(w, err)
			return
		}
		habbo := habboRow{
			ID:       row.ID,
			Name:     row.Name,
			Joined:   row.CreatedAt.UTC().Format(joinFormat),
			Activity: seen,
		}
		if private {
			habbo.Email = row.Email
			if habbo.IP, err = r.lastIP(ctx, row.UserID); err != nil {
				r.fail(w, err)
				return
			}
		}
		page.Habbos = append(page.Habbos, habbo)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "online.html", page)
}

// online asks the game who is in the hotel, with a context of its own that ends
// after onlineTimeout. ok is false when no game is injected or it gives no answer;
// a failed answer is logged.
func (r *Router) online(ctx context.Context) (ids []int64, ok bool) {
	if r.deps.Habbos == nil {
		return nil, false
	}
	ctx, cancel := context.WithTimeout(ctx, onlineTimeout)
	defer cancel()
	ids, err := r.deps.Habbos.Online(ctx)
	if err != nil {
		logError("housekeeping: online", err)
		return nil, false
	}
	return ids, true
}
