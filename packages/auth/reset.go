package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// CreateReset starts a password reset for the user with email and returns the
// token to send them. For an unknown email it returns "" and no error, so the
// caller can answer the same way in both cases.
func (a *Auth) CreateReset(ctx context.Context, email string) (string, error) {
	now := a.now().UTC()
	q := store.New(a.db)
	if _, err := q.PurgeExpiredPasswordResets(ctx, now); err != nil {
		return "", fmt.Errorf("auth: create reset: %w", err)
	}
	user, err := q.GetUserByEmail(ctx, email)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("auth: create reset: %w", err)
	}

	token, id := newToken()
	err = q.CreatePasswordReset(ctx, store.CreatePasswordResetParams{
		ID:        id,
		UserID:    user.ID,
		CreatedAt: now,
		ExpiresAt: now.Add(a.minutes("auth.resetTokenMinutes")),
	})
	if err != nil {
		return "", fmt.Errorf("auth: create reset: %w", err)
	}
	return token, nil
}

// ResetPassword sets password for the user of token. It works once: the token
// and the user's other resets stop working, and every session of the user ends.
func (a *Auth) ResetPassword(ctx context.Context, token, password string) error {
	if err := a.ValidatePassword(password); err != nil {
		return err
	}
	id, ok := digest(token)
	if !ok {
		return ErrInvalidReset
	}
	now := a.now().UTC()
	q := store.New(a.db)
	active := store.GetActivePasswordResetParams{ID: id, Now: now}
	if _, err := q.GetActivePasswordReset(ctx, active); errors.Is(err, sql.ErrNoRows) {
		return ErrInvalidReset
	} else if err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	hash := HashPassword(password)

	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	defer tx.Rollback()
	qtx := q.WithTx(tx)
	// Reading the reset again inside the transaction keeps two requests with
	// the same token from both using it.
	reset, err := qtx.GetActivePasswordReset(ctx, active)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrInvalidReset
	}
	if err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	if err := qtx.UpsertCredential(ctx, store.UpsertCredentialParams{UserID: reset.UserID, PasswordHash: hash, UpdatedAt: now}); err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	if err := qtx.DeleteUserPasswordResets(ctx, reset.UserID); err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	if err := qtx.DeleteUserSessions(ctx, reset.UserID); err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	return nil
}
