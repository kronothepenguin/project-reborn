package reborn

import (
	"bufio"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/websocket"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The behaviour: under reborn, a look or motto saved on the site or in
// housekeeping reaches the game in the same process.
func TestALookSavedOnTheSiteOrInHousekeepingReachesTheGame(t *testing.T) {
	avatarID := habbo(t, "Stylist")
	flat := room(t, avatarID)
	player := enterRoom(t, ticket(t, avatarID), flat)

	site := signIn(t, "Stylist")
	if status := post(t, site, hotel.site+"/account/looks", url.Values{"figure": {"hd-600-1.hr-500-61"}, "gender": {"F"}}); status != http.StatusOK {
		t.Fatalf("POST /account/looks = %d, want 200", status)
	}
	if body := player.until(t, 266); !strings.Contains(body, "hd-600-1.hr-500-61\x02F\x02") {
		t.Errorf("the room received 266 %q, want the look the site saved", body)
	}

	staff := signIn(t, "Admin")
	editor := hotel.site + "/housekeeping/habbos/" + strconv.FormatInt(avatarID, 10)
	if status := post(t, staff, editor, url.Values{"motto": {"Restyled by staff"}}); status != http.StatusOK {
		t.Fatalf("POST %s = %d, want 200 after the redirect", editor, status)
	}
	if body := player.until(t, 266); !strings.Contains(body, "hd-600-1.hr-500-61\x02F\x02Restyled by staff\x02") {
		t.Errorf("the room received 266 %q, want the motto housekeeping saved", body)
	}
}

// habbo makes a user with the habbo name, without a staff group, who signs in
// with the password secret123, and returns the habbo's id.
func habbo(t *testing.T, name string) int64 {
	t.Helper()
	_, avatarID, err := auth.CreateAccount(t.Context(), store.New(hotel.db), auth.Account{
		Email:        strings.ToLower(name) + "@example.com",
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		IP:           "127.0.0.1",
		PasswordHash: auth.HashPassword("secret123"),
		Habbo:        auth.Habbo{Name: name, Figure: "hd-180-1", Gender: "M"},
	})
	if err != nil {
		t.Fatalf("CreateAccount: %v", err)
	}
	return avatarID
}

// room makes an open habbo room of owner, and returns its id.
func room(t *testing.T, owner int64) int64 {
	t.Helper()
	r, err := store.New(hotel.db).CreateRoom(t.Context(), store.CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Fitting Room", Door: "open", ShowOwner: true, CreatedAt: time.Now().UTC()})
	if err != nil {
		t.Fatalf("CreateRoom: %v", err)
	}
	return r.ID
}

// ticket gives the habbo a session and an SSO ticket on it, as the site's
// client page does, and returns the ticket.
func ticket(t *testing.T, avatarID int64) string {
	t.Helper()
	q := store.New(hotel.db)
	avatar, err := q.GetAvatar(t.Context(), avatarID)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Now().UTC()
	session, id := "game-"+avatar.Name, "ticket-"+avatar.Name
	err = q.CreateSession(t.Context(), store.CreateSessionParams{ID: session, UserID: avatar.UserID, AvatarID: avatarID, IP: "127.0.0.1", CreatedAt: now, LastSeenAt: now, ExpiresAt: now.Add(time.Hour)})
	if err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	if err := q.CreateSSOTicket(t.Context(), store.CreateSSOTicketParams{ID: id, SessionID: session, AvatarID: avatarID, IP: "127.0.0.1", CreatedAt: now}); err != nil {
		t.Fatalf("CreateSSOTicket: %v", err)
	}
	return id
}

// enterRoom logs in to the game with ticket and walks into the open habbo room
// flat, as the client does.
func enterRoom(t *testing.T, ticket string, flat int64) *game {
	t.Helper()
	g := dialGame(t, hotel.info)
	g.until(t, 0)
	g.send(t, 206, "")
	g.until(t, 278)
	g.send(t, 1170, vl64(1)+b64String("")+b64String(""))
	g.send(t, 813, b64String("machine"))
	g.send(t, 1817, "")
	g.until(t, 257)
	g.send(t, 204, b64String(ticket))
	g.until(t, 3)

	id := strconv.FormatInt(flat, 10)
	g.send(t, 2, "@"+vl64(int32(flat))+vl64(0))
	g.until(t, 19)
	g.send(t, 57, id)
	g.until(t, 41)
	g.send(t, 59, id)
	g.until(t, 370)
	for _, step := range [][2]int{{60, 31}, {61, 28}, {62, 30}, {63, 45}} {
		g.send(t, step[0], "")
		g.until(t, step[1])
	}
	g.send(t, 64, "")
	g.until(t, 28)
	return g
}

// game is a client of the game that speaks R26 over a WebSocket, as the
// client's fuse_client does.
type game struct {
	conn net.Conn
	ws   *websocket.Conn
	r    *bufio.Reader
}

// dialGame opens a WebSocket to the game listener on port.
func dialGame(t *testing.T, port int) *game {
	t.Helper()
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	cfg, err := websocket.NewConfig("ws://"+conn.RemoteAddr().String()+"/", "http://localhost/")
	if err != nil {
		t.Fatal(err)
	}
	ws, err := websocket.NewClient(cfg, conn)
	if err != nil {
		t.Fatal(err)
	}
	ws.PayloadType = websocket.BinaryFrame
	return &game{conn: conn, ws: ws, r: bufio.NewReader(ws)}
}

// send writes a command in one frame: 3 B64 characters of length, 2 of the id,
// then the body.
func (g *game) send(t *testing.T, id int, body string) {
	t.Helper()
	if _, err := g.ws.Write([]byte(b64(len(body)+2, 3) + b64(id, 2) + body)); err != nil {
		t.Fatal(err)
	}
}

// receive reads a message: 2 B64 characters of the id, then the body up to the
// character 1, which ends it.
func (g *game) receive(t *testing.T) (id int, body string) {
	t.Helper()
	if err := g.conn.SetReadDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
	head := make([]byte, 2)
	for i := range head {
		b, err := g.r.ReadByte()
		if err != nil {
			t.Fatalf("receive: %v", err)
		}
		head[i] = b
	}
	text, err := g.r.ReadString(1)
	if err != nil {
		t.Fatalf("receive: %v", err)
	}
	return int(head[0]-64)<<6 | int(head[1]-64), strings.TrimSuffix(text, "\x01")
}

// until reads messages up to the first with id, and returns its body.
func (g *game) until(t *testing.T, id int) string {
	t.Helper()
	for {
		if got, body := g.receive(t); got == id {
			return body
		}
	}
}

// b64 writes v in n characters of 6 bits each, from 64 up.
func b64(v, n int) string {
	b := make([]byte, n)
	for i := range n {
		b[i] = byte(64 + (v>>(6*(n-1-i)))&63)
	}
	return string(b)
}

// b64String writes s as the client's sendNew writes a #string: its length in 2
// B64 characters, then s.
func b64String(s string) string {
	return b64(len(s), 2) + s
}

// vl64 writes each value as the client's VL64: the first character holds the
// count of characters, the sign and the 2 low bits, the next ones 6 bits each.
func vl64(values ...int32) string {
	var out []byte
	for _, v := range values {
		abs := int64(v)
		var sign byte
		if abs < 0 {
			abs, sign = -abs, 4
		}
		b := []byte{64 | sign | byte(abs&3)}
		for abs >>= 2; abs != 0; abs >>= 6 {
			b = append(b, 64|byte(abs&63))
		}
		b[0] |= byte(len(b)) << 3
		out = append(out, b...)
	}
	return string(out)
}
