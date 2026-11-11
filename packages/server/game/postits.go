package game

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// newPostItColour is the colour a post-it has when it leaves its pad, as Holo's did.
const newPostItColour = "FFFF33"

// postItColours are the colours a habbo gives a post-it, the four of the client's window.
var postItColours = []string{"FFFF33", "FF9CFF", "9CFF9C", "9CCEFF"}

func isPostIt(item room.Furni) bool {
	return item.Definition.Kind == "wall" && strings.HasPrefix(item.Definition.Sprite, "post.it")
}

// hangPostIt takes one note off the pad of viewer's hand and hangs it on the wall at position, as Holo did: the pad
// counts one note fewer in its state and goes with its last one, and the note is a new furni of the pad's kind, of
// viewer's user. The pad and the note change in one transaction, before the room's copy does. The caller holds the
// room's furni.
func hangPostIt(ctx context.Context, db *sql.DB, r *room.Room, viewer habbo.Habbo, pad room.Furni, position string) (bool, error) {
	left, err := strconv.Atoi(pad.State)
	if err != nil {
		return false, nil
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("game: hang post-it: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	var n int64
	if left > 1 {
		n, err = q.SetHandFurniState(ctx, store.SetHandFurniStateParams{ID: pad.ID, AvatarID: viewer.ID, State: strconv.Itoa(left - 1)})
	} else {
		n, err = q.DeleteHandFurni(ctx, store.DeleteHandFurniParams{ID: pad.ID, AvatarID: viewer.ID})
	}
	if err != nil {
		return false, fmt.Errorf("game: hang post-it: %w", err)
	}
	if n == 0 {
		return false, nil
	}
	row, err := q.CreateFurni(ctx, store.CreateFurniParams{
		FurniDefinitionID: pad.FurniDefinitionID, UserID: viewer.UserID,
		AvatarID: sql.NullInt64{Int64: viewer.ID, Valid: true}, State: newPostItColour, CreatedAt: time.Now().UTC(),
	})
	if err != nil {
		return false, fmt.Errorf("game: hang post-it: %w", err)
	}
	if _, err := q.PlaceFurni(ctx, store.PlaceFurniParams{ID: row.ID, AvatarID: viewer.ID, RoomID: r.Ref().ID, WallPosition: position}); err != nil {
		return false, fmt.Errorf("game: hang post-it: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("game: hang post-it: %w", err)
	}
	row.AvatarID = sql.NullInt64{}
	row.RoomID = sql.NullInt64{Int64: r.Ref().ID, Valid: true}
	row.WallPosition = position
	note := room.Furni{Furni: row, Definition: pad.Definition}
	if r.SetFurni(note) {
		broadcast(r, FurniPlaced{Furni: note})
	}
	// The client keeps the pad in its hand, and learns here how many notes it still holds.
	viewer.Session.Notify(HandChanged{})
	return true, nil
}

// PostIt returns the post-it id of the room viewer is in, whose state is its colour, and what is written on it
// (G_IDATA): anyone in the room reads a note.
func PostIt(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) (room.Furni, string, bool, error) {
	_, item, ok := in(viewer, id)
	if !ok || !isPostIt(item) {
		return room.Furni{}, "", false, nil
	}
	text, err := store.New(db).GetFurniNote(ctx, id)
	if err != nil && !store.IsNotFound(err) {
		return room.Furni{}, "", false, fmt.Errorf("game: post-it: %w", err)
	}
	return item, text, true, nil
}

// WritePostIt gives the post-it id of the room viewer is in a colour and a text (SETITEMDATA). A habbo that controls
// the room writes (plans/server decision 0108). A text longer than game.postItMaxLength characters is refused
// (plans/server decision 0109), and so is a colour the client's window does not have; a post.it.vd, which the client
// always shows white, takes any colour, as Holo let it. The text and the colour are saved in one transaction, then
// the room's copy changes and the room is told the colour.
func WritePostIt(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, colour, text string) error {
	r, ok := furnished(viewer)
	if !ok || r.Ref().Public {
		return nil
	}
	colour = strings.ToUpper(colour)
	text = postItText(text)
	if !hexColour(colour) || utf8.RuneCountInString(text) > settings.GetIntOr("game.postItMaxLength", 684) {
		return nil
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok || !isPostIt(item) || (item.Definition.Sprite == "post.it" && !slices.Contains(postItColours, colour)) {
			return nil
		}
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("game: write post-it: %w", err)
		}
		defer tx.Rollback()
		q := store.New(db).WithTx(tx)
		n, err := q.SetRoomFurniState(ctx, store.SetRoomFurniStateParams{ID: id, RoomID: r.Ref().ID, State: colour})
		if err != nil {
			return fmt.Errorf("game: write post-it: %w", err)
		}
		if n == 0 {
			return nil
		}
		if err := q.SetFurniNote(ctx, store.SetFurniNoteParams{FurniID: id, Text: text}); err != nil {
			return fmt.Errorf("game: write post-it: %w", err)
		}
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("game: write post-it: %w", err)
		}
		item.State = colour
		if r.SetFurni(item) {
			broadcast(r, FurniStateChanged{Furni: item})
		}
		return nil
	})
}

// DeletePostIt takes the post-it id off the wall of the room viewer is in, for good (REMOVEITEM). The room's owner
// deletes a note, and so does a holder of fuse_remove_stickies (plans/server decision 0108).
func DeletePostIt(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || !(owns(r, viewer) || hasFuse(viewer, auth.FuseRemoveStickies)) {
		return nil
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok || !isPostIt(item) {
			return nil
		}
		n, err := store.New(db).DeleteRoomFurni(ctx, store.DeleteRoomFurniParams{ID: id, RoomID: r.Ref().ID})
		if err != nil {
			return fmt.Errorf("game: delete post-it: %w", err)
		}
		if n == 0 {
			return nil
		}
		if _, ok := r.RemoveFurni(id); ok {
			broadcast(r, FurniRemoved{ID: id, Wall: true})
		}
		return nil
	})
}

func hexColour(colour string) bool {
	return len(colour) == 6 && !strings.ContainsFunc(colour, func(r rune) bool {
		return !(r >= '0' && r <= '9' || r >= 'A' && r <= 'F')
	})
}

// postItText keeps a note's line breaks, which the client sends as carriage returns, and turns every other control
// character into a space.
func postItText(text string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' && r != '\r' {
			return ' '
		}
		return r
	}, text)
}
