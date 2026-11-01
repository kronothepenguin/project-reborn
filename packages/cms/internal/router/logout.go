package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
)

type logoutPage struct {
	hotelStatus
	Message string
	Failed  bool
}

// HandleLogout handles POST /logout.
func (r *Router) HandleLogout(w http.ResponseWriter, req *http.Request) {
	if _, ok := auth.FromContext(req.Context()); !ok {
		r.writeNotLoggedIn(w, req)
		return
	}
	if err := auth.Logout(w, req, r.deps.DB); err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "logout.html", logoutPage{
		hotelStatus: r.hotelStatus(req.Context()),
		Message:     "You have successfully signed out",
	})
}

// HandleLogoutView renders GET /logout. Holo signed out on a GET, which any site
// could trigger with a link, so here only a POST signs out.
func (r *Router) HandleLogoutView(w http.ResponseWriter, req *http.Request) {
	if _, ok := auth.FromContext(req.Context()); ok {
		http.Redirect(w, req, "/me", http.StatusSeeOther)
		return
	}
	r.writeNotLoggedIn(w, req)
}

func (r *Router) writeNotLoggedIn(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "logout.html", logoutPage{
		hotelStatus: r.hotelStatus(req.Context()),
		Message:     "You are not logged in",
		Failed:      true,
	})
}

// Banned ends the session of a banned visitor and shows the ban, on whatever
// page they opened. It runs before Maintenance, in the order of Holo's core.php.
func (r *Router) Banned(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		session, ok := auth.FromContext(req.Context())
		if !ok {
			next.ServeHTTP(w, req)
			return
		}
		ban, err := auth.ActiveBan(req.Context(), r.deps.DB, session.UserID, auth.ClientIP(req))
		if err != nil {
			r.fail(w, err)
			return
		}
		if ban == nil {
			next.ServeHTTP(w, req)
			return
		}
		if err := auth.Logout(w, req, r.deps.DB); err != nil {
			r.fail(w, err)
			return
		}
		w.WriteHeader(http.StatusForbidden)
		astro.WriteTemplate(w, r.deps.Resolver, "logout.html", logoutPage{
			hotelStatus: r.hotelStatus(req.Context()),
			Message:     banMessage(ban),
			Failed:      true,
		})
	})
}
