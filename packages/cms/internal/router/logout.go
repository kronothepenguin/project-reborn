package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// HandleLogout handles POST /logout.
func (r *Router) HandleLogout(w http.ResponseWriter, req *http.Request) {
	if err := auth.Logout(w, req, r.deps.DB); err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/", http.StatusSeeOther)
}
