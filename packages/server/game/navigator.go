package game

import (
	"cmp"
	"context"
	"database/sql"
	"fmt"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// hiddenOwner stands for the owner of a room that hides it, as Holo wrote it.
const hiddenOwner = "-"

// CategoryListing is a category as the navigator lists it, with the habbos in its rooms and the most they take.
type CategoryListing struct {
	store.RoomCategory
	Visitors, MaxVisitors int
}

// PublicListing is a public room as the navigator lists it.
type PublicListing struct {
	store.PublicRoom
	Visitors int
}

// FlatListing is a habbo room as the navigator lists it. Owner is "-" when the room hides its owner from the viewer.
type FlatListing struct {
	ID          int64
	Name        string
	Owner       string
	Door        string
	Visitors    int
	MaxVisitors int
	Description string
}

// Browsed is what NAVIGATE shows of a category: the category, the categories right under it that the viewer may see,
// and its public rooms or its habbo rooms.
type Browsed struct {
	Category    CategoryListing
	Children    []CategoryListing
	PublicRooms []PublicListing
	Rooms       []FlatListing
}

// Browse returns what viewer sees of categoryID, without the full rooms when hideFull, and false for a category that
// does not exist or that hides itself from the viewer's level. A category lists at most game.categoryMaxRooms habbo
// rooms (decision server/0061), the busiest first.
func Browse(ctx context.Context, db *sql.DB, viewer habbo.Habbo, categoryID int64, hideFull bool) (Browsed, bool, error) {
	c, ok := category.Get(categoryID)
	if !ok {
		return Browsed{}, false, nil
	}
	level, err := auth.Level(ctx, db, viewer.UserID)
	if err != nil {
		return Browsed{}, false, fmt.Errorf("game: browse: %w", err)
	}
	if !visible(c, level) {
		return Browsed{}, false, nil
	}
	q := store.New(db)
	b := Browsed{}
	if b.Category, err = listCategory(ctx, q, c); err != nil {
		return Browsed{}, false, err
	}
	for _, child := range category.Children(c.ID) {
		if !visible(child, level) {
			continue
		}
		listed, err := listCategory(ctx, q, child)
		if err != nil {
			return Browsed{}, false, err
		}
		b.Children = append(b.Children, listed)
	}
	for _, r := range room.PublicIn(c.ID) {
		visitors := room.Visitors(room.Ref{Public: true, ID: r.ID})
		if !hideFull || visitors < int(r.MaxVisitors) {
			b.PublicRooms = append(b.PublicRooms, PublicListing{PublicRoom: r, Visitors: visitors})
		}
	}
	if c.Kind == "rooms" {
		rows, err := q.ListCategoryRooms(ctx, store.ListCategoryRoomsParams{RoomCategoryID: c.ID, MaxRooms: int64(settings.GetInt("game.categoryMaxRooms"))})
		if err != nil {
			return Browsed{}, false, fmt.Errorf("game: browse: %w", err)
		}
		for _, row := range rows {
			listed := listFlat(viewer, store.GetRoomRow(row))
			if !hideFull || listed.Visitors < listed.MaxVisitors {
				b.Rooms = append(b.Rooms, listed)
			}
		}
		slices.SortStableFunc(b.Rooms, func(a, b FlatListing) int { return cmp.Compare(b.Visitors, a.Visitors) })
	}
	return b, true, nil
}

// RoomCategories returns the categories viewer may put a room in: those of habbo rooms below the root that its level
// reaches, as Holo's check of SETFLATCAT had them.
func RoomCategories(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]store.RoomCategory, error) {
	level, err := auth.Level(ctx, db, viewer.UserID)
	if err != nil {
		return nil, fmt.Errorf("game: room categories: %w", err)
	}
	var usable []store.RoomCategory
	for _, c := range category.All() {
		if c.Kind == "rooms" && c.ParentID.Valid && level >= c.MinLevel {
			usable = append(usable, c)
		}
	}
	return usable, nil
}

func visible(c store.RoomCategory, level int64) bool {
	return !c.HiddenBelowLevel || level >= c.MinLevel
}

// listCategory counts the habbos in a category's rooms and the most they take: its public rooms from memory, its
// habbo rooms' capacity from the store.
func listCategory(ctx context.Context, q *store.Queries, c store.RoomCategory) (CategoryListing, error) {
	listed := CategoryListing{RoomCategory: c}
	for _, r := range room.PublicIn(c.ID) {
		listed.Visitors += room.Visitors(room.Ref{Public: true, ID: r.ID})
		listed.MaxVisitors += int(r.MaxVisitors)
	}
	if c.Kind == "rooms" {
		capacity, err := q.SumCategoryMaxVisitors(ctx, c.ID)
		if err != nil {
			return CategoryListing{}, fmt.Errorf("game: browse: %w", err)
		}
		listed.MaxVisitors += int(capacity)
	}
	return listed, nil
}

// listFlat lists a habbo room for viewer, who sees a hidden owner when it is that owner or holds
// fuse_see_all_roomowners (decision server/0045).
func listFlat(viewer habbo.Habbo, r store.GetRoomRow) FlatListing {
	owner := r.OwnerName
	if !r.ShowOwner && r.OwnerAvatarID != viewer.ID && !seesHiddenOwners(viewer) {
		owner = hiddenOwner
	}
	return FlatListing{
		ID:          r.ID,
		Name:        r.Name,
		Owner:       owner,
		Door:        r.Door,
		Visitors:    room.Visitors(room.Ref{ID: r.ID}),
		MaxVisitors: int(r.MaxVisitors),
		Description: r.Description,
	}
}
