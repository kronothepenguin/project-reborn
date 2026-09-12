package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"log/slog"
	"time"
)

// AccountID identifies the account a session belongs to. It is opaque to the
// library and matches the project's existing account identifiers.
type AccountID = int64

const (
	// minTokenBytes is the hard lower bound for credential entropy (128 bits).
	minTokenBytes = 16
	// csrfMessage is the fixed message bound into the synchronizer token.
	csrfMessage = "project-reborn/auth/csrf/v1"
)

// Session is the persisted session record. It never carries the raw
// credential; ID is a one-way digest of it.
type Session struct {
	ID                string
	AccountID         AccountID
	CreatedAt         time.Time
	LastSeenAt        time.Time
	IdleExpiresAt     time.Time
	AbsoluteExpiresAt time.Time
	Remember          bool
	RevokedAt         time.Time
	UserAgent         string
	Address           string
}

// Auth is the validated per-request view of a session. Session is the persisted
// record and CSRF is the derived synchronizer token; both are safe to render
// same-origin. The raw credential stays unexported and is redacted from all
// formatting and logging.
type Auth struct {
	Session Session
	CSRF    string

	credential string
}

// String renders the Auth without revealing the credential.
func (a Auth) String() string {
	return fmt.Sprintf("auth.Auth{account_id:%d session_id:%s csrf:%s credential:[REDACTED]}",
		a.Session.AccountID, a.Session.ID, a.CSRF)
}

// LogValue renders the Auth for structured logging without revealing the
// credential.
func (a Auth) LogValue() slog.Value {
	return slog.GroupValue(
		slog.Int64("account_id", int64(a.Session.AccountID)),
		slog.String("session_id", a.Session.ID),
	)
}

// newCredential returns a fresh credential of n random bytes, encoded with
// base64url without padding.
func newCredential(n int) (string, error) {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		return "", fmt.Errorf("auth: read random bytes: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

// digest returns the base64url-encoded SHA-256 digest of a credential. Only
// this value is ever persisted or handed to stores.
func digest(credential string) string {
	sum := sha256.Sum256([]byte(credential))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

// deriveCSRF derives the per-session synchronizer token from the raw
// credential with HMAC-SHA256.
func deriveCSRF(credential string) string {
	mac := hmac.New(sha256.New, []byte(credential))
	mac.Write([]byte(csrfMessage))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
