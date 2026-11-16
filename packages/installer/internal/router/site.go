package router

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	"github.com/kronothepenguin/project-reborn/packages/config/housekeeping"
	"github.com/kronothepenguin/project-reborn/packages/config/reborn"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// sitePage asks no housekeeping address with OneAddress: housekeeping then
// lives on the site, at /housekeeping.
type sitePage struct {
	OneAddress      bool
	Name            string
	ShortName       string
	URL             string
	HousekeepingURL string
	StartCredits    string
	SecureCookies   bool
	Error           string
}

func addressOn(port int) string {
	return fmt.Sprintf("http://localhost:%d/housekeeping", port)
}

// housekeepingAddress is the saved address, or while the default stands, the one
// on the port chosen in the step before.
func housekeepingAddress(port int) string {
	saved := settings.GetString("site.housekeepingUrl")
	if saved == addressOn(housekeeping.DefaultPort()) {
		return addressOn(port)
	}
	return saved
}

// siteAddress is the saved site address, or while the default stands, the
// hotel's own address from the step before.
func siteAddress(hotel reborn.Reborn) string {
	saved := settings.GetString("site.url")
	if saved == fmt.Sprintf("http://localhost:%d", cms.DefaultPort()) {
		return "http://" + net.JoinHostPort(hotel.Host, strconv.Itoa(hotel.Port))
	}
	return saved
}

// HandleSiteView renders GET /installer/site with the current settings.
func (r *Router) HandleSiteView(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, true)
	if !ok {
		return
	}
	page := sitePage{
		OneAddress:    r.deps.Move != nil,
		Name:          settings.GetString("site.name"),
		ShortName:     settings.GetString("site.shortName"),
		StartCredits:  strconv.Itoa(settings.GetInt("registration.startCredits")),
		SecureCookies: settings.GetBool("auth.secureCookies"),
	}
	if page.OneAddress {
		page.URL = siteAddress(installation.Config.Reborn)
	} else {
		page.URL = settings.GetString("site.url")
		page.HousekeepingURL = housekeepingAddress(installation.Config.Housekeeping.Port)
	}
	astro.WriteTemplate(w, r.deps.Resolver, "site.html", page)
}

// HandleSiteSave handles POST /installer/site: it saves each setting with no
// user, since none exists yet. With one address, housekeeping's address is the
// site's plus /housekeeping.
func (r *Router) HandleSiteSave(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, true)
	if !ok {
		return
	}
	page := sitePage{
		OneAddress:      r.deps.Move != nil,
		Name:            strings.TrimSpace(req.PostFormValue("name")),
		ShortName:       strings.TrimSpace(req.PostFormValue("shortName")),
		URL:             strings.TrimSpace(req.PostFormValue("url")),
		HousekeepingURL: strings.TrimSpace(req.PostFormValue("housekeepingUrl")),
		StartCredits:    strings.TrimSpace(req.PostFormValue("startCredits")),
		SecureCookies:   req.PostFormValue("secureCookies") != "",
	}
	housekeepingURL := page.HousekeepingURL
	if page.OneAddress {
		housekeepingURL = page.URL + "/housekeeping"
	}
	credits, err := strconv.Atoi(page.StartCredits)
	if err != nil {
		page.Error = "Start credits must be a whole number."
		r.invalid(w, "site.html", page)
		return
	}

	for _, field := range []struct {
		label string
		key   string
		value any
	}{
		{"Site name", "site.name", page.Name},
		{"Short name", "site.shortName", page.ShortName},
		{"Site URL", "site.url", page.URL},
		{"Housekeeping address", "site.housekeepingUrl", housekeepingURL},
		{"Start credits", "registration.startCredits", credits},
		{"Secure cookies", "auth.secureCookies", page.SecureCookies},
	} {
		if err := settings.Set(req.Context(), installation.DB, 0, field.key, field.value); err != nil {
			page.Error = field.label + ": " + reason(err)
			r.invalid(w, "site.html", page)
			return
		}
	}
	http.Redirect(w, req, "/installer/admin", http.StatusSeeOther)
}

// reason drops what settings.Set wraps around the validator's message, the
// setting's key path, since the page names the field instead.
func reason(err error) string {
	if inner := errors.Unwrap(err); inner != nil {
		return inner.Error()
	}
	return err.Error()
}
