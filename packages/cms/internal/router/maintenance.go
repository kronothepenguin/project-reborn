package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type maintenancePage struct {
	ShortName string
	Username  string
	Error     string
}

// Maintenance serves the maintenance page with 503 instead of next while
// site.maintenance is on, except to users holding site.maintenanceBypass.
func (r *Router) Maintenance(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if !settings.GetBool("site.maintenance") || r.holds(req.Context(), auth.SiteMaintenanceBypass) {
			next.ServeHTTP(w, req)
			return
		}
		r.writeMaintenance(w, maintenancePage{})
	})
}

func (r *Router) writeMaintenance(w http.ResponseWriter, page maintenancePage) {
	page.ShortName = settings.GetString("site.shortName")
	w.WriteHeader(http.StatusServiceUnavailable)
	astro.WriteTemplate(w, r.deps.Resolver, "maintenance.html", page)
}
