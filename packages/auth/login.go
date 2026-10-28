package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Login checks habboName and its owner's password and starts a session with
// that habbo active. Failed attempts count against the IP and the user: after
// auth.loginMaxFailures within auth.loginWindowMinutes Login returns
// ErrThrottled, even for the right password. A ban is revealed only to someone
// who knows the password.
func (a *Auth) Login(w http.ResponseWriter, r *http.Request, habboName, password string, remember bool) (Session, error) {
	now := a.now().UTC()
	ip := clientIP(r)
	login, err := a.authenticate(r.Context(), habboName, password, ip, now)
	if err != nil {
		return Session{}, err
	}
	return a.start(w, r, login, password, remember, ip, now)
}

func (a *Auth) authenticate(ctx context.Context, habboName, password, ip string, now time.Time) (store.GetLoginByHabboNameRow, error) {
	var none store.GetLoginByHabboNameRow
	q := store.New(a.db)
	since := now.Add(-a.minutes("auth.loginWindowMinutes"))
	limit := int64(a.settings.GetInt("auth.loginMaxFailures"))

	failures, err := q.CountFailedLoginsByIP(ctx, store.CountFailedLoginsByIPParams{IP: ip, Since: since})
	if err != nil {
		return none, fmt.Errorf("auth: login: %w", err)
	}
	if failures >= limit {
		return none, ErrThrottled
	}

	login, err := q.GetLoginByHabboName(ctx, habboName)
	if errors.Is(err, sql.ErrNoRows) {
		// Hashing anyway keeps an unknown habbo as slow as a wrong password.
		_, _ = VerifyPassword(dummyHash(), password)
		return none, recordFailure(ctx, q, ip, now, sql.NullInt64{}, sql.NullInt64{}, ErrInvalidCredentials)
	}
	if err != nil {
		return none, fmt.Errorf("auth: login: %w", err)
	}
	userID := sql.NullInt64{Int64: login.UserID, Valid: true}
	avatarID := sql.NullInt64{Int64: login.AvatarID, Valid: true}

	failures, err = q.CountFailedLoginsByUser(ctx, store.CountFailedLoginsByUserParams{UserID: login.UserID, Since: since})
	if err != nil {
		return none, fmt.Errorf("auth: login: %w", err)
	}
	if failures >= limit {
		return none, ErrThrottled
	}

	ok, err := VerifyPassword(login.PasswordHash, password)
	if err != nil {
		return none, fmt.Errorf("auth: login: %w", err)
	}
	if !ok {
		return none, recordFailure(ctx, q, ip, now, userID, avatarID, ErrInvalidCredentials)
	}

	ban, err := q.GetActiveBan(ctx, store.GetActiveBanParams{Now: now, UserID: userID, IP: ip})
	switch {
	case err == nil:
		return none, recordFailure(ctx, q, ip, now, userID, avatarID, &BanError{Reason: ban.Reason, ExpiresAt: ban.ExpiresAt.Time})
	case !errors.Is(err, sql.ErrNoRows):
		return none, fmt.Errorf("auth: login: %w", err)
	}
	return login, nil
}

func (a *Auth) start(w http.ResponseWriter, r *http.Request, login store.GetLoginByHabboNameRow, password string, remember bool, ip string, now time.Time) (Session, error) {
	ctx := r.Context()
	var rehashed string
	if NeedsRehash(login.PasswordHash) {
		rehashed = HashPassword(password)
	}
	token, id := newToken()
	lifetime := a.lifetime(remember)
	session := Session{id: id, UserID: login.UserID, AvatarID: login.AvatarID, Remember: remember, ExpiresAt: now.Add(lifetime)}

	q := store.New(a.db)
	if _, err := q.PurgeExpiredSessions(ctx, now); err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}
	defer tx.Rollback()
	qtx := q.WithTx(tx)

	if rehashed != "" {
		if err := qtx.UpsertCredential(ctx, store.UpsertCredentialParams{UserID: login.UserID, PasswordHash: rehashed, UpdatedAt: now}); err != nil {
			return Session{}, fmt.Errorf("auth: login: %w", err)
		}
	}
	err = qtx.CreateSession(ctx, store.CreateSessionParams{
		ID:         id,
		UserID:     login.UserID,
		AvatarID:   login.AvatarID,
		Remember:   remember,
		IP:         ip,
		UserAgent:  r.UserAgent(),
		CreatedAt:  now,
		LastSeenAt: now,
		ExpiresAt:  session.ExpiresAt,
	})
	if err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}
	err = qtx.CreateLoginAttempt(ctx, store.CreateLoginAttemptParams{
		UserID:    sql.NullInt64{Int64: login.UserID, Valid: true},
		AvatarID:  sql.NullInt64{Int64: login.AvatarID, Valid: true},
		IP:        ip,
		Succeeded: true,
		CreatedAt: now,
	})
	if err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}

	a.setCookie(w, token, remember, lifetime)
	return session, nil
}

func recordFailure(ctx context.Context, q *store.Queries, ip string, now time.Time, userID, avatarID sql.NullInt64, reason error) error {
	err := q.CreateLoginAttempt(ctx, store.CreateLoginAttemptParams{UserID: userID, AvatarID: avatarID, IP: ip, CreatedAt: now})
	if err != nil {
		return fmt.Errorf("auth: login: %w", err)
	}
	return reason
}

// Logout ends the session of the request's cookie, if any, and clears the
// cookie.
func (a *Auth) Logout(w http.ResponseWriter, r *http.Request) error {
	a.clearCookie(w)
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		return nil
	}
	id, ok := digest(cookie.Value)
	if !ok {
		return nil
	}
	if err := store.New(a.db).DeleteSession(r.Context(), id); err != nil {
		return fmt.Errorf("auth: logout: %w", err)
	}
	return nil
}

func (a *Auth) LogoutEverywhere(ctx context.Context, userID int64) error {
	if err := store.New(a.db).DeleteUserSessions(ctx, userID); err != nil {
		return fmt.Errorf("auth: logout everywhere: %w", err)
	}
	return nil
}

// SwitchHabbo makes avatarID the active habbo of the session in ctx; the habbo
// must belong to the session's user.
func (a *Auth) SwitchHabbo(ctx context.Context, avatarID int64) error {
	session, ok := FromContext(ctx)
	if !ok {
		return ErrNoSession
	}
	n, err := store.New(a.db).SwitchSessionAvatar(ctx, store.SwitchSessionAvatarParams{AvatarID: avatarID, ID: session.id})
	if err != nil {
		return fmt.Errorf("auth: switch habbo: %w", err)
	}
	if n == 0 {
		return ErrNotOwner
	}
	return nil
}
