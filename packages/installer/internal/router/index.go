package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

type indexPage struct {
	Configured bool
	Installed  bool
	ConfigPath string
}

// HandleIndexView renders GET /{$}, the state of the installation.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	installed, err := r.deps.Setup.Installed(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	_, configured := r.deps.Setup.Current()
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", indexPage{
		Configured: configured,
		Installed:  installed,
		ConfigPath: setup.ConfigPath(),
	})
}
