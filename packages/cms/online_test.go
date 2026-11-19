package cms

import (
	"context"
	"database/sql"
	"errors"
	"io"
	"net/http"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// presence is a game that holds the habbos of inside. It records each question of
// AreOnline, and answers it with err, or with no answer at all while hang holds,
// until the call gives up.
type presence struct {
	inside []int64
	err    error
	hang   bool

	mu    sync.Mutex
	asked [][]int64
}

func (h *presence) SendLook(context.Context, int64) error { return nil }

func (h *presence) AreOnline(ctx context.Context, ids []int64) (map[int64]bool, error) {
	h.mu.Lock()
	h.asked = append(h.asked, slices.Clone(ids))
	h.mu.Unlock()
	if h.hang {
		<-ctx.Done()
		return nil, ctx.Err()
	}
	if h.err != nil {
		return nil, h.err
	}
	online := map[int64]bool{}
	for _, id := range ids {
		online[id] = slices.Contains(h.inside, id)
	}
	return online, nil
}

func (h *presence) Online(context.Context) ([]int64, error) { return h.inside, nil }

// questions are the questions the site asked, each with its ids sorted.
func (h *presence) questions() [][]int64 {
	h.mu.Lock()
	defer h.mu.Unlock()
	var got [][]int64
	for _, ids := range h.asked {
		got = append(got, slices.Sorted(slices.Values(ids)))
	}
	return got
}

// wantAskedOnce fails unless the site asked the game once, about want.
func wantAskedOnce(t *testing.T, h *presence, want ...int64) {
	t.Helper()
	slices.Sort(want)
	if got := h.questions(); len(got) != 1 || !slices.Equal(got[0], want) {
		t.Errorf("the site asked the game %v, want one question about %v", got, want)
	}
}

// newPresenceSite mounts a CMS like newSite, with h injected as the game.
func newPresenceSite(t *testing.T, h *presence) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	site := New(db, WithResolver(printPage), WithStatic(static))
	site.Inject(Services{Habbos: h})
	site.Mount(mux)
	return db, mux
}

// wantBoxOnline fails unless the page holds the box of the habbo named with its
// online state; a box is printed as {Name:<name> ... Online:<state>}.
func wantBoxOnline(t *testing.T, body, name string, online bool) {
	t.Helper()
	state := strconv.FormatBool(online)
	box := regexp.MustCompile(`\{Name:` + regexp.QuoteMeta(name) + ` [^{}]*?Online:` + state + `\}`)
	if !box.MatchString(body) {
		t.Errorf("the page holds no box of %s with Online:%s: %s", name, state, body)
	}
}

// presencePage serves path and fails unless it answers 200.
func presencePage(t *testing.T, mux *http.ServeMux, path string, cookie *http.Cookie) string {
	t.Helper()
	rec := serve(mux, "GET", path, cookie, nil)
	wantPage(t, rec, http.StatusOK)
	return rec.Body.String()
}

// The staff page shows a staff member in the hotel online, and one outside
// offline, from one question about the staff it lists.
func TestTheStaffPageShowsWhoIsInTheHotel(t *testing.T) {
	h := &presence{}
	db, mux := newPresenceSite(t, h)
	inside := habbo(t, db, "in@example.com", "Inside")
	outside := habbo(t, db, "out@example.com", "Outside")
	staffGroup(t, db, "Moderators", 5, inside, outside)
	h.inside = []int64{avatarID(t, db, "Inside")}

	body := presencePage(t, mux, "/staff", nil)
	wantBoxOnline(t, body, "Inside", true)
	wantBoxOnline(t, body, "Outside", false)
	wantAskedOnce(t, h, avatarID(t, db, "Inside"), avatarID(t, db, "Outside"))
}

// The community page shows each random habbo in the hotel online and the others
// offline, from one question about the habbos it shows.
func TestTheCommunityPageShowsWhoIsInTheHotel(t *testing.T) {
	h := &presence{}
	db, mux := newPresenceSite(t, h)
	habbo(t, db, "in@example.com", "Inside")
	habbo(t, db, "out@example.com", "Outside")
	h.inside = []int64{avatarID(t, db, "Inside")}

	body := presencePage(t, mux, "/community", nil)
	wantBoxOnline(t, body, "Inside", true)
	wantBoxOnline(t, body, "Outside", false)
	wantAskedOnce(t, h, avatarID(t, db, "Inside"), avatarID(t, db, "Outside"))
}

