package server

import (
	"strconv"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

func userOf(t *testing.T, avatarID int64) int64 {
	t.Helper()
	avatar, err := store.New(testDB).GetAvatar(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("GetAvatar: %v", err)
	}
	return avatar.UserID
}

func TestTheUserObject(t *testing.T) {
	id := habboWithTickets(t, "Object", "object")
	err := store.New(testDB).UpdateWalletTicketsAndFilm(t.Context(), store.UpdateWalletTicketsAndFilmParams{Tickets: 3, Film: 5, UpdatedAt: time.Now().UTC(), UserID: userOf(t, id)})
	if err != nil {
		t.Fatal(err)
	}
	c, _ := login(t, "object")

	c.send(t, 7, "")
	c.expectMessage(t, 5, strconv.FormatInt(id, 10)+"\x02Object\x02hd-180-1\x02M\x02Hello\x02K\x02QAI")
}

func TestTheFusesComeBeforeLoginOK(t *testing.T) {
	id := habboWithTickets(t, "Guard", "guard")
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	group, err := q.CreateAccessGroup(ctx, store.CreateAccessGroupParams{Name: "Guards", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupAttribute(ctx, store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: "fuse_kick"}); err != nil {
		t.Fatal(err)
	}
	if err := q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userOf(t, id), GrantedAt: now}); err != nil {
		t.Fatal(err)
	}

	if _, fuses := login(t, "guard"); fuses != "fuse_trade\x02fuse_buy_credits\x02fuse_kick\x02" {
		t.Errorf("fuses %q, want the defaults and fuse_kick", fuses)
	}
}

func TestTheCredits(t *testing.T) {
	id := habboWithTickets(t, "Rich", "rich")
	if err := store.New(testDB).AddWalletCredits(t.Context(), store.AddWalletCreditsParams{Credits: 120, UpdatedAt: time.Now().UTC(), UserID: userOf(t, id)}); err != nil {
		t.Fatal(err)
	}
	c, _ := login(t, "rich")

	c.send(t, 8, "")
	c.expectMessage(t, 6, "120")
}

func TestTheBadges(t *testing.T) {
	id := habboWithTickets(t, "Badged", "badged")
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	for i, code := range []string{"HC1", "ADM"} {
		if err := q.TakeOffAvatarBadge(ctx, id); err != nil {
			t.Fatal(err)
		}
		if _, err := q.GrantAvatarBadge(ctx, store.GrantAvatarBadgeParams{AvatarID: id, Code: code, GrantedAt: now.Add(time.Duration(i) * time.Minute)}); err != nil {
			t.Fatal(err)
		}
	}
	habboWithTickets(t, "Plain", "plain")

	badged, _ := login(t, "badged")
	badged.send(t, 157, "")
	badged.expectMessage(t, 229, "JHC1\x02ADM\x02IIADM\x02")
	plain, _ := login(t, "plain")
	plain.send(t, 157, "")
	plain.expectMessage(t, 229, "HH")
}

func TestThereAreNoAchievementsYet(t *testing.T) {
	habboWithTickets(t, "Achiever", "achiever")
	c, _ := login(t, "achiever")

	c.send(t, 370, "")
	c.expectMessage(t, 436, "H")
}

func TestTheSoundSettingIsSaved(t *testing.T) {
	id := habboWithTickets(t, "Loud", "loud")
	c, _ := login(t, "loud")
	c.send(t, 228, "")
	c.expectMessage(t, 308, "I")

	c.send(t, 229, "H")
	c.send(t, 228, "")
	c.expectMessage(t, 308, "H")
	data, err := store.New(testDB).GetAvatarGameData(t.Context(), id)
	if err != nil || data.SoundEnabled {
		t.Errorf("game data = %+v, %v; want the sound off", data, err)
	}
	if h, _ := habbo.Get(id); h.SoundEnabled {
		t.Error("the online habbo still has the sound on")
	}
}

// 40 days left are 9 days of the running period and 1 prepaid period of 31 days (decision server/0052).
func TestTheClubStatus(t *testing.T) {
	habboWithTickets(t, "Plebeian", "plebeian")
	c, _ := login(t, "plebeian")
	c.send(t, 26, b64String(t, "club_habbo"))
	c.expectMessage(t, 7, "club_habbo\x02HHHI")

	id := habboWithTickets(t, "Member", "member")
	now := time.Now().UTC()
	day := 24 * time.Hour
	err := store.New(testDB).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{UserID: userOf(t, id), StartsAt: now.Add(-10 * day), EndsAt: now.Add(40 * day), CreatedAt: now.Add(-10 * day)})
	if err != nil {
		t.Fatal(err)
	}
	member, _ := login(t, "member")
	member.send(t, 26, b64String(t, "club_habbo"))
	member.expectMessage(t, 7, "club_habbo\x02QBHII")
}

func TestTheServerDate(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	before := time.Now().UTC().Format("02-01-2006")
	c.send(t, 49, "")
	_, date := c.receive(t)
	if after := time.Now().UTC().Format("02-01-2006"); date != before && date != after {
		t.Errorf("the server's date is %q, want %q", date, after)
	}
}

// The commands the client sends after LOGIN_OK get no answer before it.
func TestCommandsOfALoggedInHabboWaitForTheLogin(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	for _, id := range []int{7, 8, 157, 228, 26, 370} {
		c.send(t, id, "")
	}
	c.send(t, 49, "")
	if id, _ := c.receive(t); id != 163 {
		t.Errorf("received %d before the date, want no answer before LOGIN_OK", id)
	}
}
