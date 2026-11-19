package housekeeping

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"sync"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// hotel records each start and stop housekeeping asks of the game, and answers
// the status it holds, or err to every call.
type hotel struct {
	mu     sync.Mutex
	calls  []string
	status services.HotelStatus
	err    error
}

func (h *hotel) Status(context.Context) (services.HotelStatus, error) {
	return h.status, h.err
}

func (h *hotel) Start(context.Context) error {
	return h.record("start")
}

func (h *hotel) Stop(context.Context) error {
	return h.record("stop")
}

func (h *hotel) record(call string) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.calls = append(h.calls, call)
	return h.err
}

func wantCalls(t *testing.T, h *hotel, want ...string) {
	t.Helper()
	h.mu.Lock()
	defer h.mu.Unlock()
	if !slices.Equal(h.calls, want) {
		t.Errorf("the game was asked %v, want %v", h.calls, want)
	}
}

// newHotelSite mounts housekeeping like newSite, with h injected as the game,
// and signs in staff holding housekeeping.settings.
func newHotelSite(t *testing.T, h *hotel) (*sql.DB, *http.ServeMux, *http.Cookie) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	site := New(db, WithResolver(printPage), WithStatic(printPath("static")))
	site.Inject(Services{Hotel: h})
	site.Mount(mux)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingSettings)
	return db, mux, cookie
}

func wantSwitch(t *testing.T, db *sql.DB, key string, on bool) {
	t.Helper()
	if got := settings.Bool(t.Context(), store.New(db), key); got != on {
		t.Errorf("%s = %t, want %t", key, got, on)
	}
}

// Staff choose Hotel Closed in "Turn your hotel on/off": the game stops, and the
// choice is saved for the game's next start.
func TestClosingTheHotelStopsTheGame(t *testing.T) {
	h := &hotel{}
	db, mux, cookie := newHotelSite(t, h)

	rec := serve(mux, "POST", "/housekeeping/settings/hotel", cookie, url.Values{"game.closed": {"1"}})
	wantRedirect(t, rec, "/housekeeping/settings?saved=1&section=hotel")
	wantCalls(t, h, "stop")
	wantSwitch(t, db, "game.closed", true)
}

// Staff open the hotel again: the game starts.
func TestOpeningTheHotelStartsTheGame(t *testing.T) {
	h := &hotel{}
	db, mux, cookie := newHotelSite(t, h)
	serve(mux, "POST", "/housekeeping/settings/hotel", cookie, url.Values{"game.closed": {"1"}})

	rec := serve(mux, "POST", "/housekeeping/settings/hotel", cookie, url.Values{"game.closed": {"0"}})
	wantRedirect(t, rec, "/housekeeping/settings?saved=1&section=hotel")
	wantCalls(t, h, "stop", "start")
	wantSwitch(t, db, "game.closed", false)
}

// Staff close the site for maintenance: the game stops; staff open the site
// again: housekeeping starts the game, which keeps its doors closed while the
// hotel is closed.
func TestMaintenanceStopsAndStartsTheGame(t *testing.T) {
	h := &hotel{}
	db, mux, cookie := newHotelSite(t, h)

	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"1"}})
	wantCalls(t, h, "stop")
	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"0"}})
	wantCalls(t, h, "stop", "start")
	wantSwitch(t, db, "site.maintenance", false)
}

// A save that leaves both switches as they are asks nothing of the game.
func TestOtherSavesLeaveTheGameAlone(t *testing.T) {
	h := &hotel{}
	_, mux, cookie := newHotelSite(t, h)

	serve(mux, "POST", "/housekeeping/settings/hotel", cookie, url.Values{"game.closed": {"0"}})
	serve(mux, "POST", "/housekeeping/settings/maintenance", cookie, url.Values{"site.maintenance": {"0"}})
	serve(mux, "POST", "/housekeeping/settings/game", cookie, url.Values{"game.chatRange": {"7"}})
	wantCalls(t, h)
}

