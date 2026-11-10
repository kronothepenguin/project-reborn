package server

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// S2's first exit criterion, in one session: a Go test client logs in with a ticket it inserts, from HELLO through the
// handshake without encryption, the version check, the session parameters, SSO and LOGIN_OK, then gets the user object,
// the fuses, the credits, the badges, the sound setting and the club status; it answers pings, and a second login ends
// its session with 287.
func TestAClientLogsInEndToEnd(t *testing.T) {
	pingEvery(t, 1, 3)
	id := habboWithTickets(t, "Endtoend", "end-1", "end-2")
	c := dial(t, infoPort)
	c.expectMessage(t, 0, "")
	c.send(t, 206, "")
	for _, want := range []int{277, 278} {
		if got, _ := c.next(t); got != want {
			t.Fatalf("received %d, want %d", got, want)
		}
	}
	c.write(t, append(append(packet(t, 1170, versionCheck(t, 1, "", "")), packet(t, 813, b64String(t, "machine"))...), packet(t, 1817, "")...))
	if got, _ := c.next(t); got != 257 {
		t.Fatalf("received %d, want the session parameters, 257", got)
	}
	c.send(t, 204, b64String(t, "end-1"))
	for _, want := range []int{2, 3} {
		if got, _ := c.next(t); got != want {
			t.Fatalf("received %d, want %d", got, want)
		}
	}

	for command, answer := range map[int]int{7: 5, 8: 6, 157: 229, 228: 308, 26: 7} {
		c.send(t, command, "")
		if got, _ := c.next(t); got != answer {
			t.Errorf("command %d got %d, want %d", command, got, answer)
		}
	}

	c.expectMessage(t, 50, "")
	c.send(t, 196, "")
	c.expectMessage(t, 50, "")
	c.send(t, 196, "")

	second, _ := login(t, "end-2")
	if got, body := c.next(t); got != 287 || body != "J" {
		t.Errorf("the first session got %d %q, want 287 with reason 2", got, body)
	}
	c.expectClosed(t)
	second.send(t, 7, "")
	if got, body := second.next(t); got != 5 || !strings.HasPrefix(body, fmt.Sprint(id)+"") {
		t.Errorf("the second session got %d %q, want its user object", got, body)
	}
}

// signIn signs in to the CMS as the habbo name and returns the session's cookie.
func signIn(t *testing.T, name, password string) *http.Cookie {
	t.Helper()
	rec := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	r.RemoteAddr = "10.0.0.1:51234"
	if _, err := auth.Login(rec, r, testDB, name, password, false); err != nil {
		t.Fatalf("auth.Login: %v", err)
	}
	for _, cookie := range rec.Result().Cookies() {
		if cookie.Value != "" {
			return cookie
		}
	}
	t.Fatal("the sign-in set no cookie")
	return nil
}

// ssoTicket is the ticket the client page gets for the CMS session of cookie.
func ssoTicket(t *testing.T, cookie *http.Cookie) string {
	t.Helper()
	var ticket string
	page := auth.Sessions(testDB)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var err error
		if ticket, err = auth.SSOTicket(r, testDB); err != nil {
			t.Errorf("auth.SSOTicket: %v", err)
		}
	}))
	r := httptest.NewRequest(http.MethodGet, "/client", nil)
	r.RemoteAddr = "10.0.0.1:51234"
	r.AddCookie(cookie)
	page.ServeHTTP(httptest.NewRecorder(), r)
	return ticket
}

func ssoLogin(t *testing.T, ticket string) (id int, body string) {
	t.Helper()
	c := dial(t, infoPort)
	c.handshake(t, versionCheck(t, 1, "", ""))
	c.next(t)
	c.send(t, 204, b64String(t, ticket))
	return c.next(t)
}

// S2's second exit criterion: signing in to the CMS creates a ticket that the server accepts once, and that dies with
// the CMS session.
func TestACMSSignInMakesATicketTheServerAcceptsOnce(t *testing.T) {
	const password = "a-good-password"
	err := func() error {
		_, _, err := auth.CreateAccount(t.Context(), store.New(testDB), auth.Account{
			Email: "cms@example.com", BornOn: time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC), IP: "10.0.0.1",
			PasswordHash: auth.HashPassword(password), Habbo: auth.Habbo{Name: "Signed", Figure: "hd-180-1", Gender: "M"},
		})
		return err
	}()
	if err != nil {
		t.Fatalf("auth.CreateAccount: %v", err)
	}
	cookie := signIn(t, "Signed", password)

	ticket := ssoTicket(t, cookie)
	if id, _ := ssoLogin(t, ticket); id != 2 {
		t.Errorf("the CMS's ticket got %d, want the fuses, then LOGIN_OK", id)
	}
	if id, body := ssoLogin(t, ticket); id != 33 || body != "login incorrect" {
		t.Errorf("the spent ticket got %d %q, want 33 login incorrect", id, body)
	}

	next := ssoTicket(t, cookie)
	r := httptest.NewRequest(http.MethodPost, "/logout", nil)
	r.AddCookie(cookie)
	if err := auth.Logout(httptest.NewRecorder(), r, testDB); err != nil {
		t.Fatalf("auth.Logout: %v", err)
	}
	if id, body := ssoLogin(t, next); id != 33 || body != "login incorrect" {
		t.Errorf("a ticket of an ended CMS session got %d %q, want 33 login incorrect", id, body)
	}
}
