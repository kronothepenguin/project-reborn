package server

import (
	"bufio"
	"bytes"
	"net"
	"strconv"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/websocket"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
)

const timeout = 5 * time.Second

// client is a test client that speaks R26 over a WebSocket, as the client's fuse_client does on LibreShockwave: it
// frames each command with its length and reads each message up to its character 1. Every write is one binary frame,
// and nothing ties a frame to a packet.
type client struct {
	ws   *websocket.Conn
	r    *bufio.Reader
	addr string
}

// dial opens a WebSocket to the listener on port, from an address of its own, which the server logs as the client's.
func dial(t *testing.T, port int) *client {
	t.Helper()
	conn, err := net.DialTimeout("tcp", net.JoinHostPort("127.0.0.1", strconv.Itoa(port)), timeout)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { conn.Close() })
	if err := conn.SetDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
	config, err := websocket.NewConfig("ws://"+conn.RemoteAddr().String()+"/", "http://localhost/")
	if err != nil {
		t.Fatal(err)
	}
	ws, err := websocket.NewClient(config, conn)
	if err != nil {
		t.Fatal(err)
	}
	ws.PayloadType = websocket.BinaryFrame
	return &client{ws: ws, r: bufio.NewReader(ws), addr: conn.LocalAddr().String()}
}

// send writes a command as the client's send does: 3 B64 characters of length, 2 of the id, then the body.
func (c *client) send(t *testing.T, id int, body string) {
	t.Helper()
	c.write(t, packet(t, id, body))
}

// write sends p in one frame.
func (c *client) write(t *testing.T, p []byte) {
	t.Helper()
	if _, err := c.ws.Write(p); err != nil {
		t.Fatal(err)
	}
}

// receive reads a message as the client's msghandler does: 2 B64 characters of the id, then the body up to the
// character 1, which ends it.
func (c *client) receive(t *testing.T) (id int, body string) {
	t.Helper()
	id, err := encoding.ReadB64(c.r, 2)
	if err != nil {
		t.Fatalf("receive: %v", err)
	}
	b, err := c.r.ReadString(1)
	if err != nil {
		t.Fatalf("receive: %v", err)
	}
	return id, strings.TrimSuffix(b, "\x01")
}

func packet(t *testing.T, id int, body string) []byte {
	t.Helper()
	var b bytes.Buffer
	if err := encoding.WriteB64(&b, 2+len(body), 3); err != nil {
		t.Fatal(err)
	}
	if err := encoding.WriteB64(&b, id, 2); err != nil {
		t.Fatal(err)
	}
	b.WriteString(body)
	return b.Bytes()
}

// b64String writes s as the client's sendNew writes a #string.
func b64String(t *testing.T, s string) string {
	t.Helper()
	var b strings.Builder
	if err := encoding.WriteB64String(&b, s); err != nil {
		t.Fatal(err)
	}
	return b.String()
}