// A home's profile widget shows its habbo online while it is in the hotel, and
// offline while it is not, from one question about that habbo.
func TestTheProfileWidgetShowsWhetherTheHabboIsInTheHotel(t *testing.T) {
	for _, c := range []struct {
		name   string
		online bool
	}{
		{"Inside", true},
		{"Outside", false},
	} {
		t.Run(c.name, func(t *testing.T) {
			h := &presence{}
			db, mux := newPresenceSite(t, h)
			habbo(t, db, "in@example.com", "Inside")
			habbo(t, db, "out@example.com", "Outside")
			h.inside = []int64{avatarID(t, db, "Inside")}

			body := presencePage(t, mux, "/home/"+c.name, nil)
			profile := body[strings.Index(body, "Profile:"):]
			wantBoxOnline(t, profile, c.name, c.online)
			wantAskedOnce(t, h, avatarID(t, db, c.name))
		})
	}
}

// A thread's post boxes show each author in the hotel online and the others
// offline, and the viewer's box for its preview shows whether it is inside, from
// one question for the page.
func TestThePostBoxesShowWhoIsInTheHotel(t *testing.T) {
	h := &presence{}
	db, mux := newPresenceSite(t, h)
	cookie, viewer, _ := member(t, db, mux)
	habbo(t, db, "in@example.com", "Inside")
	habbo(t, db, "out@example.com", "Outside")
	inside, outside := avatarID(t, db, "Inside"), avatarID(t, db, "Outside")
	th := thread(t, db, inside, "Hello", testNow, 0)
	reply := store.CreateForumPostParams{ForumThreadID: th.ID, AvatarID: outside, Body: "Hi", CreatedAt: testNow.Add(time.Minute)}
	if _, err := store.New(db).CreateForumPost(t.Context(), reply); err != nil {
		t.Fatal(err)
	}
	h.inside = []int64{inside, viewer}

	body := presencePage(t, mux, "/forum/threads/"+strconv.FormatInt(th.ID, 10), cookie)
	posts := body[strings.Index(body, "Posts:"):]
	if !regexp.MustCompile(`Author:Inside [^{}]*Online:true\}`).MatchString(posts) {
		t.Errorf("Inside's post box is not online: %s", posts)
	}
	if !regexp.MustCompile(`Author:Outside [^{}]*Online:false\}`).MatchString(posts) {
		t.Errorf("Outside's post box is not offline: %s", posts)
	}
	wantBoxOnline(t, body, "Newbie", true)
	wantAskedOnce(t, h, inside, outside, viewer)
}

// The board's preview box shows the viewer online while it is in the hotel, and
// offline while it is not.
func TestTheBoardsPreviewShowsWhetherTheViewerIsInTheHotel(t *testing.T) {
	for _, online := range []bool{true, false} {
		t.Run(map[bool]string{true: "inside", false: "outside"}[online], func(t *testing.T) {
			h := &presence{}
			db, mux := newPresenceSite(t, h)
			cookie, viewer, _ := member(t, db, mux)
			if online {
				h.inside = []int64{viewer}
			}

			body := presencePage(t, mux, "/forum", cookie)
			wantBoxOnline(t, body, "Newbie", online)
			wantAskedOnce(t, h, viewer)
		})
	}
}

// The game fails, gives no answer within 1 second, or is not injected: the page
// answers, with every habbo offline, and a failure of the game is logged.
func TestAGameWithoutAnAnswerShowsEveryHabboOffline(t *testing.T) {
	for _, c := range []struct {
		name string
		game *presence
	}{
		{"the game fails", &presence{err: errors.New("the game is down")}},
		{"the game gives no answer", &presence{hang: true}},
		{"no game", nil},
	} {
		t.Run(c.name, func(t *testing.T) {
			var db *sql.DB
			var mux *http.ServeMux
			if c.game == nil {
				db, mux = newSite(t)
			} else {
				db, mux = newPresenceSite(t, c.game)
			}
			staff := habbo(t, db, "in@example.com", "Inside")
			staffGroup(t, db, "Moderators", 5, staff)
			if c.game != nil {
				c.game.inside = []int64{avatarID(t, db, "Inside")}
			}

			logs := captureLog(t)

			start := time.Now()
			body := presencePage(t, mux, "/staff", nil)
			if elapsed := time.Since(start); elapsed > 2*time.Second {
				t.Errorf("the page answered after %v, want the question to give up after 1 second", elapsed)
			}
			wantBoxOnline(t, body, "Inside", false)
			if logged := strings.Contains(logs.String(), "habbos online"); logged != (c.game != nil) {
				t.Errorf("logged = %t, want a failure logged only from a game: %q", logged, logs.String())
			}
		})
	}
}
