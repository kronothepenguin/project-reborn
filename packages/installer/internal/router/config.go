package router

import (
	"errors"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	"github.com/kronothepenguin/project-reborn/packages/config/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/config/server"
	storeconfig "github.com/kronothepenguin/project-reborn/packages/config/store"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

// configPage shows one of two forms. With OneAddress, the hotel runs in one
// process: the form asks its host and port. Otherwise it asks the site's port
// and housekeeping's port, for programs run apart.
type configPage struct {
	OneAddress       bool
	Written          bool
	ConfigPath       string
	Path             string
	Host             string
	Port             string
	HousekeepingPort string
	Error            string
}

// HandleConfigView renders GET /installer/config.
func (r *Router) HandleConfigView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, false)
	if !ok {
		return
	}
	page := configPage{
		OneAddress: r.deps.Move != nil,
		ConfigPath: setup.ConfigPath(),
		Path:       storeconfig.DefaultPath(),
	}
	if page.OneAddress {
		page.Host, page.Port = reborn.DefaultHost(), strconv.Itoa(reborn.DefaultPort())
	} else {
		page.Port, page.HousekeepingPort = strconv.Itoa(cms.DefaultPort()), strconv.Itoa(housekeeping.DefaultPort())
	}
	if cfg := installation.Config; cfg != nil {
		page.Written, page.Path = true, cfg.Store.Path
		if page.OneAddress {
			page.Host, page.Port = cfg.Reborn.Host, strconv.Itoa(cfg.Reborn.Port)
		} else {
			page.Port, page.HousekeepingPort = strconv.Itoa(cfg.CMS.Port), strconv.Itoa(cfg.Housekeeping.Port)
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "config.html", page)
}

// HandleConfigSave handles POST /installer/config: it creates the database and
// writes config.json. With one address, it then moves the hotel there when the
// request arrived elsewhere.
func (r *Router) HandleConfigSave(w http.ResponseWriter, req *http.Request) {
	if _, ok := r.step(w, req, false); !ok {
		return
	}
	page := configPage{
		OneAddress:       r.deps.Move != nil,
		ConfigPath:       setup.ConfigPath(),
		Path:             strings.TrimSpace(req.PostFormValue("path")),
		Host:             strings.TrimSpace(req.PostFormValue("host")),
		Port:             strings.TrimSpace(req.PostFormValue("port")),
		HousekeepingPort: strings.TrimSpace(req.PostFormValue("housekeepingPort")),
	}
	port, err := strconv.Atoi(page.Port)
	if err != nil {
		page.Error = "The hotel port must be a number."
		r.invalid(w, "config.html", page)
		return
	}

	cfg := &config.Config{
		Store:        storeconfig.Store{Path: page.Path},
		CMS:          cms.CMS{Host: cms.DefaultHost(), Port: cms.DefaultPort()},
		Housekeeping: housekeeping.Housekeeping{Host: housekeeping.DefaultHost(), Port: housekeeping.DefaultPort()},
		Proxy:        proxy.Proxy{Enabled: proxy.DefaultEnabled(), Trusted: proxy.DefaultTrusted()},
		Server:       server.Server{Info: server.DefaultInfo(), MUS: server.DefaultMUS()},
		Reborn:       reborn.Reborn{Host: reborn.DefaultHost(), Port: reborn.DefaultPort()},
	}
	if page.OneAddress {
		cfg.Reborn = reborn.Reborn{Host: page.Host, Port: port}
	} else {
		housekeepingPort, err := strconv.Atoi(page.HousekeepingPort)
		if err != nil {
			page.Error = "The housekeeping port must be a number."
			r.invalid(w, "config.html", page)
			return
		}
		cfg.CMS.Port, cfg.Housekeeping.Port = port, housekeepingPort
	}

	switch err := r.deps.Setup.Configure(req.Context(), cfg); {
	case errors.Is(err, setup.ErrConfigured):
		http.Redirect(w, req, "/installer/config", http.StatusSeeOther)
	case err != nil:
		page.Error = err.Error()
		r.invalid(w, "config.html", page)
	case page.OneAddress && !arrivedAt(req, page.Host, port):
		if err := r.deps.Move(w, req, page.Host, port); err != nil {
			page.Written, page.Error = true, err.Error()
			r.invalid(w, "config.html", page)
		}
	default:
		http.Redirect(w, req, "/installer/site", http.StatusSeeOther)
	}
}

// arrivedAt reports whether req came to host:port, as the browser addressed it.
func arrivedAt(req *http.Request, host string, port int) bool {
	reqHost, reqPort, err := net.SplitHostPort(req.Host)
	if err != nil {
		return false
	}
	return reqHost == host && reqPort == strconv.Itoa(port)
}
