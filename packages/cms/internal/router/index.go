package router

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type indexPage struct {
	hotelStatus
	Name         string
	ShortName    string
	LandingPromo bool
	Username     string
	Error        string
}

func newIndexPage() indexPage {
	return indexPage{
		Name:         settings.GetString("site.name"),
		ShortName:    settings.GetString("site.shortName"),
		LandingPromo: settings.GetBool("features.landingPromo"),
	}
}

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", newIndexPage())
}

// HandleIndexLogin handles the POST /{$} login action.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	username := strings.TrimSpace(req.PostFormValue("username"))
	password := req.PostFormValue("password")
	if username == "" || password == "" {
		r.loginFailed(w, username, "Please do not leave any fields blank.")
		return
	}

	r.signIn(w, req, username, password, req.PostFormValue("remember") != "")
}

// signIn starts a session and redirects to /me, or shows the sign-in form again
// with the reason.
func (r *Router) signIn(w http.ResponseWriter, req *http.Request, username, password string, remember bool) {
	_, err := auth.Login(w, req, r.deps.DB, username, password, remember)
	ban, banned := errors.AsType[*auth.BanError](err)
	switch {
	case err == nil:
		http.Redirect(w, req, "/me", http.StatusSeeOther)
	case banned:
		r.loginFailed(w, username, banMessage(ban))
	case errors.Is(err, auth.ErrInvalidCredentials):
		r.loginFailed(w, username, "Invalid username or password.")
	case errors.Is(err, auth.ErrThrottled):
		r.loginFailed(w, username, "Too many failed attempts. Please try again later.")
	default:
		r.fail(w, err)
	}
}

// loginFailed shows the form again on the page it came from: during maintenance
// only the maintenance page has one.
func (r *Router) loginFailed(w http.ResponseWriter, username, message string) {
	if settings.GetBool("site.maintenance") {
		r.writeMaintenance(w, maintenancePage{Username: username, Error: message})
		return
	}
	page := newIndexPage()
	page.Username, page.Error = username, message
	r.invalid(w, "index.html", page)
}

func banMessage(ban *auth.BanError) string {
	if ban.ExpiresAt.IsZero() {
		return fmt.Sprintf(`You have been banned! The reason for this ban is "%s". This ban does not expire.`, ban.Reason)
	}
	return fmt.Sprintf(`You have been banned! The reason for this ban is "%s". The ban will expire at %s.`,
		ban.Reason, ban.ExpiresAt.UTC().Format("2006-01-02 15:04 MST"))
}
