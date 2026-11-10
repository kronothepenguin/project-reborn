package game

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// recommendedRooms is how many rooms GET_RECOMMENDED_ROOMS gets (plans/server decision 0057).
const recommendedRooms = 3

// likeEscaper escapes what LIKE reads as wildcards, with the ! that SearchRooms declares as its escape.
var likeEscaper = strings.NewReplacer("!", "!!", "%", "!%", "_", "!_")

// OwnRooms returns viewer's rooms, by id.
func OwnRooms(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]FlatListing, error) {
	rows, err := store.New(db).ListAvatarRooms(ctx, viewer.ID)
	if err != nil {
		return nil, fmt.Errorf("game: own rooms: %w", err)
	}
	listed := make([]FlatListing, 0, len(rows))
	for _, row := range rows {
		listed = append(listed, listFlat(viewer, store.GetRoomRow(row)))
	}
	return listed, nil
}

// SearchRooms returns the rooms whose name holds query or whose owner it names, at most game.searchMaxRooms
// (plans/server decision 0061). A room that hides its owner comes up for the owner's name only for those who may see
// that owner.
func SearchRooms(ctx context.Context, db *sql.DB, viewer habbo.Habbo, query string) ([]FlatListing, error) {
	seeHidden := int64(0)
	if seesHiddenOwners(viewer) {
		seeHidden = 1
	}
	rows, err := store.New(db).SearchRooms(ctx, store.SearchRoomsParams{
		OwnerName:       query,
		ViewerAvatarID:  viewer.ID,
		SeeHiddenOwners: seeHidden,
		NamePattern:     "%" + likeEscaper.Replace(query) + "%",
		MaxRooms:        int64(settings.GetInt("game.searchMaxRooms")),
	})
	if err != nil {
		return nil, fmt.Errorf("game: search rooms: %w", err)
	}
	listed := make([]FlatListing, 0, len(rows))
	for _, row := range rows {
		listed = append(listed, listFlat(viewer, store.GetRoomRow(row)))
	}
	return listed, nil
}

// RecommendedRooms returns three habbo rooms drawn at random, or as many as there are (plans/server decision 0057).
func RecommendedRooms(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]FlatListing, error) {
	rows, err := store.New(db).ListRandomRooms(ctx, recommendedRooms)
	if err != nil {
		return nil, fmt.Errorf("game: recommended rooms: %w", err)
	}
	listed := make([]FlatListing, 0, len(rows))
	for _, row := range rows {
		listed = append(listed, listFlat(viewer, store.GetRoomRow(row)))
	}
	return listed, nil
}

func seesHiddenOwners(viewer habbo.Habbo) bool {
	return slices.Contains(viewer.Fuses, "fuse_see_all_roomowners")
}
