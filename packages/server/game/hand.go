package game

import (
	"context"
	"database/sql"
	"fmt"
	"math"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// HandPageSize is how many furni a page of the hand holds: the client's hand has nine places.
const HandPageSize = 9

// LastHandPage asks HandPage for the hand's last page.
const LastHandPage = math.MaxInt32

// HandItem is a furni in a hand, with what it is and its place in the whole hand, from 0.
type HandItem struct {
	store.Furni
	Definition store.FurniDefinition
	Position   int
}

// Hand is one page of a habbo's hand, and how many furni the whole hand holds.
type Hand struct {
	Page  int
	Items []HandItem
	Total int
}

// HandPage reads a page of viewer's hand from the store, where the hand lives (decision server/0096), the oldest
// furni first, as Holo listed them. A page before the first gives the first, and one past the last gives the last.
func HandPage(ctx context.Context, db *sql.DB, viewer habbo.Habbo, page int) (Hand, error) {
	q := store.New(db)
	total, err := q.CountHandFurni(ctx, viewer.ID)
	if err != nil {
		return Hand{}, fmt.Errorf("game: hand: %w", err)
	}
	last := max(int(total)-1, 0) / HandPageSize
	page = min(max(page, 0), last)
	rows, err := q.ListHandFurni(ctx, store.ListHandFurniParams{AvatarID: viewer.ID, PageSize: HandPageSize, Skip: int64(page * HandPageSize)})
	if err != nil {
		return Hand{}, fmt.Errorf("game: hand: %w", err)
	}
	hand := Hand{Page: page, Total: int(total)}
	for i, row := range rows {
		// A definition that an update added since the server loaded them is not in memory yet.
		if d, ok := furni.Get(row.FurniDefinitionID); ok {
			hand.Items = append(hand.Items, HandItem{Furni: row, Definition: d, Position: page*HandPageSize + i})
		}
	}
	return hand, nil
}
