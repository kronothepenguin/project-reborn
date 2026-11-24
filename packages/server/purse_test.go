package server

import (
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// siblingWithTickets adds the habbo name to the user of the habbo of, signed in to the CMS on a session of its own
// that holds ticket, and returns its id.
func siblingWithTickets(t *testing.T, of int64, name, ticket string) int64 {
	t.Helper()
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	first, err := q.GetAvatar(ctx, of)
	if err != nil {
		t.Fatal(err)
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: first.UserID, Name: name, Figure: "hd-180-1", Gender: "M", Motto: "Hello", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	session := "cms-" + name
	err = q.CreateSession(ctx, store.CreateSessionParams{ID: session, UserID: first.UserID, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now, LastSeenAt: now, ExpiresAt: now.Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	err = q.CreateSSOTicket(ctx, store.CreateSSOTicketParams{ID: ticket, SessionID: session, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now})
	if err != nil {
		t.Fatalf("CreateSSOTicket: %v", err)
	}
	return avatar.ID
}

// fillPurse changes the purse of the habbo id's user outside the game, as the site or housekeeping changes it, and
// returns the user's id.
func fillPurse(t *testing.T, id int64, credits, tickets, film int64) int64 {
	t.Helper()
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	avatar, err := q.GetAvatar(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	if err := q.AddWalletCredits(ctx, store.AddWalletCreditsParams{UserID: avatar.UserID, Credits: credits, UpdatedAt: now}); err != nil {
		t.Fatal(err)
	}
	err = q.UpdateWalletTicketsAndFilm(ctx, store.UpdateWalletTicketsAndFilmParams{UserID: avatar.UserID, Tickets: tickets, Film: film, UpdatedAt: now})
	if err != nil {
		t.Fatal(err)
	}
	return avatar.UserID
}

// expectPurse reads the purse the game shows after a change outside it: the user object with the tickets and the
// film, the film, then the credits.
func (c *client) expectPurse(t *testing.T, id int64, name string, credits, tickets, film int32) {
	t.Helper()
	user := strconv.FormatInt(id, 10) + "\x02" + name + "\x02hd-180-1\x02M\x02Hello\x02" + vl64String(t, tickets) + "\x02" +
		vl64String(t, film, 1)
	c.expectNext(t, 5, user)
	c.expectNext(t, 4, vl64String(t, film))
	c.expectNext(t, 6, strconv.Itoa(int(credits)))
}

func TestAPurseChangedOutsideShowsToEachHabboOfItsUserInTheHotel(t *testing.T) {
	firstID := habboWithTickets(t, "Pursekeeper", "pursekeeper")
	secondID := siblingWithTickets(t, firstID, "Pursesharer", "pursesharer")
	habboWithTickets(t, "Purseneighbour", "purseneighbour")
	first, _ := login(t, "pursekeeper")
	second, _ := login(t, "pursesharer")
	neighbour, _ := login(t, "purseneighbour")

	userID := fillPurse(t, firstID, 120, 7, 3)
	if err := testServer.SendPurse(t.Context(), userID); err != nil {
		t.Fatalf("SendPurse: %v", err)
	}

	first.expectPurse(t, firstID, "Pursekeeper", 120, 7, 3)
	second.expectPurse(t, secondID, "Pursesharer", 120, 7, 3)
	// The habbo of another user gets nothing: the next message it reads is the answer to its own question.
	neighbour.send(t, 8, "")
	neighbour.expectNext(t, 6, "0")
}

func TestAPurseChangedWhileOfflineWaitsForTheLogin(t *testing.T) {
	sleeperID := habboWithTickets(t, "Pursedreamer", "pursedreamer")

	userID := fillPurse(t, sleeperID, 45, 2, 1)
	if err := testServer.SendPurse(t.Context(), userID); err != nil {
		t.Fatalf("SendPurse: %v", err)
	}

	sleeper, _ := login(t, "pursedreamer")
	sleeper.send(t, 8, "")
	sleeper.expectNext(t, 6, "45")
	sleeper.send(t, 7, "")
	if body := sleeper.nextBody(t, 5); !strings.HasSuffix(body, "\x02"+vl64String(t, 2)+"\x02"+vl64String(t, 1, 1)) {
		t.Errorf("Pursedreamer's user object is %q, want 2 tickets and 1 film", body)
	}
}

func TestAPurseChangedApartReachesTheHabboThroughTheAPI(t *testing.T) {
	id := habboWithTickets(t, "Apipurseholder", "apipurseholder")
	holder, _ := login(t, "apipurseholder")

	userID := fillPurse(t, id, 300, 0, 5)
	if err := api.New(apiURL(), testDB).SendPurse(t.Context(), userID); err != nil {
		t.Fatalf("SendPurse through the api: %v", err)
	}

	holder.expectPurse(t, id, "Apipurseholder", 300, 0, 5)
}
