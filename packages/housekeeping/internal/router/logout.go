package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// HandleLogout handles POST /housekeeping/logout. The session is the CMS's too, so
// this signs out of both, and the visitor ends where a guest goes.
func (r *Router) HandleLogout(w http.ResponseWriter, req *http.Request) {
	if err := auth.Logout(w, req, r.deps.DB); err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, settings.GetString("site.url"), http.StatusSeeOther)
}