// The hotel's switch has its own form under "Turn your site on/off", and the Game
// form no longer holds it.
func TestTheHotelsSwitchHasItsOwnForm(t *testing.T) {
	_, mux, cookie := newHotelSite(t, &hotel{})

	wantPage(t, serve(mux, "GET", "/housekeeping/settings?section=hotel", cookie, nil), http.StatusOK,
		"Menu:Turn your hotel on/off Title:Turn your hotel on/off Button:Apply",
		"Key:game.closed Label:Close Hotel", "OnLabel:Hotel Closed OffLabel:Hotel Open")
	body := serve(mux, "GET", "/housekeeping/settings?section=game", cookie, nil).Body.String()
	_, form, _ := strings.Cut(body, " Section:{ID:game ")
	if strings.Contains(form, "Key:game.closed ") {
		t.Errorf("the Game form still holds game.closed: %s", form)
	}

	ids := []string{}
	for _, part := range strings.Split(body, "{ID:")[1:] {
		id, _, _ := strings.Cut(part, " ")
		ids = append(ids, id)
	}
	if site := slices.Index(ids, "maintenance"); site < 0 || slices.Index(ids, "hotel") != site+1 {
		t.Errorf("Turn your hotel on/off does not follow Turn your site on/off in the menu: %v", ids)
	}
}

// Staff open the settings page: "Turn your hotel on/off" shows whether the game
// runs and how many habbos are inside, or that the game gives no answer.
func TestTheHotelsFormShowsTheGame(t *testing.T) {
	for _, c := range []struct {
		name string
		game *hotel
		want string
	}{
		{"running", &hotel{status: services.HotelStatus{Running: true, Online: 12}}, "Hotel:The game server is running, with 12 habbos inside."},
		{"one habbo", &hotel{status: services.HotelStatus{Running: true, Online: 1}}, "Hotel:The game server is running, with 1 habbo inside."},
		{"stopped", &hotel{}, "Hotel:The game server is stopped."},
		{"no answer", &hotel{err: errors.New("connection refused")}, "Hotel:The game server gives no answer."},
	} {
		t.Run(c.name, func(t *testing.T) {
			_, mux, cookie := newHotelSite(t, c.game)
			wantPage(t, serve(mux, "GET", "/housekeeping/settings?section=hotel", cookie, nil), http.StatusOK, c.want)
		})
	}

	t.Run("other forms", func(t *testing.T) {
		_, mux, cookie := newHotelSite(t, &hotel{status: services.HotelStatus{Running: true}})
		wantPage(t, serve(mux, "GET", "/housekeeping/settings?section=maintenance", cookie, nil), http.StatusOK, "Hotel:}")
	})
}

// Staff save the hotel's switch while the game gives no answer: the choice is
// saved, and the failure is logged.
func TestASaveWhileTheGameIsSilentIsKept(t *testing.T) {
	h := &hotel{err: errors.New("connection refused")}
	db, mux, cookie := newHotelSite(t, h)
	logs := captureLog(t)

	rec := serve(mux, "POST", "/housekeeping/settings/hotel", cookie, url.Values{"game.closed": {"1"}})
	wantRedirect(t, rec, "/housekeeping/settings?saved=1&section=hotel")
	wantSwitch(t, db, "game.closed", true)
	wantCalls(t, h, "stop")
	if !strings.Contains(logs.String(), "hotel stop") {
		t.Errorf("the log holds no failure: %q", logs.String())
	}
}

// Staff open the dashboard: the number of habbos online shows beside Members,
// and 0 while the game gives no answer.
func TestTheDashboardCountsTheHabbosOnline(t *testing.T) {
	for _, c := range []struct {
		name string
		game *hotel
		want string
	}{
		{"running", &hotel{status: services.HotelStatus{Running: true, Online: 7}}, "Online:7 "},
		{"no answer", &hotel{err: errors.New("connection refused")}, "Online:0 "},
	} {
		t.Run(c.name, func(t *testing.T) {
			_, mux, cookie := newHotelSite(t, c.game)
			wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK, "index.html", c.want)
		})
	}
}
