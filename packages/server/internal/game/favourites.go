package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// ErrTooManyFavourites is returned for a favourite past game.maxFavouriteRooms (decision server/0058).
var ErrTooManyFavourites = errors.New("game: too many favourite rooms")

// Favourites returns viewer's favourite public rooms and habbo rooms, oldest first.
func Favourites(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]PublicListing, []FlatListing, error) {
	q := store.New(db)
	ids, err := q.ListFavouritePublicRooms(ctx, viewer.ID)
	if err != nil {
		return nil, nil, fmt.Errorf("game: favourites: %w", err)
	}
	var public []PublicListing
	for _, id := range ids {
		if r, ok := room.Public(id); ok {
			public = append(public, PublicListing{PublicRoom: r, Visitors: room.Visitors(room.Ref{Public: true, ID: id})})
		}
	}
	rows, err := q.ListFavouriteRooms(ctx, viewer.ID)
	if err != nil {
		return nil, nil, fmt.Errorf("game: favourites: %w", err)
	}
	flats := make([]FlatListing, 0, len(rows))
	for _, row := range rows {
		flats = append(flats, listFlat(viewer, store.GetRoomRow(row)))
	}
	return public, flats, nil
}

// AddFavourite keeps a room among viewer's favourites, up to game.maxFavouriteRooms. A room that does not exist, or that
// is a favourite already, changes nothing.
func AddFavourite(ctx context.Context, db *sql.DB, viewer habbo.Habbo, r room.Ref) error {
	if r.Public {
		if _, ok := room.Public(r.ID); !ok {
			return nil
		}
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("game: add favourite: %w", err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	if !r.Public {
		if _, err := q.GetRoom(ctx, r.ID); store.IsNotFound(err) {
			return nil
		} else if err != nil {
			return fmt.Errorf("game: add favourite: %w", err)
		}
	}
	count, err := q.CountFavouriteRooms(ctx, viewer.ID)
	if err != nil {
		return fmt.Errorf("game: add favourite: %w", err)
	}
	if count >= int64(settings.Int(ctx, q, "game.maxFavouriteRooms")) {
		return ErrTooManyFavourites
	}
	now := time.Now().UTC()
	if r.Public {
		err = q.AddFavouritePublicRoom(ctx, store.AddFavouritePublicRoomParams{AvatarID: viewer.ID, PublicRoomID: r.ID, CreatedAt: now})
	} else {
		err = q.AddFavouriteRoom(ctx, store.AddFavouriteRoomParams{AvatarID: viewer.ID, RoomID: r.ID, CreatedAt: now})
	}
	if err != nil {
		return fmt.Errorf("game: add favourite: %w", err)
	}
	return tx.Commit()
}

// RemoveFavourite takes a room out of viewer's favourites.
func RemoveFavourite(ctx context.Context, db *sql.DB, viewer habbo.Habbo, r room.Ref) error {
	q := store.New(db)
	var err error
	if r.Public {
		err = q.RemoveFavouritePublicRoom(ctx, store.RemoveFavouritePublicRoomParams{AvatarID: viewer.ID, PublicRoomID: r.ID})
	} else {
		err = q.RemoveFavouriteRoom(ctx, store.RemoveFavouriteRoomParams{AvatarID: viewer.ID, RoomID: r.ID})
	}
	if err != nil {
		return fmt.Errorf("game: remove favourite: %w", err)
	}
	return nil
}
