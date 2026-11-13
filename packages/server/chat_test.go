package server

import (
	"slices"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// nextSkipping reads the next message whose id is not one of skip, nor a PING.
func (c *client) nextSkipping(t *testing.T, skip ...int) (int, string) {
	t.Helper()
	for {
		if id, body := c.next(t); !slices.Contains(skip, id) {
			return id, body
		}
	}
}

// expectChat reads the next message that is not a status, 34, and wants it to be id with body.
func (c *client) expectChat(t *testing.T, id int, body string) {
	t.Helper()
	if gotID, gotBody := c.nextSkipping(t, 34); gotID != id || gotBody != body {
		t.Fatalf("received %d %q, want %d %q", gotID, gotBody, id, body)
	}
}

func chatLine(t *testing.T, index int32, text string) string {
	t.Helper()
	return vl64String(t, index) + text + "\x02"
}

// threeInAFlat brings Speaker, Nearby and Faraway into Speaker's room, in that order, and moves Faraway 6 tiles from
// the door, out of reach of chat (decision server/0074).
func threeInAFlat(t *testing.T, prefix string) (speaker, near, far *client, flat int64) {
	t.Helper()
	speakerID := habboWithTickets(t, prefix+"Speaker", strings.ToLower(prefix)+"speaker")
	habboWithTickets(t, prefix+"Nearby", strings.ToLower(prefix)+"nearby")
	farID := habboWithTickets(t, prefix+"Faraway", strings.ToLower(prefix)+"faraway")
	flat = newRoom(t, speakerID, 2, prefix+"Chatter", true)
	speaker, _ = login(t, strings.ToLower(prefix)+"speaker")
	near, _ = login(t, strings.ToLower(prefix)+"nearby")
	far, _ = login(t, strings.ToLower(prefix)+"faraway")
	speaker.enterFlat(t, flat, 47, 42)
	near.enterFlat(t, flat)
	far.enterFlat(t, flat)
	for _, c := range []*client{speaker, speaker, near} {
		c.nextBody(t, 28)
		c.nextBody(t, 34)
	}
	r, _ := room.Loaded(room.Ref{ID: flat})
	r.Update(farID, func(o *room.Occupant) { o.X = 9 })
	return speaker, near, far, flat
}

func TestChatShoutsAndWhispers(t *testing.T) {
	speaker, near, far, flat := threeInAFlat(t, "")

	speaker.send(t, 52, b64String(t, "hello :)"))
	speaker.expectChat(t, 24, chatLine(t, 0, "hello :)"))
	near.expectChat(t, 24, chatLine(t, 0, "hello :)"))
	far.expectChat(t, 24, chatLine(t, 0, ""))
	if line := statusLines(near.nextBody(t, 34))["0"]; !strings.Contains(line, "/talk/") || !strings.HasSuffix(line, "/gest sml/") {
		t.Errorf("Speaker's status %q, want talk and a smile (decision server/0075)", line)
	}

	speaker.send(t, 55, b64String(t, "HEY"))
	for _, c := range []*client{speaker, near, far} {
		c.expectChat(t, 26, chatLine(t, 0, "HEY"))
	}

	speaker.send(t, 56, b64String(t, "Nearby psst"))
	speaker.expectChat(t, 25, chatLine(t, 0, "psst"))
	near.expectChat(t, 25, chatLine(t, 0, "psst"))
	speaker.send(t, 56, b64String(t, "Nobody psst"))
	speaker.send(t, 52, b64String(t, strings.Repeat("a", 150)))
	far.expectChat(t, 24, chatLine(t, 0, ""))
	speaker.expectChat(t, 24, chatLine(t, 0, strings.Repeat("a", 100)))
	near.expectChat(t, 24, chatLine(t, 0, strings.Repeat("a", 100)))

	near.send(t, 317, "")
	for _, c := range []*client{speaker, near, far} {
		c.expectChat(t, 361, vl64String(t, 1, 1))
	}
	near.send(t, 52, b64String(t, "hi"))
	for _, c := range []*client{speaker, near} {
		c.expectChat(t, 361, vl64String(t, 1, 0))
		c.expectChat(t, 24, chatLine(t, 1, "hi"))
	}

	var lines int
	if err := testDB.QueryRowContext(t.Context(), "SELECT COUNT(*) FROM chat_messages WHERE room_id = ?", flat).Scan(&lines); err != nil || lines != 6 {
		t.Errorf("%d lines saved, %v; want the 6 said, whispered and shouted (decision server/0066)", lines, err)
	}
}

// A habbo gets nothing of a habbo it ignores; its list holds game.maxIgnoredHabbos, and one more drops the oldest
// (decision server/0076).
func TestIgnoringAHabbo(t *testing.T) {
	speaker, near, far, _ := threeInAFlat(t, "Ignore")

	far.send(t, 319, b64String(t, "IgnoreSpeaker"))
	far.expectChat(t, 419, vl64String(t, 1))
	speaker.send(t, 55, b64String(t, "can you hear me"))
	near.expectChat(t, 26, chatLine(t, 0, "can you hear me"))
	far.send(t, 321, "")
	far.expectChat(t, 420, vl64String(t, 1)+"IgnoreSpeaker\x02")

	for _, name := range []string{"NoSuchHabbo", "IgnoreFaraway"} {
		far.send(t, 319, b64String(t, name))
		far.expectChat(t, 419, vl64String(t, 0))
	}
	setSetting(t, "game.maxIgnoredHabbos", 1, 100)
	far.send(t, 319, b64String(t, "IgnoreNearby"))
	far.expectChat(t, 419, vl64String(t, 2))
	far.send(t, 321, "")
	far.expectChat(t, 420, vl64String(t, 1)+"IgnoreNearby\x02")

	far.send(t, 322, b64String(t, "IgnoreNearby"))
	far.expectChat(t, 419, vl64String(t, 3))
	far.send(t, 322, b64String(t, "IgnoreNearby"))
	far.expectChat(t, 419, vl64String(t, 0))
	speaker.send(t, 55, b64String(t, "and now"))
	far.expectChat(t, 26, chatLine(t, 0, "and now"))
}

// Dances, waves and stops show in the habbo's status on the clock's next tick; a wave stops a dance, and ends after
// 1.5 s (decision server/0075). The club dances need fuse_use_club_dance.
func TestDancingAndWaving(t *testing.T) {
	ownerID := habboWithTickets(t, "Dancer", "dancer")
	flat := newRoom(t, ownerID, 2, "Ballroom", true)
	dancer, _ := login(t, "dancer")
	dancer.enterFlat(t, flat, 47, 42)
	dancer.extendDeadline(t)

	dancer.send(t, 93, "")
	if line := statusLines(dancer.nextBody(t, 34))["0"]; !strings.HasSuffix(line, "/dance/") {
		t.Errorf("status %q, want the normal dance", line)
	}
	dancer.send(t, 93, vl64String(t, 2))
	dancer.send(t, 94, "")
	if line := statusLines(dancer.nextBody(t, 34))["0"]; !strings.HasSuffix(line, "/wave/") || strings.Contains(line, "dance") {
		t.Errorf("status %q, want a wave that stopped the dance, and no club dance", line)
	}
	if line := statusLines(dancer.nextBody(t, 34))["0"]; strings.Contains(line, "wave") {
		t.Errorf("status %q, want the wave over", line)
	}
	dancer.send(t, 93, "")
	dancer.nextBody(t, 34)
	dancer.send(t, 88, "Dance")
	if line := statusLines(dancer.nextBody(t, 34))["0"]; strings.Contains(line, "dance") {
		t.Errorf("status %q, want the dance stopped", line)
	}
}
