package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type indexPage struct {
	Configured bool
	Installed  bool
	ConfigPath string
	SiteURL    string
}

// HandleIndexView renders GET /installer/{$}, the state of the installation.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	installed, err := r.deps.Setup.Installed(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	installation, configured := r.deps.Setup.Current()
	page := indexPage{
		Configured: configured,
		Installed:  installed,
		ConfigPath: setup.ConfigPath(),
	}
	if installed {
		page.SiteURL = settings.String(req.Context(), store.New(installation.DB), "site.url")
	}
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
}
