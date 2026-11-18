package server

import (
	"context"
	"errors"
	"io"
	"maps"
	"net"
	"net/http"
	"slices"
	"strconv"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// hotelClosed is 292 with the opening time 00:00 and the disconnect flag.
const hotelClosed = "HHI"

// setBool sets a boolean setting for the test, and sets it back to false when the test ends.
func setBool(t *testing.T, key string, on bool) {
	t.Helper()
	if err := settings.Set(context.Background(), store.New(testDB), 0, key, on); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := settings.Set(context.Background(), store.New(testDB), 0, key, false); err != nil {
			t.Error(err)
		}
	})
}

// reopen opens the doors again when the test ends, for the tests that follow.
func reopen(t *testing.T, game services.Hotel) {
	t.Helper()
	t.Cleanup(func() {
		if err := game.Start(context.Background()); err != nil {
			t.Errorf("Start: %v", err)
		}
	})
}

func stop(t *testing.T, game services.Hotel) {
	t.Helper()
	ctx, cancel := context.WithTimeout(t.Context(), timeout)
	defer cancel()
	if err := game.Stop(ctx); err != nil {
		t.Fatalf("Stop: %v", err)
	}
}

func status(t *testing.T, game services.Hotel) services.HotelStatus {
	t.Helper()
	s, err := game.Status(t.Context())
	if err != nil {
		t.Fatalf("Status: %v", err)
	}
	return s
}

// refused wants nothing to listen on port.
func refused(t *testing.T, port int) {
	t.Helper()
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err == nil {
		conn.Close()
		t.Errorf("port %d took a connection, want its door closed", port)
	}
}

// opens wants the info listener to greet a client with HELLO.
func opens(t *testing.T) {
	t.Helper()
	c := dial(t, infoPort)
	c.expectMessage(t, 0, "")
}

// until reads messages until one with id, and returns its body.
func (c *client) until(t *testing.T, id int) string {
	t.Helper()
	for {
		if got, body := c.receive(t); got == id {
			return body
		}
	}
}

// eventuallyOnline waits until exactly ids are in the hotel, once the sessions of earlier tests have ended.
func eventuallyOnline(t *testing.T, ids ...int64) {
	t.Helper()
	slices.Sort(ids)
	eventually(t, "online", func() bool { return slices.Equal(habbo.IDs(), ids) })
}

func TestTheGameStartsWithTheHotelAndTheSiteOpen(t *testing.T) {
	if err := testServer.Start(t.Context()); err != nil {
		t.Fatalf("a second Start: %v", err)
	}

	if !status(t, testServer).Running {
		t.Error("Status says the doors are closed")
	}
	opens(t)
}

func TestTheGameStartsWithTheHotelClosedAndKeepsRunning(t *testing.T) {
	reopen(t, testServer)
	stop(t, testServer)
	setBool(t, "game.closed", true)

	if err := testServer.Start(t.Context()); err != nil {
		t.Fatalf("Start: %v", err)
	}

	refused(t, infoPort)
	refused(t, musPort)
	if status(t, testServer).Running {
		t.Error("Status says the doors are open")
	}
	if _, err := api.New(apiURL(), testDB).Status(t.Context()); err != nil {
		t.Errorf("the /api/ of a closed hotel: %v", err)
	}
}

func TestTheGameStartedWhileTheSiteIsClosedStaysClosed(t *testing.T) {
	reopen(t, testServer)
	stop(t, testServer)
	setBool(t, "site.maintenance", true)

	if err := testServer.Start(t.Context()); err != nil {
		t.Fatalf("Start: %v", err)
	}

	refused(t, infoPort)
	if status(t, testServer).Running {
		t.Error("Status says the doors are open")
	}
}

func TestStoppingTheGameLogsEveryHabboOutAndClosesTheDoors(t *testing.T) {
	reopen(t, testServer)
	resident := habboWithTickets(t, "Closingresident", "closingresident")
	lounger := habboWithTickets(t, "Closinglounger", "closinglounger")
	flat := newRoom(t, resident, 2, "Closing Time", true)
	inRoom, _ := login(t, "closingresident")
	inView, _ := login(t, "closinglounger")
	inRoom.enterFlat(t, flat, 47, 42)
	mus := dial(t, musPort)
	eventuallyOnline(t, resident, lounger)
	left := time.Now().UTC()

	stop(t, testServer)

	for _, c := range []*client{inRoom, inView} {
		if body := c.until(t, 292); body != hotelClosed {
			t.Errorf("292 carries %q, want %q", body, hotelClosed)
		}
		c.expectClosed(t)
	}
	if _, err := mus.r.ReadByte(); !errors.Is(err, io.EOF) {
		t.Errorf("the mus connection read %v, want io.EOF", err)
	}
	if got := status(t, testServer); got.Running || got.Online != 0 {
		t.Errorf("Status = %+v, want the doors closed and nobody inside", got)
	}
	for _, id := range []int64{resident, lounger} {
		data, err := store.New(testDB).GetAvatarGameData(t.Context(), id)
		if err != nil || data.LastOnlineAt.Time.Before(left) {
			t.Errorf("habbo %d's last time online = %v, %v; want the stop", id, data.LastOnlineAt, err)
		}
	}
	refused(t, infoPort)
	refused(t, musPort)
}

