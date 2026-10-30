package router

import (
	"log/slog"
	"net/http"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type maintenancePage struct {
	ShortName string
}

// Maintenance serves the maintenance page with 503 instead of next while
// site.maintenance is on, except to users holding site.maintenanceBypass.
func (r *Router) Maintenance(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		if !settings.GetBool("site.maintenance") || r.bypassesMaintenance(req) {
			next(w, req)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		astro.WriteTemplate(w, r.deps.Resolver, "maintenance.html", maintenancePage{
			ShortName: settings.GetString("site.shortName"),
		})
	}
}

func (r *Router) bypassesMaintenance(req *http.Request) bool {
	session, ok := auth.FromContext(req.Context())
	if !ok {
		return false
	}
	attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
	if err != nil {
		slog.Error("cms: attributes", "err", err)
		return false
	}
	return slices.Contains(attributes, auth.SiteMaintenanceBypass)
}
