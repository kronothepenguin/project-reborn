package auth

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func (f *fixture) ssoTicket(t *testing.T, cookie *http.Cookie) string {
	t.Helper()
	session, ok, _ := f.visit(t, cookie)
	if !ok {
		t.Fatal("the cookie has no session")
	}
	r := httptest.NewRequest(http.MethodGet, "/client", nil)
	r.RemoteAddr = "10.0.0.1:51234"
	r = r.WithContext(context.WithValue(r.Context(), contextKey{}, session))
	ticket, err := SSOTicket(r, f.db)
	if err != nil {
		t.Fatalf("SSOTicket: %v", err)
	}
	return ticket
}

func (f *fixture) spend(t *testing.T, ticket string) (int64, error) {
	t.Helper()
	return store.New(f.db).SpendSSOTicket(t.Context(), store.SpendSSOTicketParams{ID: ticket, Now: f.now})
}

func TestSignInMakesAnSSOTicketThatIsSpentOnce(t *testing.T) {
	f := newFixture(t)
	_, avatarID := f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)
	if n := f.count(t, "SELECT COUNT(*) FROM sso_tickets WHERE avatar_id = ?", avatarID); n != 1 {
		t.Fatalf("a sign-in made %d tickets, want 1", n)
	}

	ticket := f.ssoTicket(t, cookie)
	if again := f.ssoTicket(t, cookie); again != ticket {
		t.Errorf("the client page got %q, then %q; want the sign-in's ticket twice", ticket, again)
	}
	if got, err := f.spend(t, ticket); err != nil || got != avatarID {
		t.Fatalf("spending the ticket = %d, %v; want %d", got, err, avatarID)
	}
	if _, err := f.spend(t, ticket); !store.IsNotFound(err) {
		t.Errorf("spending it again = %v, want not found", err)
	}

	next := f.ssoTicket(t, cookie)
	if next == ticket {
		t.Fatal("the client page got the spent ticket again")
	}
	if got, err := f.spend(t, next); err != nil || got != avatarID {
		t.Errorf("spending the new ticket = %d, %v; want %d", got, err, avatarID)
	}
}

func TestSwitchingHabboDropsTheSessionsTicket(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	second := f.avatar(t, userID, "AdminToo")
	cookie := f.mustLogin(t, "Admin", false)
	old := f.ssoTicket(t, cookie)
	session, _, _ := f.visit(t, cookie)

	if err := SwitchHabbo(context.WithValue(t.Context(), contextKey{}, session), f.db, second); err != nil {
		t.Fatalf("SwitchHabbo: %v", err)
	}
	if _, err := f.spend(t, old); !store.IsNotFound(err) {
		t.Errorf("spending the ticket of the habbo the session left = %v, want not found", err)
	}
	if got, err := f.spend(t, f.ssoTicket(t, cookie)); err != nil || got != second {
		t.Errorf("spending the new habbo's ticket = %d, %v; want %d", got, err, second)
	}
}

func TestATicketDiesWithItsSession(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)
	ticket := f.ssoTicket(t, cookie)

	r := httptest.NewRequest(http.MethodPost, "/logout", nil)
	r.AddCookie(cookie)
	if err := Logout(httptest.NewRecorder(), r, f.db); err != nil {
		t.Fatalf("Logout: %v", err)
	}
	if _, err := f.spend(t, ticket); !store.IsNotFound(err) {
		t.Errorf("spending the ticket of a logged-out session = %v, want not found", err)
	}
}

func TestSSOTicketNeedsASession(t *testing.T) {
	f := newFixture(t)
	r := httptest.NewRequest(http.MethodGet, "/client", nil)
	if _, err := SSOTicket(r, f.db); !errors.Is(err, ErrNoSession) {
		t.Errorf("SSOTicket without a session = %v, want ErrNoSession", err)
	}
}
