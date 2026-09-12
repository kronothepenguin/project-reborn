package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
)

// Create establishes a new session for an account whose credentials the
// application has already verified. It revokes any credential the client
// presents before storing the fresh session, so a client-supplied value is
// never adopted (session fixation defense, FR-002).
func Create(w http.ResponseWriter, r *http.Request, accountID AccountID, revoker Revoker, creator Creator, opts ...Option) (*Auth, error) {
	s, err := resolve(opts...)
	if err != nil {
		return nil, err
	}
	return create(w, r, s, accountID, revoker, creator)
}

func create(w http.ResponseWriter, r *http.Request, s settings, accountID AccountID, revoker Revoker, creator Creator) (*Auth, error) {
	if presented, ok := sessionCredential(r, s); ok {
		if err := revoker.Revoke(r.Context(), digest(presented)); err != nil {
			return nil, fmt.Errorf("auth: revoke presented session: %w", err)
		}
	}

	now := s.now()
	credential, err := newCredential(s.tokenBytes)
	if err != nil {
		return nil, err
	}
	record := Session{
		ID:                digest(credential),
		AccountID:         accountID,
		CreatedAt:         now,
		LastSeenAt:        now,
		IdleExpiresAt:     now.Add(s.idleTimeout),
		AbsoluteExpiresAt: now.Add(s.absoluteLifetime()),
		Remember:          s.remember,
		UserAgent:         r.UserAgent(),
		Address:           requestAddress(r),
	}
	if err := creator.Create(r.Context(), &record); err != nil {
		return nil, fmt.Errorf("auth: create session: %w", err)
	}

	setSessionCookie(w, s, credential, record.Remember)
	emit(r.Context(), s, Event{
		Kind:      EventCreated,
		AccountID: record.AccountID,
		SessionID: record.ID,
		Outcome:   OutcomeOK,
		Address:   record.Address,
		UserAgent: record.UserAgent,
	})
	return newAuth(record, credential), nil
}

// Validate resolves and validates the session credential on a request. It
// denies absent, malformed, unknown, revoked, or expired sessions, and slides
// the idle deadline through the Toucher at most once per touch interval.
func Validate(r *http.Request, validator Validator, toucher Toucher, opts ...Option) (*Auth, error) {
	s, err := resolve(opts...)
	if err != nil {
		return nil, err
	}
	return validate(r.Context(), r, s, validator, toucher)
}

func validate(ctx context.Context, r *http.Request, s settings, validator Validator, toucher Toucher) (*Auth, error) {
	credential, ok := sessionCredential(r, s)
	if !ok {
		return nil, ErrNoSession
	}

	record, err := validator.Validate(ctx, digest(credential))
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return nil, ErrNoSession
		}
		return nil, fmt.Errorf("auth: validate session: %w", err)
	}
	if record == nil {
		return nil, ErrNoSession
	}
	if !record.RevokedAt.IsZero() {
		return nil, fmt.Errorf("%w: session is revoked", ErrRevoked)
	}

	now := s.now()
	if !now.Before(record.IdleExpiresAt) || !now.Before(record.AbsoluteExpiresAt) {
		emit(ctx, s, Event{
			Kind:      EventExpired,
			AccountID: record.AccountID,
			SessionID: record.ID,
			Outcome:   OutcomeDenied,
			Address:   requestAddress(r),
			UserAgent: r.UserAgent(),
		})
		return nil, fmt.Errorf("%w: session deadline passed", ErrExpired)
	}

	if !record.LastSeenAt.Add(s.touchInterval).After(now) {
		touched := *record
		touched.LastSeenAt = now
		touched.IdleExpiresAt = now.Add(s.idleTimeout)
		if err := toucher.Touch(ctx, &touched); err != nil {
			return nil, fmt.Errorf("auth: touch session: %w", err)
		}
		record.LastSeenAt = touched.LastSeenAt
		record.IdleExpiresAt = touched.IdleExpiresAt
	}

	return newAuth(*record, credential), nil
}

// Rotate issues a fresh credential for a validated session while preserving
// the logical session: AccountID, CreatedAt, AbsoluteExpiresAt, and Remember
// survive. It revokes the old digest before creating the replacement, so at
// most one credential is valid at any moment (FR-009).
func Rotate(w http.ResponseWriter, r *http.Request, a *Auth, revoker Revoker, creator Creator, opts ...Option) (*Auth, error) {
	s, err := resolve(opts...)
	if err != nil {
		return nil, err
	}
	return rotate(w, r, s, a, revoker, creator)
}

func rotate(w http.ResponseWriter, r *http.Request, s settings, a *Auth, revoker Revoker, creator Creator) (*Auth, error) {
	if a == nil {
		return nil, fmt.Errorf("%w: no session to rotate", ErrNoSession)
	}
	now := s.now()
	if err := revoker.Revoke(r.Context(), a.Session.ID); err != nil {
		return nil, fmt.Errorf("auth: revoke session: %w", err)
	}
	credential, err := newCredential(s.tokenBytes)
	if err != nil {
		return nil, err
	}
	record := Session{
		ID:                digest(credential),
		AccountID:         a.Session.AccountID,
		CreatedAt:         a.Session.CreatedAt,
		LastSeenAt:        now,
		IdleExpiresAt:     now.Add(s.idleTimeout),
		AbsoluteExpiresAt: a.Session.AbsoluteExpiresAt,
		Remember:          a.Session.Remember,
		UserAgent:         a.Session.UserAgent,
		Address:           a.Session.Address,
	}
	if err := creator.Create(r.Context(), &record); err != nil {
		return nil, fmt.Errorf("auth: create rotated session: %w", err)
	}

	setSessionCookie(w, s, credential, record.Remember)
	emit(r.Context(), s, Event{
		Kind:      EventRotated,
		AccountID: record.AccountID,
		SessionID: record.ID,
		Outcome:   OutcomeOK,
		Address:   record.Address,
		UserAgent: record.UserAgent,
	})
	return newAuth(record, credential), nil
}

