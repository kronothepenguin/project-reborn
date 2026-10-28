package router

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
	storeconfig "github.com/kronothepenguin/project-reborn/packages/config/store"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

type configPage struct {
	Written    bool
	ConfigPath string
	Path       string
	Port       string
	Error      string
}

// HandleConfigView renders GET /config.
func (r *Router) HandleConfigView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, false)
	if !ok {
		return
	}
	page := configPage{
		ConfigPath: setup.ConfigPath(),
		Path:       storeconfig.DefaultPath(),
		Port:       strconv.Itoa(cms.DefaultPort()),
	}
	if cfg := installation.Config; cfg != nil {
		page.Written, page.Path, page.Port = true, cfg.Store.Path, strconv.Itoa(cfg.CMS.Port)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "config.html", page)
}

// HandleConfigWrite handles POST /config: it creates the database and writes
// config.json.
func (r *Router) HandleConfigWrite(w http.ResponseWriter, req *http.Request) {
	if _, ok := r.step(w, req, false); !ok {
		return
	}
	page := configPage{
		ConfigPath: setup.ConfigPath(),
		Path:       strings.TrimSpace(req.PostFormValue("path")),
		Port:       strings.TrimSpace(req.PostFormValue("port")),
	}
	port, err := strconv.Atoi(page.Port)
	if err != nil {
		page.Error = "The hotel port must be a number."
		r.invalid(w, "config.html", page)
		return
	}

	cfg := &config.Config{
		Store: storeconfig.Store{Path: page.Path},
		CMS:   cms.CMS{Port: port},
		Proxy: proxy.Proxy{Enabled: proxy.DefaultEnabled(), Trusted: proxy.DefaultTrusted()},
	}
	switch err := r.deps.Setup.Configure(req.Context(), cfg); {
	case errors.Is(err, setup.ErrConfigured):
		http.Redirect(w, req, "/config", http.StatusSeeOther)
	case err != nil:
		page.Error = err.Error()
		r.invalid(w, "config.html", page)
	default:
		http.Redirect(w, req, "/site", http.StatusSeeOther)
	}
}
