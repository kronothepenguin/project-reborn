package server

import (
	"database/sql"
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// habboWithTickets makes a user who takes the newsletter, with an empty wallet and the habbo name, signed in to the CMS
// on a session of its own that holds tickets, as the CMS would, and returns the habbo's id.
func habboWithTickets(t *testing.T, name string, tickets ...string) int64 {
	t.Helper()
	ctx := t.Context()
	q := store.New(testDB)
	now := time.Now().UTC()
	user, err := q.CreateUser(ctx, store.CreateUserParams{Email: strings.ToLower(name) + "@example.com", BornOn: time.Date(2000, 1, 2, 0, 0, 0, 0, time.UTC), Newsletter: true, CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateUser: %v", err)
	}
	if err := q.CreateWallet(ctx, store.CreateWalletParams{UserID: user.ID, UpdatedAt: now}); err != nil {
		t.Fatalf("CreateWallet: %v", err)
	}
	avatar, err := q.CreateAvatar(ctx, store.CreateAvatarParams{UserID: user.ID, Name: name, Figure: "hd-180-1", Gender: "M", Motto: "Hello", CreatedAt: now, UpdatedAt: now})
	if err != nil {
		t.Fatalf("CreateAvatar: %v", err)
	}
	session := "cms-" + name
	err = q.CreateSession(ctx, store.CreateSessionParams{ID: session, UserID: user.ID, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now, LastSeenAt: now, ExpiresAt: now.Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	for _, ticket := range tickets {
		err := q.CreateSSOTicket(ctx, store.CreateSSOTicketParams{ID: ticket, SessionID: session, AvatarID: avatar.ID, IP: "127.0.0.1", CreatedAt: now})
		if err != nil {
			t.Fatalf("CreateSSOTicket: %v", err)
		}
	}
	return avatar.ID
}

// versionCheck is the body of VERSIONCHECK, as the client's sendNew writes it.
func versionCheck(t *testing.T, version int32, clientURL, variablesURL string) string {
	t.Helper()
	var b strings.Builder
	if err := encoding.WriteVL64(&b, version); err != nil {
		t.Fatal(err)
	}
	return b.String() + b64String(t, clientURL) + b64String(t, variablesURL)
}

// expect reads exactly the bytes of want.
func (c *client) expect(t *testing.T, want string) {
	t.Helper()
	got := make([]byte, len(want))
	if _, err := io.ReadFull(c.r, got); err != nil || string(got) != want {
		t.Fatalf("received %q, %v; want %q", got, err, want)
	}
}

func (c *client) expectMessage(t *testing.T, wantID int, wantBody string) {
	t.Helper()
	if id, body := c.receive(t); id != wantID || body != wantBody {
		t.Fatalf("received %d %q, want %d %q", id, body, wantID, wantBody)
	}
}

// expectClosed reads the end of the connection, which the server closed.
func (c *client) expectClosed(t *testing.T) {
	t.Helper()
	if b, err := c.r.ReadByte(); !errors.Is(err, io.EOF) {
		t.Fatalf("read %q, %v; want io.EOF once the server closed the connection", b, err)
	}
}

// handshake takes c from HELLO to its version check, which it sends with the commands the client sends with it.
func (c *client) handshake(t *testing.T, check string) {
	t.Helper()
	c.expectMessage(t, 0, "")
	c.send(t, 206, "")
	c.expectMessage(t, 277, "H")
	c.expectMessage(t, 278, "")
	c.write(t, append(append(packet(t, 1170, check), packet(t, 813, b64String(t, "machine"))...), packet(t, 1817, "")...))
}

// login opens a client that logs in with ticket, and returns it with the fuses that came before LOGIN_OK.
func login(t *testing.T, ticket string) (*client, string) {
	t.Helper()
	c := dial(t, infoPort)
	c.handshake(t, versionCheck(t, 1, "", ""))
	if id, _ := c.receive(t); id != 257 {
		t.Fatalf("received %d, want 257", id)
	}
	c.send(t, 204, b64String(t, ticket))
	id, fuses := c.receive(t)
	if id != 2 {
		t.Fatalf("received %d, want the fuses, 2", id)
	}
	c.expectMessage(t, 3, "")
	return c, fuses
}

func eventually(t *testing.T, what string, done func() bool) {
	t.Helper()
	for deadline := time.Now().Add(timeout); !done(); {
		if time.Now().After(deadline) {
			t.Fatalf("still not %s", what)
		}
		time.Sleep(10 * time.Millisecond)
	}
}

// The bytes of packages/server/knowledge/r26/hh_entry_init.md, from HELLO to LOGIN_OK, with the default session
// parameters: every flag 0 but profile editing, the date format dd-mm-yyyy and an empty tracking header. Every habbo's
// fuses come before LOGIN_OK.
func TestTheHandshakeAndTheLoginInBytes(t *testing.T) {
	id := habboWithTickets(t, "Bytes", "abc")
	c := dial(t, infoPort)
	c.expect(t, "@@\x01")
	c.write(t, []byte("@@BCN"))
	c.expect(t, "DUH\x01DV\x01")
	c.write(t, []byte("@@F_R@Bab"))
	logged.wait(t, "r26 "+c.addr+" unhandled GENERATEKEY (2002), 4 bytes")
	c.write(t, []byte("@@GRRI@@@@@@GLm@Cabc@@B\\Y"))
	c.expect(t, "DARBHHIHJHKHPAHQAdd-mm-yyyy\x02RAHSAIPB\x02QBH\x01")
	c.write(t, []byte("@@GCL@Cabc"))
	c.expect(t, "@Bfuse_trade\x02fuse_buy_credits\x02\x01@C\x01")

	if h, ok := habbo.Get(id); !ok || h.Name != "Bytes" {
		t.Errorf("habbo.Get = %+v, %t; want Bytes online", h, ok)
	}
	data, err := store.New(testDB).GetAvatarGameData(t.Context(), id)
	if err != nil || data.MachineID != (sql.NullString{String: "abc", Valid: true}) || !data.LastOnlineAt.Valid {
		t.Errorf("game data = %+v, %v; want the machine id abc and the last time online", data, err)
	}
}

func TestAClientWithTheAcceptedVersionGoesOnWhereverItWasLoadedFrom(t *testing.T) {
	site := settings.GetString("site.url")
	for name, check := range map[string]string{
		"empty URLs":       versionCheck(t, 1, "", ""),
		"the site":         versionCheck(t, 1, site+"/client", site+"/dcr/external_variables.txt"),
		"another host":     versionCheck(t, 1, "http://hotel.example.com:8080/client", "http://hotel.example.com:8080/dcr/external_variables.txt"),
		"another site URL": versionCheck(t, 1, site+".example.com/client", "http://example.com/external_variables.txt"),
	} {
		t.Run(name, func(t *testing.T) {
			c := dial(t, infoPort)
			c.handshake(t, check)
			if id, _ := c.receive(t); id != 257 {
				t.Errorf("received %d, want 257", id)
			}
		})
	}
}

// A wrong client gets 33 Version not correct, and the server closes the connection before it answers the
// GET_SESSION_PARAMETERS that came with the check (decision server/0049).
func TestAClientWithAnotherVersionIsClosedAfterItsError(t *testing.T) {
	site := settings.GetString("site.url")
	for name, check := range map[string]string{
		"another version":  versionCheck(t, 2, site+"/client", site+"/dcr/external_variables.txt"),
		"a body cut short": "I",
	} {
		t.Run(name, func(t *testing.T) {
			c := dial(t, infoPort)
			c.handshake(t, check)
			c.expectMessage(t, 33, "Version not correct")
			c.expectClosed(t)
		})
	}
}

func TestAnSSOBeforeTheVersionCheckIsTurnedAway(t *testing.T) {
	id := habboWithTickets(t, "Early", "early")
	c := dial(t, infoPort)
	c.expectMessage(t, 0, "")
	c.send(t, 204, b64String(t, "early"))
	c.expectMessage(t, 33, "Version not correct")
	c.expectClosed(t)
	if _, ok := habbo.Get(id); ok {
		t.Error("Early logged in without a version check")
	}
}

func TestATicketLogsInOnce(t *testing.T) {
	habboWithTickets(t, "Once", "once")
	login(t, "once")

	for _, ticket := range []string{"once", "unknown"} {
		c := dial(t, infoPort)
		c.handshake(t, versionCheck(t, 1, "", ""))
		c.receive(t)
		c.send(t, 204, b64String(t, ticket))
		c.expectMessage(t, 33, "login incorrect")
	}
}

func TestTryLoginIsAlwaysIncorrect(t *testing.T) {
	habboWithTickets(t, "Typed")
	c := dial(t, infoPort)
	c.handshake(t, versionCheck(t, 1, "", ""))
	c.receive(t)
	c.send(t, 756, b64String(t, "Typed")+b64String(t, "password"))
	c.expectMessage(t, 33, "login incorrect")
}

// A second login ends the first session with 287, reason 2, and closes it; the habbo stays online on the second
// until that one leaves (decision server/0029).
func TestASecondLoginEndsTheFirstSession(t *testing.T) {
	id := habboWithTickets(t, "Twice", "twice-1", "twice-2")
	first, _ := login(t, "twice-1")
	second, _ := login(t, "twice-2")

	first.expectMessage(t, 287, "J")
	first.expectClosed(t)
	if _, ok := habbo.Get(id); !ok {
		t.Fatal("Twice went offline when the first session closed")
	}

	left := time.Now().UTC()
	second.ws.Close()
	eventually(t, "offline", func() bool {
		_, ok := habbo.Get(id)
		return !ok
	})
	data, err := store.New(testDB).GetAvatarGameData(t.Context(), id)
	if err != nil || data.LastOnlineAt.Time.Before(left) {
		t.Errorf("last time online = %v, %v; want the time Twice left", data.LastOnlineAt, err)
	}
}
