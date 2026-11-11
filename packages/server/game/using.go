package game

import (
	"context"
	"database/sql"
	"fmt"
	"math/rand/v2"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// FurniStateChanged tells a room the new state of a furni that stands in it.
type FurniStateChanged struct{ Furni room.Furni }

// DiceRolled tells a room that the dice id rolls, or the face it shows once it stopped, 0 for a dice turned off.
type DiceRolled struct {
	ID      int64
	Rolling bool
	Face    int
}

// How long the furni that draw a number show it coming, as Holo timed them.
const (
	diceRollTime   = 2 * time.Second
	wheelSpinTime  = 4250 * time.Millisecond
	randomizerTime = 5 * time.Second
)

// A drink is sipped as Holo's habbos did: carried for sipInterval, drunk for sipTime, sips times.
const (
	sips        = 10
	sipInterval = 9 * time.Second
	sipTime     = time.Second
)

// The states that the furni which draw a number show while it comes.
const (
	wheelSpinning      = "-1"
	randomizerSpinning = "123456789"
)

// The states of a door furni: open, which lets habbos through, and closed.
const (
	doorOpen   = "O"
	doorClosed = "C"
)

// stateMaxLength is the longest state a client may set: the client's own are a word or a number.
const stateMaxLength = 32

// neverSet reports whether no client sets the state of a furni of that sprite: a dice, a bottle, a randomizer and the
// wheel show what the server drew, a trophy what its buyer wrote, and a present its note, as Holo guarded them.
func neverSet(sprite string) bool {
	for _, guarded := range []string{"edice", "bottle", "val_randomizer", "habbowheel", "prizetrophy", "greektrophy", "present_gen", "post.it", "poster", "roomdimmer"} {
		if strings.HasPrefix(sprite, guarded) {
			return true
		}
	}
	return false
}

// in returns the habbo room viewer is in and the furni id that stands in it.
func in(viewer habbo.Habbo, id int64) (*room.Room, room.Furni, bool) {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public {
		return nil, room.Furni{}, false
	}
	item, ok := r.FurniByID(id)
	return r, item, ok
}

// SetFurniState changes the state of the floor furni id of the room viewer is in (SETSTUFFDATA), as Holo let it:
// anyone in the room changes a furni's state, a lamp on or off; only a habbo that controls the room opens and closes a
// door furni, O and C, and a door closes only while nobody stands in it; and nobody sets a furni that the server
// draws or writes. The state is saved, then the room's copy changes, and the room is told.
func SetFurniState(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, state string) error {
	r, item, ok := in(viewer, id)
	if !ok || item.Definition.Kind == "wall" || neverSet(item.Definition.Sprite) || !validState(state) {
		return nil
	}
	if door := strings.ToUpper(state); door == doorOpen || door == doorClosed {
		if !item.Definition.Door || !controls(r, viewer) {
			return nil
		}
		state = door
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		if state == doorClosed {
			held := standing(r)
			if slices.ContainsFunc(item.Tiles(), func(at [2]int) bool { return held[at] }) {
				return nil
			}
		}
		return saveState(ctx, db, r, item, state)
	})
}

// SetItemState changes the state of the wall item id of the room viewer is in (SETITEMSTATE): anyone in the room does,
// for any item but those the server or its owner writes.
func SetItemState(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64, state int) error {
	r, item, ok := in(viewer, id)
	if !ok || item.Definition.Kind != "wall" || neverSet(item.Definition.Sprite) {
		return nil
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		return saveState(ctx, db, r, item, strconv.Itoa(state))
	})
}

// validState reports whether a client may set state: short, and without control characters.
func validState(state string) bool {
	return len(state) <= stateMaxLength && !strings.ContainsFunc(state, func(r rune) bool { return r < ' ' })
}

// saveState writes the furni's new state, then the room's copy, and tells the room.
func saveState(ctx context.Context, db *sql.DB, r *room.Room, item room.Furni, state string) error {
	if err := storeState(ctx, db, r, &item, state); err != nil || item.State != state {
		return err
	}
	broadcast(r, FurniStateChanged{Furni: item})
	return nil
}

// storeState writes the furni's new state and then the room's copy, and leaves item as it now stands; it tells
// nobody. A furni that left the room meanwhile keeps its state.
func storeState(ctx context.Context, db *sql.DB, r *room.Room, item *room.Furni, state string) error {
	n, err := store.New(db).SetRoomFurniState(ctx, store.SetRoomFurniStateParams{ID: item.ID, RoomID: r.Ref().ID, State: state})
	if err != nil {
		return fmt.Errorf("game: furni state: %w", err)
	}
	if n == 0 {
		return nil
	}
	changed := *item
	changed.State = state
	if r.SetFurni(changed) {
		*item = changed
	}
	return nil
}

// beside reports whether viewer stands on the furni's tile or one of the eight around it, from where Holo let a
// habbo roll a dice.
func beside(r *room.Room, viewer habbo.Habbo, item room.Furni) bool {
	o, ok := r.Occupant(viewer.ID)
	return ok && abs(o.X-int(item.X)) <= 1 && abs(o.Y-int(item.Y)) <= 1
}

// later runs tell after wait, while the room is still loaded and still has the furni id.
func later(r *room.Room, id int64, wait time.Duration, tell func()) {
	time.AfterFunc(wait, func() {
		if _, ok := r.FurniByID(id); ok {
			tell()
		}
	})
}

