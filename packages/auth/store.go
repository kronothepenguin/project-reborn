package auth

import (
	"context"
	"time"
)

// Creator stores a new session record. Create is insert-only and never
// upserts; an existing ID is a duplicate.
type Creator interface {
	Create(ctx context.Context, session *Session) error
}

// Validator fetches the session record identified by a digest. It returns
// ErrNotFound when the session is absent or revoked; expired records are
// returned so the library can enforce deadlines and emit the expiry event.
type Validator interface {
	Validate(ctx context.Context, id string) (*Session, error)
}

// Toucher records activity on an existing session. It updates only LastSeenAt
// and IdleExpiresAt and never any other field.
type Toucher interface {
	Touch(ctx context.Context, session *Session) error
}

// Revoker revokes one session by digest. It is idempotent: absent or
// already-revoked sessions return nil.
type Revoker interface {
	Revoke(ctx context.Context, id string) error
}

// AccountRevoker atomically revokes every session of an account except one
// (except == "" revokes all) and returns the records it revoked so the library
// can emit one audit event per session.
type AccountRevoker interface {
	RevokeAccount(ctx context.Context, accountID AccountID, except string) ([]*Session, error)
}

// Lister enumerates an account's active sessions. Result order is not
// significant.
type Lister interface {
	List(ctx context.Context, accountID AccountID) ([]*Session, error)
}

// Purger deletes revoked and past-deadline records, returning the number
// removed. Active sessions are never touched.
type Purger interface {
	Purge(ctx context.Context, now time.Time) (int, error)
}
