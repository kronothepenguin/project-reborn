package transport

import (
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/websocket"
)

const timeout = 10 * time.Second

// A client is the test's end of a connection: send writes p as one TCP write or one WebSocket
// frame, and recv returns the next bytes the server sent.
type client interface {
	send(p []byte) error
	recv() ([]byte, error)
	Close() error
	LocalAddr() net.Addr
}

type tcpClient struct{ net.Conn }

func (c tcpClient) send(p []byte) error {
	_, err := c.Write(p)
	return err
}

func (c tcpClient) recv() ([]byte, error) {
	b := make([]byte, 512)
	n, err := c.Read(b)
	return b[:n], err
}

type wsClient struct {
	*websocket.Conn
	conn net.Conn
}

func (c wsClient) send(p []byte) error { return websocket.Message.Send(c.Conn, p) }

func (c wsClient) sendText(s string) error { return websocket.Message.Send(c.Conn, s) }

func (c wsClient) recv() ([]byte, error) {
	var f wsFrame
	if err := wsFrames.Receive(c.Conn, &f); err != nil {
		return nil, err
	}
	if f.payloadType != websocket.BinaryFrame {
		return nil, fmt.Errorf("a frame of type %d, want binary (%d)", f.payloadType, websocket.BinaryFrame)
	}
	return f.payload, nil
}

func (c wsClient) LocalAddr() net.Addr { return c.conn.LocalAddr() }

type wsFrame struct {
	payload     []byte
	payloadType byte
}

var wsFrames = websocket.Codec{Unmarshal: func(data []byte, payloadType byte, v any) error {
	*v.(*wsFrame) = wsFrame{data, payloadType}
	return nil
}}

type dialer func(t *testing.T) client

func startTCP(t *testing.T, h Handler) dialer {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	served := make(chan error, 1)
	go func() { served <- ServeTCP(l, h) }()
	t.Cleanup(func() {
		l.Close()
		if err := <-served; err != nil {
			t.Errorf("ServeTCP: %v", err)
		}
	})
	return func(t *testing.T) client {
		c, err := net.DialTimeout("tcp", l.Addr().String(), timeout)
		if err != nil {
			t.Fatal(err)
		}
		t.Cleanup(func() { c.Close() })
		if err := c.SetDeadline(time.Now().Add(timeout)); err != nil {
			t.Fatal(err)
		}
		return tcpClient{c}
	}
}

func startWebSocket(t *testing.T, h Handler) dialer {
	srv := httptest.NewServer(WebSocket(h))
	t.Cleanup(srv.Close)
	return func(t *testing.T) client {
		return dialWebSocket(t, srv)
	}
}

func dialWebSocket(t *testing.T, srv *httptest.Server) wsClient {
	config, err := websocket.NewConfig("ws"+strings.TrimPrefix(srv.URL, "http")+"/", "http://localhost/")
	if err != nil {
		t.Fatal(err)
	}
	c, err := net.DialTimeout("tcp", srv.Listener.Addr().String(), timeout)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { c.Close() })
	if err := c.SetDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
	ws, err := websocket.NewClient(config, c)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ws.Close() })
	return wsClient{ws, c}
}

var transports = []struct {
	name  string
	start func(t *testing.T, h Handler) dialer
}{
	{"TCP", startTCP},
	{"WebSocket", startWebSocket},
}

func receive[T any](t *testing.T, ch <-chan T) (v T) {
	t.Helper()
	select {
	case v = <-ch:
	case <-time.After(timeout):
		t.Fatal("timed out waiting for the handler")
	}
	return v
}

func readInPieces(r io.Reader, n, piece int) ([]byte, error) {
	got := make([]byte, 0, n)
	buf := make([]byte, piece)
	for len(got) < n {
		k, err := r.Read(buf[:min(piece, n-len(got))])
		got = append(got, buf[:k]...)
		if err != nil {
			return got, err
		}
	}
	return got, nil
}

func recvAtLeast(c client, n int) ([]byte, error) {
	var got []byte
	for len(got) < n {
		b, err := c.recv()
		got = append(got, b...)
		if err != nil {
			return got, err
		}
	}
	return got, nil
}

func TestConnCarriesBytesBothWays(t *testing.T) {
	type received struct {
		split, joined string
		err           error
	}
	for _, tr := range transports {
		t.Run(tr.name, func(t *testing.T) {
			got := make(chan received, 1)
			dial := tr.start(t, func(c Conn) {
				split := make([]byte, 5)
				if _, err := io.ReadFull(c, split); err != nil {
					got <- received{err: err}
					return
				}
				joined, err := readInPieces(c, 10, 3)
				if err == nil {
					_, err = c.Write([]byte("@@"))
				}
				if err == nil {
					_, err = c.Write([]byte{1})
				}
				got <- received{string(split), string(joined), err}
			})
			cl := dial(t)
			for _, p := range []string{"@@B", "CN", "@@BCN@@BCN"} {
				if err := cl.send([]byte(p)); err != nil {
					t.Fatalf("send(%q): %v", p, err)
				}
			}
			b, err := recvAtLeast(cl, 3)
			if err != nil || string(b) != "@@\x01" {
				t.Errorf("the client received %q, %v, want %q", b, err, "@@\x01")
			}
			r := receive(t, got)
			if r.err != nil {
				t.Fatalf("the handler: %v", r.err)
			}
			if r.split != "@@BCN" {
				t.Errorf("a packet sent in two pieces read as %q, want %q", r.split, "@@BCN")
			}
			if r.joined != "@@BCN@@BCN" {
				t.Errorf("two packets sent at once read in pieces of 3 as %q, want %q", r.joined, "@@BCN@@BCN")
			}
		})
	}
}

