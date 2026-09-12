package auth

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Exported error sentinels. Every error returned by this package wraps one of
// these (or a store error) so callers can match it with errors.Is.
var (
	// ErrNoSession reports that the request carries no usable session
	// credential.
	ErrNoSession = errors.New("auth: no session")
	// ErrExpired reports that the session's idle or absolute deadline passed.
	ErrExpired = errors.New("auth: session expired")
	// ErrRevoked reports that the session was revoked.
	ErrRevoked = errors.New("auth: session revoked")
	// ErrCSRF reports a missing or invalid anti-forgery token.
	ErrCSRF = errors.New("auth: invalid CSRF token")
	// ErrConfig reports an invalid configuration option value.
	ErrConfig = errors.New("auth: invalid configuration")
	// ErrNotFound is the error stores return from Validate for absent or
	// revoked sessions.
	ErrNotFound = errors.New("auth: session not found")
)

// Option configures the optional settings of a library function. Options apply
// on top of secure defaults; no option is mandatory and none is ever required
// to make a function work.
type Option func(*settings)

// settings holds the resolved configuration for one call or one Protect
// middleware closure. It is unexported so the exported surface stays the
// granular Option setters.
type settings struct {
	cookieName          string
	cookiePath          string
	cookieDomain        string
	sameSite            http.SameSite
	cookieSecure        bool
	remember            bool
	idleTimeout         time.Duration
	absoluteTimeout     time.Duration
	rememberTimeout     time.Duration
	touchInterval       time.Duration
	tokenBytes          int
	csrfHeader          string
	csrfParam           string
	now                 func() time.Time
	eventSink           EventSink
	unauthorizedHandler http.Handler
	forbiddenHandler    http.Handler
}

// defaultSettings returns the secure defaults documented in the feature plan
// (D9, D10, D17, FR-016).
func defaultSettings() settings {
	return settings{
		cookieName:      "__Host-session",
		cookiePath:      "/",
		sameSite:        http.SameSiteStrictMode,
		cookieSecure:    true,
		idleTimeout:     30 * time.Minute,
		absoluteTimeout: 12 * time.Hour,
		rememberTimeout: 30 * 24 * time.Hour,
		touchInterval:   time.Minute,
		tokenBytes:      32,
		csrfHeader:      "X-CSRF-Token",
		csrfParam:       "csrf_token",
		now:             time.Now,
		eventSink:       slogDefaultSink{},
		unauthorizedHandler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
		}),
		forbiddenHandler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			http.Error(w, "Forbidden", http.StatusForbidden)
		}),
	}
}

// resolve applies the secure defaults first, then every option in order, and
// validates the result. No request is processed with an invalid configuration.
func resolve(opts ...Option) (settings, error) {
	s := defaultSettings()
	for _, opt := range opts {
		if opt != nil {
			opt(&s)
		}
	}
	if err := s.validate(); err != nil {
		return settings{}, err
	}
	return s, nil
}

// validate enforces the configuration rules: a non-empty cookie name,
// __Host- prefix rules, positive timeouts, at least 128 bits of credential
// entropy, and a touch interval no larger than the idle timeout.
func (s *settings) validate() error {
	if s.cookieName == "" {
		return fmt.Errorf("%w: cookie name must not be empty", ErrConfig)
	}
	if strings.HasPrefix(s.cookieName, "__Host-") {
		if s.cookiePath != "/" {
			return fmt.Errorf("%w: __Host- cookies require Path=/", ErrConfig)
		}
		if s.cookieDomain != "" {
			return fmt.Errorf("%w: __Host- cookies must not set Domain", ErrConfig)
		}
		if !s.cookieSecure {
			return fmt.Errorf("%w: __Host- cookies require Secure", ErrConfig)
		}
	}
	if s.idleTimeout <= 0 {
		return fmt.Errorf("%w: idle timeout must be positive", ErrConfig)
	}
	if s.absoluteTimeout <= 0 {
		return fmt.Errorf("%w: absolute timeout must be positive", ErrConfig)
	}
	if s.rememberTimeout <= 0 {
		return fmt.Errorf("%w: remember timeout must be positive", ErrConfig)
	}
	if s.touchInterval <= 0 {
		return fmt.Errorf("%w: touch interval must be positive", ErrConfig)
	}
	if s.tokenBytes < minTokenBytes {
		return fmt.Errorf("%w: token bytes must be at least %d", ErrConfig, minTokenBytes)
	}
	if s.touchInterval > s.idleTimeout {
		return fmt.Errorf("%w: touch interval must not exceed the idle timeout", ErrConfig)
	}
	return nil
}

