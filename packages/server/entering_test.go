package server

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// expectNext reads the next message that is not a PING.
func (c *client) expectNext(t *testing.T, wantID int, wantBody string) {
	t.Helper()
	if id, body := c.next(t); id != wantID || body != wantBody {
		t.Fatalf("received %d %q, want %d %q", id, body, wantID, wantBody)
	}
}

// nextBody reads the next message that is not a PING, which must be wantID, and returns its body.
func (c *client) nextBody(t *testing.T, wantID int) string {
	t.Helper()
	id, body := c.next(t)
	if id != wantID {
		t.Fatalf("received %d %q, want %d", id, body, wantID)
	}
	return body
}

// chooseRoom sends #room_directory for a public room, by its id, or a habbo room, and reads 19.
func (c *client) chooseRoom(t *testing.T, public bool, id int64) {
	t.Helper()
	kind := "@"
	if public {
		kind = "A"
	}
	c.send(t, 2, kind+vl64String(t, int32(id), 0))
	c.expectNext(t, 19, "")
}

// knock chooses the habbo room id and sends TRYFLAT, with a password when there is one.
func (c *client) knock(t *testing.T, id int64, password string) {
	t.Helper()
	c.chooseRoom(t, false, id)
	text := strconv.FormatInt(id, 10)
	if password != "" {
		text += "/" + password
	}
	c.send(t, 57, text)
}

// built is what a client asks for once 69 came: the height map, the users, the public furni and, in a habbo room,
// the items.
type built struct{ heightMap, users, objects string }

func (c *client) build(t *testing.T, flat bool) built {
	t.Helper()
	var b built
	c.send(t, 60, "")
	b.heightMap = c.nextBody(t, 31)
	c.send(t, 61, "")
	b.users = c.nextBody(t, 28)
	c.send(t, 62, "")
	b.objects = c.nextBody(t, 30)
	c.expectNext(t, 32, "H")
	if flat {
		c.send(t, 63, "")
		c.expectNext(t, 45, "")
	}
	return b
}

// arrival is what G_STAT brings: the others' statuses, then the habbo's own user lines and status.
type arrival struct{ others, user, status string }

func (c *client) arrive(t *testing.T) arrival {
	t.Helper()
	c.send(t, 64, "")
	return arrival{others: c.nextBody(t, 34), user: c.nextBody(t, 28), status: c.nextBody(t, 34)}
}

// enterFlat takes the client through an open door into the habbo room id, and returns what G_STAT brought.
func (c *client) enterFlat(t *testing.T, id int64, rights ...int) arrival {
	t.Helper()
	c.knock(t, id, "")
	c.expectNext(t, 41, "\x02")
	c.goToFlat(t, id, rights...)
	c.build(t, true)
	return c.arrive(t)
}

// goToFlat sends GOTOFLAT and reads 69 with model a, then the rights messages given, 47 and 42.
func (c *client) goToFlat(t *testing.T, id int64, rights ...int) {
	t.Helper()
	c.send(t, 59, strconv.FormatInt(id, 10))
	c.expectNext(t, 69, "model_a "+strconv.FormatInt(id, 10))
	for _, r := range rights {
		c.expectNext(t, r, "")
	}
}

func userLine(index int, id int64, name string, x, y, height int) string {
	return fmt.Sprintf("i:%d\ra:%d\rn:%s\rf:hd-180-1\rl:%d %d %d\rc:Hello\rs:M\rb:\r", index, id, name, x, y, height)
}

func doorOf(t *testing.T, name string) store.RoomModel {
	t.Helper()
	m, ok := model.Get(name)
	if !ok {
		t.Fatalf("no model %s", name)
	}
	return m
}

func statusLine(index int, m store.RoomModel, actions string) string {
	return fmt.Sprintf("%d %d,%d,%d,%d,%d/%s\r", index, m.DoorX, m.DoorY, m.DoorHeight, m.DoorDirection, m.DoorDirection, actions)
}

