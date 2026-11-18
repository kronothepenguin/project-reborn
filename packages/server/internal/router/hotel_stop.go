package router

import (
	"log/slog"
	"net/http"
)

// HandleHotelStop handles POST /api/hotel/stop: the game closes its doors and
// logs every habbo out. It answers 204 once the sessions have ended.
func (r *Router) HandleHotelStop(w http.ResponseWriter, req *http.Request) {
	if err := r.deps.Hotel.Stop(req.Context()); err != nil {
		slog.Error("server: api: stop the hotel: " + err.Error())
		internalError(w)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
