package server

import (
	"context"
	"database/sql"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// S4's first exit criterion, with the fourth's saved chat and the fifth: two Go test clients see the ads, enter a
// public room and a habbo room and see each other, walk a step every 500 ms, chat, whisper and shout, type, dance and
// wave, and leave; the room empties and unloads, and its chat is saved, then pruned after 30 days.
func TestHabbosLiveInRooms(t *testing.T) {
	ownerID := habboWithTickets(t, "Resident", "resident")
	habboWithTickets(t, "Neighbour", "neighbour")
	flat := newRoom(t, ownerID, 2, "Residence", true)
	resident, _ := login(t, "resident")
	neighbour, _ := login(t, "neighbour")
	for _, c := range []*client{resident, neighbour} {
		c.extendDeadline(t)
	}
	setString(t, "game.loadingAdImage", "https://example.com/ad.gif")
	resident.send(t, 182, "general")
	resident.expectNext(t, 258, "https://example.com/ad.gif\t")
	resident.send(t, 126, "")
	resident.expectNext(t, 208, "0")

	for _, c := range []*client{resident, neighbour} {
		c.chooseRoom(t, true, 101)
		c.expectNext(t, 69, "newbie_lobby 101")
		c.build(t, false)
		c.arrive(t)
	}
	if line := resident.nextUsers(t); !strings.Contains(line, "n:Neighbour\r") {
		t.Errorf("Resident sees %q, want Neighbour", line)
	}
	resident.nextBody(t, 34)
	resident.send(t, 53, "")
	neighbour.expectChat(t, 29, "0")
	neighbour.send(t, 53, "")
	eventually(t, "the lounge unloaded", func() bool {
		_, loaded := room.Loaded(room.Ref{Public: true, ID: 101})
		return !loaded
	})

	resident.enterFlat(t, flat, 47, 42)
	neighbour.enterFlat(t, flat)
	resident.nextUsers(t)
	resident.nextBody(t, 34)
	for _, c := range []*client{resident, neighbour} {
		c.extendDeadline(t)
	}
	start := time.Now()
	neighbour.send(t, 75, b64Short(t, 5)+b64Short(t, 5))
	for _, want := range []string{"1 3,5,0,2,2/mv 4,5,0/", "1 4,5,0,2,2/mv 5,5,0/", "1 5,5,0,2,2/"} {
		if lines := statusLines(resident.nextBody(t, 34)); lines["1"] != want {
			t.Fatalf("Neighbour walks as %q, want %q", lines["1"], want)
		}
	}
	if took := time.Since(start); took < 900*time.Millisecond || took > 2*time.Second {
		t.Errorf("2 steps and the stop took %v, want a step every 500 ms", took)
	}

	resident.send(t, 52, b64String(t, "hello there"))
	for _, c := range []*client{resident, neighbour} {
		c.expectChat(t, 24, chatLine(t, 0, "hello there"))
	}
	neighbour.send(t, 56, b64String(t, "Resident psst"))
	for _, c := range []*client{neighbour, resident} {
		c.expectChat(t, 25, chatLine(t, 1, "psst"))
	}
	resident.send(t, 55, b64String(t, "HEY"))
	for _, c := range []*client{resident, neighbour} {
		c.expectChat(t, 26, chatLine(t, 0, "HEY"))
	}
	neighbour.send(t, 317, "")
	resident.expectChat(t, 361, vl64String(t, 1, 1))
	neighbour.send(t, 93, "")
	neighbour.send(t, 94, "")
	if line := waitForStatus(t, resident, "1", "/wave/"); strings.Contains(line, "dance") {
		t.Errorf("Neighbour %q, want a wave that stopped its dance", line)
	}

	var lines int
	if err := testDB.QueryRowContext(t.Context(), "SELECT COUNT(*) FROM chat_messages WHERE room_id = ?", flat).Scan(&lines); err != nil || lines != 3 {
		t.Errorf("%d lines saved, %v; want 3", lines, err)
	}
	if err := game.PruneChat(context.Background(), testDB, time.Now().AddDate(0, 0, 31)); err != nil {
		t.Fatal(err)
	}
	if err := testDB.QueryRowContext(t.Context(), "SELECT COUNT(*) FROM chat_messages WHERE room_id = ?", flat).Scan(&lines); err != nil || lines != 0 {
		t.Errorf("%d lines left 31 days on, %v; want none", lines, err)
	}

	neighbour.send(t, 53, "")
	resident.expectChat(t, 29, "1")
	resident.send(t, 53, "")
	eventually(t, "the habbo room unloaded", func() bool {
		_, loaded := room.Loaded(room.Ref{ID: flat})
		return !loaded
	})
}

// waitForStatus reads statuses until the habbo of index shows an action, and returns its line.
func waitForStatus(t *testing.T, c *client, index, action string) string {
	t.Helper()
	for {
		if line := statusLines(c.nextBody(t, 34))[index]; strings.Contains(line, action) {
			return line
		}
	}
}

// S4's second exit criterion, with full rooms queueing (decision server/0087): an owner's room asks for its
// password, rings its doorbell, queues a full room's arrivals and refuses a banned habbo; the owner gives and takes
// rights, answers the doorbell, kicks a habbo that walks out, and bans for 15 minutes.
func TestAnOwnerKeepsItsRoom(t *testing.T) {
	ownerID := habboWithTickets(t, "Householder", "householder")
	habboWithTickets(t, "Visitor", "visitor-s4")
	intruderID := habboWithTickets(t, "Intruder", "intruder")
	flat := newRoom(t, ownerID, 2, "Homestead", true)
	q := store.New(testDB)
	setDoor(t, ownerID, flat, "password", "open sesame")
	owner, _ := login(t, "householder")
	visitor, _ := login(t, "visitor-s4")
	intruder, _ := login(t, "intruder")

	owner.enterFlat(t, flat, 47, 42)
	visitor.knock(t, flat, "wrong")
	visitor.expectNext(t, 33, "Incorrect flat password")
	visitor.knock(t, flat, "open sesame")
	visitor.expectNext(t, 41, "\x02")
	visitor.goToFlat(t, flat)
	visitor.build(t, true)
	visitor.arrive(t)
	owner.nextUsers(t)

	setDoor(t, ownerID, flat, "closed", "")
	intruder.knock(t, flat, "")
	intruder.expectNext(t, 91, "")
	owner.expectChat(t, 91, "Intruder")
	owner.send(t, 98, b64String(t, "Intruder")+"A")
	intruder.expectNext(t, 41, "\x02")
	intruder.goToFlat(t, flat)
	intruder.build(t, true)
	intruder.arrive(t)

	owner.send(t, 96, "Visitor")
	visitor.nextChatBody(t, 42)
	owner.send(t, 97, "Visitor")
	visitor.nextChatBody(t, 43)

	owner.send(t, 95, "Intruder")
	intruder.nextChatBody(t, 18)
	intruder.extendDeadline(t)
	owner.send(t, 320, "Visitor")
	visitor.nextChatBody(t, 18)
	end, err := q.GetRoomBanEnd(t.Context(), store.GetRoomBanEndParams{RoomID: flat, AvatarID: mustAvatar(t, "Visitor"), Now: time.Now().UTC()})
	if err != nil || time.Until(end) < 14*time.Minute || time.Until(end) > 15*time.Minute {
		t.Errorf("the ban ends at %v, %v; want in 15 minutes", end, err)
	}
	visitor.knock(t, flat, "")
	visitor.expectNext(t, 224, vl64String(t, 4))

	if _, err := q.UpdateRoomSettings(t.Context(), store.UpdateRoomSettingsParams{ID: flat, OwnerAvatarID: ownerID, MaxVisitors: 1}); err != nil {
		t.Fatal(err)
	}
	r, _ := room.Loaded(room.Ref{ID: flat})
	r.SetMax(1)
	setDoor(t, ownerID, flat, "open", "")
	intruder.knock(t, flat, "")
	if id, body := intruder.nextSkipping(t, 34, 28, 29); id != 259 || body != queueData(t, "room", 0, 0, "spectators", 0, 0) {
		t.Errorf("Intruder at the full room got %d %q, want its queue", id, body)
	}
	if _, in := r.Occupant(intruderID); in {
		t.Error("Intruder came into the full room")
	}
}

func mustAvatar(t *testing.T, name string) int64 {
	t.Helper()
	a, err := store.New(testDB).GetAvatarByName(t.Context(), name)
	if err != nil {
		t.Fatal(err)
	}
	return a.ID
}

// S4's third exit criterion: a habbo rates a room, ignores another, holds a room event, and shows its badges and its
// favourite group's.
func TestAHabbosLifeInARoom(t *testing.T) {
	hostID := habboWithTickets(t, "Showman", "showman")
	habboWithTickets(t, "Heckler", "heckler")
	flat := newRoom(t, hostID, 2, "Stage", true)
	q := store.New(testDB)
	now := time.Now().UTC()
	group, err := q.CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: hostID, Name: "Showmen", Description: "On stage", Badge: "b0503Xs09114", Access: "open", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: group.ID, AvatarID: hostID, Role: "admin", RequestedAt: now, JoinedAt: sql.NullTime{Time: now, Valid: true}}); err != nil {
		t.Fatal(err)
	}
	if _, err := q.SetFavouriteGroup(t.Context(), store.SetFavouriteGroupParams{GroupID: group.ID, AvatarID: hostID}); err != nil {
		t.Fatal(err)
	}
	if _, err := q.GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: hostID, Code: "ADM", GrantedAt: now}); err != nil {
		t.Fatal(err)
	}
	host, _ := login(t, "showman")
	heckler, _ := login(t, "heckler")
	host.enterFlat(t, flat, 47, 42)
	heckler.enterFlat(t, flat)
	host.nextUsers(t)
	heckler.send(t, 61, "")
	if id, users := heckler.nextSkipping(t, 34); id != 28 || !strings.Contains(users, "b:1:ADM\rg:"+strconv.FormatInt(group.ID, 10)+"\rt:1\r") {
		t.Errorf("users %d %q, want Showman with ADM and its group", id, users)
	}

	heckler.send(t, 261, vl64String(t, 1))
	if rating := heckler.nextChatBody(t, 345); rating != vl64String(t, 1, 100) {
		t.Errorf("the rating %q, want 1 and 100", rating)
	}
	host.send(t, 319, b64String(t, "Heckler"))
	host.expectChat(t, 419, vl64String(t, 1))
	heckler.send(t, 55, b64String(t, "BOO"))
	heckler.expectChat(t, 26, chatLine(t, 1, "BOO"))
	host.send(t, 346, vl64String(t, 1)+b64String(t, "Show time")+b64String(t, "Come watch"))
	if event := host.nextChatBody(t, 370); !strings.Contains(event, "Show time\x02Come watch\x02") {
		t.Errorf("the host got %q, want its event, and no BOO from the habbo it ignores", event)
	}
	slots := ""
	for i, code := range []string{"", "ADM", "", "", ""} {
		slots += vl64String(t, int32(i+1)) + b64String(t, code)
	}
	heckler.nextChatBody(t, 370)
	host.send(t, 158, slots)
	if badges := heckler.nextChatBody(t, 228); badges != strconv.FormatInt(hostID, 10)+"\x02"+vl64String(t, 1, 2)+"ADM\x02" {
		t.Errorf("228 %q, want ADM in slot 2", badges)
	}
}

// nextUsers reads the next user lines, 28, past any status.
func (c *client) nextUsers(t *testing.T) string {
	t.Helper()
	id, body := c.nextSkipping(t, 34)
	if id != 28 {
		t.Fatalf("received %d %q, want 28", id, body)
	}
	return body
}
