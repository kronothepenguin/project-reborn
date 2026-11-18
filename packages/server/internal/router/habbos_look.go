package router

import (
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
)

// HandleHabbosLook handles POST /api/habbos/{id}/look: the habbo's look and
// motto were saved outside the game, which shows them at once. It answers 204.
func (r *Router) HandleHabbosLook(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	if err := r.deps.Habbos.SendLook(req.Context(), id); err != nil {
		slog.Error(fmt.Sprintf("server: api: send look of habbo %d: %v", id, err))
		internalError(w)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
