package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// ErrInvalidTicket is returned for a ticket that is unknown, spent, or whose CMS
// session ended or moved to another habbo.
var ErrInvalidTicket = errors.New("game: invalid SSO ticket")

// Login logs in on s the habbo that ticket names. It spends the ticket, saves
// machineID, the machine id s holds, when there is one, and the last time online,
// and puts the habbo online. The session the habbo was online on gets
// ConcurrentLogin.
func Login(ctx context.Context, db *sql.DB, s Session, ticket, machineID string) (habbo.Habbo, error) {
	now := time.Now().UTC()
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	avatarID, err := q.SpendSSOTicket(ctx, store.SpendSSOTicketParams{ID: ticket, Now: now})
	if store.IsNotFound(err) {
		return habbo.Habbo{}, ErrInvalidTicket
	}
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	avatar, err := q.GetAvatar(ctx, avatarID)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	if machineID != "" {
		if err := q.SetAvatarMachineID(ctx, store.SetAvatarMachineIDParams{AvatarID: avatarID, MachineID: machineID}); err != nil {
			return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
		}
	}
	err = q.SetAvatarLastOnline(ctx, store.SetAvatarLastOnlineParams{AvatarID: avatarID, LastOnlineAt: sql.NullTime{Time: now, Valid: true}})
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}

	h := habbo.Habbo{Avatar: avatar, Session: s}
	if old, ok := habbo.Add(h); ok && old.Session != s {
		old.Session.Notify(ConcurrentLogin{})
	}
	return h, nil
}

// Logout writes the last time online of avatarID and takes it offline, while s
// plays it: a session that a second login replaced logs nothing out.
func Logout(ctx context.Context, db *sql.DB, s Session, avatarID int64) error {
	if h, ok := habbo.Get(avatarID); !ok || h.Session != s {
		return nil
	}
	err := store.New(db).SetAvatarLastOnline(ctx, store.SetAvatarLastOnlineParams{
		AvatarID:     avatarID,
		LastOnlineAt: sql.NullTime{Time: time.Now().UTC(), Valid: true},
	})
	habbo.Drop(avatarID, s)
	if err != nil {
		return fmt.Errorf("game: logout: %w", err)
	}
	return nil
}