func TestConnClosesWhenTheClientCloses(t *testing.T) {
	for _, tr := range transports {
		t.Run(tr.name, func(t *testing.T) {
			got := make(chan error, 1)
			dial := tr.start(t, func(c Conn) {
				_, err := c.Read(make([]byte, 8))
				got <- err
			})
			if err := dial(t).Close(); err != nil {
				t.Fatalf("Close: %v", err)
			}
			if err := receive(t, got); !errors.Is(err, io.EOF) {
				t.Errorf("Read after the client closed = %v, want io.EOF", err)
			}
		})
	}
}

func TestConnClosesWhenTheServerCloses(t *testing.T) {
	for _, tr := range transports {
		t.Run(tr.name, func(t *testing.T) {
			got := make(chan error, 1)
			dial := tr.start(t, func(c Conn) {
				go c.Close()
				_, err := c.Read(make([]byte, 8))
				got <- err
			})
			cl := dial(t)
			if err := receive(t, got); err == nil {
				t.Error("Read on a connection the server closed returned no error")
			}
			if b, err := cl.recv(); !errors.Is(err, io.EOF) {
				t.Errorf("the client received %q, %v, want io.EOF", b, err)
			}
		})
	}
}

func TestConnClosesWhenTheHandlerReturns(t *testing.T) {
	for _, tr := range transports {
		t.Run(tr.name, func(t *testing.T) {
			got := make(chan string, 1)
			dial := tr.start(t, func(c Conn) { got <- c.RemoteAddr() })
			cl := dial(t)
			if b, err := cl.recv(); !errors.Is(err, io.EOF) {
				t.Errorf("the client received %q, %v, want io.EOF", b, err)
			}
			if addr, want := receive(t, got), cl.LocalAddr().String(); addr != want {
				t.Errorf("RemoteAddr() = %q, want the client's address %q", addr, want)
			}
		})
	}
}

func TestWebSocketReadsTextFramesAsTheirBytes(t *testing.T) {
	type received struct {
		b   []byte
		err error
	}
	got := make(chan received, 1)
	srv := httptest.NewServer(WebSocket(func(c Conn) {
		b, err := io.ReadAll(c)
		got <- received{b, err}
	}))
	t.Cleanup(srv.Close)
	cl := dialWebSocket(t, srv)
	for _, s := range []string{"@@BCN", "é"} {
		if err := cl.sendText(s); err != nil {
			t.Fatalf("sendText(%q): %v", s, err)
		}
	}
	if err := cl.Close(); err != nil {
		t.Fatalf("Close: %v", err)
	}
	r := receive(t, got)
	if want := "@@BCN\xc3\xa9"; string(r.b) != want || r.err != nil {
		t.Errorf("text frames read as %q, %v, want %q", r.b, r.err, want)
	}
}

func TestWebSocketRefusesAMissingOrigin(t *testing.T) {
	srv := httptest.NewServer(WebSocket(func(c Conn) {}))
	t.Cleanup(srv.Close)
	for origin, want := range map[string]int{
		"":                  http.StatusForbidden,
		"http://localhost/": http.StatusSwitchingProtocols,
	} {
		req, err := http.NewRequest(http.MethodGet, srv.URL+"/", nil)
		if err != nil {
			t.Fatal(err)
		}
		req.Header.Set("Upgrade", "websocket")
		req.Header.Set("Connection", "Upgrade")
		req.Header.Set("Sec-WebSocket-Key", "dGhlIHNhbXBsZSBub25jZQ==")
		req.Header.Set("Sec-WebSocket-Version", "13")
		if origin != "" {
			req.Header.Set("Origin", origin)
		}
		resp, err := srv.Client().Do(req)
		if err != nil {
			t.Fatalf("Origin %q: %v", origin, err)
		}
		resp.Body.Close()
		if resp.StatusCode != want {
			t.Errorf("Origin %q: status %d, want %d", origin, resp.StatusCode, want)
		}
	}
}

func TestServeTCPReturnsNilOnceTheListenerCloses(t *testing.T) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	served := make(chan error, 1)
	go func() { served <- ServeTCP(l, func(c Conn) {}) }()
	l.Close()
	if err := receive(t, served); err != nil {
		t.Errorf("ServeTCP() = %v, want nil", err)
	}
}

func TestServeTCPReturnsAFailedAccept(t *testing.T) {
	want := errors.New("accept failed")
	if err := ServeTCP(failingListener{want}, func(c Conn) {}); !errors.Is(err, want) {
		t.Errorf("ServeTCP() = %v, want %v", err, want)
	}
}

type failingListener struct{ err error }

func (l failingListener) Accept() (net.Conn, error) { return nil, l.err }
func (l failingListener) Close() error              { return nil }
func (l failingListener) Addr() net.Addr            { return &net.TCPAddr{} }
