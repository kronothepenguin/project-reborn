package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Login checks habboName and its owner's password and starts a session with
// that habbo active. Failed attempts count against the IP and the user: after
// auth.loginMaxFailures within auth.loginWindowMinutes Login returns
// ErrThrottled, even for the right password. A ban is revealed only to someone
// who knows the password.
func Login(w http.ResponseWriter, r *http.Request, db *sql.DB, habboName, password string, remember bool) (Session, error) {
	now := clock().UTC()
	ip := ClientIP(r)
	login, err := authenticate(r.Context(), db, habboName, password, ip, now)
	if err != nil {
		return Session{}, err
	}
	return start(w, r, db, login, password, remember, ip, now)
}

func authenticate(ctx context.Context, db *sql.DB, habboName, password, ip string, now time.Time) (store.GetLoginByHabboNameRow, error) {
	var none store.GetLoginByHabboNameRow
	q := store.New(db)
	since := now.Add(-minutes("auth.loginWindowMinutes"))
	limit := int64(settings.GetInt("auth.loginMaxFailures"))

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

	ban, err := activeBan(ctx, q, userID, ip, now)
	if err != nil {
		return none, fmt.Errorf("auth: login: %w", err)
	}
	if ban != nil {
		return none, recordFailure(ctx, q, ip, now, userID, avatarID, ban)
	}
	return login, nil
}

// ActiveBan returns the ban in force on the user or the IP, or nil without one.
func ActiveBan(ctx context.Context, db *sql.DB, userID int64, ip string) (*BanError, error) {
	ban, err := activeBan(ctx, store.New(db), sql.NullInt64{Int64: userID, Valid: true}, ip, clock().UTC())
	if err != nil {
		return nil, fmt.Errorf("auth: active ban: %w", err)
	}
	return ban, nil
}

func activeBan(ctx context.Context, q *store.Queries, userID sql.NullInt64, ip string, now time.Time) (*BanError, error) {
	ban, err := q.GetActiveBan(ctx, store.GetActiveBanParams{Now: now, UserID: userID, IP: ip})
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &BanError{Reason: ban.Reason, ExpiresAt: ban.ExpiresAt.Time}, nil
}

func start(w http.ResponseWriter, r *http.Request, db *sql.DB, login store.GetLoginByHabboNameRow, password string, remember bool, ip string, now time.Time) (Session, error) {
	ctx := r.Context()
	var rehashed string
	if NeedsRehash(login.PasswordHash) {
		rehashed = HashPassword(password)
	}
	token, id := newToken()
	lifetime := sessionLifetime(remember)
	session := Session{id: id, UserID: login.UserID, AvatarID: login.AvatarID, Remember: remember, ExpiresAt: now.Add(lifetime)}

	q := store.New(db)
	if _, err := q.PurgeExpiredSessions(ctx, now); err != nil {
		return Session{}, fmt.Errorf("auth: login: %w", err)
	}
	tx, err := db.BeginTx(ctx, nil)
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

	setCookie(w, token, remember, lifetime)
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
func Logout(w http.ResponseWriter, r *http.Request, db *sql.DB) error {
	clearCookie(w)
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		return nil
	}
	id, ok := digest(cookie.Value)
	if !ok {
		return nil
	}
	if err := store.New(db).DeleteSession(r.Context(), id); err != nil {
		return fmt.Errorf("auth: logout: %w", err)
	}
	return nil
}

func LogoutEverywhere(ctx context.Context, db *sql.DB, userID int64) error {
	if err := store.New(db).DeleteUserSessions(ctx, userID); err != nil {
		return fmt.Errorf("auth: logout everywhere: %w", err)
	}
	return nil
}

// SwitchHabbo makes avatarID the active habbo of the session in ctx; the habbo
// must belong to the session's user.
func SwitchHabbo(ctx context.Context, db *sql.DB, avatarID int64) error {
	session, ok := FromContext(ctx)
	if !ok {
		return ErrNoSession
	}
	n, err := store.New(db).SwitchSessionAvatar(ctx, store.SwitchSessionAvatarParams{AvatarID: avatarID, ID: session.id})
	if err != nil {
		return fmt.Errorf("auth: switch habbo: %w", err)
	}
	if n == 0 {
		return ErrNotOwner
	}
	return nil
}
