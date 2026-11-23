package router

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	Setup    *setup.State
	// Move moves the hotel to host:port, as installer.Listener does. When it is
	// set, the config step asks one address for the whole hotel.
	Move func(w http.ResponseWriter, r *http.Request, host string, port int) error
}

type Router struct {
	deps Deps
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// step lets the handler of name run only while the hotel has no
// administrator and no step before name waits. Otherwise it redirects to the
// page that applies and reports false.
func (r *Router) step(w http.ResponseWriter, req *http.Request, name string) (setup.Installation, bool) {
	installed, err := r.deps.Setup.Installed(req.Context())
	if err != nil {
		r.fail(w, err)
		return setup.Installation{}, false
	}
	if installed {
		http.Redirect(w, req, "/installer/", http.StatusSeeOther)
		return setup.Installation{}, false
	}
	if waiting := r.deps.Setup.Waiting(); slices.Index(setup.Steps, name) > slices.Index(setup.Steps, waiting) {
		http.Redirect(w, req, "/installer/"+waiting, http.StatusSeeOther)
		return setup.Installation{}, false
	}
	installation, _ := r.deps.Setup.Current()
	return installation, true
}

// pass records that name is done and sends the browser to the step after it.
func (r *Router) pass(w http.ResponseWriter, req *http.Request, name string) {
	r.deps.Setup.Pass(name)
	next := setup.Steps[slices.Index(setup.Steps, name)+1]
	http.Redirect(w, req, "/installer/"+next, http.StatusSeeOther)
}

func (r *Router) invalid(w http.ResponseWriter, name string, data any) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

// fail answers 500 and logs err, unless the visitor abandoned the request: its
// error is then context.Canceled, and the request ends quietly.
func (r *Router) fail(w http.ResponseWriter, err error) {
	if !errors.Is(err, context.Canceled) {
		slog.Error("installer", "err", err)
	}
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}
