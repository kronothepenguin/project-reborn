package router

import (
	"log/slog"
	"net"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	Setup    *setup.State
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// step lets a step's handler run only while the hotel has no administrator
// and, when needConfig is set, once config.json is written. Otherwise it
// redirects to the page that applies and reports false.
func (r *Router) step(w http.ResponseWriter, req *http.Request, needConfig bool) (setup.Installation, bool) {
	installed, err := r.deps.Setup.Installed(req.Context())
	if err != nil {
		r.fail(w, err)
		return setup.Installation{}, false
	}
	if installed {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return setup.Installation{}, false
	}
	installation, configured := r.deps.Setup.Current()
	if needConfig && !configured {
		http.Redirect(w, req, "/config", http.StatusSeeOther)
		return setup.Installation{}, false
	}
	return installation, true
}

func (r *Router) invalid(w http.ResponseWriter, name string, data any) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	slog.Error("installer", "err", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

func clientIP(req *http.Request) string {
	host, _, err := net.SplitHostPort(req.RemoteAddr)
	if err != nil {
		return req.RemoteAddr
	}
	return host
}