func TestTheGameStartedAfterAStopOpensItsDoorsAgain(t *testing.T) {
	reopen(t, testServer)
	stop(t, testServer)
	habboWithTickets(t, "Reopener", "reopener")

	if err := testServer.Start(t.Context()); err != nil {
		t.Fatalf("Start: %v", err)
	}

	if !status(t, testServer).Running {
		t.Error("Status says the doors are closed")
	}
	login(t, "reopener")
}

func TestTheStatusCountsTheHabbosInside(t *testing.T) {
	first := habboWithTickets(t, "Counted", "counted")
	second := habboWithTickets(t, "Countedtoo", "countedtoo")
	login(t, "counted")
	login(t, "countedtoo")
	eventuallyOnline(t, first, second)

	if got := status(t, testServer); !got.Running || got.Online != 2 {
		t.Errorf("Status = %+v, want the doors open and 2 inside", got)
	}
}

func TestAreOnlineAnswersForEachHabbo(t *testing.T) {
	inside := habboWithTickets(t, "Onlineinsider", "onlineinsider")
	outside := habboWithTickets(t, "Onlineoutsider")
	login(t, "onlineinsider")
	eventuallyOnline(t, inside)

	got, err := testServer.AreOnline(t.Context(), []int64{inside, outside})

	if want := map[int64]bool{inside: true, outside: false}; err != nil || !maps.Equal(got, want) {
		t.Errorf("AreOnline = %v, %v; want %v", got, err, want)
	}
}

func TestOnlineListsEveryHabboInside(t *testing.T) {
	first := habboWithTickets(t, "Listedone", "listedone")
	second := habboWithTickets(t, "Listedtwo", "listedtwo")
	habboWithTickets(t, "Unlisted")
	login(t, "listedone")
	login(t, "listedtwo")
	eventuallyOnline(t, first, second)

	got, err := testServer.Online(t.Context())

	if want := []int64{min(first, second), max(first, second)}; err != nil || !slices.Equal(got, want) {
		t.Errorf("Online = %v, %v; want %v", got, err, want)
	}
}

// The programs run apart ask and command the game through its /api/.
func TestTheQuestionsAndCommandsGoThroughTheAPI(t *testing.T) {
	reopen(t, testServer)
	game := api.New(apiURL(), testDB)
	inside := habboWithTickets(t, "Apiinsider", "apiinsider")
	outside := habboWithTickets(t, "Apioutsider")
	c, _ := login(t, "apiinsider")
	eventuallyOnline(t, inside)

	if got := status(t, game); !got.Running || got.Online != 1 {
		t.Errorf("Status = %+v, want the doors open and 1 inside", got)
	}
	if got, err := game.AreOnline(t.Context(), []int64{inside, outside}); err != nil || !maps.Equal(got, map[int64]bool{inside: true, outside: false}) {
		t.Errorf("AreOnline = %v, %v", got, err)
	}
	if got, err := game.Online(t.Context()); err != nil || !slices.Equal(got, []int64{inside}) {
		t.Errorf("Online = %v, %v; want [%d]", got, err, inside)
	}

	stop(t, game)
	if body := c.until(t, 292); body != hotelClosed {
		t.Errorf("292 carries %q, want %q", body, hotelClosed)
	}
	if got := status(t, game); got.Running || got.Online != 0 {
		t.Errorf("Status after Stop = %+v, want the doors closed and nobody inside", got)
	}
	if got, err := game.Online(t.Context()); err != nil || len(got) != 0 {
		t.Errorf("Online after Stop = %v, %v; want none", got, err)
	}

	if err := game.Start(t.Context()); err != nil {
		t.Fatalf("Start: %v", err)
	}
	if !status(t, game).Running {
		t.Error("Status after Start says the doors are closed")
	}
	opens(t)
}

func TestTheHotelsAPIAnswers404WithoutTheSecret(t *testing.T) {
	for _, c := range []struct{ method, path string }{
		{http.MethodGet, "/api/hotel"},
		{http.MethodPost, "/api/hotel/start"},
		{http.MethodPost, "/api/hotel/stop"},
		{http.MethodGet, "/api/habbos/online"},
		{http.MethodGet, "/api/habbos/online?ids=1,2"},
	} {
		req, err := http.NewRequestWithContext(t.Context(), c.method, apiURL()+c.path, nil)
		if err != nil {
			t.Fatal(err)
		}
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("%s %s: %v", c.method, c.path, err)
		}
		res.Body.Close()
		if res.StatusCode != http.StatusNotFound {
			t.Errorf("%s %s answered %s, want 404 Not Found", c.method, c.path, res.Status)
		}
	}
	if !status(t, testServer).Running {
		t.Error("a call without the secret closed the doors")
	}
	if _, err := api.New(apiURL(), siteDB(t, "not-the-secret")).Status(t.Context()); err == nil {
		t.Error("Status with a wrong secret = nil, want an error")
	}
}