func setDoor(t *testing.T, owner, id int64, door, password string) {
	t.Helper()
	q := store.New(testDB)
	now := time.Now().UTC()
	if _, err := q.UpdateRoomInfo(t.Context(), store.UpdateRoomInfoParams{Name: "Door", Door: door, ShowOwner: true, UpdatedAt: now, ID: id, OwnerAvatarID: owner}); err != nil {
		t.Fatal(err)
	}
	if password != "" {
		if _, err := q.SetRoomPassword(t.Context(), store.SetRoomPasswordParams{PasswordHash: auth.HashPassword(password), UpdatedAt: now, ID: id, OwnerAvatarID: owner}); err != nil {
			t.Fatal(err)
		}
	}
}

// fill puts n habbos with no client in the room, and takes them out after the test.
func fill(t *testing.T, ref room.Ref, first int64, n int) {
	t.Helper()
	crowd := &stranger{}
	for i := range int64(n) {
		if _, _, _, err := room.Enter(t.Context(), testDB, ref, first+i, crowd, 0); err != nil {
			t.Fatal(err)
		}
	}
	t.Cleanup(func() {
		for i := range int64(n) {
			room.Leave(first+i, crowd)
		}
	})
}

func TestTwoHabbosMeetInAPublicRoom(t *testing.T) {
	loungerID := habboWithTickets(t, "Lounger", "lounger")
	minglerID := habboWithTickets(t, "Mingler", "mingler")
	lounger, _ := login(t, "lounger")
	mingler, _ := login(t, "mingler")
	lobby := doorOf(t, "newbie_lobby")

	lounger.chooseRoom(t, true, 101)
	lounger.expectNext(t, 69, "newbie_lobby 101")
	b := lounger.build(t, false)
	if want := strings.ReplaceAll(lobby.Heightmap, "\n", "\r"); b.heightMap != want || !strings.HasPrefix(b.heightMap, "xxxxxxxxxxxxxxxx000000\rxxxxx0") {
		t.Errorf("height map %q, want the model's rows on lines", b.heightMap)
	}
	if b.users != "" {
		t.Errorf("users %q in an empty room", b.users)
	}
	if lines := strings.Split(b.objects, "\r"); len(lines) != 64 || lines[0] != "a160 crl_lamp 16 0 0 0" || lines[63] != "" {
		t.Errorf("objects %q, want the 63 public furni without their state, the lamp first", b.objects)
	}
	a := lounger.arrive(t)
	if a.others != "" || a.user != userLine(0, loungerID, "Lounger", 2, 11, 0) || a.status != statusLine(0, lobby, "") {
		t.Errorf("Lounger arrived as %+v", a)
	}

	mingler.chooseRoom(t, true, 101)
	mingler.expectNext(t, 69, "newbie_lobby 101")
	if b := mingler.build(t, false); b.users != userLine(0, loungerID, "Lounger", 2, 11, 0) {
		t.Errorf("Mingler sees the users %q, want Lounger", b.users)
	}
	a = mingler.arrive(t)
	if a.others != statusLine(0, lobby, "") || a.user != userLine(1, minglerID, "Mingler", 2, 11, 0) || a.status != statusLine(1, lobby, "") {
		t.Errorf("Mingler arrived as %+v", a)
	}
	lounger.expectNext(t, 28, userLine(1, minglerID, "Mingler", 2, 11, 0))
	lounger.expectNext(t, 34, statusLine(1, lobby, ""))
	if n := room.Visitors(room.Ref{Public: true, ID: 101}); n != 2 {
		t.Errorf("%d visitors, want 2", n)
	}
	lounger.send(t, 154, vl64String(t, 101))
	lounger.expectNext(t, 223, vl64String(t, 101, 2)+"Lounger\x02Mingler\x02")

	mingler.send(t, 53, "")
	lounger.expectNext(t, 29, "1")
	lounger.send(t, 53, "")
	eventually(t, "unloaded", func() bool {
		_, loaded := room.Loaded(room.Ref{Public: true, ID: 101})
		return !loaded
	})
}

