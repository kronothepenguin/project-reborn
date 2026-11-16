package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// HandleClientUnload handles POST /client/unload, unloadclient.php, which the
// client page calls as it closes. Holo's sent a guest to the front page and
// answered a habbo with nothing.
func (r *Router) HandleClientUnload(w http.ResponseWriter, req *http.Request) {
	if _, ok := auth.FromContext(req.Context()); !ok {
		http.Redirect(w, req, "/", http.StatusSeeOther)
	}
}
