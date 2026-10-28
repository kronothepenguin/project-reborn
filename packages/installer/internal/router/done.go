package router

import (
	"net/http"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

type donePage struct {
	ConfigPath   string
	DatabasePath string
	Dir          string
}

// HandleDoneView renders GET /done once the administrator exists.
func (r *Router) HandleDoneView(w http.ResponseWriter, req *http.Request) {
	installed, err := r.deps.Setup.Installed(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	if !installed {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	}
	installation, _ := r.deps.Setup.Current()
	database, err := filepath.Abs(installation.Config.Store.Path)
	if err != nil {
		database = installation.Config.Store.Path
	}
	configPath := setup.ConfigPath()
	astro.WriteTemplate(w, r.deps.Resolver, "done.html", donePage{
		ConfigPath:   configPath,
		DatabasePath: database,
		Dir:          filepath.Dir(configPath),
	})
}
