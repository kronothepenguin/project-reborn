package router

import (
	"errors"
	"log/slog"
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

// configPage shows one of two forms. With OneAddress, inside reborn, the form
// asks the hotel's host and port, and the database stays the one config.json
// names. Otherwise it asks the database, the site's port and housekeeping's
// port, for programs run apart.
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
		page.Path = cfg.Store.Path
		if page.OneAddress {
			page.Host, page.Port = cfg.Reborn.Host, strconv.Itoa(cfg.Reborn.Port)
		} else {
			page.Written = true
			page.Port, page.HousekeepingPort = strconv.Itoa(cfg.CMS.Port), strconv.Itoa(cfg.Housekeeping.Port)
		}
	}
	astro.WriteTemplate(w, r.deps.Resolver, "config.html", page)
}

// HandleConfigSave handles POST /installer/config. With one address, it moves
// the hotel first and saves the address after; otherwise it creates the
// database and writes config.json.
func (r *Router) HandleConfigSave(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, false)
	if !ok {
		return
	}
	if r.deps.Move != nil {
		r.saveAddress(w, req, installation)
		return
	}
	page := configPage{
		ConfigPath:       setup.ConfigPath(),
		Path:             strings.TrimSpace(req.PostFormValue("path")),
		Port:             strings.TrimSpace(req.PostFormValue("port")),
		HousekeepingPort: strings.TrimSpace(req.PostFormValue("housekeepingPort")),
	}
	port, err := strconv.Atoi(page.Port)
	if err != nil {
		page.Error = "The hotel port must be a number."
		r.invalid(w, "config.html", page)
		return
	}
	housekeepingPort, err := strconv.Atoi(page.HousekeepingPort)
	if err != nil {
		page.Error = "The housekeeping port must be a number."
		r.invalid(w, "config.html", page)
		return
	}

	cfg := &config.Config{
		Store:        storeconfig.Store{Path: page.Path},
		CMS:          cms.CMS{Host: cms.DefaultHost(), Port: port},
		Housekeeping: housekeeping.Housekeeping{Host: housekeeping.DefaultHost(), Port: housekeepingPort},
		Proxy:        proxy.Proxy{Enabled: proxy.DefaultEnabled(), Trusted: proxy.DefaultTrusted()},
		Server:       server.Server{Info: server.DefaultInfo(), MUS: server.DefaultMUS()},
		Reborn:       reborn.Reborn{Host: reborn.DefaultHost(), Port: reborn.DefaultPort()},
	}
	switch err := r.deps.Setup.Configure(req.Context(), cfg); {
	case errors.Is(err, setup.ErrConfigured):
		http.Redirect(w, req, "/installer/config", http.StatusSeeOther)
	case err != nil:
		page.Error = err.Error()
		r.invalid(w, "config.html", page)
	default:
		http.Redirect(w, req, "/installer/site", http.StatusSeeOther)
	}
}

// saveAddress moves the hotel when the request arrived elsewhere, then saves
// the address into the reborn section of config.json. A failed move saves
// nothing and shows its error, so the step takes another address.
func (r *Router) saveAddress(w http.ResponseWriter, req *http.Request, installation setup.Installation) {
	page := configPage{
		OneAddress: true,
		ConfigPath: setup.ConfigPath(),
		Host:       strings.TrimSpace(req.PostFormValue("host")),
		Port:       strings.TrimSpace(req.PostFormValue("port")),
	}
	if installation.Config != nil {
		page.Path = installation.Config.Store.Path
	}
	port, err := strconv.Atoi(page.Port)
	if err != nil {
		page.Error = "The hotel port must be a number."
		r.invalid(w, "config.html", page)
		return
	}
	address := reborn.Reborn{Host: page.Host, Port: port}
	if err := address.Validate(); err != nil {
		page.Error = "reborn." + err.Error()
		r.invalid(w, "config.html", page)
		return
	}

	if arrivedAt(req, address.Host, address.Port) {
		if err := r.deps.Setup.SaveReborn(address); err != nil {
			page.Error = err.Error()
			r.invalid(w, "config.html", page)
			return
		}
		http.Redirect(w, req, "/installer/site", http.StatusSeeOther)
		return
	}
	if err := r.deps.Move(w, req, address.Host, address.Port); err != nil {
		page.Error = err.Error()
		r.invalid(w, "config.html", page)
		return
	}
	// The browser is already on its way to the new address.
	if err := r.deps.Setup.SaveReborn(address); err != nil {
		slog.Error("installer", "err", err)
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
