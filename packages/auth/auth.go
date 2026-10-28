// Package auth signs users in with a habbo name and the owner's password,
// keeps their sessions, checks their access attributes and resets forgotten
// passwords. Its limits are settings read from packages/virtual.
package auth

import (
	"database/sql"
	"errors"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual"
)

var (
	ErrInvalidCredentials = errors.New("auth: invalid habbo name or password")
	ErrThrottled          = errors.New("auth: too many failed logins")
	ErrBanned             = errors.New("auth: banned")
	ErrNoSession          = errors.New("auth: no session")
	ErrNotOwner           = errors.New("auth: the habbo belongs to another user")
	ErrPasswordLength     = errors.New("auth: password length out of range")
	ErrInvalidReset       = errors.New("auth: invalid or expired reset token")
)

// BanError is what Login returns for a banned user or IP; it matches
// ErrBanned. ExpiresAt is zero for a permanent ban.
type BanError struct {
	Reason    string
	ExpiresAt time.Time
}

func (e *BanError) Error() string {
	if e.ExpiresAt.IsZero() {
		return "auth: banned permanently: " + e.Reason
	}
	return fmt.Sprintf("auth: banned until %s: %s", e.ExpiresAt.Format(time.RFC3339), e.Reason)
}

func (e *BanError) Is(target error) bool {
	return target == ErrBanned
}

type Auth struct {
	db       *sql.DB
	settings *virtual.Settings
	// now is the clock; tests replace it.
	now func() time.Time
}

func New(db *sql.DB, settings *virtual.Settings) *Auth {
	return &Auth{db: db, settings: settings, now: time.Now}
}

func (a *Auth) minutes(key string) time.Duration {
	return time.Duration(a.settings.GetInt(key)) * time.Minute
}

func (a *Auth) lifetime(remember bool) time.Duration {
	if remember {
		return time.Duration(a.settings.GetInt("auth.rememberDays")) * 24 * time.Hour
	}
	return a.minutes("auth.sessionIdleMinutes")
}

// clientIP is the address of the connection's peer. X-Forwarded-For is not
// trusted, so behind a reverse proxy every request has the proxy's address.
func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
