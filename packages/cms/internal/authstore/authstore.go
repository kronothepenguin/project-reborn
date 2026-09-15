// Package authstore persists session lifecycle records for packages/auth over
// the shared store.
package authstore

import (
	"context"
	"fmt"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Store adapts the shared persistence layer to the session lifecycle
// interfaces of packages/auth.
type Store struct {
	db *store.Store
}

// New returns an auth store over db.
func New(db *store.Store) *Store {
	return &Store{db: db}
}

// Create stores a new session record. The insert is insert-only; a duplicate
// digest is an error and is never upserted.
func (s *Store) Create(ctx context.Context, session *auth.Session) error {
	err := s.db.CreateSession(ctx, store.CreateSessionParams{
		ID:                session.ID,
		UserID:            session.AccountID,
		CreatedAt:         session.CreatedAt.Unix(),
		LastSeenAt:        session.LastSeenAt.Unix(),
		IdleExpiresAt:     session.IdleExpiresAt.Unix(),
		AbsoluteExpiresAt: session.AbsoluteExpiresAt.Unix(),
		Remember:          boolToInt(session.Remember),
		RevokedAt:         unixOrZero(session.RevokedAt),
		UserAgent:         session.UserAgent,
		Address:           session.Address,
	})
	if err != nil {
		return fmt.Errorf("authstore: create session: %w", err)
	}
	return nil
}

// Validate fetches the session identified by its digest. A missing row is
// auth.ErrNotFound; revoked rows are returned so the library emits the right
// denial.
func (s *Store) Validate(ctx context.Context, id string) (*auth.Session, error) {
	row, err := s.db.GetSession(ctx, id)
	if err != nil {
		if store.IsNotFound(err) {
			return nil, auth.ErrNotFound
		}
		return nil, fmt.Errorf("authstore: get session: %w", err)
	}
	return sessionFromRow(row), nil
}

// Touch records activity by updating only the session's LastSeenAt and
// IdleExpiresAt.
func (s *Store) Touch(ctx context.Context, session *auth.Session) error {
	err := s.db.TouchSession(ctx, store.TouchSessionParams{
		LastSeenAt:    session.LastSeenAt.Unix(),
		IdleExpiresAt: session.IdleExpiresAt.Unix(),
		ID:            session.ID,
	})
	if err != nil {
		return fmt.Errorf("authstore: touch session: %w", err)
	}
	return nil
}

// Revoke revokes one session. Absent or already-revoked sessions are a no-op.
func (s *Store) Revoke(ctx context.Context, id string) error {
	err := s.db.RevokeSession(ctx, store.RevokeSessionParams{
		RevokedAt: time.Now().UTC().Unix(),
		ID:        id,
	})
	if err != nil {
		return fmt.Errorf("authstore: revoke session: %w", err)
	}
	return nil
}

// RevokeAccount revokes every active session of an account except one. The
// work runs in a single transaction and returns the records it revoked.
func (s *Store) RevokeAccount(ctx context.Context, accountID auth.AccountID, except string) ([]*auth.Session, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("authstore: begin revoke account: %w", err)
	}
	defer tx.Rollback()

	rows, err := tx.ListUserSessions(ctx, accountID)
	if err != nil {
		return nil, fmt.Errorf("authstore: list sessions: %w", err)
	}

	now := time.Now().UTC()
	revoked := make([]*auth.Session, 0, len(rows))
	for _, row := range rows {
		if row.RevokedAt != 0 || row.ID == except {
			continue
		}
		err := tx.RevokeSession(ctx, store.RevokeSessionParams{
			RevokedAt: now.Unix(),
			ID:        row.ID,
		})
		if err != nil {
			return nil, fmt.Errorf("authstore: revoke session %q: %w", row.ID, err)
		}
		session := sessionFromRow(row)
		session.RevokedAt = now
		revoked = append(revoked, session)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("authstore: commit revoke account: %w", err)
	}
	return revoked, nil
}

// List returns an account's sessions ordered by creation time, newest first.
// The library filters revoked and past-deadline records.
func (s *Store) List(ctx context.Context, accountID auth.AccountID) ([]*auth.Session, error) {
	rows, err := s.db.ListUserSessions(ctx, accountID)
	if err != nil {
		return nil, fmt.Errorf("authstore: list sessions: %w", err)
	}
	sessions := make([]*auth.Session, 0, len(rows))
	for _, row := range rows {
		sessions = append(sessions, sessionFromRow(row))
	}
	return sessions, nil
}

// Purge deletes revoked and past-deadline session records, returning the
// number removed.
func (s *Store) Purge(ctx context.Context, now time.Time) (int, error) {
	removed, err := s.db.PurgeSessions(ctx, store.PurgeSessionsParams{
		IdleExpiresAt:     now.Unix(),
		AbsoluteExpiresAt: now.Unix(),
	})
	if err != nil {
		return 0, fmt.Errorf("authstore: purge sessions: %w", err)
	}
	return int(removed), nil
}

// sessionFromRow maps a stored session to the auth package's record.
func sessionFromRow(row store.Session) *auth.Session {
	return &auth.Session{
		ID:                row.ID,
		AccountID:         row.UserID,
		CreatedAt:         time.Unix(row.CreatedAt, 0).UTC(),
		LastSeenAt:        time.Unix(row.LastSeenAt, 0).UTC(),
		IdleExpiresAt:     time.Unix(row.IdleExpiresAt, 0).UTC(),
		AbsoluteExpiresAt: time.Unix(row.AbsoluteExpiresAt, 0).UTC(),
		Remember:          row.Remember != 0,
		RevokedAt:         timeFromUnix(row.RevokedAt),
		UserAgent:         row.UserAgent,
		Address:           row.Address,
	}
}

// unixOrZero converts a possibly-zero time to unix seconds, with zero stored
// as 0.
func unixOrZero(t time.Time) int64 {
	if t.IsZero() {
		return 0
	}
	return t.Unix()
}

// timeFromUnix converts stored seconds back to a time, with 0 meaning zero.
func timeFromUnix(seconds int64) time.Time {
	if seconds == 0 {
		return time.Time{}
	}
	return time.Unix(seconds, 0).UTC()
}

// boolToInt stores a boolean as SQLite's 0/1 form.
func boolToInt(value bool) int64 {
	if value {
		return 1
	}
	return 0
}
