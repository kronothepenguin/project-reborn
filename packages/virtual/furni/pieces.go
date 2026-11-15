package furni

import (
	"context"
	"fmt"
	"slices"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// padNotes is how many notes a new pad of post-its holds, as Holo's did.
const padNotes = "20"

// teleports are the furni that come as a pair of teleports, as Holo knew them, and decorations the wall items a room
// uses up in place of hanging them.
var (
	teleports   = []string{"door", "doorB", "doorC", "doorD", "teleport_door"}
	decorations = []string{"wallpaper", "floor", "landscape"}
)

// IsTeleport reports whether a furni of the sprite is a teleport.
func IsTeleport(sprite string) bool { return slices.Contains(teleports, sprite) }

// IsDecoration reports whether a furni of the sprite is a wallpaper, a floor or a landscape, which carries the
// pattern its buyer chose as its state.
func IsDecoration(sprite string) bool { return slices.Contains(decorations, sprite) }

// IsPostIt reports whether a furni of the sprite is a pad of post-its, or one of its notes on a wall.
func IsPostIt(sprite string) bool { return strings.HasPrefix(sprite, "post.it") }

// Create creates what a habbo gets for one furni of the sprite, as a purchase, a voucher or any other gift gives it
// (decision server/0125): piece as it is for most furni; a pad of post-its with its notes when piece has no
// state; and a teleport with the other of its pair, the two naming each other (decision server/0111). q writes
// them, inside the caller's transaction.
func Create(ctx context.Context, q *store.Queries, sprite string, piece store.CreateFurniParams) error {
	if piece.State == "" && IsPostIt(sprite) {
		piece.State = padNotes
	}
	first, err := q.CreateFurni(ctx, piece)
	if err != nil {
		return fmt.Errorf("furni: create: %w", err)
	}
	if !IsTeleport(sprite) {
		return nil
	}
	second, err := q.CreateFurni(ctx, piece)
	if err != nil {
		return fmt.Errorf("furni: create: %w", err)
	}
	for _, pair := range [][2]int64{{first.ID, second.ID}, {second.ID, first.ID}} {
		if err := q.SetFurniPartner(ctx, store.SetFurniPartnerParams{ID: pair[0], PartnerFurniID: pair[1]}); err != nil {
			return fmt.Errorf("furni: create: %w", err)
		}
	}
	return nil
}
