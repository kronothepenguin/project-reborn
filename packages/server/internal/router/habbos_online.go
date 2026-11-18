package router

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"
)

// HandleHabbosOnlineView handles GET /api/habbos/online. Without ids, it lists
// the habbos in the hotel, as [1,5,9]. With ids, such as ?ids=1,2, it tells
// for each of them whether it is in the hotel, as {"1":true,"2":false}; an id
// that is not a number answers 400.
func (r *Router) HandleHabbosOnlineView(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	if !query.Has("ids") {
		ids, err := r.deps.Habbos.Online(req.Context())
		if err != nil {
			slog.Error("server: api: the habbos online: " + err.Error())
			internalError(w)
			return
		}
		writeJSON(w, ids)
		return
	}
	var ids []int64
	if list := query.Get("ids"); list != "" {
		for field := range strings.SplitSeq(list, ",") {
			id, err := strconv.ParseInt(field, 10, 64)
			if err != nil {
				http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
				return
			}
			ids = append(ids, id)
		}
	}
	online, err := r.deps.Habbos.AreOnline(req.Context(), ids)
	if err != nil {
		slog.Error("server: api: which habbos are online: " + err.Error())
		internalError(w)
		return
	}
	writeJSON(w, online)
}