// WithCookieName sets the session cookie name. The default is "__Host-session".
func WithCookieName(name string) Option {
	return func(s *settings) { s.cookieName = name }
}

// WithCookiePath sets the session cookie path. The default is "/".
func WithCookiePath(path string) Option {
	return func(s *settings) { s.cookiePath = path }
}

// WithCookieDomain sets the session cookie domain. The default is empty
// (host-only).
func WithCookieDomain(domain string) Option {
	return func(s *settings) { s.cookieDomain = domain }
}

// WithSameSite sets the session cookie SameSite mode. The default is
// http.SameSiteStrictMode.
func WithSameSite(mode http.SameSite) Option {
	return func(s *settings) { s.sameSite = mode }
}

// WithCookieSecure controls the session cookie Secure attribute (browser-side
// cookie hardening; transport security itself is deployment-owned). The
// default is true, and __Host- cookie names require it.
func WithCookieSecure(secure bool) Option {
	return func(s *settings) { s.cookieSecure = secure }
}

// WithRemember marks sessions created by Create as "remember me": a persistent
// cookie and the remember absolute lifetime are used. The default is false.
func WithRemember(remember bool) Option {
	return func(s *settings) { s.remember = remember }
}

// WithIdleTimeout sets the sliding inactivity window. The default is 30
// minutes.
func WithIdleTimeout(d time.Duration) Option {
	return func(s *settings) { s.idleTimeout = d }
}

// WithAbsoluteTimeout sets the hard session lifetime. The default is 12 hours.
func WithAbsoluteTimeout(d time.Duration) Option {
	return func(s *settings) { s.absoluteTimeout = d }
}

// WithRememberTimeout sets the hard lifetime and cookie max-age used for
// "remember me" sessions. The default is 30 days.
func WithRememberTimeout(d time.Duration) Option {
	return func(s *settings) { s.rememberTimeout = d }
}

// WithTouchInterval sets the minimum spacing between activity writes. The
// default is one minute and it must not exceed the idle timeout.
func WithTouchInterval(d time.Duration) Option {
	return func(s *settings) { s.touchInterval = d }
}

// WithTokenBytes sets the credential entropy in random bytes. The default is
// 32 (256 bits) and the hard minimum is 16 (128 bits).
func WithTokenBytes(n int) Option {
	return func(s *settings) { s.tokenBytes = n }
}

// WithCSRFHeader sets the request header carrying the synchronizer token. The
// default is "X-CSRF-Token".
func WithCSRFHeader(name string) Option {
	return func(s *settings) { s.csrfHeader = name }
}

// WithCSRFParam sets the form field carrying the synchronizer token. The
// default is "csrf_token".
func WithCSRFParam(name string) Option {
	return func(s *settings) { s.csrfParam = name }
}

// WithClock replaces the time source. It exists as a test seam; the default is
// time.Now.
func WithClock(now func() time.Time) Option {
	return func(s *settings) {
		if now != nil {
			s.now = now
		}
	}
}

// WithEventSink replaces the audit destination. The default writes structured
// records through log/slog.Default().
func WithEventSink(sink EventSink) Option {
	return func(s *settings) {
		if sink != nil {
			s.eventSink = sink
		}
	}
}

// WithUnauthorizedHandler replaces the response used when authentication is
// denied. The default is a generic 401 response.
func WithUnauthorizedHandler(h http.Handler) Option {
	return func(s *settings) {
		if h != nil {
			s.unauthorizedHandler = h
		}
	}
}

// WithForbiddenHandler replaces the response used when the CSRF check fails.
// The default is a generic 403 response.
func WithForbiddenHandler(h http.Handler) Option {
	return func(s *settings) {
		if h != nil {
			s.forbiddenHandler = h
		}
	}
}
