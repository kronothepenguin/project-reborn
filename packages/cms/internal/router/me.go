package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// mePage is the data model of the minimal personal page placeholder. The full
// personal page arrives with its slice.
type mePage struct {
	Username string
}

// HandleMeView renders GET /me for a signed-in member.
func (r *Router) HandleMeView(w http.ResponseWriter, req *http.Request) {
	session, ok := auth.FromContext(req.Context())
	if !ok {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	}

	user, err := r.deps.Accounts.UserByID(req.Context(), session.Session.AccountID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "me.html", mePage{Username: user.Username})
}
