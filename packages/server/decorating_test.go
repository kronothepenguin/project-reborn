package server

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A habbo that controls a room uses up a wallpaper, a floor or a landscape of its hand on it: the room keeps the
// pattern, everyone in it gets 46, and a habbo that comes in later gets the room's decorations after 69.
func TestDecoratingARoom(t *testing.T) {
	owner := habboWithTickets(t, "Painter", "painter")
	squatter := habboWithTickets(t, "Squatter", "squatter", "squatter-again")
	flat := newRoom(t, owner, 2, "Studio", true)
	wallpaper := giveFurni(t, owner, 3, "107")
	floor := giveFurni(t, owner, 2, "111")
	stolen := giveFurni(t, squatter, 3, "205")
	chair := giveFurni(t, owner, 463, "")
	landscape, err := store.New(testDB).ListFurniDefinitions(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	var sky int64
	for _, d := range landscape {
		if d.Sprite == "landscape" {
			sky = giveFurni(t, owner, d.ID, "1.3")
			break
		}
	}
	p, _ := login(t, "painter")
	s, _ := login(t, "squatter")
	both := []*client{p, s}
	p.enterFlat(t, flat, 47, 42)
	s.enterFlat(t, flat)
	p.nextBody(t, 28)
	p.nextBody(t, 34)

	// Without rights, with a furni that is no wallpaper, and with a wallpaper named as a floor: nothing.
	s.send(t, 66, fmt.Sprintf("wallpaper/%d", stolen))
	p.send(t, 66, fmt.Sprintf("wallpaper/%d", chair))
	p.send(t, 66, fmt.Sprintf("floor/%d", wallpaper))
	p.send(t, 66, fmt.Sprintf("wallpaper/%d", wallpaper))
	expectAll(t, both, 46, "wallpaper/107")
	p.send(t, 66, fmt.Sprintf("floor/%d", floor))
	expectAll(t, both, 46, "floor/111")
	p.send(t, 66, fmt.Sprintf("landscape/%d", sky))
	expectAll(t, both, 46, "landscape/1.3")

	room := getRoom(t, flat)
	if room.Wallpaper != "107" || room.Floor != "111" || room.Landscape != "1.3" {
		t.Errorf("the room is stored with %q, %q and %q; want the three patterns", room.Wallpaper, room.Floor, room.Landscape)
	}
	if hand := handOf(t, owner); len(hand) != 1 || hand[0].ID != chair {
		t.Errorf("the owner's hand holds %+v, want only the chair: the decorations are used up", hand)
	}
	if hand := handOf(t, squatter); len(hand) != 1 {
		t.Errorf("the habbo without rights lost its wallpaper: its hand holds %d furni", len(hand))
	}

	s.send(t, 53, "")
	again, _ := login(t, "squatter-again")
	again.knock(t, flat, "")
	again.expectNext(t, 41, "\x02")
	again.send(t, 59, strconv.FormatInt(flat, 10))
	again.expectNext(t, 69, "model_a "+strconv.FormatInt(flat, 10))
	again.expectNext(t, 46, "landscape/1.3")
	again.expectNext(t, 46, "wallpaper/107")
	again.expectNext(t, 46, "floor/111")
}
