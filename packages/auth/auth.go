// Package auth signs users in with a habbo name and the owner's password,
// keeps their sessions, checks their access attributes and resets forgotten
// passwords. Its helpers receive the database, and its limits are settings.
package auth

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
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

// clock is the time source; tests replace it.
var clock = time.Now

func minutes(key string) time.Duration {
	return time.Duration(settings.GetInt(key)) * time.Minute
}

func sessionLifetime(remember bool) time.Duration {
	if remember {
		return time.Duration(settings.GetInt("auth.rememberDays")) * 24 * time.Hour
	}
	return minutes("auth.sessionIdleMinutes")
}

// ClientIP is the address of the connection's peer. Behind a reverse proxy,
// RealIP must run first so that it is the client's address.
func ClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
