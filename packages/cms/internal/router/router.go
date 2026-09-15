// Package router holds the CMS HTTP handlers, one file per route.
package router

import (
	"context"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/status"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Accounts is the account-service surface the handlers use.
type Accounts interface {
	Authenticate(ctx context.Context, username, password, address string) (*store.User, error)
	UserByID(ctx context.Context, id int64) (*store.User, error)
}

// Sessions is the session surface the handlers and middleware use.
type Sessions interface {
	auth.Creator
	auth.Validator
	auth.Toucher
	auth.Revoker
}

// StatusProvider yields the game status shown on public pages.
type StatusProvider interface {
	Snapshot(ctx context.Context) (status.Status, error)
}

// Links are the operator-configured navigation targets.
type Links struct {
	Help    string
	Terms   string
	Privacy string
}

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	Accounts Accounts
	Sessions Sessions
	Status   StatusProvider
	BaseURL  *url.URL
	Links    Links
}

// Router renders pages and runs the actions registered by Mount.
type Router struct {
	deps        Deps
	authOptions []auth.Option
}

// New returns a Router. The session cookie options derive from the public
// base URL so the same hardening reaches session creation and protection.
func New(deps Deps) *Router {
	return &Router{deps: deps, authOptions: AuthOptions(deps.BaseURL)}
}

// AuthOptions returns the session cookie options implied by the public base
// URL: HTTPS keeps the library's hardened defaults, while HTTP selects a
// development-friendly cookie because `__Host-` names require Secure (R11).
func AuthOptions(baseURL *url.URL) []auth.Option {
	if baseURL != nil && baseURL.Scheme == "https" {
		return nil
	}
	return []auth.Option{
		auth.WithCookieName("session"),
		auth.WithCookieSecure(false),
	}
}
