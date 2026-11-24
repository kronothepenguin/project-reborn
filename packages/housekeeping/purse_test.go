package housekeeping

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// economy records each user whose purse housekeeping tells the game of. It
// answers with err, or with no answer at all while hang holds, until the call
// gives up.
type economy struct {
	mu   sync.Mutex
	told []int64
	err  error
	hang bool
}

func (e *economy) SendPurse(ctx context.Context, userID int64) error {
	e.mu.Lock()
	e.told = append(e.told, userID)
	e.mu.Unlock()
	if e.hang {
		<-ctx.Done()
		return ctx.Err()
	}
	return e.err
}

func (e *economy) users() []int64 {
	e.mu.Lock()
	defer e.mu.Unlock()
	return slices.Clone(e.told)
}

// newEconomySite mounts housekeeping like newSite, with e injected as the
// game's economy.
func newEconomySite(t *testing.T, e *economy) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	site := New(db, WithResolver(printPage), WithStatic(printPath("static")))
	site.Inject(Services{Economy: e})
	site.Mount(mux)
	return db, mux
}

func wantPurseTold(t *testing.T, e *economy, want ...int64) {
	t.Helper()
	if got := e.users(); !slices.Equal(got, want) {
		t.Errorf("the game was told of the purses of %v, want %v", got, want)
	}
}

// purseKeeper may give credits and edit a user's tickets and film.
func purseKeeper(t *testing.T, db *sql.DB) *http.Cookie {
	t.Helper()
	_, cookie := ranked(t, db, "Keeper", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit,
		auth.HousekeepingUsersPrivate, auth.HousekeepingCredits)
	return cookie
}

func userURL(id int64) string {
	return fmt.Sprintf("/housekeeping/users/%d", id)
}

// Staff give or take credits, or change tickets or film: housekeeping tells the
// game once, with the habbo's user, after the commit.
func TestAPurseChangedInHousekeepingTellsTheGame(t *testing.T) {
	for _, c := range []struct {
		name string
		path func(userID, id int64) string
		form func(id int64) url.Values
		want string
	}{
		{"credits given", func(_, id int64) string { return creditsURL(id) },
			func(int64) url.Values { return url.Values{"amount": {"100"}} }, "?gave=100"},
		{"tickets and film", func(userID, _ int64) string { return userURL(userID) },
			func(id int64) url.Values {
				return url.Values{"habbo": {fmt.Sprint(id)}, "tickets": {"7"}, "film": {"3"}}
			}, "?saved=1"},
	} {
		t.Run(c.name, func(t *testing.T) {
			e := &economy{}
			db, mux := newEconomySite(t, e)
			cookie := purseKeeper(t, db)
			userID := habbo(t, db, "frank@example.com", "Frank")
			id := habboOf(t, db, "Frank").ID

			wantRedirect(t, serve(mux, "POST", c.path(userID, id), cookie, c.form(id)), habboURL(id)+c.want)
			wantPurseTold(t, e, userID)
		})
	}
}

// A form that leaves the purse as it was tells the game nothing.
func TestAPurseLeftAsItWasInHousekeepingTellsTheGameNothing(t *testing.T) {
	e := &economy{}
	db, mux := newEconomySite(t, e)
	cookie := purseKeeper(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"-1"}})
	serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"lots"}})
	wantRedirect(t, serve(mux, "POST", userURL(userID), cookie, url.Values{"habbo": {fmt.Sprint(id)}, "email": {"new@example.com"}}),
		habboURL(id)+"?saved=1")
	wantPurseTold(t, e)
}

// The game fails, or gives no answer within 2 seconds: the purse is changed,
// the page answers as it does without the game, and the failure is logged.
func TestAFailingGameLeavesThePurseChangedInHousekeeping(t *testing.T) {
	for _, c := range []struct {
		name string
		game *economy
	}{
		{"the game fails", &economy{err: errors.New("the game is down")}},
		{"the game gives no answer", &economy{hang: true}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newEconomySite(t, c.game)
			cookie := purseKeeper(t, db)
			userID := habbo(t, db, "frank@example.com", "Frank")
			id := habboOf(t, db, "Frank").ID
			logs := captureLog(t)

			start := time.Now()
			rec := serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"100"}})
			if elapsed := time.Since(start); elapsed > 3*time.Second {
				t.Errorf("the page answered after %v, want the call to give up after 2 seconds", elapsed)
			}
			wantRedirect(t, rec, habboURL(id)+"?gave=100")
			if got := creditsOf(t, db, userID); got != 100 {
				t.Errorf("credits = %d, want 100", got)
			}
			wantPurseTold(t, c.game, userID)
			if !strings.Contains(logs.String(), "send purse") {
				t.Errorf("the log holds no failure: %q", logs.String())
			}
		})
	}
}