// The owner gets 47 and 42 and the status flatctrl useradmin, as Holo gave them; a guest neither.
func TestEnteringAHabboRoom(t *testing.T) {
	ownerID := habboWithTickets(t, "Tenant", "tenant")
	guestID := habboWithTickets(t, "Wanderer", "wanderer")
	flat := newRoom(t, ownerID, 2, "Open House", true)
	owner, _ := login(t, "tenant")
	guest, _ := login(t, "wanderer")
	a := doorOf(t, "a")

	if got := guest.enterFlat(t, flat); got.others != "" || got.user != userLine(0, guestID, "Wanderer", 3, 5, 0) || got.status != statusLine(0, a, "") {
		t.Errorf("Wanderer arrived as %+v", got)
	}
	got := owner.enterFlat(t, flat, 47, 42)
	if got.others != statusLine(0, a, "") || got.user != userLine(1, ownerID, "Tenant", 3, 5, 0) || got.status != statusLine(1, a, "flatctrl useradmin/") {
		t.Errorf("Tenant arrived as %+v", got)
	}
	guest.expectNext(t, 28, userLine(1, ownerID, "Tenant", 3, 5, 0))
	guest.expectNext(t, 34, statusLine(1, a, "flatctrl useradmin/"))
}

// The owner passes a password door without one; anyone else needs it (plans/server decision 0062).
func TestAPasswordDoor(t *testing.T) {
	ownerID := habboWithTickets(t, "Keyholder", "keyholder")
	habboWithTickets(t, "Guesser", "guesser")
	flat := newRoom(t, ownerID, 2, "Locked", true)
	setDoor(t, ownerID, flat, "password", "secret")
	owner, _ := login(t, "keyholder")
	guest, _ := login(t, "guesser")

	guest.knock(t, flat, "wrong")
	guest.expectNext(t, 33, "Incorrect flat password")
	guest.knock(t, flat, "")
	guest.expectNext(t, 33, "Incorrect flat password")
	guest.send(t, 59, strconv.FormatInt(flat, 10))
	guest.knock(t, flat, "secret")
	guest.expectNext(t, 41, "\x02")
	owner.knock(t, flat, "")
	owner.expectNext(t, 41, "\x02")
}

// A closed door rings the doorbell of those with rights in the room; with nobody to answer, the ringer is turned away
// at once, as Holo did with nobody in.
func TestTheDoorbell(t *testing.T) {
	ownerID := habboWithTickets(t, "Doorkeeper", "doorkeeper")
	ringerID := habboWithTickets(t, "Knocker", "knocker")
	habboWithTickets(t, "Snubbed", "snubbed")
	flat := newRoom(t, ownerID, 2, "Bell", true)
	setDoor(t, ownerID, flat, "closed", "")
	owner, _ := login(t, "doorkeeper")
	ringer, _ := login(t, "knocker")
	snubbed, _ := login(t, "snubbed")
	a := doorOf(t, "a")

	ringer.knock(t, flat, "")
	ringer.expectNext(t, 131, "\x02")

	owner.enterFlat(t, flat, 47, 42)
	ringer.knock(t, flat, "")
	ringer.expectNext(t, 91, "")
	owner.expectNext(t, 91, "Knocker")
	owner.send(t, 98, b64String(t, "Knocker")+"A")
	ringer.expectNext(t, 41, "\x02")
	owner.expectNext(t, 41, "Knocker\x02")
	ringer.goToFlat(t, flat)
	ringer.build(t, true)
	if got := ringer.arrive(t); got.user != userLine(1, ringerID, "Knocker", 3, 5, 0) {
		t.Errorf("Knocker arrived as %+v", got)
	}
	owner.expectNext(t, 28, userLine(1, ringerID, "Knocker", 3, 5, 0))
	owner.expectNext(t, 34, statusLine(1, a, ""))

	snubbed.knock(t, flat, "")
	snubbed.expectNext(t, 91, "")
	owner.expectNext(t, 91, "Snubbed")
	ringer.send(t, 98, b64String(t, "Snubbed")+"A")
	owner.send(t, 98, b64String(t, "Snubbed")+"@")
	snubbed.expectNext(t, 131, "\x02")
	owner.expectNext(t, 131, "Snubbed\x02")
	snubbed.send(t, 59, strconv.FormatInt(flat, 10))

	// A ringer that leaves drops out of the owner's doorbell.
	snubbed.knock(t, flat, "")
	snubbed.expectNext(t, 91, "")
	owner.expectNext(t, 91, "Snubbed")
	snubbed.send(t, 53, "")
	owner.expectNext(t, 131, "Snubbed\x02")
}

