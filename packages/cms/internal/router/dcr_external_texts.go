package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
)

// HandleExternalTextsText serves GET /dcr/external_texts.txt, written from the
// stored texts with this hotel's short name.
func (r *Router) HandleExternalTextsText(w http.ResponseWriter, req *http.Request) {
	body, err := dcr.Texts(req.Context(), r.deps.Queries, r.dcrHotel(req))
	if err != nil {
		r.fail(w, err)
		return
	}
	writeClientText(w, body)
}
