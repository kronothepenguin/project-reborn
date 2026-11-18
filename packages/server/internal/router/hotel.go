package router

import (
	"encoding/json/v2"
	"log/slog"
	"net/http"
)

// hotelStatus is the answer of GET /api/hotel.
type hotelStatus struct {
	Running bool `json:"running"`
	Online  int  `json:"online"`
}

// HandleHotelView handles GET /api/hotel: whether the doors are open and how
// many habbos are in the hotel, as {"running":true,"online":12}.
func (r *Router) HandleHotelView(w http.ResponseWriter, req *http.Request) {
	status, err := r.deps.Hotel.Status(req.Context())
	if err != nil {
		slog.Error("server: api: the hotel's status: " + err.Error())
		internalError(w)
		return
	}
	writeJSON(w, hotelStatus{Running: status.Running, Online: status.Online})
}

// writeJSON answers 200 with v as JSON.
func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.MarshalWrite(w, v); err != nil {
		slog.Error("server: api: write the answer: " + err.Error())
	}
}

func internalError(w http.ResponseWriter) {
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
