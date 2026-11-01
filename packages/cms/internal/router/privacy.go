package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// HandlePrivacyView renders GET /privacy.
func (r *Router) HandlePrivacyView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "privacy.html", r.hotelStatus(req.Context()))
}
