package server

import (
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
)

// readFlatLines reads 16 and 55 as the client's handle_flat_results does: a line per room, nine items separated by
// tabs.
func readFlatLines(t *testing.T, body string) [][]string {
	t.Helper()
	var flats [][]string
	for line := range strings.SplitSeq(body, "\r") {
		if line == "" {
			break
		}
		items := strings.Split(line, "\t")
		if len(items) != 9 {
			t.Fatalf("a line with %d items: %q", len(items), line)
		}
		flats = append(flats, items)
	}
	return flats
}

func TestAHabbosOwnRooms(t *testing.T) {
	owner := habboWithTickets(t, "Landlord", "landlord")
	habboWithTickets(t, "Homeless", "homeless")
	first := newRoom(t, owner, 2, "Flat one", true)
	newRoom(t, owner, 2, "Flat\ttwo", false)

	c, _ := login(t, "landlord")
	c.send(t, 16, "Landlord")
	id, body := c.next(t)
	flats := readFlatLines(t, body)
	if id != 16 || len(flats) != 2 {
		t.Fatalf("received %d with %v, want 16 with two rooms", id, flats)
	}
	want := []string{strconv.FormatInt(first, 10), "Flat one", "Landlord", "open", "x", "0", "25", "null", ""}
	if strings.Join(flats[0], "|") != strings.Join(want, "|") {
		t.Errorf("first line = %q, want %q", flats[0], want)
	}
	if flats[1][1] != "Flat two" || flats[1][2] != "Landlord" {
		t.Errorf("second line = %q, want the tab of its name turned into a space and its owner shown to the owner", flats[1])
	}

	none, _ := login(t, "homeless")
	none.send(t, 16, "Homeless")
	if id, _ := none.next(t); id != 57 {
		t.Errorf("a habbo without rooms got %d, want 57", id)
	}
}

func TestSearchingRooms(t *testing.T) {
	host := habboWithTickets(t, "Partyhost", "partyhost")
	recluse := habboWithTickets(t, "Recluse", "recluse")
	habboWithTickets(t, "Seeker", "seeker")
	newRoom(t, host, 2, "Disco Night", true)
	newRoom(t, recluse, 2, "Cave", false)
	c, _ := login(t, "seeker")

	search := func(query string) (int, [][]string) {
		t.Helper()
		c.send(t, 17, query)
		id, body := c.next(t)
		if id != 55 {
			return id, nil
		}
		return id, readFlatLines(t, body)
	}
	if id, flats := search("disco"); id != 55 || len(flats) != 1 || flats[0][1] != "Disco Night" {
		t.Errorf("a search for disco got %d with %v, want Disco Night", id, flats)
	}
	if id, flats := search("partyhost"); id != 55 || len(flats) != 1 || flats[0][2] != "Partyhost" {
		t.Errorf("a search for Partyhost got %d with %v, want its room", id, flats)
	}
	if id, _ := search("recluse"); id != 58 {
		t.Errorf("a search for an owner who hides itself got %d, want 58: nothing gives it away", id)
	}
	if id, flats := search("cave"); id != 55 || len(flats) != 1 || flats[0][2] != "-" {
		t.Errorf("a search for Cave got %d with %v, want the room with its owner hidden", id, flats)
	}
	if id, _ := search("no such room"); id != 58 {
		t.Errorf("a search that matches nothing got %d, want 58", id)
	}
}

func TestThreeRecommendedRooms(t *testing.T) {
	owner := habboWithTickets(t, "Recommender", "recommender")
	for _, name := range []string{"One", "Two", "Three", "Four"} {
		newRoom(t, owner, 2, name, true)
	}
	c, _ := login(t, "recommender")

	c.send(t, 264, "")
	id, body := c.next(t)
	r := strings.NewReader(body)
	count := readInt(t, r)
	if id != 351 || count != 3 {
		t.Fatalf("received %d with %d rooms, want 351 with three", id, count)
	}
	for range count {
		readInt(t, r)
		for range 3 {
			readText(t, r)
		}
		readInt(t, r)
		readInt(t, r)
		readText(t, r)
	}
	if r.Len() != 0 {
		t.Errorf("%d bytes left after the rooms", r.Len())
	}
}

func readInt(t *testing.T, r *strings.Reader) int32 {
	t.Helper()
	v, err := encoding.ReadVL64(r)
	if err != nil {
		t.Fatal(err)
	}
	return v
}

func readText(t *testing.T, r *strings.Reader) string {
	t.Helper()
	v, err := encoding.ReadString(r)
	if err != nil {
		t.Fatal(err)
	}
	return v
}
