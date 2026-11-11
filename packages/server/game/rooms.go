package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/category"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// The rules of a habbo's rooms (plans/server decision 0056), and the description's size, that of Holo's column.
const (
	maxRoomName        = 50
	maxRoomDescription = 125
	maxRoomPassword    = 32
	minRoomVisitors    = 10
	maxRoomVisitors    = 25
)

// defaultRoomCategory is "No category", which 0010-navigator.sql seeds with the id 2: a new room sits there until the
// room-o-matic's SETFLATCAT, which follows at once.
const defaultRoomCategory = 2

// doors are the client's three doors.
var doors = []string{"open", "closed", "password"}

var (
	// ErrCannotCreateRoom is returned for a room past the habbo's limit, or with a name, model or door the rules refuse.
	ErrCannotCreateRoom = errors.New("game: cannot create the room")
	// ErrNotOwner is returned when the habbo does not own the room, or it does not exist.
	ErrNotOwner = errors.New("game: not the room's owner")
	// ErrInvalidRoomSettings is returned for a category, password or visitors the rules refuse.
	ErrInvalidRoomSettings = errors.New("game: invalid room settings")
)

// NewRoom is what CREATEFLAT carries.
type NewRoom struct {
	Name      string
	Model     string
	Door      string
	ShowOwner bool
}

