package router

import (
	"context"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// accountPage holds what every account page reads. Result is Holo's line at the
// top of a form, red when Failed.
type accountPage struct {
	community
	ClubDays int
	Result   string
	Failed   bool
}

func (r *Router) newAccountPage(ctx context.Context) (accountPage, error) {
	session, _ := auth.FromContext(ctx)
	layout, err := r.community(ctx)
	if err != nil {
		return accountPage{}, err
	}
	days, err := r.clubDays(ctx, session.UserID, time.Now().UTC())
	if err != nil {
		return accountPage{}, err
	}
	return accountPage{community: layout, ClubDays: days}, nil
}

// answer renders a form's page: a failed form answers 422.
func (r *Router) answer(w http.ResponseWriter, name string, failed bool, data any) {
	if failed {
		r.invalid(w, name, data)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

// HandleAccountView handles GET /account: Holo opens on the first tab.
func (r *Router) HandleAccountView(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, "/account/looks", http.StatusSeeOther)
}
