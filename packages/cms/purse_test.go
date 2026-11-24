package cms

import (
	"context"
	"database/sql"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// economy records each user whose purse the site tells the game of. It answers
// with err, or with no answer at all while hang holds, until the call gives up.
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

// newEconomySite mounts a CMS like newSite, with e injected as the game's
// economy.
func newEconomySite(t *testing.T, e *economy) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db := openDB(t)
	mux := http.NewServeMux()
	static := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "static") })
	site := New(db, WithResolver(printPage), WithStatic(static))
	site.Inject(Services{Economy: e})
	site.Mount(mux)
	return db, mux
}

// spender is the habbo Frank with credits, signed in on a site that tells e.
func spender(t *testing.T, e *economy, credits int64) (*sql.DB, *http.ServeMux, *http.Cookie, int64) {
	t.Helper()
	db, mux := newEconomySite(t, e)
	userID := habbo(t, db, "frank@example.com", "Frank")
	if credits > 0 {
		if _, err := store.New(db).ChangeWalletCredits(t.Context(), store.ChangeWalletCreditsParams{UserID: userID, Credits: credits, UpdatedAt: testNow}); err != nil {
			t.Fatalf("ChangeWalletCredits: %v", err)
		}
	}
	return db, mux, login(t, db, "Frank"), userID
}

func wantPurseTold(t *testing.T, e *economy, want ...int64) {
	t.Helper()
	if got := e.users(); !slices.Equal(got, want) {
		t.Errorf("the game was told of the purses of %v, want %v", got, want)
	}
}

func wantStatus(t *testing.T, rec *httptest.ResponseRecorder, status int) {
	t.Helper()
	if rec.Code != status {
		t.Fatalf("answered %d %s, want %d", rec.Code, rec.Body, status)
	}
}

// A habbo changes its purse on the site: the site tells the game once, with
// its user, after the commit.
func TestAPurseChangedOnTheSiteTellsTheGame(t *testing.T) {
	for _, c := range []struct {
		name   string
		change func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder
	}{
		{"a credit voucher", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			makeVoucher(t, db, "purse123", 50)
			return redeem(mux, cookie, "purse123")
		}},
		{"the club", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return buyClub(mux, cookie, 1)
		}},
		{"a group", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return purchase(mux, cookie, "Purse Club", "We pay.")
		}},
		{"the home store", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return buy(mux, cookie, 1)
		}},
	} {
		t.Run(c.name, func(t *testing.T) {
			e := &economy{}
			db, mux, cookie, userID := spender(t, e, 100)

			wantStatus(t, c.change(t, db, mux, cookie), http.StatusOK)
			wantPurseTold(t, e, userID)
		})
	}
}

// A new user registers through a referral link: the game is told of the
// referrer's purse, which the reward changed, and not of the new user's, whose
// habbo is outside the hotel.
func TestAReferralRewardTellsTheGameOfTheReferrer(t *testing.T) {
	e := &economy{}
	db, mux := newEconomySite(t, e)
	form := referred(t, mux)
	wantPurseTold(t, e)

	wantRedirect(t, serve(mux, "POST", "/register", nil, form), "/me")
	referrer, err := store.New(db).GetAvatarByName(t.Context(), "Referrer")
	if err != nil {
		t.Fatal(err)
	}
	wantPurseTold(t, e, referrer.UserID)
}

// A change that leaves the purse as it was tells the game nothing.
func TestAPurseLeftAsItWasTellsTheGameNothing(t *testing.T) {
	for _, c := range []struct {
		name   string
		change func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder
	}{
		{"an unknown code", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return redeem(mux, cookie, "nosuchcode")
		}},
		{"an item voucher", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			q := store.New(db)
			item, err := q.GetFurniDefinitionBySprite(t.Context(), "throne")
			if err != nil {
				t.Fatal(err)
			}
			err = q.CreateVoucher(t.Context(), store.CreateVoucherParams{Code: "pursethrone", FurniDefinitionID: sql.NullInt64{Int64: item.ID, Valid: true}, CreatedAt: testNow})
			if err != nil {
				t.Fatal(err)
			}
			return redeem(mux, cookie, "pursethrone")
		}},
		{"the club without the credits", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			return buyClub(mux, cookie, 12)
		}},
		{"a group without the credits", func(t *testing.T, db *sql.DB, mux *http.ServeMux, cookie *http.Cookie) *httptest.ResponseRecorder {
			setSetting(t, db, "groups.price", 1000)
			return purchase(mux, cookie, "Purse Club", "We pay.")
		}},
	} {
		t.Run(c.name, func(t *testing.T) {
			e := &economy{}
			db, mux, cookie, _ := spender(t, e, 10)

			c.change(t, db, mux, cookie)
			wantPurseTold(t, e)
		})
	}
}

// A registration without a referral tells the game nothing: the new habbo is
// outside the hotel, and reads its start credits at its login.
func TestARegistrationTellsTheGameNothing(t *testing.T) {
	e := &economy{}
	_, mux := newEconomySite(t, e)

	wantRedirect(t, serve(mux, "POST", "/register", nil, registration()), "/me")
	wantPurseTold(t, e)
}

// The game fails, or gives no answer within 2 seconds: the purse is changed,
// the page answers as it does without the game, and the failure is logged.
func TestAFailingGameLeavesThePurseChanged(t *testing.T) {
	for _, c := range []struct {
		name string
		game *economy
	}{
		{"the game fails", &economy{err: errors.New("the game is down")}},
		{"the game gives no answer", &economy{hang: true}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux, cookie, userID := spender(t, c.game, 10)
			makeVoucher(t, db, "silent12", 50)
			logs := captureLog(t)

			start := time.Now()
			rec := redeem(mux, cookie, "silent12")
			if elapsed := time.Since(start); elapsed > 3*time.Second {
				t.Errorf("the page answered after %v, want the call to give up after 2 seconds", elapsed)
			}
			wantRedeemed(t, rec, http.StatusOK, 60, "You have redeemed 50 credits successfully.")
			if got := walletOf(t, db, userID); got != 60 {
				t.Errorf("the purse holds %d, want 10 + 50", got)
			}
			wantPurseTold(t, c.game, userID)
			if !strings.Contains(logs.String(), "send purse") {
				t.Errorf("the log holds no failure: %q", logs.String())
			}
		})
	}
}
