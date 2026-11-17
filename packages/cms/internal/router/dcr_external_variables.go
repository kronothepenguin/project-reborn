package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
)

// HandleExternalVariablesText serves GET /dcr/external_variables.txt, written
// from the stored variables with this hotel's addresses and client version.
func (r *Router) HandleExternalVariablesText(w http.ResponseWriter, req *http.Request) {
	body, err := dcr.Variables(req.Context(), r.deps.Queries, r.dcrHotel(req))
	if err != nil {
		r.fail(w, err)
		return
	}
	writeClientText(w, body)
}
