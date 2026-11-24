package router

import (
	"context"
	"database/sql"
	"encoding/json/v2"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"slices"
	"sync/atomic"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Deps are the shared services every handler can use.
type Deps struct {
	Resolver astro.Resolver
	DB       *sql.DB
	Queries  *store.Queries
	Updates  *store.UpdateCheck
	// Habbos is nil until a runner injects it, and while it is nil its calls are
	// skipped.
	Habbos services.Habbos
	// Hotel is nil until a runner injects it, and while it is nil the game
	// counts as stopped.
	Hotel services.Hotel
	// Economy is nil until a runner injects it, and while it is nil its calls
	// are skipped.
	Economy services.Economy
}

type Router struct {
	deps Deps
	// gameFailed remembers whether the game's last answer failed.
	gameFailed atomic.Bool
}

func New(deps Deps) *Router {
	return &Router{deps: deps}
}

// hotelStatus holds what every layout reads: the site's names, the game's status
// and the count of habbos in the hotel, which is 0 while the game is stopped.
type hotelStatus struct {
	Name            string
	ShortName       string
	Online          bool
	OnlineCount     int
	RegisteredUsers int64
	Staff           bool
	HousekeepingURL string
}

func (r *Router) hotelStatus(ctx context.Context) hotelStatus {
	registered, err := r.deps.Queries.CountAvatars(ctx)
	if err != nil {
		logError("cms: count habbos", err)
	}
	game := r.gameStatus(ctx)
	return hotelStatus{
		Name:            settings.String(ctx, r.deps.Queries, "site.name"),
		Online:          game.Running,
		OnlineCount:     game.Online,
		ShortName:       settings.String(ctx, r.deps.Queries, "site.shortName"),
		RegisteredUsers: registered,
		Staff:           r.holds(ctx, auth.HousekeepingAccess),
		HousekeepingURL: settings.String(ctx, r.deps.Queries, "site.housekeepingUrl"),
	}
}

// statusTimeout is how long the game has to tell its status.
const statusTimeout = 300 * time.Millisecond

// gameStatus asks the game whether its doors are open and how many habbos are
// inside, once per request. No injected game, an error or no answer within
// statusTimeout reads as stopped, with nobody inside; the result goes to
// gameAnswered.
func (r *Router) gameStatus(ctx context.Context) services.HotelStatus {
	if r.deps.Hotel == nil {
		return services.HotelStatus{}
	}
	ctx, cancel := context.WithTimeout(ctx, statusTimeout)
	defer cancel()
	status, err := r.deps.Hotel.Status(ctx)
	r.gameAnswered("hotel status", err)
	if err != nil {
		return services.HotelStatus{}
	}
	if !status.Running {
		return services.HotelStatus{}
	}
	return status
}

// holds reports whether the visitor's user holds attribute.
func (r *Router) holds(ctx context.Context, attribute auth.Attribute) bool {
	session, ok := auth.FromContext(ctx)
	if !ok {
		return false
	}
	attributes, err := auth.Attributes(ctx, r.deps.DB, session.UserID)
	if err != nil {
		logError("cms: attributes", err)
		return false
	}
	return slices.Contains(attributes, attribute)
}

// Guest sends signed-in visitors to /me instead of next.
func Guest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if _, ok := auth.FromContext(req.Context()); ok {
			http.Redirect(w, req, "/me", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, req)
	})
}

func (r *Router) invalid(w http.ResponseWriter, name string, data any) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, data)
}

// logError logs err under msg, unless the visitor abandoned the request: its
// error is then context.Canceled, and the request ends quietly.
func logError(msg string, err error) {
	if errors.Is(err, context.Canceled) {
		return
	}
	slog.Error(msg, "err", err)
}

// gameAnswered records the result of a question or command sent to the game, so
// a silent game is logged once per change: the first failure logs "the game
// gives no answer" with the error, prefixed by what was asked, and the first
// success after it logs "the game answers again". A request the visitor
// abandoned leaves the memory as it is.
func (r *Router) gameAnswered(asked string, err error) {
	switch {
	case errors.Is(err, context.Canceled):
	case err != nil:
		if r.gameFailed.CompareAndSwap(false, true) {
			slog.Error("cms: the game gives no answer", "err", fmt.Errorf("%s: %w", asked, err))
		}
	case r.gameFailed.CompareAndSwap(true, false):
		slog.Info("cms: the game answers again")
	}
}

// sendTimeout is how long the game has to answer a SendLook or a
// SendPurse.
const sendTimeout = 2 * time.Second

// sendLook tells the game that the habbo's look or motto changed, after the save.
// The call has a context of its own, apart from the request's, so a request the
// visitor abandons still tells the game. The result goes to gameAnswered, and
// the page answers as it would without the game.
func (r *Router) sendLook(ctx context.Context, avatarID int64) {
	if r.deps.Habbos == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), sendTimeout)
	defer cancel()
	err := r.deps.Habbos.SendLook(ctx, avatarID)
	if err != nil {
		err = fmt.Errorf("habbo %d: %w", avatarID, err)
	}
	r.gameAnswered("send look", err)
}

// sendPurse tells the game that the user's purse changed, after the commit, as
// sendLook does.
func (r *Router) sendPurse(ctx context.Context, userID int64) {
	if r.deps.Economy == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), sendTimeout)
	defer cancel()
	err := r.deps.Economy.SendPurse(ctx, userID)
	if err != nil {
		err = fmt.Errorf("user %d: %w", userID, err)
	}
	r.gameAnswered("send purse", err)
}

func (r *Router) fail(w http.ResponseWriter, err error) {
	logError("cms", err)
	http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
}

// answerJSON writes v as the answer, with status.
func (r *Router) answerJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.MarshalWrite(w, v); err != nil {
		slog.Error("cms: json", "err", err)
	}
}

// inTx runs change in one transaction, committing when it returns nil. change must
// use only the q it receives, because the pool's one connection is the
// transaction's until inTx returns.
func (r *Router) inTx(ctx context.Context, change func(q *store.Queries) error) error {
	tx, err := r.deps.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if err := change(r.deps.Queries.WithTx(tx)); err != nil {
		return err
	}
	return tx.Commit()
}