// CreateRoom creates a room that viewer creates and owns: up to game.maxRoomsPerHabbo, with a name of 1 to 50
// characters, a model habbos build on, a club one only with fuse_use_special_room_layouts, and one of the client's
// doors.
func CreateRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo, r NewRoom) (store.Room, error) {
	m, ok := model.Get(r.Model)
	if !validRoomName(r.Name) || !slices.Contains(doors, r.Door) || !ok || !m.HabboRooms ||
		(m.ClubOnly && !slices.Contains(viewer.Fuses, "fuse_use_special_room_layouts")) {
		return store.Room{}, ErrCannotCreateRoom
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return store.Room{}, fmt.Errorf("game: create room: %w", err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	count, err := q.CountAvatarRooms(ctx, viewer.ID)
	if err != nil {
		return store.Room{}, fmt.Errorf("game: create room: %w", err)
	}
	if count >= int64(settings.GetInt("game.maxRoomsPerHabbo")) {
		return store.Room{}, ErrCannotCreateRoom
	}
	created, err := q.CreateRoom(ctx, store.CreateRoomParams{
		AvatarID:       viewer.ID,
		RoomCategoryID: defaultRoomCategory,
		RoomModelID:    m.ID,
		Name:           r.Name,
		Door:           r.Door,
		ShowOwner:      r.ShowOwner,
		CreatedAt:      time.Now().UTC(),
	})
	if err != nil {
		return store.Room{}, fmt.Errorf("game: create room: %w", err)
	}
	return created, tx.Commit()
}

// SetRoomCategory puts viewer's room in a category that its level lets it use.
func SetRoomCategory(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID, categoryID int64) error {
	usable, err := RoomCategories(ctx, db, viewer)
	if err != nil {
		return err
	}
	if !slices.ContainsFunc(usable, func(c store.RoomCategory) bool { return c.ID == categoryID }) {
		return ErrInvalidRoomSettings
	}
	n, err := store.New(db).SetRoomCategory(ctx, store.SetRoomCategoryParams{ID: roomID, OwnerAvatarID: viewer.ID, RoomCategoryID: categoryID, UpdatedAt: time.Now().UTC()})
	if err != nil {
		return fmt.Errorf("game: set room category: %w", err)
	}
	if n == 0 {
		return ErrNotOwner
	}
	return nil
}

// RoomSettings is what SETFLATINFO changes; a nil field keeps the room's value.
type RoomSettings struct {
	Description     *string
	Password        *string
	OthersMoveFurni *bool
	MaxVisitors     *int
}

// SetRoomSettings changes viewer's room. A description loses its control characters and is cut at 125 characters, as
// Holo's column cut it; a password of 1 to 32 characters is stored hashed (plans/server decision 0062); the visitors
// are 10 to 25.
func SetRoomSettings(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID int64, change RoomSettings) error {
	if change.Password != nil && !inRange(utf8.RuneCountInString(*change.Password), 1, maxRoomPassword) ||
		change.MaxVisitors != nil && !inRange(*change.MaxVisitors, minRoomVisitors, maxRoomVisitors) {
		return ErrInvalidRoomSettings
	}
	var hash string
	if change.Password != nil {
		// Hashing is slow, and the store has one connection, so it happens before the transaction.
		hash = auth.HashPassword(*change.Password)
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("game: set room settings: %w", err)
	}
	defer tx.Rollback()
	q := store.New(tx)
	current, err := q.GetRoom(ctx, roomID)
	if store.IsNotFound(err) || err == nil && current.OwnerAvatarID != viewer.ID {
		return ErrNotOwner
	}
	if err != nil {
		return fmt.Errorf("game: set room settings: %w", err)
	}
	next := store.UpdateRoomSettingsParams{
		ID:              roomID,
		OwnerAvatarID:   viewer.ID,
		Description:     current.Description,
		OthersMoveFurni: current.OthersMoveFurni,
		MaxVisitors:     current.MaxVisitors,
		UpdatedAt:       time.Now().UTC(),
	}
	if change.Description != nil {
		next.Description = cleanDescription(*change.Description)
	}
	if change.OthersMoveFurni != nil {
		next.OthersMoveFurni = *change.OthersMoveFurni
	}
	if change.MaxVisitors != nil {
		next.MaxVisitors = int64(*change.MaxVisitors)
	}
	if _, err := q.UpdateRoomSettings(ctx, next); err != nil {
		return fmt.Errorf("game: set room settings: %w", err)
	}
	if change.Password != nil {
		if _, err := q.SetRoomPassword(ctx, store.SetRoomPasswordParams{ID: roomID, OwnerAvatarID: viewer.ID, PasswordHash: hash, UpdatedAt: next.UpdatedAt}); err != nil {
			return fmt.Errorf("game: set room settings: %w", err)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("game: set room settings: %w", err)
	}
	// A loaded room takes the new limit, and a higher one lets its queue in.
	if r, ok := room.Loaded(room.Ref{ID: roomID}); ok {
		r.SetMax(int(next.MaxVisitors))
		serveLines(r)
	}
	return nil
}

func validRoomName(name string) bool {
	return inRange(utf8.RuneCountInString(name), 1, maxRoomName) && !strings.ContainsFunc(name, isControl)
}

func cleanDescription(description string) string {
	description = strings.Map(func(r rune) rune {
		if isControl(r) {
			return -1
		}
		return r
	}, description)
	if utf8.RuneCountInString(description) > maxRoomDescription {
		description = string([]rune(description)[:maxRoomDescription])
	}
	return description
}

func isControl(r rune) bool {
	return r < ' ' || r == 0x7f
}

func inRange(n, low, high int) bool {
	return n >= low && n <= high
}

// RoomDetails is a habbo room as GETFLATINFO shows it: its listing, the name of its model, its settings, whether its
// category allows trading, and the most visitors any room takes, past which the navigator's modify page may not go.
type RoomDetails struct {
	FlatListing
	Model               string
	ShowOwner           bool
	OthersMoveFurni     bool
	Trading             bool
	AbsoluteMaxVisitors int
}

// RoomInfo returns what viewer sees of a habbo room, and false when there is none.
func RoomInfo(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID int64) (RoomDetails, bool, error) {
	r, err := store.New(db).GetRoom(ctx, roomID)
	if store.IsNotFound(err) {
		return RoomDetails{}, false, nil
	}
	if err != nil {
		return RoomDetails{}, false, fmt.Errorf("game: room info: %w", err)
	}
	m, _ := model.ByID(r.RoomModelID)
	c, _ := category.Get(r.RoomCategoryID)
	return RoomDetails{
		FlatListing:         listFlat(viewer, r),
		Model:               m.Name,
		ShowOwner:           r.ShowOwner,
		OthersMoveFurni:     r.OthersMoveFurni,
		Trading:             c.Trading,
		AbsoluteMaxVisitors: maxRoomVisitors,
	}, true, nil
}

// RoomCategoryOf returns the category of viewer's room, and false when viewer does not own it.
func RoomCategoryOf(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID int64) (int64, bool, error) {
	r, err := store.New(db).GetRoom(ctx, roomID)
	if store.IsNotFound(err) {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, fmt.Errorf("game: room category: %w", err)
	}
	return r.RoomCategoryID, r.OwnerAvatarID == viewer.ID, nil
}

// UpdateRoom changes the name, the door and whether to show the owner of viewer's room, by the rules of CreateRoom.
func UpdateRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID int64, name, door string, showOwner bool) error {
	if !validRoomName(name) || !slices.Contains(doors, door) {
		return ErrInvalidRoomSettings
	}
	n, err := store.New(db).UpdateRoomInfo(ctx, store.UpdateRoomInfoParams{ID: roomID, OwnerAvatarID: viewer.ID, Name: name, Door: door, ShowOwner: showOwner, UpdatedAt: time.Now().UTC()})
	if err != nil {
		return fmt.Errorf("game: update room: %w", err)
	}
	if n == 0 {
		return ErrNotOwner
	}
	return nil
}

// DeleteRoom deletes viewer's room and the favourites that name it, and sends the habbos in it out, as Holo did. The
// furni that stands in it goes to the owner's hand first, in the same transaction, whoever placed it (plans/server
// decisions 0059 and 0103).
func DeleteRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo, roomID int64) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("game: delete room: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	owned, err := q.GetRoom(ctx, roomID)
	if store.IsNotFound(err) || err == nil && owned.OwnerAvatarID != viewer.ID {
		return ErrNotOwner
	}
	if err != nil {
		return fmt.Errorf("game: delete room: %w", err)
	}
	if err := q.MoveRoomFurniToHand(ctx, store.MoveRoomFurniToHandParams{RoomID: roomID, UserID: viewer.UserID, AvatarID: viewer.ID}); err != nil {
		return fmt.Errorf("game: delete room: %w", err)
	}
	n, err := q.DeleteRoom(ctx, store.DeleteRoomParams{ID: roomID, OwnerAvatarID: viewer.ID})
	if err != nil {
		return fmt.Errorf("game: delete room: %w", err)
	}
	if n == 0 {
		return ErrNotOwner
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("game: delete room: %w", err)
	}
	emptyRoom(room.Ref{ID: roomID})
	return nil
}
