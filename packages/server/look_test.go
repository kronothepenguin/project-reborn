package server

import (
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// restyle saves a new look and motto for the habbo id, as the site or housekeeping saves them, and tells the game.
func restyle(t *testing.T, id int64, figure, gender, motto string) {
	t.Helper()
	q := store.New(testDB)
	now := time.Now().UTC()
	if err := q.UpdateAvatarLook(t.Context(), store.UpdateAvatarLookParams{ID: id, Figure: figure, Gender: gender, UpdatedAt: now}); err != nil {
		t.Fatal(err)
	}
	if err := q.UpdateAvatarMotto(t.Context(), store.UpdateAvatarMottoParams{ID: id, Motto: motto, UpdatedAt: now}); err != nil {
		t.Fatal(err)
	}
	if err := testServer.SendLook(t.Context(), id); err != nil {
		t.Fatalf("SendLook: %v", err)
	}
}

// userObject is the body of 5 for a habbo made by habboWithTickets: no tickets, no film, and the newsletter.
func userObject(id int64, name, figure, gender, motto string) string {
	return strconv.FormatInt(id, 10) + "\x02" + name + "\x02" + figure + "\x02" + gender + "\x02" + motto + "\x02H\x02HI"
}

func TestALookChangedOutsideShowsInTheRoomAtOnce(t *testing.T) {
	stylistID := habboWithTickets(t, "Couturier", "couturier")
	habboWithTickets(t, "Lookadmirer", "lookadmirer")
	flat := newRoom(t, stylistID, 2, "Fitting Room", true)
	stylist, _ := login(t, "couturier")
	admirer, _ := login(t, "lookadmirer")
	stylist.enterFlat(t, flat, 47, 42)
	admirer.enterFlat(t, flat)

	restyle(t, stylistID, "hd-600-1.hr-500-61", "F", "Brand new")
	if id, body := stylist.nextSkipping(t, 34, 28); id != 5 || body != userObject(stylistID, "Couturier", "hd-600-1.hr-500-61", "F", "Brand new") {
		t.Errorf("Couturier received %d %q, want its new user object", id, body)
	}
	want := vl64String(t, 0) + "hd-600-1.hr-500-61\x02F\x02Brand new\x02"
	for _, c := range []*client{stylist, admirer} {
		if id, body := c.nextSkipping(t, 34, 28); id != 266 || body != want {
			t.Errorf("received %d %q, want 266 %q", id, body, want)
		}
	}
}

func TestALookChangedOutsideARoomShowsInTheHotelViewAndTheNextRoom(t *testing.T) {
	walkerID := habboWithTickets(t, "Lookchanger", "lookchanger")
	flat := newRoom(t, walkerID, 2, "Changing Booth", true)
	walker, _ := login(t, "lookchanger")

	restyle(t, walkerID, "hd-605-2", "F", "Fresh look")
	walker.expectNext(t, 5, userObject(walkerID, "Lookchanger", "hd-605-2", "F", "Fresh look"))

	a := walker.enterFlat(t, flat, 47, 42)
	if !strings.Contains(a.user, "f:hd-605-2\r") || !strings.Contains(a.user, "c:Fresh look\rs:F\r") {
		t.Errorf("Strolling entered as %q, want the new look and motto", a.user)
	}
}

func TestALookChangedWhileOfflineWaitsForTheLogin(t *testing.T) {
	sleeperID := habboWithTickets(t, "Lookdreamer", "lookdreamer")

	restyle(t, sleeperID, "hd-610-3", "F", "Woke up new")
	if _, ok := habbo.Get(sleeperID); ok {
		t.Fatal("Sleeper is online, want offline")
	}

	sleeper, _ := login(t, "lookdreamer")
	sleeper.send(t, 7, "")
	sleeper.expectNext(t, 5, userObject(sleeperID, "Lookdreamer", "hd-610-3", "F", "Woke up new"))
}

func TestALookChangedAfterASecondLoginShowsInTheNewSessionOnly(t *testing.T) {
	id := habboWithTickets(t, "Lookrelogger", "lookrelogger-1", "lookrelogger-2")
	first, _ := login(t, "lookrelogger-1")
	second, _ := login(t, "lookrelogger-2")
	first.expectMessage(t, 287, "J")

	restyle(t, id, "hd-615-4", "M", "Second wind")
	second.expectNext(t, 5, userObject(id, "Lookrelogger", "hd-615-4", "M", "Second wind"))
	first.expectClosed(t)
}
