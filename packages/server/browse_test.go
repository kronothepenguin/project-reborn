package server

import (
	"bytes"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

type flat struct {
	ID                    int32
	Name, Owner, Door     string
	Visitors, MaxVisitors int32
	Description           string
}

type node struct {
	ID, Type                      int32
	Name                          string
	Visitors, MaxVisitors, Parent int32
	Unit                          string
	Port, Door                    int32
	Casts                         string
	Queue                         int32
	Visible                       bool
	Flats                         []flat
}

// readNodes reads a 220 as the client's parseNode does: the node mask, then nodes up to an id of 0 or the end.
func readNodes(t *testing.T, body string) (mask int32, nodes []node) {
	t.Helper()
	r := strings.NewReader(body)
	integer := func() int32 {
		v, err := encoding.ReadVL64(r)
		if err != nil {
			t.Fatalf("reading %q: %v", body, err)
		}
		return v
	}
	text := func() string {
		v, err := encoding.ReadString(r)
		if err != nil {
			t.Fatalf("reading %q: %v", body, err)
		}
		return v
	}
	mask = integer()
	for r.Len() > 0 {
		n := node{ID: integer()}
		if n.ID <= 0 {
			break
		}
		n.Type, n.Name, n.Visitors, n.MaxVisitors, n.Parent = integer(), text(), integer(), integer(), integer()
		switch n.Type {
		case 1:
			n.Unit, n.Port, n.Door, n.Casts, n.Queue = text(), integer(), integer(), text(), integer()
			v, err := encoding.ReadBool(r)
			if err != nil {
				t.Fatal(err)
			}
			n.Visible = v
		case 2:
			for range integer() {
				n.Flats = append(n.Flats, flat{integer(), text(), text(), text(), integer(), integer(), text()})
			}
		}
		nodes = append(nodes, n)
	}
	return mask, nodes
}

func navigate(t *testing.T, c *client, mask, id int32) (int32, []node) {
	t.Helper()
	c.send(t, 150, vl64String(t, mask, id, 1))
	got, body := c.next(t)
	if got != 220 {
		t.Fatalf("received %d, want 220", got)
	}
	return readNodes(t, body)
}

func newRoom(t *testing.T, owner int64, category int64, name string, showOwner bool) int64 {
	t.Helper()
	r, err := store.New(testDB).CreateRoom(t.Context(), store.CreateRoomParams{AvatarID: owner, RoomCategoryID: category, RoomModelID: 1, Name: name, Door: "open", ShowOwner: showOwner, CreatedAt: time.Now().UTC()})
	if err != nil {
		t.Fatalf("CreateRoom: %v", err)
	}
	return r.ID
}

func TestNavigatingThePublicRooms(t *testing.T) {
	habboWithTickets(t, "Tourist", "tourist")
	c, _ := login(t, "tourist")

	mask, nodes := navigate(t, c, 0, 3)
	if mask != 0 || len(nodes) != 4 {
		t.Fatalf("mask %d, nodes %+v; want Public Rooms, its two categories and the Welcome Lounge", mask, nodes)
	}
	if got := nodes[0]; got.ID != 3 || got.Type != 0 || got.Name != "Public Rooms" || got.MaxVisitors != 35 || got.Parent != 0 {
		t.Errorf("first node = %+v, want Public Rooms with the Welcome Lounge's 35", got)
	}
	if got := nodes[1]; got.ID != 5 || got.Name != "Outside spaces" || got.MaxVisitors != 130 || got.Parent != 3 {
		t.Errorf("second node = %+v, want Outside spaces with its five rooms' 130", got)
	}
	if got := nodes[2]; got.ID != 7 || got.Name != "Entertainment" || got.MaxVisitors != 60 {
		t.Errorf("third node = %+v, want Entertainment with 60", got)
	}
	want := node{ID: 101, Type: 1, Name: "Welcome Lounge", MaxVisitors: 35, Parent: 3, Unit: "welcome_lounge", Port: 101, Casts: "hh_room_nlobby", Visible: true}
	if got := nodes[3]; !equalNodes(got, want) {
		t.Errorf("public room = %+v, want %+v", got, want)
	}
}

func equalNodes(a, b node) bool {
	return a.ID == b.ID && a.Type == b.Type && a.Name == b.Name && a.Visitors == b.Visitors && a.MaxVisitors == b.MaxVisitors &&
		a.Parent == b.Parent && a.Unit == b.Unit && a.Port == b.Port && a.Door == b.Door && a.Casts == b.Casts &&
		a.Queue == b.Queue && a.Visible == b.Visible && slices.Equal(a.Flats, b.Flats)
}

// A habbo room that hides its owner shows "-", except to its owner (decision server/0045 lets fuse_see_all_roomowners see
// it too).
func TestNavigatingAHabboRoomsCategory(t *testing.T) {
	trader := habboWithTickets(t, "Trader", "trader")
	shy := habboWithTickets(t, "Shy", "shy")
	habboWithTickets(t, "Browser", "browser")
	open := newRoom(t, trader, 6, "Trading post", true)
	hidden := newRoom(t, shy, 6, "Hideout", false)
	c, _ := login(t, "browser")

	_, nodes := navigate(t, c, 0, 6)
	if len(nodes) != 1 || nodes[0].Type != 2 || nodes[0].Name != "Trade rooms" || nodes[0].MaxVisitors != 50 {
		t.Fatalf("nodes = %+v, want Trade rooms as a list of flats taking 50", nodes)
	}
	want := []flat{
		{ID: int32(open), Name: "Trading post", Owner: "Trader", Door: "open", MaxVisitors: 25},
		{ID: int32(hidden), Name: "Hideout", Owner: "-", Door: "open", MaxVisitors: 25},
	}
	if !slices.Equal(nodes[0].Flats, want) {
		t.Errorf("flats = %+v, want %+v", nodes[0].Flats, want)
	}

	owner, _ := login(t, "shy")
	if _, nodes := navigate(t, owner, 0, 6); nodes[0].Flats[1].Owner != "Shy" {
		t.Errorf("the owner sees %q, want its own name", nodes[0].Flats[1].Owner)
	}
}

func TestNavigatingGuestroomsListsItsCategories(t *testing.T) {
	habboWithTickets(t, "Guest", "guest")
	c, _ := login(t, "guest")

	_, nodes := navigate(t, c, 0, 4)
	var ids []int32
	for _, n := range nodes[1:] {
		ids = append(ids, n.ID)
		if n.Type != 0 || n.Parent != 4 {
			t.Errorf("child %+v is not a category under Guestrooms", n)
		}
	}
	if nodes[0].Type != 2 || !slices.Equal(ids, []int32{2, 6, 10, 24, 25, 26, 27, 28, 29}) {
		t.Errorf("Guestrooms %+v with children %v, want a flats node and its nine categories", nodes[0], ids)
	}
}

// Node mask 1 leaves the full rooms out.
func TestHidingFullRooms(t *testing.T) {
	owner := habboWithTickets(t, "Crowded", "crowded")
	full := newRoom(t, owner, 25, "Packed", true)
	newRoom(t, owner, 25, "Roomy", true)
	crowd := &stranger{}
	for i := range int64(25) {
		if _, _, _, err := room.Enter(t.Context(), testDB, room.Ref{ID: full}, 1_000_000+i, crowd, 0); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() {
		for i := range int64(25) {
			room.Leave(1_000_000+i, crowd)
		}
	})
	c, _ := login(t, "crowded")

	if mask, nodes := navigate(t, c, 1, 25); mask != 1 || len(nodes[0].Flats) != 1 || nodes[0].Flats[0].Name != "Roomy" {
		t.Errorf("mask %d, flats %+v; want only Roomy", mask, nodes[0].Flats)
	}
	if _, nodes := navigate(t, c, 0, 25); len(nodes[0].Flats) != 2 || nodes[0].Flats[0].Name != "Packed" || nodes[0].Flats[0].Visitors != 25 {
		t.Errorf("flats %+v, want Packed first, the busiest, with 25 habbos, then Roomy", nodes[0].Flats)
	}
}

func readCategories(t *testing.T, body string) []int32 {
	t.Helper()
	r := strings.NewReader(body)
	n, err := encoding.ReadVL64(r)
	if err != nil {
		t.Fatal(err)
	}
	var ids []int32
	for range n {
		id, err := encoding.ReadVL64(r)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := encoding.ReadString(r); err != nil {
			t.Fatal(err)
		}
		ids = append(ids, id)
	}
	return ids
}

// Staff's Rooms takes level 7 and Moderators Rooms level 6 (decision server/0055).
func TestTheCategoriesAHabboMayUse(t *testing.T) {
	habboWithTickets(t, "Builder", "builder")
	admin := habboWithTickets(t, "Overseer", "overseer")
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Overseers", Level: 7, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userOf(t, admin), GrantedAt: now}); err != nil {
		t.Fatal(err)
	}

	for ticket, want := range map[string][]int32{
		"builder":  {2, 6, 25, 26, 27, 28, 29},
		"overseer": {2, 6, 10, 24, 25, 26, 27, 28, 29},
	} {
		c, _ := login(t, ticket)
		c.send(t, 151, "")
		id, body := c.next(t)
		if got := readCategories(t, body); id != 221 || !slices.Equal(got, want) {
			t.Errorf("%s got %d with %v, want 221 with %v", ticket, id, got, want)
		}
	}
}

func TestAParentChain(t *testing.T) {
	habboWithTickets(t, "Lost", "lost")
	c, _ := login(t, "lost")

	c.send(t, 156, vl64String(t, 8))
	if id, body := c.next(t); id != 227 || body != vl64String(t, 8)+"The Park & Infobus\x02"+vl64String(t, 5)+"Outside spaces\x02"+vl64String(t, 3)+"Public Rooms\x02" {
		t.Errorf("received %d %q, want 227 with The Park & Infobus, Outside spaces and Public Rooms", id, body)
	}
}

// Nobody is in a public room until S4 lets habbos enter.
func TestThoseInAPublicRoom(t *testing.T) {
	habboWithTickets(t, "Curious", "curious")
	c, _ := login(t, "curious")

	c.send(t, 154, vl64String(t, 101))
	if id, body := c.next(t); id != 223 || !bytes.Equal([]byte(body), []byte(vl64String(t, 101, 0))) {
		t.Errorf("received %d %q, want 223 with the Welcome Lounge and nobody", id, body)
	}
}

// stranger plays habbos that only fill rooms: they have no client, and their ids belong to no test's habbo.
type stranger struct{}

func (*stranger) Notify(any) {}