// Logout revokes the presented session and always clears the session cookie.
// It is idempotent: without a cookie it still clears and returns nil.
func Logout(w http.ResponseWriter, r *http.Request, revoker Revoker, opts ...Option) error {
	s, err := resolve(opts...)
	if err != nil {
		return err
	}
	credential, ok := sessionCredential(r, s)
	clearSessionCookie(w, s)
	if !ok {
		return nil
	}
	id := digest(credential)
	if err := revoker.Revoke(r.Context(), id); err != nil {
		return fmt.Errorf("auth: revoke session: %w", err)
	}
	emit(r.Context(), s, Event{
		Kind:      EventLoggedOut,
		SessionID: id,
		Outcome:   OutcomeOK,
		Address:   requestAddress(r),
		UserAgent: r.UserAgent(),
	})
	return nil
}

// newAuth builds the request view for a validated session.
func newAuth(record Session, credential string) *Auth {
	return &Auth{
		Session:    record,
		CSRF:       deriveCSRF(credential),
		credential: credential,
	}
}

// absoluteLifetime selects the hard lifetime for a new session.
func (s settings) absoluteLifetime() time.Duration {
	if s.remember {
		return s.rememberTimeout
	}
	return s.absoluteTimeout
}

// Revoke revokes one session by digest and records a revoked event. It is
// idempotent.
func Revoke(ctx context.Context, sessionID string, revoker Revoker, opts ...Option) error {
	s, err := resolve(opts...)
	if err != nil {
		return err
	}
	if err := revoker.Revoke(ctx, sessionID); err != nil {
		return fmt.Errorf("auth: revoke session: %w", err)
	}
	emit(ctx, s, Event{
		Kind:      EventRevoked,
		SessionID: sessionID,
		Outcome:   OutcomeOK,
	})
	return nil
}

// RevokeAll revokes every session of an account and records one revoked event
// per returned record.
func RevokeAll(ctx context.Context, accountID AccountID, accountRevoker AccountRevoker, opts ...Option) error {
	s, err := resolve(opts...)
	if err != nil {
		return err
	}
	revoked, err := accountRevoker.RevokeAccount(ctx, accountID, "")
	if err != nil {
		return fmt.Errorf("auth: revoke account sessions: %w", err)
	}
	emitRevoked(ctx, s, revoked)
	return nil
}

// List returns an account's active sessions, filtering out records whose idle
// or absolute deadline has passed according to the configured clock.
func List(ctx context.Context, accountID AccountID, lister Lister, opts ...Option) ([]*Session, error) {
	s, err := resolve(opts...)
	if err != nil {
		return nil, err
	}
	sessions, err := lister.List(ctx, accountID)
	if err != nil {
		return nil, fmt.Errorf("auth: list sessions: %w", err)
	}
	now := s.now()
	active := make([]*Session, 0, len(sessions))
	for _, session := range sessions {
		if session == nil || !session.RevokedAt.IsZero() {
			continue
		}
		if !now.Before(session.IdleExpiresAt) || !now.Before(session.AbsoluteExpiresAt) {
			continue
		}
		active = append(active, session)
	}
	return active, nil
}

// Purge removes revoked and past-deadline records using the configured clock
// and returns the number removed. Active sessions are never touched (FR-018).
func Purge(ctx context.Context, purger Purger, opts ...Option) (int, error) {
	s, err := resolve(opts...)
	if err != nil {
		return 0, err
	}
	removed, err := purger.Purge(ctx, s.now())
	if err != nil {
		return 0, fmt.Errorf("auth: purge sessions: %w", err)
	}
	return removed, nil
}

// PasswordChanged invalidates every other session of the account after a
// password change and rotates the acting session, which stays valid with a
// fresh credential. One revoked event is recorded per invalidated session
// (FR-011).
func PasswordChanged(w http.ResponseWriter, r *http.Request, a *Auth, accountRevoker AccountRevoker, revoker Revoker, creator Creator, opts ...Option) (*Auth, error) {
	s, err := resolve(opts...)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, fmt.Errorf("%w: no session to rotate", ErrNoSession)
	}
	revoked, err := accountRevoker.RevokeAccount(r.Context(), a.Session.AccountID, a.Session.ID)
	if err != nil {
		return nil, fmt.Errorf("auth: revoke account sessions: %w", err)
	}
	emitRevoked(r.Context(), s, revoked)
	return rotate(w, r, s, a, revoker, creator)
}

// emitRevoked records one revoked event for each returned session.
func emitRevoked(ctx context.Context, s settings, revoked []*Session) {
	for _, session := range revoked {
		if session == nil {
			continue
		}
		emit(ctx, s, Event{
			Kind:      EventRevoked,
			AccountID: session.AccountID,
			SessionID: session.ID,
			Outcome:   OutcomeOK,
			Address:   session.Address,
			UserAgent: session.UserAgent,
		})
	}
}
