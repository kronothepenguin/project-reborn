package router

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
)

// HandleUsersPurse handles POST /api/users/{id}/purse: the user's purse
// changed outside the game, which shows it at once to the user's habbos in the
// hotel. It answers 204.
func (r *Router) HandleUsersPurse(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	if err := r.deps.Economy.SendPurse(req.Context(), id); err != nil {
		slog.Error(fmt.Sprintf("server: api: send purse of user %d: %v", id, err))
		internalError(w)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
