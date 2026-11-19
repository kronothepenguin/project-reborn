package cms

import (
	"context"
	"database/sql"
	"errors"
	"io"
	"net/http"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/services"
)

// hotel answers the site's questions about the game: with status, with err, or
// with no answer at all while hang holds, until the call gives up.
type hotel struct {
	status services.HotelStatus
	err    error
	hang   bool
}

func (h *hotel) Status(ctx context.Context) (services.HotelStatus, error) {
	if h.hang {
		<-ctx.Done()
		return services.HotelStatus{}, ctx.Err()
	}
	return h.status, h.err
}

func (h *hotel) Start(context.Context) error { return nil }
func (h *hotel) Stop(context.Context) error  { return nil }

// running is a game whose doors are open, with online habbos inside.
func running(online int) *hotel {
	return &hotel{status: services.HotelStatus{Running: true, Online: online}}
}

// newHotelSite mounts a CMS like newSite, with h injected as the game, or no
// game at all when h is nil.
func newHotelSite(t *testing.T, h services.Hotel) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	site := New(db, WithResolver(printPage), WithStatic(static))
	site.Inject(Services{Hotel: h})
	site.Mount(mux)
	return db, mux
}

// The game runs: every page carries the count of habbos online, for guests and
// habbos alike.
func TestEveryPageShowsTheHabbosOnlineWhileTheGameRuns(t *testing.T) {
	db, mux := newHotelSite(t, running(12))
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	for _, path := range []string{"/register", "/community", "/privacy"} {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "Online:true OnlineCount:12 ")
	}
	for _, path := range []string{"/me", "/community", "/account/looks"} {
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, "Online:true OnlineCount:12 ")
	}
}

// The game is stopped, gives an error, gives no answer within a second, or is
// not there at all: every page shows the hotel offline, with nobody inside.
func TestEveryPageShowsTheHotelOfflineWhileTheGameIsStoppedOrSilent(t *testing.T) {
	for _, c := range []struct {
		name  string
		hotel services.Hotel
	}{
		{"stopped", &hotel{status: services.HotelStatus{Online: 3}}},
		{"failing", &hotel{err: errors.New("the game is down")}},
		{"silent", &hotel{hang: true}},
		{"missing", nil},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newHotelSite(t, c.hotel)
			habbo(t, db, "dora@example.com", "Dora")
			cookie := login(t, db, "Dora")

			start := time.Now()
			wantPage(t, serve(mux, "GET", "/community", nil, nil), http.StatusOK, "Online:false OnlineCount:0 ")
			wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Online:false OnlineCount:0 ")
			if took := time.Since(start); took > 3*time.Second {
				t.Errorf("two pages took %s, want at most a second's wait each", took)
			}
		})
	}
}

// A guest who opens /client while the game is stopped still goes to Holo's
// "please sign in"; a habbo goes back to its Me page, and gets no ticket.
func TestTheClientPageSendsAHabboToMeWhileTheGameIsStopped(t *testing.T) {
	db, mux := newHotelSite(t, &hotel{})
	habbo(t, db, "dora@example.com", "Dora")
	cookie := login(t, db, "Dora")

	before := tickets(t, db)

	wantRedirect(t, serve(mux, "GET", "/client", cookie, nil), "/me")
	wantRedirect(t, serve(mux, "GET", "/client", nil, nil), "/client/utils?key=LogInPlease")
	if after := tickets(t, db); !slices.Equal(after, before) {
		t.Errorf("the stopped hotel gave a ticket: %v, then %v", before, after)
	}
}

// tickets lists the ids of every ticket.
func tickets(t *testing.T, db *sql.DB) []string {
	t.Helper()
	rows, err := db.QueryContext(t.Context(), `SELECT id FROM sso_tickets ORDER BY id`)
	if err != nil {
		t.Fatalf("list tickets: %v", err)
	}
	defer rows.Close()
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			t.Fatalf("list tickets: %v", err)
		}
		ids = append(ids, id)
	}
	return ids
}

func TestTheClientPageOpensWhileTheGameRuns(t *testing.T) {
	db, mux := newHotelSite(t, running(7))
	habbo(t, db, "dora@example.com", "Dora")

	wantPage(t, serve(mux, "GET", "/client", login(t, db, "Dora"), nil), http.StatusOK, "client.html ", "OnlineCount:7 ")
}

// The client loses its connection while the game is stopped: its window lands
// on the page closed. While the game runs, and for any other error, it shows
// Holo's fatal error.
func TestALostConnectionShowsHotelClosedWhileTheGameIsStopped(t *testing.T) {
	for _, c := range []struct {
		name  string
		hotel services.Hotel
		path  string
		want  string
	}{
		{"stopped", &hotel{}, "/client/utils?key=error&error=disconnect", "client/utils.html {Key:closed Name:Reborn Hotel "},
		{"silent", &hotel{hang: true}, "/client/utils?key=error&error=disconnect", "client/utils.html {Key:closed "},
		{"running", running(1), "/client/utils?key=error&error=disconnect", "client/utils.html {Key:error "},
		{"another error", &hotel{}, "/client/utils?key=error", "client/utils.html {Key:error "},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newHotelSite(t, c.hotel)
			habbo(t, db, "dora@example.com", "Dora")

			wantPage(t, serve(mux, "GET", c.path, login(t, db, "Dora"), nil), http.StatusOK, c.want)
		})
	}
}

// Holo's header: "Enter <site name>", which opens the client page in the window
// named client, while the game runs, and "<site name> is offline" while it is
// stopped, for guests and habbos alike.
func TestTheHeaderOffersEnterWhileTheGameRuns(t *testing.T) {
	enter := `id="enter-hotel-open-medium-link" href="/client" target="client"><span>Enter Reborn Hotel`
	for _, c := range []struct {
		name  string
		hotel services.Hotel
		want  string
		not   string
	}{
		{"running", running(1), enter, "Reborn Hotel is offline"},
		{"stopped", &hotel{}, "Reborn Hotel is offline", "enter-hotel-open-medium-link"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newBuiltSite(t, c.hotel)
			habbo(t, db, "dora@example.com", "Dora")
			cookie := login(t, db, "Dora")

			for _, path := range []string{"/me", "/community", "/account/looks"} {
				rec := serve(mux, "GET", path, cookie, nil)
				wantPage(t, rec, http.StatusOK, c.want)
				if strings.Contains(rec.Body.String(), c.not) {
					t.Errorf("%s shows %q to a habbo", path, c.not)
				}
			}
			rec := serve(mux, "GET", "/community", nil, nil)
			wantPage(t, rec, http.StatusOK, c.want)
			if strings.Contains(rec.Body.String(), c.not) {
				t.Errorf("/community shows %q to a guest", c.not)
			}
		})
	}
}

// Holo's Me page: the Enter button while the game runs, and "Hotel Closed"
// while it is stopped.
func TestTheMePageShowsEnterOrHotelClosed(t *testing.T) {
	for _, c := range []struct {
		name  string
		hotel services.Hotel
		want  string
		not   string
	}{
		{"running", running(1), "Enter Reborn<i", "Hotel Closed"},
		{"stopped", &hotel{}, "Hotel Closed", "Enter Reborn<i"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newBuiltSite(t, c.hotel)
			habbo(t, db, "dora@example.com", "Dora")

			rec := serve(mux, "GET", "/me", login(t, db, "Dora"), nil)

			wantPage(t, rec, http.StatusOK, c.want)
			if strings.Contains(rec.Body.String(), c.not) {
				t.Errorf("the Me page shows %q", c.not)
			}
		})
	}
}
