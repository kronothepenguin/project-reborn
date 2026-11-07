package r26

import (
	"bytes"
	"errors"
	"io"
	"log/slog"
	"net"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
)

const timeout = 5 * time.Second

var logged = newRecorder()

func TestMain(m *testing.M) {
	slog.SetDefault(slog.New(logged))
	m.Run()
}

type pipeConn struct {
	net.Conn
	addr string
}

func (c pipeConn) RemoteAddr() string { return c.addr }

// start serves a session over a pipe, as the client at addr, and returns the client's end once it has read HELLO.
// Like the transport, it closes the server's end once serve returns, and then closes done.
func start(t *testing.T, addr string, handlers map[int]handler) (client net.Conn, done <-chan struct{}) {
	t.Helper()
	server, client := net.Pipe()
	served := make(chan struct{})
	go func() {
		defer close(served)
		defer server.Close()
		serve(pipeConn{server, addr}, handlers)
	}()
	t.Cleanup(func() {
		client.Close()
		<-served
	})
	if err := client.SetDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
	hello := make([]byte, 3)
	if _, err := io.ReadFull(client, hello); err != nil || string(hello) != "@@\x01" {
		t.Fatalf("the session opened with %q, %v; want HELLO, @@\\x01", hello, err)
	}
	return client, served
}

// packet frames a command as the client's send does: 3 B64 characters of length, 2 of the id, then the body.
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

// write sends the packets in one write.
func write(t *testing.T, c net.Conn, packets ...[]byte) {
	t.Helper()
	if _, err := c.Write(bytes.Join(packets, nil)); err != nil {
		t.Fatal(err)
	}
}

func waitDone(t *testing.T, done <-chan struct{}) {
	t.Helper()
	select {
	case <-done:
	case <-time.After(timeout):
		t.Fatal("the session did not end")
	}
}

func TestServeSendsHelloFirst(t *testing.T) {
	start(t, t.Name(), nil)
}

func TestServeRunsTheHandlerOfEachIdInOrder(t *testing.T) {
	type call struct {
		id   int
		body string
	}
	calls := make(chan call, 3)
	record := func(id int) handler {
		return func(_ *session, body []byte) { calls <- call{id, string(body)} }
	}
	client, _ := start(t, t.Name(), map[int]handler{206: record(206), 2002: record(2002)})
	write(t, client, packet(t, 206, ""), packet(t, 2002, "@Bab"), packet(t, 206, ""))
	for _, want := range []call{{206, ""}, {2002, "@Bab"}, {206, ""}} {
		select {
		case got := <-calls:
			if got != want {
				t.Errorf("handled %v, want %v", got, want)
			}
		case <-time.After(timeout):
			t.Fatalf("nothing handled, want %v", want)
		}
	}
}

func TestServeLogsAPacketThatNoHandlerTakesAndGoesOn(t *testing.T) {
	client, _ := start(t, t.Name(), nil)
	write(t, client, packet(t, 206, ""))
	logged.wait(t, "r26 "+t.Name()+" unhandled INIT_CRYPTO (206), 0 bytes")
	write(t, client, packet(t, 315, "I"))
	logged.wait(t, "r26 "+t.Name()+" unhandled TEST_LATENCY (315), 1 byte")
	write(t, client, packet(t, 999, "abc"))
	logged.wait(t, "r26 "+t.Name()+" unhandled 999, 3 bytes")
}

// Until login is handled, TRY_LOGIN carries the typed password and SSO the ticket.
func TestServeNeverLogsABody(t *testing.T) {
	client, _ := start(t, t.Name(), nil)
	write(t, client,
		packet(t, 756, b64String(t, "habbo")+b64String(t, "hunter2")),
		packet(t, 204, b64String(t, "the-sso-ticket")),
	)
	logged.wait(t, "r26 "+t.Name()+" unhandled TRY_LOGIN (756), 16 bytes")
	logged.wait(t, "r26 "+t.Name()+" unhandled SSO (204), 16 bytes")
	for _, line := range logged.all() {
		if strings.Contains(line, "hunter2") || strings.Contains(line, "the-sso-ticket") {
			t.Errorf("the log holds a body: %q", line)
		}
	}
}

func TestSessionsDoNotWaitOnEachOther(t *testing.T) {
	started, release := make(chan struct{}), make(chan struct{})
	defer close(release)
	handlers := map[int]handler{315: func(*session, []byte) {
		close(started)
		<-release
	}}
	a, _ := start(t, t.Name()+"/a", handlers)
	write(t, a, packet(t, 315, "I"))
	select {
	case <-started:
	case <-time.After(timeout):
		t.Fatal("the handler of the first session did not start")
	}
	b, _ := start(t, t.Name()+"/b", handlers)
	write(t, b, packet(t, 206, ""))
	logged.wait(t, "r26 "+t.Name()+"/b unhandled INIT_CRYPTO (206), 0 bytes")
}

// A client that leaves is no error: it closes, and before that writes one byte 0.
func TestServeEndsQuietlyWhenTheClientLeaves(t *testing.T) {
	for name, leave := range map[string]func(net.Conn) error{
		"closing": func(c net.Conn) error { return c.Close() },
		"with the byte 0": func(c net.Conn) error {
			_, err := c.Write([]byte{0})
			return err
		},
	} {
		t.Run(name, func(t *testing.T) {
			client, done := start(t, t.Name(), nil)
			if err := leave(client); err != nil {
				t.Fatal(err)
			}
			waitDone(t, done)
			for _, line := range logged.all() {
				if strings.HasPrefix(line, "r26 "+t.Name()+" ") {
					t.Errorf("the session logged %q", line)
				}
			}
		})
	}
}

func TestServeClosesTheSessionOnAMalformedLength(t *testing.T) {
	client, done := start(t, t.Name(), nil)
	write(t, client, []byte("@@A"))
	waitDone(t, done)
	logged.wait(t, "r26 "+t.Name()+" closed: encoding: malformed value: a packet length of 1, too short for its id")
	if _, err := client.Read(make([]byte, 1)); !errors.Is(err, io.EOF) {
		t.Errorf("the client read %v, want io.EOF once the session closed", err)
	}
}

func TestServeClosesTheSessionOnAPacketCutShort(t *testing.T) {
	client, done := start(t, t.Name(), nil)
	write(t, client, []byte("@@F_R@B"))
	client.Close()
	waitDone(t, done)
	logged.wait(t, "r26 "+t.Name()+" closed: unexpected EOF")
}
