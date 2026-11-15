package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// ErrInvalidTicket is returned for a ticket that is unknown, spent, or whose CMS
// session ended or moved to another habbo.
var ErrInvalidTicket = errors.New("game: invalid SSO ticket")

// Login logs in on s the habbo that ticket names. It spends the ticket, saves
// machineID, the machine id s holds, when there is one, and the last time online,
// and puts the habbo online with its badges, its sound setting, its ignore list, its favourite group and its fuses
// (decision server/0053). The session the habbo was online on leaves its
// room and gets ConcurrentLogin.
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
	h := habbo.Habbo{Avatar: avatar, Session: s}
	badges, err := q.ListAvatarBadges(ctx, avatarID)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	for _, badge := range badges {
		h.Badges = append(h.Badges, badge.Code)
		if badge.Slot >= 1 && badge.Slot <= 5 {
			h.Worn[badge.Slot-1] = badge.Code
		}
	}
	if h.Group, err = favouriteGroup(ctx, q, avatarID); err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	ignored, err := q.ListIgnoredHabbos(ctx, avatarID)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	for _, row := range ignored {
		h.Ignored = append(h.Ignored, row.IgnoredAvatarID)
	}
	data, err := q.GetAvatarGameData(ctx, avatarID)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	h.SoundEnabled = data.SoundEnabled
	if err := tx.Commit(); err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	// auth.Fuses reads through db, which waits for the transaction's connection until the commit.
	fuses, err := auth.Fuses(ctx, db, avatar.UserID)
	if err != nil {
		return habbo.Habbo{}, fmt.Errorf("game: login: %w", err)
	}
	for _, fuse := range fuses {
		h.Fuses = append(h.Fuses, string(fuse))
	}

	if old, ok := habbo.Add(h); ok && old.Session != s {
		LeaveRoom(old.ID, old.Session)
		old.Session.Notify(ConcurrentLogin{})
	}
	return h, nil
}

// Logout takes avatarID out of its room, writes its last time online and takes it
// offline, while s plays it: a session that a second login replaced logs nothing
// out.
func Logout(ctx context.Context, db *sql.DB, s Session, avatarID int64) error {
	// A replaced session left its room at the second login; leaving again would clear the heading of the new one.
	if h, ok := habbo.Get(avatarID); !ok || h.Session != s {
		return nil
	}
	LeaveRoom(avatarID, s)
	room.ClosePassage(avatarID)
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
