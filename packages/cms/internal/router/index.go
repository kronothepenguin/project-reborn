package router

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/account"
)

// indexValues are the sign-in values echoed back after a failed attempt.
type indexValues struct {
	Username string
}

// indexErrors are the per-field sign-in messages.
type indexErrors struct {
	Username string
	Password string
	General  string
}

// indexPage is the data model of the public homepage.
type indexPage struct {
	Online     int
	IsUp       bool
	TermsURL   string
	PrivacyURL string
	Values     indexValues
	Errors     indexErrors
}

// HandleIndexView renders GET /{$}.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", r.indexPage(req.Context()))
}

// HandleIndexLogin handles the POST /{$} sign-in action: it verifies
// credentials, creates the session, and redirects to the personal page, or
// re-renders the page with an error.
func (r *Router) HandleIndexLogin(w http.ResponseWriter, req *http.Request) {
	if err := req.ParseForm(); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	username := strings.TrimSpace(req.PostFormValue("username"))
	password := req.PostFormValue("password")
	remember := req.PostFormValue("remember") != ""

	page := r.indexPage(req.Context())
	page.Values.Username = username
	if username == "" {
		page.Errors.Username = "Enter your username."
	}
	if password == "" {
		page.Errors.Password = "Enter your password."
	}
	if page.Errors.Username != "" || page.Errors.Password != "" {
		astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
		return
	}

	user, err := r.deps.Accounts.Authenticate(req.Context(), username, password, req.RemoteAddr)
	switch {
	case err == nil:
		options := append(r.authOptions, auth.WithRemember(remember))
		_, err := auth.Create(w, req, user.ID, r.deps.Sessions, r.deps.Sessions, options...)
		if err != nil {
			page.Errors.General = "Sign-in is unavailable right now. Please try again."
			astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
			return
		}
		http.Redirect(w, req, "/me", http.StatusSeeOther)
	case errors.Is(err, account.ErrLocked):
		page.Errors.General = "Too many attempts. Try again later."
		astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
	default:
		page.Errors.General = "Invalid username or password."
		astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
	}
}

// indexPage collects the shared public data and the current game status. A
// failing or down provider renders the offline state (research R9).
func (r *Router) indexPage(ctx context.Context) indexPage {
	page := indexPage{
		TermsURL:   r.deps.Links.Terms,
		PrivacyURL: r.deps.Links.Privacy,
	}
	if r.deps.Status == nil {
		return page
	}
	snapshot, err := r.deps.Status.Snapshot(ctx)
	if err == nil && snapshot.Up {
		page.IsUp = true
		page.Online = snapshot.Online
	}
	return page
}
