package server

import (
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type flatInfo struct {
	OthersMove, Door, ID                int32
	Owner, Marker, Name, Description    string
	ShowOwner, Trading, Alert, Max, Abs int32
}

func getFlatInfo(t *testing.T, c *client, id int64) flatInfo {
	t.Helper()
	c.send(t, 21, strconv.FormatInt(id, 10))
	got, body := c.next(t)
	if got != 54 {
		t.Fatalf("received %d, want 54", got)
	}
	r := strings.NewReader(body)
	return flatInfo{readInt(t, r), readInt(t, r), readInt(t, r), readText(t, r), readText(t, r), readText(t, r), readText(t, r),
		readInt(t, r), readInt(t, r), readInt(t, r), readInt(t, r), readInt(t, r)}
}

func TestARoomsInfo(t *testing.T) {
	owner := habboWithTickets(t, "Infoowner", "infoowner")
	habboWithTickets(t, "Infoguest", "infoguest")
	id := newRoom(t, owner, 6, "Bazaar", false)
	c, _ := login(t, "infoowner")

	want := flatInfo{Door: 0, ID: int32(id), Owner: "Infoowner", Marker: "model_a", Name: "Bazaar", Trading: 1, Max: 25, Abs: 25}
	if got := getFlatInfo(t, c, id); got != want {
		t.Errorf("54 = %+v, want %+v", got, want)
	}
	guest, _ := login(t, "infoguest")
	if got := getFlatInfo(t, guest, id); got.Owner != "-" {
		t.Errorf("a guest sees the owner %q of a room that hides it, want -", got.Owner)
	}
}

func TestTheOwnerChangesARoom(t *testing.T) {
	habboWithTickets(t, "Renovator", "renovator")
	habboWithTickets(t, "Vandal", "vandal")
	c, _ := login(t, "renovator")
	_, body := createFlat(t, c, "Old name", "a", "open")
	id := createdID(t, body)
	flat := strconv.FormatInt(id, 10)

	vandal, _ := login(t, "vandal")
	vandal.send(t, 24, flat+"/Taken/closed/0")
	vandal.send(t, 152, vl64String(t, int32(id)))
	settle(t, vandal)
	if r := getRoom(t, id); r.Name != "Old name" || r.Door != "open" {
		t.Errorf("another habbo changed the room: %+v", r)
	}

	c.send(t, 24, flat+"/New name/closed/0")
	c.send(t, 24, flat+"/"+strings.Repeat("n", 51)+"/open/1")
	c.send(t, 152, vl64String(t, int32(id)))
	if got, body := c.next(t); got != 222 || body != vl64String(t, int32(id), 2) {
		t.Errorf("GETFLATCAT got %d %q, want 222 with the room in No category", got, body)
	}
	if r := getRoom(t, id); r.Name != "New name" || r.Door != "closed" || r.ShowOwner {
		t.Errorf("room = %+v, want New name, closed, its owner hidden, and the long name refused", r)
	}
}

// A deleted room goes with the favourites that name it; another habbo cannot delete it.
func TestDeletingARoom(t *testing.T) {
	habboWithTickets(t, "Demolisher", "demolisher")
	habboWithTickets(t, "Admirer", "admirer")
	c, _ := login(t, "demolisher")
	_, body := createFlat(t, c, "Doomed", "a", "open")
	id := createdID(t, body)
	admirer, _ := login(t, "admirer")
	admirer.send(t, 19, vl64String(t, 0, int32(id)))
	admirer.send(t, 23, strconv.FormatInt(id, 10))
	settle(t, admirer)
	if _, err := store.New(testDB).GetRoom(t.Context(), id); err != nil {
		t.Fatalf("another habbo deleted the room: %v", err)
	}

	c.send(t, 23, strconv.FormatInt(id, 10))
	settle(t, c)
	if _, err := store.New(testDB).GetRoom(t.Context(), id); !store.IsNotFound(err) {
		t.Errorf("the room is still there: %v", err)
	}
	if flats, _ := favourites(t, admirer); len(flats) != 0 {
		t.Errorf("the deleted room is still a favourite: %+v", flats)
	}
}
