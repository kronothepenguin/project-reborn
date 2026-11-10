package server

import (
	"context"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// createFlat sends CREATEFLAT and returns the answer.
func createFlat(t *testing.T, c *client, name, model, door string) (int, string) {
	t.Helper()
	c.send(t, 29, "/first floor/"+name+"/model_"+model+"/"+door+"/1")
	return c.next(t)
}

// createdID reads the id of 59.
func createdID(t *testing.T, body string) int64 {
	t.Helper()
	first, _, _ := strings.Cut(body, "\r")
	id, err := strconv.ParseInt(first, 10, 64)
	if err != nil {
		t.Fatalf("59 = %q: %v", body, err)
	}
	return id
}

// settle waits until the server has handled every command c sent: it answers them in order, and GDATE always.
func settle(t *testing.T, c *client) {
	t.Helper()
	c.send(t, 49, "")
	if id, _ := c.next(t); id != 163 {
		t.Fatalf("received %d, want the date", id)
	}
}

func getRoom(t *testing.T, id int64) store.GetRoomRow {
	t.Helper()
	r, err := store.New(testDB).GetRoom(t.Context(), id)
	if err != nil {
		t.Fatalf("GetRoom: %v", err)
	}
	return r
}

func setSetting(t *testing.T, key string, value, restore int) {
	t.Helper()
	if err := settings.Set(context.Background(), testDB, 0, key, value); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := settings.Set(context.Background(), testDB, 0, key, restore); err != nil {
			t.Error(err)
		}
	})
}

func TestCreatingARoomWithTheRoomOMatic(t *testing.T) {
	builder := habboWithTickets(t, "Architect", "architect")
	c, _ := login(t, "architect")

	got, body := createFlat(t, c, "My Room", "a", "password")
	if got != 59 || !strings.HasSuffix(body, "\rMy Room") {
		t.Fatalf("received %d %q, want 59 with the id and the name", got, body)
	}
	id := createdID(t, body)
	c.send(t, 153, vl64String(t, int32(id), 6))
	c.send(t, 25, "/"+strconv.FormatInt(id, 10)+"/\rdescription=A room\rpassword=secret\rallsuperuser=1")
	settle(t, c)

	r := getRoom(t, id)
	if r.CreatorAvatarID != builder || r.OwnerAvatarID != builder || r.RoomCategoryID != 6 || r.Door != "password" || !r.ShowOwner {
		t.Errorf("room = %+v, want Architect's, in Trade rooms, behind a password", r)
	}
	if r.Description != "A room" || !r.OthersMoveFurni || r.MaxVisitors != 25 {
		t.Errorf("settings = %q, %t, %d; want A room, others moving furniture, 25", r.Description, r.OthersMoveFurni, r.MaxVisitors)
	}
	if ok, err := auth.VerifyPassword(r.PasswordHash.String, "secret"); !ok || err != nil || r.PasswordHash.String == "secret" {
		t.Errorf("the password is %q, want a hash of secret", r.PasswordHash.String)
	}

	c.send(t, 25, strconv.FormatInt(id, 10)+"/\rdescription=Renamed\rallsuperuser=0\rmaxvisitors=10")
	settle(t, c)
	if r := getRoom(t, id); r.Description != "Renamed" || r.OthersMoveFurni || r.MaxVisitors != 10 {
		t.Errorf("the navigator's form left %+v", r)
	}
}

// A habbo owns up to game.maxRoomsPerHabbo rooms (decision 0056).
func TestTheRoomLimit(t *testing.T) {
	setSetting(t, "game.maxRoomsPerHabbo", 1, 50)
	habboWithTickets(t, "Hoarder", "hoarder")
	c, _ := login(t, "hoarder")

	if got, _ := createFlat(t, c, "First", "b", "open"); got != 59 {
		t.Fatalf("the first room got %d, want 59", got)
	}
	if got, body := createFlat(t, c, "Second", "b", "open"); got != 33 || body != "Error creating a private room" {
		t.Errorf("the second room got %d %q, want 33 Error creating a private room", got, body)
	}
}

func TestAClubModelNeedsTheClubFuse(t *testing.T) {
	habboWithTickets(t, "Clubless", "plain-club")
	member := habboWithTickets(t, "Clubber", "member-club")
	now := time.Now().UTC()
	err := store.New(testDB).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{UserID: userOf(t, member), StartsAt: now.Add(-time.Hour), EndsAt: now.Add(24 * time.Hour), CreatedAt: now})
	if err != nil {
		t.Fatal(err)
	}

	plain, _ := login(t, "plain-club")
	if got, _ := createFlat(t, plain, "Fancy", "g", "open"); got != 33 {
		t.Errorf("a habbo without club got %d for model g, want 33", got)
	}
	club, _ := login(t, "member-club")
	if got, _ := createFlat(t, club, "Fancy", "g", "open"); got != 59 {
		t.Errorf("a club member got %d for model g, want 59", got)
	}
}

func TestTheRoomOMaticRefusesWhatTheRulesRefuse(t *testing.T) {
	habboWithTickets(t, "Rulebreaker", "rulebreaker")
	c, _ := login(t, "rulebreaker")

	for name, room := range map[string][3]string{
		"a name of 51 characters": {strings.Repeat("n", 51), "a", "open"},
		"an empty name":           {"", "a", "open"},
		"a control character":     {"bad\x02name", "a", "open"},
		"a door the client lacks": {"Room", "a", "locked"},
		"an unknown model":        {"Room", "z", "open"},
		"a public room's model":   {"Room", "newbie_lobby", "open"},
	} {
		if got, _ := createFlat(t, c, room[0], room[1], room[2]); got != 33 {
			t.Errorf("%s got %d, want 33", name, got)
		}
	}
	if got, _ := createFlat(t, c, strings.Repeat("n", 50), "a", "open"); got != 59 {
		t.Errorf("a name of 50 characters got %d, want 59", got)
	}
}

// A category above the habbo's level, a password or visitors out of range, or a room of another habbo, change
// nothing.
func TestRoomSettingsOutsideTheRulesChangeNothing(t *testing.T) {
	habboWithTickets(t, "Settler", "settler")
	habboWithTickets(t, "Meddler", "meddler")
	c, _ := login(t, "settler")
	_, body := createFlat(t, c, "Settled", "c", "open")
	id := createdID(t, body)
	flat := strconv.FormatInt(id, 10)

	c.send(t, 153, vl64String(t, int32(id), 10))
	c.send(t, 25, flat+"/\rdescription=x\rallsuperuser=0\rmaxvisitors=40")
	c.send(t, 25, flat+"/\rdescription=x\rpassword="+strings.Repeat("p", 33)+"\rallsuperuser=0\rmaxvisitors=20")
	settle(t, c)
	other, _ := login(t, "meddler")
	other.send(t, 25, flat+"/\rdescription=Mine now\rallsuperuser=1\rmaxvisitors=10")
	other.send(t, 153, vl64String(t, int32(id), 6))
	settle(t, other)

	if r := getRoom(t, id); r.RoomCategoryID != 2 || r.Description != "" || r.MaxVisitors != 25 || r.PasswordHash.Valid || r.OthersMoveFurni {
		t.Errorf("room = %+v, want it as created, in No category", r)
	}
}
