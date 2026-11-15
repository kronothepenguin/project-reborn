package server

import (
	"strconv"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// queueData writes 259 as the server sends it: the habbo's own set first, each with its club line and its own, and
// how many of each come in before the habbo (decision server/0090).
func queueData(t *testing.T, own string, ownClub, ownOthers int32, other string, otherClub, otherOthers int32) string {
	t.Helper()
	targets := map[string]int32{"room": 1, "spectators": 2}
	set := func(name string, club, others int32) string {
		return name + "\x02" + vl64String(t, targets[name], 2) + "club\x02" + vl64String(t, club) + name + "\x02" + vl64String(t, others)
	}
	return vl64String(t, 2) + set(own, ownClub, ownOthers) + set(other, otherClub, otherOthers)
}

// A full room queues its arrivals; a place that frees lets the first one in, and a habbo in line can switch to watch
// as a spectator, who sees the room and its chat until the room empties (decisions server/0087 and server/0089).
func TestAFullRoomQueuesAndTakesSpectators(t *testing.T) {
	ownerID := habboWithTickets(t, "Gatekeeper", "gatekeeper")
	sitterID := habboWithTickets(t, "Sitter", "sitter")
	habboWithTickets(t, "Patient", "patient")
	watcherID := habboWithTickets(t, "Watcher", "watcher")
	flat := newRoom(t, ownerID, 2, "Tiny Studio", true)
	if _, err := store.New(testDB).UpdateRoomSettings(t.Context(), store.UpdateRoomSettingsParams{ID: flat, OwnerAvatarID: ownerID, MaxVisitors: 2}); err != nil {
		t.Fatal(err)
	}
	owner, _ := login(t, "gatekeeper")
	sitter, _ := login(t, "sitter")
	patient, _ := login(t, "patient")
	watcher, _ := login(t, "watcher")
	owner.enterFlat(t, flat, 47, 42)
	sitter.enterFlat(t, flat)

	patient.knock(t, flat, "")
	patient.expectNext(t, 259, queueData(t, "room", 0, 0, "spectators", 0, 0))
	watcher.knock(t, flat, "")
	watcher.expectNext(t, 259, queueData(t, "room", 0, 1, "spectators", 0, 0))
	patient.expectNext(t, 259, queueData(t, "room", 0, 0, "spectators", 0, 0))

	watcher.send(t, 211, vl64String(t, 2))
	watcher.expectNext(t, 254, "")
	watcher.expectNext(t, 41, "\x02")
	patient.expectNext(t, 259, queueData(t, "room", 0, 0, "spectators", 0, 0))
	watcher.goToFlat(t, flat)
	watcher.build(t, true)
	watcher.send(t, 64, "")
	if lines := statusLines(watcher.nextBody(t, 34)); len(lines) != 2 || lines["0"] == "" || lines["1"] == "" {
		t.Errorf("the spectator got the statuses %q, want the 2 habbos inside and none of its own", lines)
	}
	r, _ := room.Loaded(room.Ref{ID: flat})
	if _, in := r.Occupant(watcherID); in || room.Visitors(room.Ref{ID: flat}) != 2 {
		t.Error("the spectator came into the room")
	}
	watcher.send(t, 216, "")
	watcher.expectChat(t, 298, vl64String(t, 1, 50))
	owner.send(t, 52, b64String(t, "welcome, all"))
	watcher.expectChat(t, 24, chatLine(t, 0, "welcome, all"))

	sitter.send(t, 53, "")
	if id, body := patient.nextSkipping(t, 259); id != 41 || body != "\x02" {
		t.Fatalf("received %d %q, want 41, the queue's turn", id, body)
	}
	patient.goToFlat(t, flat)
	patient.build(t, true)
	if got := patient.arrive(t); got.status == "" || room.Visitors(room.Ref{ID: flat}) != 2 || r.Taken() != 2 {
		t.Errorf("Patient arrived as %+v, with %d visitors and %d places taken; want 2 and no place kept", got, room.Visitors(room.Ref{ID: flat}), r.Taken())
	}
	if _, in := r.Occupant(sitterID); in {
		t.Error("Sitter is still in")
	}

	owner.send(t, 53, "")
	patient.send(t, 53, "")
	watcher.nextChatBody(t, 283)
	watcher.nextChatBody(t, 18)
	if _, loaded := room.Loaded(room.Ref{ID: flat}); loaded {
		t.Error("the room stayed loaded")
	}
}

// Club members come first in a queue: the next turn is the first club member's, and a club member has nobody but club
// members ahead (decision server/0088).
func TestClubMembersComeFirstInAQueue(t *testing.T) {
	library, _ := room.Public(104)
	ref := room.Ref{Public: true, ID: 104}
	fill(t, ref, 2_000_200, int(library.MaxVisitors))
	r, _ := room.Loaded(ref)
	crowd := &stranger{}
	for i, club := range []bool{false, true, false} {
		room.Head(2_000_300+int64(i), ref)
		r.Join(room.Queue, room.Waiting{AvatarID: 2_000_300 + int64(i), Session: crowd, Club: club})
	}
	t.Cleanup(func() {
		for i := range 3 {
			r.Remove(room.Queue, 2_000_300+int64(i))
			r.Unreserve(2_000_300 + int64(i))
			room.ClearHeading(2_000_300 + int64(i))
		}
	})
	game.LeaveRoom(2_000_200, crowd)
	if _, waiting := r.LineOf(2_000_301); waiting || !r.Reserved(2_000_301) {
		t.Error("the club member did not get the freed place first")
	}
	for _, id := range []int64{2_000_300, 2_000_302} {
		if l, ok := r.LineOf(id); !ok || l != room.Queue {
			t.Errorf("habbo %d left the queue", id)
		}
	}
	if h, ok := room.HeadingOf(2_000_301); !ok || !h.Admitted {
		t.Errorf("the club member's way in is %+v, %t; want admitted", h, ok)
	}
	if got := strconv.Itoa(len(r.Waiting(room.Queue))); got != "2" {
		t.Errorf("%s waiting, want 2", got)
	}
}
