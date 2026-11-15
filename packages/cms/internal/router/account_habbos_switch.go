package router

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// HandleAccountHabbosSwitch handles POST /account/habbos/{id}/switch.
func (r *Router) HandleAccountHabbosSwitch(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	err = auth.SwitchHabbo(req.Context(), r.deps.DB, id)
	switch {
	case errors.Is(err, auth.ErrNotOwner):
		http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/account/habbos", http.StatusSeeOther)
	}
}
