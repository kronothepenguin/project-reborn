package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Reset is a started password reset, with the habbo and the address as stored.
type Reset struct {
	Token string
	Name  string
	Email string
}

// CreateReset starts a password reset for the account of email, when the habbo
// called name belongs to it. For any other pair, and while the account holds
// auth.resetMaxActive unexpired links, it returns nil and no error, so the caller
// can answer the same way in every case.
func CreateReset(ctx context.Context, db *sql.DB, name, email string) (*Reset, error) {
	now := clock().UTC()
	q := store.New(db)
	if _, err := q.PurgeExpiredPasswordResets(ctx, now); err != nil {
		return nil, fmt.Errorf("auth: create reset: %w", err)
	}
	account, err := q.GetResetAccount(ctx, store.GetResetAccountParams{Name: name, Email: email})
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("auth: create reset: %w", err)
	}

	token, id := newToken()
	created, err := q.CreatePasswordReset(ctx, store.CreatePasswordResetParams{
		ID:        id,
		UserID:    account.UserID,
		CreatedAt: now,
		ExpiresAt: now.Add(minutes("auth.resetTokenMinutes")),
		MaxActive: int64(settings.GetInt("auth.resetMaxActive")),
	})
	if err != nil {
		return nil, fmt.Errorf("auth: create reset: %w", err)
	}
	if created == 0 {
		return nil, nil
	}
	return &Reset{Token: token, Name: account.Name, Email: account.Email}, nil
}

// ResetPassword sets password for the user of token. It works once: the token
// and the user's other resets stop working, and every session of the user ends.
func ResetPassword(ctx context.Context, db *sql.DB, token, password string) error {
	if err := ValidatePassword(password); err != nil {
		return err
	}
	id, ok := digest(token)
	if !ok {
		return ErrInvalidReset
	}
	now := clock().UTC()
	q := store.New(db)
	active := store.GetActivePasswordResetParams{ID: id, Now: now}
	if _, err := q.GetActivePasswordReset(ctx, active); errors.Is(err, sql.ErrNoRows) {
		return ErrInvalidReset
	} else if err != nil {
		return fmt.Errorf("auth: reset password: %w", err)
	}
	hash := HashPassword(password)

	tx, err := db.BeginTx(ctx, nil)
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