func TestABannedHabboAndAFullRoom(t *testing.T) {
	ownerID := habboWithTickets(t, "Proprietor", "proprietor")
	pestID := habboWithTickets(t, "Banished", "banished")
	habboWithTickets(t, "Squeezed", "squeezed")
	flat := newRoom(t, ownerID, 2, "Strict", true)
	err := store.New(testDB).BanFromRoom(t.Context(), store.BanFromRoomParams{RoomID: flat, AvatarID: pestID, ExpiresAt: time.Now().UTC().Add(15 * time.Minute)})
	if err != nil {
		t.Fatal(err)
	}
	owner, _ := login(t, "proprietor")
	pest, _ := login(t, "banished")
	squeezed, _ := login(t, "squeezed")

	pest.knock(t, flat, "")
	pest.expectNext(t, 224, vl64String(t, 4))
	owner.knock(t, flat, "")
	owner.expectNext(t, 41, "\x02")

	fill(t, room.Ref{ID: flat}, 2_000_000, 25)
	squeezed.knock(t, flat, "")
	squeezed.expectNext(t, 224, vl64String(t, 1))

	library, _ := room.Public(104)
	fill(t, room.Ref{Public: true, ID: 104}, 2_000_100, int(library.MaxVisitors))
	squeezed.chooseRoom(t, true, 104)
	squeezed.expectNext(t, 224, vl64String(t, 1))
}

// Deleting a room sends the habbos in it out, as Holo did: each gets 18, and the others see it go.
func TestDeletingARoomSendsItsHabbosOut(t *testing.T) {
	ownerID := habboWithTickets(t, "Evictor", "evictor")
	habboWithTickets(t, "Evicted", "evicted")
	flat := newRoom(t, ownerID, 2, "Doomed", true)
	owner, _ := login(t, "evictor")
	guest, _ := login(t, "evicted")
	owner.enterFlat(t, flat, 47, 42)
	guest.enterFlat(t, flat)
	owner.nextBody(t, 28)
	owner.nextBody(t, 34)

	owner.send(t, 23, strconv.FormatInt(flat, 10))
	owner.expectNext(t, 18, "")
	guest.expectNext(t, 29, "0")
	guest.expectNext(t, 18, "")
	eventually(t, "unloaded", func() bool {
		_, loaded := room.Loaded(room.Ref{ID: flat})
		return !loaded
	})
}

// A habbo whose session ends, or who logs in again, leaves its room.
func TestLoggingOutLeavesTheRoom(t *testing.T) {
	habboWithTickets(t, "Stayer", "stayer")
	habboWithTickets(t, "Departer", "departer", "departer-again")
	stayer, _ := login(t, "stayer")
	departer, _ := login(t, "departer")
	for _, c := range []*client{stayer, departer} {
		c.chooseRoom(t, true, 104)
		c.nextBody(t, 69)
		c.build(t, false)
		c.arrive(t)
	}
	stayer.nextBody(t, 28)
	stayer.nextBody(t, 34)

	again, _ := login(t, "departer-again")
	stayer.expectNext(t, 29, "1")
	again.chooseRoom(t, true, 104)
	again.nextBody(t, 69)
	again.build(t, false)
	again.arrive(t)
	stayer.nextBody(t, 28)
	stayer.nextBody(t, 34)
	again.ws.Close()
	stayer.expectNext(t, 29, "1")
}

func setString(t *testing.T, key, value string) {
	t.Helper()
	if err := settings.Set(context.Background(), testDB, 0, key, value); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := settings.Set(context.Background(), testDB, 0, key, ""); err != nil {
			t.Error(err)
		}
	})
}

// The loading ad and the room ad come from the settings, and 0 shows none (plans/server decision 0070).
func TestTheAdsComeFromTheSettings(t *testing.T) {
	habboWithTickets(t, "Adwatcher", "adwatcher")
	c, _ := login(t, "adwatcher")

	c.send(t, 182, "general")
	c.expectNext(t, 258, "0")
	c.send(t, 126, "")
	c.expectNext(t, 208, "0")
	setString(t, "game.loadingAdImage", "https://example.com/loading.gif")
	setString(t, "game.loadingAdLink", "https://example.com/")
	setString(t, "game.roomAdImage", "https://example.com/room.gif")
	c.send(t, 182, "general")
	c.expectNext(t, 258, "https://example.com/loading.gif\thttps://example.com/")
	c.send(t, 126, "")
	c.expectNext(t, 208, "https://example.com/room.gif\t")
}
