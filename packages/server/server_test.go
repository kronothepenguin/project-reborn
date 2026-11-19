package server

import (
	"bytes"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

var (
	logged                     = newRecorder()
	infoPort, musPort, apiPort int
	testDB                     *sql.DB
	testServer                 *Server
)

// config.Load reads config.json once per process, so the whole package shares one file. It puts info, mus and api on
// ports of the loopback interface that were free when the tests started, and the listeners start before any test runs,
// on one database that every test shares.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "server-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	ports := freePorts(3)
	infoPort, musPort, apiPort = ports[0], ports[1], ports[2]
	cfg := fmt.Sprintf(`{"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}, "api": {"host": "127.0.0.1", "port": %d}}}`, infoPort, musPort, apiPort)
	if err := os.WriteFile(config.Filename, []byte(cfg), 0o644); err != nil {
		log.Fatal(err)
	}
	testDB, err = store.Open(filepath.Join(dir, "hotel.db"))
	if err != nil {
		log.Fatal(err)
	}
	defer testDB.Close()
	// Every stop holds each connection after its notice; a short hold keeps the tests within their deadlines.
	noticeHold = 300 * time.Millisecond
	s := New(testDB, WithAPI())
	testServer = s
	if err := s.Start(context.Background()); err != nil {
		log.Fatal(err)
	}
	slog.SetDefault(slog.New(logged))
	m.Run()
}

// freePorts holds every port it takes until it has n, so that none repeats.
func freePorts(n int) []int {
	ports := make([]int, n)
	for i := range n {
		l, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			log.Fatal(err)
		}
		defer l.Close()
		ports[i] = l.Addr().(*net.TCPAddr).Port
	}
	return ports
}

// S0's exit criterion: a client of the info listener receives HELLO, and a command that nothing handles is logged by
// name. INIT_CRYPTO was that command until s2-06 answered it; GET_PASSWORD, which no script sends, stays unhandled.
func TestInfoSendsHelloAndLogsAnUnhandledCommandByName(t *testing.T) {
	c := dial(t, infoPort)
	if id, body := c.receive(t); id != 0 || body != "" {
		t.Fatalf("received %d %q, want HELLO, 0 with no body", id, body)
	}
	c.send(t, 47, "")
	logged.wait(t, "r26 "+c.addr+" unhandled GET_PASSWORD (47), 0 bytes")
}

// Packets share frames and spread over several, and each is logged in the order it came.
func TestInfoReadsPacketsWhateverTheFrames(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	c.write(t, append(packet(t, 47, ""), packet(t, 2002, b64String(t, "ab"))...))
	langCheck := packet(t, 58, b64String(t, "word"))
	c.write(t, langCheck[:4])
	c.write(t, langCheck[4:])
	last := -1
	for _, want := range []string{"GET_PASSWORD (47), 0 bytes", "GENERATEKEY (2002), 4 bytes", "LANGCHECK (58), 6 bytes"} {
		line := "r26 " + c.addr + " unhandled " + want
		logged.wait(t, line)
		i := slices.Index(logged.all(), line)
		if i < last {
			t.Errorf("%q was logged out of order", line)
		}
		last = i
	}
}

// TRY_LOGIN carries the typed password, SSO the ticket, and an unhandled command what a player typed: none of them
// reaches the log (decision server/0021).
func TestInfoNeverLogsABody(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	c.send(t, 756, b64String(t, "habbo")+b64String(t, "hunter2"))
	if id, body := c.receive(t); id != 33 || body != "login incorrect" {
		t.Errorf("TRY_LOGIN got %d %q, want 33 login incorrect", id, body)
	}
	c.send(t, 58, b64String(t, "hunter2"))
	logged.wait(t, "r26 "+c.addr+" unhandled LANGCHECK (58), 9 bytes")
	c.send(t, 204, b64String(t, "the-sso-ticket"))
	if id, body := c.receive(t); id != 33 || body != "Version not correct" {
		t.Errorf("SSO before VERSIONCHECK got %d %q, want 33 Version not correct", id, body)
	}
	for _, line := range logged.all() {
		if strings.Contains(line, "hunter2") || strings.Contains(line, "the-sso-ticket") {
			t.Errorf("the log holds a body: %q", line)
		}
	}
}

func TestInfoClosesOnlyTheSessionWithAMalformedLength(t *testing.T) {
	bad, good := dial(t, infoPort), dial(t, infoPort)
	bad.receive(t)
	good.receive(t)
	bad.write(t, []byte("@@A"))
	if _, err := bad.r.ReadByte(); !errors.Is(err, io.EOF) {
		t.Errorf("the session with a malformed length read %v, want io.EOF once the server closed it", err)
	}
	logged.wait(t, "r26 "+bad.addr+" closed: encoding: malformed value: a packet length of 1, too short for its id")
	good.send(t, 47, "")
	logged.wait(t, "r26 "+good.addr+" unhandled GET_PASSWORD (47), 0 bytes")
}

// Until S7 frames MUS, the mus listener logs what a client sends and never answers (decision server/0023).
func TestMusLogsWhatItReceivesAndNeverAnswers(t *testing.T) {
	c := dial(t, musPort)
	logged.wait(t, "mus "+c.addr+" connected")
	c.write(t, bytes.Repeat([]byte{'m'}, 11))
	logged.wait(t, "mus "+c.addr+" received 11 bytes")
	c.write(t, []byte{'m'})
	logged.wait(t, "mus "+c.addr+" received 1 byte")
	if err := c.ws.SetReadDeadline(time.Now().Add(200 * time.Millisecond)); err != nil {
		t.Fatal(err)
	}
	if n, err := c.ws.Read(make([]byte, 16)); n != 0 || !isTimeout(err) {
		t.Errorf("the mus listener answered %d bytes, %v; want nothing until the read times out", n, err)
	}
	if err := c.ws.Close(); err != nil {
		t.Fatal(err)
	}
	logged.wait(t, "mus "+c.addr+" closed")
}

func isTimeout(err error) bool {
	ne, ok := errors.AsType[net.Error](err)
	return ok && ne.Timeout()
}

// The listeners of TestMain hold both ports.
func TestStartReturnsAnErrorWhenItCannotListen(t *testing.T) {
	s := New(testDB)
	if err := s.Start(t.Context()); err == nil || !strings.HasPrefix(err.Error(), "server: info: ") {
		t.Errorf("Start on ports in use = %v, want an error", err)
	}
	if status, _ := s.Status(t.Context()); status.Running {
		t.Error("a game that could not listen says its doors are open")
	}
}