// ThrowDice rolls the dice id (THROW_DICE) for a habbo beside it: the room sees it roll, and its face, 1 to 6, two
// seconds later. A bottle spins the same way and points one of its eight ways, which Holo left out. The face is
// saved as the dice's state at once.
func ThrowDice(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, item, ok := in(viewer, id)
	sprite := item.Definition.Sprite
	if !ok || (sprite != "edice" && sprite != "edicehc" && sprite != "bottle") || !beside(r, viewer, item) {
		return nil
	}
	face := rand.IntN(6) + 1
	if sprite == "bottle" {
		face = rand.IntN(8)
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		if err := storeState(ctx, db, r, &item, strconv.Itoa(face)); err != nil {
			return err
		}
		broadcast(r, DiceRolled{ID: id, Rolling: true})
		later(r, id, diceRollTime, func() { broadcast(r, DiceRolled{ID: id, Face: face}) })
		return nil
	})
}

// CloseDice turns the dice id off (DICE_OFF) for a habbo beside it: it shows no face.
func CloseDice(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, item, ok := in(viewer, id)
	if sprite := item.Definition.Sprite; !ok || (sprite != "edice" && sprite != "edicehc") || !beside(r, viewer, item) {
		return nil
	}
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		if err := storeState(ctx, db, r, &item, "0"); err != nil {
			return err
		}
		broadcast(r, DiceRolled{ID: id})
		return nil
	})
}

// SpinWheel spins the wheel of fortune id (SPIN_WHEEL_OF_FORTUNE) for a habbo that controls the room, as Holo asked:
// the room sees it spin, and the number it stops on, 0 to 9, 4.25 seconds later.
func SpinWheel(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, item, ok := in(viewer, id)
	if !ok || item.Definition.Sprite != "habbowheel" || !controls(r, viewer) {
		return nil
	}
	return draw(ctx, db, r, id, wheelSpinning, strconv.Itoa(rand.IntN(10)), wheelSpinTime)
}

// SetRandomState starts the love randomizer id (SET_RANDOM_STATE) for anyone in the room: the room sees it run, and
// the number it stops on, 1 to 4, five seconds later, as Holo had it.
func SetRandomState(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) error {
	r, item, ok := in(viewer, id)
	if !ok || item.Definition.Sprite != "val_randomizer" {
		return nil
	}
	return draw(ctx, db, r, id, randomizerSpinning, strconv.Itoa(rand.IntN(4)+1), randomizerTime)
}

// draw saves the number a furni drew as its state at once, shows the room the state it has while the number comes,
// and the number after wait.
func draw(ctx context.Context, db *sql.DB, r *room.Room, id int64, coming, number string, wait time.Duration) error {
	return r.Furnish(func() error {
		item, ok := r.FurniByID(id)
		if !ok {
			return nil
		}
		if err := storeState(ctx, db, r, &item, number); err != nil || item.State != number {
			return err
		}
		spinning := item
		spinning.State = coming
		broadcast(r, FurniStateChanged{Furni: spinning})
		later(r, id, wait, func() { broadcast(r, FurniStateChanged{Furni: item}) })
		return nil
	})
}

// CarryDrink puts a drink in the habbo's hand (CARRYDRINK), which it sips ten times, unless it lies. The token names
// the drink to the client, 1 to 26, as Holo knew them. It stops the habbo's dance and replaces what it carried.
func CarryDrink(viewer habbo.Habbo, token string) {
	if n, err := strconv.Atoi(token); err != nil || n < 1 || n > 26 {
		return
	}
	next := time.Now().Add(sipInterval)
	changeStatuses(viewer, func(o *room.Occupant) {
		if hasStatus(o, "lay") {
			return
		}
		o.Carry = room.Carry{Item: token, Sips: sips, Next: next}
		o.Statuses = setStatus(without(o.Statuses, "dance", "drink"), room.Status{Action: "carryd", Parameters: token})
		o.Changed = true
	})
}

// DropDrink takes what the habbo carries out of its hand (STOP CarryItem).
func DropDrink(viewer habbo.Habbo) {
	changeStatuses(viewer, func(o *room.Occupant) {
		if o.Carry.Item != "" {
			drop(o)
		}
	})
}

func drop(o *room.Occupant) {
	o.Carry = room.Carry{}
	o.Statuses, o.Changed = without(o.Statuses, "carryd", "drink"), true
}

// sip moves the habbo's drink on when its time has come: up to its mouth for sipTime, then down again until the next
// sip, and out of its hand after the last. The room's clock calls it on every tick.
func sip(o *room.Occupant, now time.Time) {
	if o.Carry.Item == "" || now.Before(o.Carry.Next) {
		return
	}
	if hasStatus(o, "carryd") {
		o.Statuses = setStatus(without(o.Statuses, "carryd"), room.Status{Action: "drink", Parameters: o.Carry.Item})
		o.Carry.Next, o.Changed = now.Add(sipTime), true
		return
	}
	if o.Carry.Sips--; o.Carry.Sips <= 0 {
		drop(o)
		return
	}
	o.Statuses = setStatus(without(o.Statuses, "drink"), room.Status{Action: "carryd", Parameters: o.Carry.Item})
	o.Carry.Next, o.Changed = now.Add(sipInterval), true
}
