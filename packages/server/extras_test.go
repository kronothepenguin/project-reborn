package server

import (
	"database/sql"
	"strconv"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A room's rating is -1 until the habbo votes, then the sum of its votes and the share of +1, which reaches everyone
// in the room who has voted (decision server/0082).
func TestRatingARoom(t *testing.T) {
	ownerID := habboWithTickets(t, "Critic", "critic")
	habboWithTickets(t, "Rater", "rater")
	habboWithTickets(t, "Hater", "hater")
	flat := newRoom(t, ownerID, 2, "Gallery", true)
	owner, _ := login(t, "critic")
	fan, _ := login(t, "rater")
	hater, _ := login(t, "hater")
	owner.enterFlat(t, flat, 47, 42)
	for _, c := range []*client{fan, hater} {
		if rating, _ := c.enterFlatEvent(t, flat); rating != vl64String(t, -1, 0) {
			t.Errorf("a habbo that never voted sees %q, want -1", rating)
		}
		c.build(t, true)
		c.arrive(t)
	}

	fan.send(t, 261, vl64String(t, 1))
	if got := fan.nextChatBody(t, 345); got != vl64String(t, 1, 100) {
		t.Errorf("Fan's vote brought %q, want 1 and 100", got)
	}
	hater.send(t, 261, vl64String(t, -1))
	for _, c := range []*client{hater, fan} {
		if got := c.nextChatBody(t, 345); got != vl64String(t, 0, 50) {
			t.Errorf("Hater's vote brought %q, want 0 and 50", got)
		}
	}
	fan.send(t, 261, vl64String(t, -1))
	fan.send(t, 345, "")
	if got := fan.nextChatBody(t, 367); got != vl64String(t, 0) {
		t.Errorf("a second vote brought %q before 367", got)
	}
	if rating, _ := fan.enterFlatEvent(t, flat); rating != vl64String(t, 0, 50) {
		t.Errorf("a habbo that voted sees %q, want 0 and 50", rating)
	}
}

// nextChatBody reads the next message that is not a status, a user list nor a leave, which must be id.
func (c *client) nextChatBody(t *testing.T, id int) string {
	t.Helper()
	got, body := c.nextSkipping(t, 34, 28, 29)
	if got != id {
		t.Fatalf("received %d %q, want %d", got, body, id)
	}
	return body
}

// enterFlatEvent heads the client for the habbo room flat through its open door and returns the rating and the event
// GOTOFLAT brings.
func (c *client) enterFlatEvent(t *testing.T, flat int64) (rating, event string) {
	t.Helper()
	c.knock(t, flat, "")
	if id, body := c.nextSkipping(t, 34, 28, 29); id != 41 {
		t.Fatalf("received %d %q, want 41", id, body)
	}
	return c.goToFlat(t, flat)
}

// eventLine is a room event as 370 writes it, started in one of the minutes given.
func eventLine(t *testing.T, hostID int64, host string, flat int64, eventType int32, name, description string, minutes ...string) []string {
	t.Helper()
	var lines []string
	for _, m := range minutes {
		lines = append(lines, strconv.FormatInt(hostID, 10)+"\x02"+host+"\x02"+strconv.FormatInt(flat, 10)+"\x02"+vl64String(t, eventType)+name+"\x02"+description+"\x02"+m+"\x02")
	}
	return lines
}

// Only the room's owner hosts an event there, of a type 1 to 11, which the room and the navigator's list show, and
// which ends when its host leaves (decision server/0081).
func TestHostingARoomEvent(t *testing.T) {
	hostID := habboWithTickets(t, "Organizer", "organizer")
	habboWithTickets(t, "Attendee", "attendee")
	habboWithTickets(t, "Latecomer", "latecomer")
	flat := newRoom(t, hostID, 2, "Party Hall", true)
	host, _ := login(t, "organizer")
	guest, _ := login(t, "attendee")
	late, _ := login(t, "latecomer")
	host.enterFlat(t, flat, 47, 42)
	guest.enterFlat(t, flat)
	f := strconv.FormatInt(flat, 10)

	host.send(t, 345, "")
	if got := host.nextChatBody(t, 367); got != vl64String(t, 1) {
		t.Errorf("the owner may host: %q, want 1", got)
	}
	guest.send(t, 345, "")
	guest.expectChat(t, 367, vl64String(t, 0))
	guest.send(t, 349, "")
	guest.expectChat(t, 368, vl64String(t, 11))

	host.send(t, 346, vl64String(t, 2)+b64String(t, "ab")+b64String(t, "too short"))
	host.send(t, 346, vl64String(t, 12)+b64String(t, "Party")+b64String(t, "no such type"))
	before := time.Now().UTC().Format("15:04")
	host.send(t, 346, vl64String(t, 2)+b64String(t, "Party")+b64String(t, "Come dance"))
	got := guest.nextChatBody(t, 370)
	after := time.Now().UTC().Format("15:04")
	if want := eventLine(t, hostID, "Organizer", flat, 2, "Party", "Come dance", before, after); got != want[0] && got != want[1] {
		t.Errorf("the event reached the guest as %q, want %q", got, want[0])
	}
	started := got[len(got)-6 : len(got)-1]
	host.nextChatBody(t, 370)
	host.send(t, 345, "")
	host.expectChat(t, 367, vl64String(t, 0))

	guest.send(t, 350, vl64String(t, 2))
	guest.expectChat(t, 369, vl64String(t, 2, 1)+f+"\x02Organizer\x02Party\x02Come dance\x02"+started+"\x02")
	guest.send(t, 350, vl64String(t, 3))
	guest.expectChat(t, 369, vl64String(t, 3, 0))

	host.send(t, 348, vl64String(t, 3)+b64String(t, "Party!")+b64String(t, "New plan"))
	changed := eventLine(t, hostID, "Organizer", flat, 3, "Party!", "New plan", started)[0]
	if got := guest.nextChatBody(t, 370); got != changed {
		t.Errorf("the changed event reached the guest as %q, want %q", got, changed)
	}
	if _, event := late.enterFlatEvent(t, flat); event != changed {
		t.Errorf("a newcomer got the event %q, want %q", event, changed)
	}

	host.send(t, 53, "")
	guest.expectChat(t, 370, "-1\x02")
	guest.send(t, 350, vl64String(t, 3))
	if got := guest.nextChatBody(t, 369); got != vl64String(t, 3, 0) {
		t.Errorf("the ended event is still listed: %q", got)
	}
}

// A habbo shows its favourite group in its user lines, with its status in it, 1 owner, 2 admin, 3 member; the room
// lists the groups' badges and details (decision server/0068). Tags come from the site's profile.
func TestGroupsAndTags(t *testing.T) {
	founderID := habboWithTickets(t, "Founder", "founder")
	officerID := habboWithTickets(t, "Officer", "officer")
	flat := newRoom(t, founderID, 2, "Clubhouse", true)
	q := store.New(testDB)
	ctx := t.Context()
	now := time.Now().UTC()
	group, err := q.CreateGroup(ctx, store.CreateGroupParams{AvatarID: founderID, Name: "Builders Guild", Description: "We build", Badge: "b0503Xs09114", Access: "open", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	joined := sql.NullTime{Time: now, Valid: true}
	for _, m := range []struct {
		id   int64
		role string
	}{{founderID, "admin"}, {officerID, "admin"}} {
		if err := q.AddGroupMember(ctx, store.AddGroupMemberParams{GroupID: group.ID, AvatarID: m.id, Role: m.role, RequestedAt: now, JoinedAt: joined}); err != nil {
			t.Fatal(err)
		}
		if _, err := q.SetFavouriteGroup(ctx, store.SetFavouriteGroupParams{GroupID: group.ID, AvatarID: m.id}); err != nil {
			t.Fatal(err)
		}
	}
	profile, err := q.CreateProfile(ctx, store.CreateProfileParams{AvatarID: founderID, CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	for i, tag := range []string{"builder", "dj"} {
		if _, err := q.AddProfileTag(ctx, store.AddProfileTagParams{ProfileID: profile.ID, Tag: tag, CreatedAt: now.Add(time.Duration(i) * time.Second)}); err != nil {
			t.Fatal(err)
		}
	}
	founder, _ := login(t, "founder")
	officer, _ := login(t, "officer")
	g := strconv.FormatInt(group.ID, 10)

	founder.enterFlat(t, flat, 47, 42)
	got := officer.enterFlat(t, flat)
	if want := userLine(1, officerID, "Officer", 3, 5, 0) + "g:" + g + "\rt:2\r"; got.user != want {
		t.Errorf("Officer's user lines %q, want %q", got.user, want)
	}
	if line := founder.nextBody(t, 28); line != userLine(1, officerID, "Officer", 3, 5, 0)+"g:"+g+"\rt:2\r" {
		t.Errorf("Founder sees Officer as %q", line)
	}
	officer.send(t, 61, "")
	if id, users := officer.nextSkipping(t, 34); id != 28 || users != userLine(0, founderID, "Founder", 3, 5, 0)+"g:"+g+"\rt:1\r"+userLine(1, officerID, "Officer", 3, 5, 0)+"g:"+g+"\rt:2\r" {
		t.Errorf("users %d %q, want Founder, its owner, then Officer, an admin", id, users)
	}

	officer.send(t, 230, "")
	officer.expectChat(t, 309, vl64String(t, 1, int32(group.ID))+"b0503Xs09114\x02")
	officer.send(t, 231, vl64String(t, int32(group.ID)))
	officer.expectChat(t, 311, vl64String(t, int32(group.ID))+"Builders Guild\x02We build\x02"+vl64String(t, -1)+"\x02")
	officer.send(t, 231, vl64String(t, 999999))
	officer.expectChat(t, 311, vl64String(t, -1))

	officer.send(t, 263, vl64String(t, int32(founderID)))
	officer.expectChat(t, 350, vl64String(t, int32(founderID), 2)+"builder\x02dj\x02")
	officer.send(t, 263, vl64String(t, int32(officerID)))
	officer.expectChat(t, 350, vl64String(t, int32(officerID), 0))
}
