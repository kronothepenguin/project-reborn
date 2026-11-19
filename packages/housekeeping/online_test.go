package housekeeping

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// onlineGame answers who is online with inside, or with err, or with no answer at all
// while hang holds, until the call gives up.
type onlineGame struct {
	inside []int64
	err    error
	hang   bool
}

func (h *onlineGame) SendLook(context.Context, int64) error { return nil }

func (h *onlineGame) AreOnline(context.Context, []int64) (map[int64]bool, error) {
	return map[int64]bool{}, nil
}

func (h *onlineGame) Online(ctx context.Context) ([]int64, error) {
	if h.hang {
		<-ctx.Done()
		return nil, ctx.Err()
	}
	return h.inside, h.err
}

// newOnlineSite mounts housekeeping like newSite, with h injected as the game.
func newOnlineSite(t *testing.T, h *onlineGame) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	site := New(db, WithResolver(printPage), WithStatic(printPath("static")))
	site.Inject(Services{Habbos: h})
	site.Mount(mux)
	return db, mux
}

// liveSession records a live session of the habbo, last seen at.
func liveSession(t *testing.T, db *sql.DB, userID, avatarID int64, at time.Time) {
	t.Helper()
	_, err := db.ExecContext(t.Context(),
		`INSERT INTO sessions (id, user_id, avatar_id, ip, user_agent, created_at, last_seen_at, expires_at)
		 VALUES (?, ?, ?, '10.0.0.1', 'test', ?, ?, ?)`,
		fmt.Sprint("session-", avatarID), userID, avatarID, at, at, at.Add(time.Hour))
	if err != nil {
		t.Fatalf("insert session: %v", err)
	}
}

// Staff with housekeeping.users open Online Users: Holo's table lists every habbo
// the game says is in the hotel, the most recently active first.
func TestOnlineUsersListsEveryHabboInTheHotel(t *testing.T) {
	h := &onlineGame{}
	db, mux := newOnlineSite(t, h)
	_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	frank := habbo(t, db, "frank@example.com", "Frank")
	mary := habbo(t, db, "mary@example.com", "Mary")
	habbo(t, db, "other@example.com", "Other")
	frankID, maryID := habboOf(t, db, "Frank").ID, habboOf(t, db, "Mary").ID
	now := time.Now().UTC()
	liveSession(t, db, frank, frankID, now.Add(-time.Minute))
	liveSession(t, db, mary, maryID, now)
	h.inside = []int64{frankID, maryID}

	rec := serve(mux, "GET", "/housekeeping/online", cookie, nil)
	wantPage(t, rec, http.StatusOK, "online.html", "Answered:true", "Name:Mary", "Name:Frank", "seconds ago")
	body := rec.Body.String()
	if strings.Contains(body, "Name:Other") {
		t.Error("the list shows a habbo outside the hotel")
	}
	if strings.Index(body, "Name:Mary") > strings.Index(body, "Name:Frank") {
		t.Error("the list does not show the most recently active habbo first")
	}
}

// What is private follows User Listing: it takes housekeeping.usersPrivate.
func TestOnlineUsersShowsWhatIsPrivateWithItsAttribute(t *testing.T) {
	h := &onlineGame{}
	db, mux := newOnlineSite(t, h)
	_, plain := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)
	_, private := staff(t, db, "Seer", auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersPrivate)
	frank := habbo(t, db, "frank@example.com", "Frank")
	frankID := habboOf(t, db, "Frank").ID
	signIn(t, db, frank, frankID, "10.0.0.7")
	h.inside = []int64{frankID}

	rec := serve(mux, "GET", "/housekeeping/online", plain, nil)
	wantPage(t, rec, http.StatusOK, "Name:Frank", "Private:false")
	for _, secret := range []string{"frank@example.com", "10.0.0.7"} {
		if strings.Contains(rec.Body.String(), secret) {
			t.Errorf("the list shows %s without housekeeping.usersPrivate", secret)
		}
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/online", private, nil), http.StatusOK,
		"Private:true", "Email:frank@example.com", "IP:10.0.0.7")
}

// Staff without housekeeping.users are refused.
func TestOnlineUsersTakesItsAttribute(t *testing.T) {
	db, mux := newOnlineSite(t, &onlineGame{})
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)

	wantPage(t, serve(mux, "GET", "/housekeeping/online", cookie, nil), http.StatusForbidden, "access-denied.html")
}

// A game that fails, gives no answer within a second or is not there leaves the
// table empty, and the page says so.
func TestOnlineUsersWithNoAnswerFromTheGame(t *testing.T) {
	for _, c := range []struct {
		name string
		game *onlineGame
	}{
		{"an error", &onlineGame{err: errors.New("refused")}},
		{"no answer", &onlineGame{hang: true}},
		{"no game", nil},
	} {
		t.Run(c.name, func(t *testing.T) {
			db := openDB(t)
			mux := http.NewServeMux()
			site := New(db, WithResolver(printPage), WithStatic(printPath("static")))
			if c.game != nil {
				site.Inject(Services{Habbos: c.game})
			}
			site.Mount(mux)
			_, cookie := staff(t, db, "Mod", auth.HousekeepingAccess, auth.HousekeepingUsers)

			started := time.Now()
			wantPage(t, serve(mux, "GET", "/housekeeping/online", cookie, nil), http.StatusOK,
				"online.html", "Answered:false", "Habbos:[]")
			if elapsed := time.Since(started); elapsed > 3*time.Second {
				t.Errorf("the page took %v, want the game's call to give up after a second", elapsed)
			}
		})
	}
}
