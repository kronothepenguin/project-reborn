package server

import (
	"context"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// readFavourites reads 61: the node mask, a header node of type 2 with the habbo rooms as its flats, then the public
// rooms as nodes.
func readFavourites(t *testing.T, body string) (flats []flat, public []node) {
	t.Helper()
	r := strings.NewReader(body)
	readInt(t, r)
	header := node{ID: readInt(t, r), Type: readInt(t, r), Name: readText(t, r), Visitors: readInt(t, r), MaxVisitors: readInt(t, r), Parent: readInt(t, r)}
	if header.ID != 0 || header.Type != 2 || header.Name != "" {
		t.Fatalf("header = %+v, want an empty node of type 2", header)
	}
	for range readInt(t, r) {
		flats = append(flats, flat{readInt(t, r), readText(t, r), readText(t, r), readText(t, r), readInt(t, r), readInt(t, r), readText(t, r)})
	}
	for r.Len() > 0 {
		n := node{ID: readInt(t, r), Type: readInt(t, r), Name: readText(t, r), Visitors: readInt(t, r), MaxVisitors: readInt(t, r), Parent: readInt(t, r)}
		n.Unit, n.Port, n.Door, n.Casts, n.Queue = readText(t, r), readInt(t, r), readInt(t, r), readText(t, r), readInt(t, r)
		visible, err := encoding.ReadBool(r)
		if err != nil {
			t.Fatal(err)
		}
		n.Visible = visible
		public = append(public, n)
	}
	return flats, public
}

func favourites(t *testing.T, c *client) ([]flat, []node) {
	t.Helper()
	c.send(t, 18, "@")
	id, body := c.next(t)
	if id != 61 {
		t.Fatalf("received %d, want 61", id)
	}
	return readFavourites(t, body)
}

func TestKeepingFavouriteRooms(t *testing.T) {
	fan := habboWithTickets(t, "Fan", "fan")
	den := newRoom(t, fan, 2, "Den", true)
	c, _ := login(t, "fan")

	c.send(t, 19, vl64String(t, 1, 101))
	c.send(t, 19, vl64String(t, 0, int32(den)))
	c.send(t, 19, vl64String(t, 1, 999))
	flats, public := favourites(t, c)
	if len(flats) != 1 || flats[0].ID != int32(den) || flats[0].Name != "Den" {
		t.Errorf("favourite flats = %+v, want Den", flats)
	}
	if len(public) != 1 || public[0].ID != 101 || public[0].Type != 1 || public[0].Parent != 3 || public[0].Unit != "welcome_lounge" {
		t.Errorf("favourite public rooms = %+v, want the Welcome Lounge under Public Rooms", public)
	}

	c.send(t, 20, vl64String(t, 1, 101))
	if flats, public := favourites(t, c); len(flats) != 1 || len(public) != 0 {
		t.Errorf("after removing the Welcome Lounge: %+v and %+v, want Den alone", flats, public)
	}
}

// Past game.maxFavouriteRooms, a favourite gets 33, whatever number the client's text says (decision server/0058).
func TestTheFavouritesHaveALimit(t *testing.T) {
	set := func(value int) {
		if err := settings.Set(context.Background(), store.New(testDB), 0, "game.maxFavouriteRooms", value); err != nil {
			t.Fatal(err)
		}
	}
	set(2)
	t.Cleanup(func() { set(30) })
	habboWithTickets(t, "Collector", "collector")
	c, _ := login(t, "collector")

	c.send(t, 19, vl64String(t, 1, 101))
	c.send(t, 19, vl64String(t, 1, 102))
	c.send(t, 19, vl64String(t, 1, 103))
	if id, body := c.next(t); id != 33 || body != "Only 10 favorite rooms allowed!" {
		t.Errorf("the third favourite got %d %q, want 33 with the client's text", id, body)
	}
	if _, public := favourites(t, c); len(public) != 2 {
		t.Errorf("%d favourites kept, want 2", len(public))
	}
}
