package router

import (
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/config/assets"
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
	stepTabs
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
	installation, ok := r.step(w, req, "config")
	if !ok {
		return
	}
	page := configPage{
		stepTabs:   r.tabs(),
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
	installation, ok := r.step(w, req, "config")
	if !ok {
		return
	}
	if r.deps.Move != nil {
		r.saveAddress(w, req, installation)
		return
	}
	page := configPage{
		stepTabs:         r.tabs(),
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
		Server:       server.Server{Info: server.DefaultInfo(), MUS: server.DefaultMUS(), API: server.DefaultAPI()},
		Reborn:       reborn.Reborn{Host: reborn.DefaultHost(), Port: reborn.DefaultPort()},
		Assets:       assets.Assets{Path: assets.DefaultPath()},
	}
	switch err := r.deps.Setup.Configure(req.Context(), cfg); {
	case errors.Is(err, setup.ErrConfigured):
		http.Redirect(w, req, "/installer/config", http.StatusSeeOther)
	case err != nil:
		page.Error = err.Error()
		r.invalid(w, "config.html", page)
	default:
		r.pass(w, req, "config")
	}
}

// saveAddress moves the hotel when it listens elsewhere, then saves the
// address into the reborn section of config.json. A failed move saves
// nothing and shows its error, so the step takes another address.
func (r *Router) saveAddress(w http.ResponseWriter, req *http.Request, installation setup.Installation) {
	page := configPage{
		stepTabs:   r.tabs(),
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

	if installation.Config != nil && installation.Config.Reborn == address {
		if err := r.deps.Setup.SaveReborn(address); err != nil {
			page.Error = err.Error()
			r.invalid(w, "config.html", page)
			return
		}
		r.pass(w, req, "config")
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
