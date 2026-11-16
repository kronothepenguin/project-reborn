package housekeeping

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// game records each habbo housekeeping tells it of. It answers with err, or with
// no answer at all while hang holds, until the call gives up.
type game struct {
	mu   sync.Mutex
	told []int64
	err  error
	hang bool
}

func (g *game) SendLook(ctx context.Context, avatarID int64) error {
	g.mu.Lock()
	g.told = append(g.told, avatarID)
	g.mu.Unlock()
	if g.hang {
		<-ctx.Done()
		return ctx.Err()
	}
	return g.err
}

func (g *game) habbos() []int64 {
	g.mu.Lock()
	defer g.mu.Unlock()
	return slices.Clone(g.told)
}

// newGameSite mounts housekeeping like newSite, with g injected as the game.
func newGameSite(t *testing.T, g *game) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	site := New(db, WithResolver(printPage), WithStatic(printPath("static")))
	site.Inject(Services{Habbos: g})
	site.Mount(mux)
	return db, mux
}

// lockedLog is a log the test reads while the schedulers of earlier tests may
// still write to it.
type lockedLog struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (l *lockedLog) Write(p []byte) (int, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.buf.Write(p)
}

func (l *lockedLog) String() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.buf.String()
}

// captureLog sends the log to the log it returns, for the rest of the test.
func captureLog(t *testing.T) *lockedLog {
	t.Helper()
	logs := &lockedLog{}
	previous := slog.Default()
	slog.SetDefault(slog.New(slog.NewTextHandler(logs, nil)))
	t.Cleanup(func() { slog.SetDefault(previous) })
	return logs
}

func wantTold(t *testing.T, g *game, want ...int64) {
	t.Helper()
	if got := g.habbos(); !slices.Equal(got, want) {
		t.Errorf("the game was told of %v, want %v", got, want)
	}
}

// Staff save a habbo's look or motto in housekeeping: housekeeping tells the game
// once, after the save.
func TestASavedHabboTellsTheGame(t *testing.T) {
	g := &game{}
	db, mux := newGameSite(t, g)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {"Hello"}, "figure": {"hd-190-2.ch-215-82"}, "gender": {"F"}})
	wantRedirect(t, rec, habboURL(id)+"?saved=1")
	wantTold(t, g, id)
}

// A save is refused: the game is told nothing.
func TestARefusedHabboTellsTheGameNothing(t *testing.T) {
	g := &game{}
	db, mux := newGameSite(t, g)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	ranked(t, db, "Boss", 5, auth.HousekeepingAccess)

	for _, c := range []struct {
		name  string
		habbo string
		form  url.Values
	}{
		{"a long motto", "Frank", url.Values{"motto": {strings.Repeat("é", 39)}}},
		{"a bad figure", "Frank", url.Values{"figure": {`"><script>`}}},
		{"a habbo of staff above", "Boss", url.Values{"motto": {"Hello"}}},
	} {
		t.Run(c.name, func(t *testing.T) {
			rec := serve(mux, "POST", habboURL(habboOf(t, db, c.habbo).ID), cookie, c.form)
			if rec.Code != http.StatusUnprocessableEntity {
				t.Errorf("got %d, want the save refused with 422", rec.Code)
			}
		})
	}
	wantTold(t, g)
}

// The game fails, or gives no answer within 2 seconds: the page answers as it
// does today, and the failure is logged.
func TestAFailingGameIsLoggedAndTheHabboSaves(t *testing.T) {
	for _, c := range []struct {
		name string
		game *game
	}{
		{"the game fails", &game{err: errors.New("the game is down")}},
		{"the game gives no answer", &game{hang: true}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newGameSite(t, c.game)
			_, cookie := editor(t, db)
			habbo(t, db, "frank@example.com", "Frank")
			id := habboOf(t, db, "Frank").ID
			logs := captureLog(t)

			start := time.Now()
			rec := serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {"Hello"}})
			if elapsed := time.Since(start); elapsed > 3*time.Second {
				t.Errorf("the page answered after %v, want the call to give up after 2 seconds", elapsed)
			}
			wantRedirect(t, rec, habboURL(id)+"?saved=1")
			if got := habboOf(t, db, "Frank").Motto; got != "Hello" {
				t.Errorf("motto = %q, want it saved", got)
			}
			wantTold(t, c.game, id)
			if !strings.Contains(logs.String(), "send look") {
				t.Errorf("the log holds no failure: %q", logs.String())
			}
		})
	}
}
