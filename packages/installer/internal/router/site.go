package router

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type sitePage struct {
	Name          string
	ShortName     string
	URL           string
	StartCredits  string
	SecureCookies bool
	Error         string
}

// HandleSiteView renders GET /site with the current settings.
func (r *Router) HandleSiteView(w http.ResponseWriter, req *http.Request) {
	if _, ok := r.step(w, req, true); !ok {
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "site.html", sitePage{
		Name:          settings.GetString("site.name"),
		ShortName:     settings.GetString("site.shortName"),
		URL:           settings.GetString("site.url"),
		StartCredits:  strconv.Itoa(settings.GetInt("registration.startCredits")),
		SecureCookies: settings.GetBool("auth.secureCookies"),
	})
}

// HandleSiteSave handles POST /site: it saves each setting with no user, since
// none exists yet.
func (r *Router) HandleSiteSave(w http.ResponseWriter, req *http.Request) {
	installation, ok := r.step(w, req, true)
	if !ok {
		return
	}
	page := sitePage{
		Name:          strings.TrimSpace(req.PostFormValue("name")),
		ShortName:     strings.TrimSpace(req.PostFormValue("shortName")),
		URL:           strings.TrimSpace(req.PostFormValue("url")),
		StartCredits:  strings.TrimSpace(req.PostFormValue("startCredits")),
		SecureCookies: req.PostFormValue("secureCookies") != "",
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
		{"Start credits", "registration.startCredits", credits},
		{"Secure cookies", "auth.secureCookies", page.SecureCookies},
	} {
		if err := settings.Set(req.Context(), installation.DB, 0, field.key, field.value); err != nil {
			page.Error = field.label + ": " + reason(err)
			r.invalid(w, "site.html", page)
			return
		}
	}
	http.Redirect(w, req, "/admin", http.StatusSeeOther)
}

// reason drops what settings.Set wraps around the validator's message, the
// setting's key path, since the page names the field instead.
func reason(err error) string {
	if inner := errors.Unwrap(err); inner != nil {
		return inner.Error()
	}
	return err.Error()
}
