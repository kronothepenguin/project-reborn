package cms

import (
	"context"
	"embed"
	"errors"
	"html/template"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/account"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/authstore"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/status"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

//go:embed dist/*
var DistFS embed.FS

// Status is the game status snapshot shown on public pages.
type Status = status.Status

// StatusProvider yields the current game status; implementations may query a
// game server or return sample values.
type StatusProvider = status.Provider

// Links are the operator-configured navigation and footer targets.
type Links struct {
	Help    string
	Terms   string
	Privacy string
}

// CMS is the hotel web application: it wires the store, account service,
// session adapter, and router into an HTTP surface.
type CMS struct {
	static  http.Handler
	resolve func(string) (*template.Template, error)

	store       *store.Store
	sessions    *authstore.Store
	accounts    *account.Service
	baseURL     *url.URL
	status      status.Provider
	links       Links
	loginPolicy account.LoginPolicy
}

// Option configures the CMS.
type Option func(*CMS)

// New returns a CMS with the documented defaults: sample game status,
// localhost base URL, operators' empty links, and the default login policy.
func New(opts ...Option) *CMS {
	c := &CMS{
		baseURL:     &url.URL{Scheme: "http", Host: "localhost:8080"},
		status:      status.Sample{},
		loginPolicy: account.DefaultLoginPolicy(),
	}
	for _, opt := range opts {
		opt(c)
	}
	if c.store != nil {
		c.sessions = authstore.New(c.store)
		c.accounts = account.NewService(c.store, account.NewHasher(account.DefaultCost), c.loginPolicy)
	}
	return c
}

// Mount registers every CMS route on mux and the static handler last.
func (c *CMS) Mount(mux *http.ServeMux) {
	if c.sessions == nil || c.accounts == nil {
		panic("cms: Mount requires WithStore")
	}
	if c.baseURL == nil || c.baseURL.Scheme != "https" {
		slog.Warn("cms: CMS_BASE_URL is not https; session cookies are not hardened (production must use HTTPS)")
	}

	authOptions := router.AuthOptions(c.baseURL)
	protected := auth.Protect(
		c.sessions,
		c.sessions,
		append(authOptions, auth.WithUnauthorizedHandler(http.RedirectHandler("/", http.StatusSeeOther)))...,
	)

	r := router.New(router.Deps{
		Resolver: c.resolve,
		Accounts: c.accounts,
		Sessions: c.sessions,
		Status:   c.status,
		BaseURL:  c.baseURL,
		Links: router.Links{
			Help:    c.links.Help,
			Terms:   c.links.Terms,
			Privacy: c.links.Privacy,
		},
	})

	mux.HandleFunc("GET /{$}", r.HandleIndexView)
	mux.Handle("POST /{$}", r.OriginCheck(http.HandlerFunc(r.HandleIndexLogin)))
	mux.Handle("GET /me", protected(http.HandlerFunc(r.HandleMeView)))

	mux.Handle("/", c.static)
}

// Purge removes revoked and past-deadline sessions and returns the number
// removed. The app owns the schedule (research R12).
func (c *CMS) Purge(ctx context.Context) (int, error) {
	if c.sessions == nil {
		return 0, errors.New("cms: Purge requires WithStore")
	}
	return auth.Purge(ctx, c.sessions, router.AuthOptions(c.baseURL)...)
}

// WithStatic sets the handler that serves static files and unknown routes.
func WithStatic(h http.Handler) Option {
	return func(c *CMS) {
		c.static = h
	}
}

// WithResolver sets the built-template resolver.
func WithResolver(r func(string) (*template.Template, error)) Option {
	return func(c *CMS) {
		c.resolve = r
	}
}

// WithStore sets the shared persistence store. Required for Mount and Purge.
func WithStore(db *store.Store) Option {
	return func(c *CMS) {
		c.store = db
	}
}

// WithBaseURL sets the public origin used by the origin check and by cookie
// hardening: HTTPS keeps the library defaults, HTTP selects a development
// cookie (research R11).
func WithBaseURL(base *url.URL) Option {
	return func(c *CMS) {
		if base != nil {
			c.baseURL = base
		}
	}
}

// WithStatus replaces the sample game-status provider.
func WithStatus(provider status.Provider) Option {
	return func(c *CMS) {
		if provider != nil {
			c.status = provider
		}
	}
}

// WithLinks sets the operator-configured navigation targets.
func WithLinks(links Links) Option {
	return func(c *CMS) {
		c.links = links
	}
}

// WithLoginPolicy sets the failed sign-in throttle policy.
func WithLoginPolicy(maxFailures int, window, lock time.Duration) Option {
	return func(c *CMS) {
		c.loginPolicy = account.LoginPolicy{MaxFailures: maxFailures, Window: window, Lock: lock}
	}
}
