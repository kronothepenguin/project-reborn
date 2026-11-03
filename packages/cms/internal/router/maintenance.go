package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type maintenancePage struct {
	ShortName  string
	Username   string
	Error      string
	UpdatesURL string
}

// Maintenance serves the maintenance page with 503 instead of next while
// site.maintenance is on, except to users holding site.maintenanceBypass, and
// to everyone while updates wait: the pages' code may need them.
func (r *Router) Maintenance(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		closed, err := r.closed(req)
		if err != nil {
			r.fail(w, err)
			return
		}
		if closed {
			r.writeMaintenance(w, req, maintenancePage{})
			return
		}
		next.ServeHTTP(w, req)
	})
}

func (r *Router) closed(req *http.Request) (bool, error) {
	waiting, err := r.deps.Updates.Waiting(req.Context())
	if err != nil || waiting {
		return waiting, err
	}
	return settings.GetBool("site.maintenance") && !r.holds(req.Context(), auth.SiteMaintenanceBypass), nil
}

// writeMaintenance shows those who may apply waiting updates, once signed in,
// the way to housekeeping's update page instead of the sign-in box.
func (r *Router) writeMaintenance(w http.ResponseWriter, req *http.Request, page maintenancePage) {
	page.ShortName = settings.GetString("site.shortName")
	waiting, err := r.deps.Updates.Waiting(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	if waiting && (r.holds(req.Context(), auth.HousekeepingDatabase) || r.holds(req.Context(), auth.HousekeepingAccessGroups)) {
		page.UpdatesURL = settings.GetString("site.housekeepingUrl") + "/updates"
	}
	w.WriteHeader(http.StatusServiceUnavailable)
	astro.WriteTemplate(w, r.deps.Resolver, "maintenance.html", page)
}

type updateFailedPage struct {
	ShortName string
}

// UpdateFailed answers every page with the update-failed page once an automatic
// update failed at start. It stands outside the session reader, because the
// code may not work on the database the failure left.
func (r *Router) UpdateFailed(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if r.deps.Updates.Failed() == nil {
			next.ServeHTTP(w, req)
			return
		}
		w.WriteHeader(http.StatusServiceUnavailable)
		astro.WriteTemplate(w, r.deps.Resolver, "update-failed.html", updateFailedPage{ShortName: settings.GetString("site.shortName")})
	})
}
