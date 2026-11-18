package cms

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"
)

// game records each habbo the site tells it of. It answers with err, or with no
// answer at all while hang holds, until the call gives up.
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

// AreOnline and Online answer that nobody is in the hotel: the tests of the
// status come with their own pages.
func (g *game) AreOnline(context.Context, []int64) (map[int64]bool, error) {
	return map[int64]bool{}, nil
}

func (g *game) Online(context.Context) ([]int64, error) {
	return nil, nil
}

func (g *game) habbos() []int64 {
	g.mu.Lock()
	defer g.mu.Unlock()
	return slices.Clone(g.told)
}

// newGameSite mounts a CMS like newSite, with g injected as the game.
func newGameSite(t *testing.T, g *game) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	site := New(db, WithResolver(printPage), WithStatic(static))
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

// A habbo saves a look on the looks page, or a motto on the Me page or the
// profile page: the site tells the game once, after the save.
func TestASavedLookOrMottoTellsTheGame(t *testing.T) {
	for _, c := range []struct {
		name string
		save func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder
	}{
		{"a look", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return serve(mux, "POST", "/account/looks", cookie, url.Values{"figure": {"hd-205-6"}, "gender": {"M"}})
		}},
		{"a motto on the profile page", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return serve(mux, "POST", "/account/profile", cookie, url.Values{"motto": {"Hello"}})
		}},
		{"a motto on the Me page", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return saveMotto(mux, cookie, "Hello")
		}},
	} {
		t.Run(c.name, func(t *testing.T) {
			g := &game{}
			db, mux := newGameSite(t, g)
			cookie, avatarID, _ := member(t, db, mux)

			wantPage(t, c.save(mux, cookie), http.StatusOK)
			wantTold(t, g, avatarID)
		})
	}
}

// A save is refused: the game is told nothing.
func TestARefusedSaveTellsTheGameNothing(t *testing.T) {
	for _, c := range []struct {
		name string
		save func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder
	}{
		{"a bad look", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return serve(mux, "POST", "/account/looks", cookie, url.Values{"figure": {"not a figure"}, "gender": {"M"}})
		}},
		{"a long motto on the profile page", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return serve(mux, "POST", "/account/profile", cookie, url.Values{"motto": {strings.Repeat("a", 33)}})
		}},
		{"a long motto on the Me page", func(mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return saveMotto(mux, cookie, strings.Repeat("a", 39))
		}},
	} {
		t.Run(c.name, func(t *testing.T) {
			g := &game{}
			db, mux := newGameSite(t, g)
			cookie, _, _ := member(t, db, mux)

			c.save(mux, cookie)
			wantTold(t, g)
		})
	}
}

// The game fails, or gives no answer within 2 seconds: the page answers as it
// does today, and the failure is logged.
func TestAFailingGameIsLoggedAndThePageAnswers(t *testing.T) {
	for _, c := range []struct {
		name string
		game *game
	}{
		{"the game fails", &game{err: errors.New("the game is down")}},
		{"the game gives no answer", &game{hang: true}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newGameSite(t, c.game)
			cookie, avatarID, _ := member(t, db, mux)
			logs := captureLog(t)

			start := time.Now()
			rec := serve(mux, "POST", "/account/looks", cookie, url.Values{"figure": {"hd-205-6"}, "gender": {"M"}})
			if elapsed := time.Since(start); elapsed > 3*time.Second {
				t.Errorf("the page answered after %v, want the call to give up after 2 seconds", elapsed)
			}
			wantPage(t, rec, http.StatusOK, "Result:Account settings updated successfully.", "Failed:false", "Figure:hd-205-6")
			wantTold(t, c.game, avatarID)
			if !strings.Contains(logs.String(), "send look") {
				t.Errorf("the log holds no failure: %q", logs.String())
			}
		})
	}
}
