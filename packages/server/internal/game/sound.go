package game

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// SetSoundEnabled saves the sound setting of avatarID, then that of its online copy while s plays it (decisions
// server/0038 and server/0053).
func SetSoundEnabled(ctx context.Context, db *sql.DB, s Session, avatarID int64, on bool) error {
	err := store.New(db).SetAvatarSoundEnabled(ctx, store.SetAvatarSoundEnabledParams{AvatarID: avatarID, SoundEnabled: on})
	if err != nil {
		return fmt.Errorf("game: sound: %w", err)
	}
	habbo.Update(avatarID, s, func(h *habbo.Habbo) { h.SoundEnabled = on })
	return nil
}
