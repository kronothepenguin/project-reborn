package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type legalPage struct {
	hotelStatus
	Name      string
	ShortName string
}

func (r *Router) writeLegalPage(w http.ResponseWriter, name string) {
	astro.WriteTemplate(w, r.deps.Resolver, name, legalPage{
		Name:      settings.GetString("site.name"),
		ShortName: settings.GetString("site.shortName"),
	})
}

// HandleDisclaimerView renders GET /disclaimer.
func (r *Router) HandleDisclaimerView(w http.ResponseWriter, req *http.Request) {
	r.writeLegalPage(w, "disclaimer.html")
}
