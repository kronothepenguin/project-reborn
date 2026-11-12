package game

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// RoomDecorated tells a room its new wallpaper, floor or landscape: the property and its pattern.
type RoomDecorated struct{ Property, Pattern string }

// Decorate uses up the wallpaper, floor or landscape id of viewer's hand on the room it is in (FLATPROPBYITEM), and
// reports whether it did: the room keeps the pattern the furni was bought with, the furni goes, and the room is told.
// A habbo that controls the room decorates it, as Holo let it, and never with a furni it has on offer in a trade. The
// room and the furni change in one transaction.
func Decorate(ctx context.Context, db *sql.DB, viewer habbo.Habbo, property string, id int64) (bool, error) {
	r, ok := furnished(viewer)
	if !ok || !furni.IsDecoration(property) || onOffer(viewer, id) {
		return false, nil
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("game: decorate: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	row, err := q.GetFurni(ctx, id)
	if store.IsNotFound(err) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("game: decorate: %w", err)
	}
	d, ok := furni.Get(row.FurniDefinitionID)
	if !ok || d.Sprite != property || row.AvatarID.Int64 != viewer.ID || !spacesPattern.MatchString(row.State) {
		return false, nil
	}
	now := time.Now().UTC()
	switch property {
	case "wallpaper":
		_, err = q.SetRoomWallpaper(ctx, store.SetRoomWallpaperParams{ID: r.Ref().ID, Pattern: row.State, UpdatedAt: now})
	case "floor":
		_, err = q.SetRoomFloor(ctx, store.SetRoomFloorParams{ID: r.Ref().ID, Pattern: row.State, UpdatedAt: now})
	default:
		_, err = q.SetRoomLandscape(ctx, store.SetRoomLandscapeParams{ID: r.Ref().ID, Pattern: row.State, UpdatedAt: now})
	}
	if err != nil {
		return false, fmt.Errorf("game: decorate: %w", err)
	}
	used, err := q.DeleteHandFurni(ctx, store.DeleteHandFurniParams{ID: id, AvatarID: viewer.ID})
	if err != nil {
		return false, fmt.Errorf("game: decorate: %w", err)
	}
	if used == 0 {
		return false, nil
	}
	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("game: decorate: %w", err)
	}
	broadcast(r, RoomDecorated{Property: property, Pattern: row.State})
	return true, nil
}
