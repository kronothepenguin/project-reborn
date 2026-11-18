package router

import (
	"log/slog"
	"net/http"
)

// HandleHotelStart handles POST /api/hotel/start: the game opens its doors,
// unless the hotel or the site is closed. It answers 204.
func (r *Router) HandleHotelStart(w http.ResponseWriter, req *http.Request) {
	if err := r.deps.Hotel.Start(req.Context()); err != nil {
		slog.Error("server: api: start the hotel: " + err.Error())
		internalError(w)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
