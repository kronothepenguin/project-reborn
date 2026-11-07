package server

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net"
	"os"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/config"
)

var (
	logged            = newRecorder()
	infoPort, musPort int
)

// config.Load reads config.json once per process, so the whole package shares one file. It puts info and mus on ports
// of the loopback interface that were free when the tests started, and both listeners start before any test runs.
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "server-test-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(dir)
	if err := os.Chdir(dir); err != nil {
		log.Fatal(err)
	}
	ports := freePorts(2)
	infoPort, musPort = ports[0], ports[1]
	cfg := fmt.Sprintf(`{"server": {"info": {"host": "127.0.0.1", "port": %d}, "mus": {"host": "127.0.0.1", "port": %d}}}`, infoPort, musPort)
	if err := os.WriteFile(config.Filename, []byte(cfg), 0o644); err != nil {
		log.Fatal(err)
	}
	s := New(nil)
	if err := s.StartInfo(); err != nil {
		log.Fatal(err)
	}
	if err := s.StartMus(); err != nil {
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

// S0's exit criterion: a client of the info listener receives HELLO, and its INIT_CRYPTO, which nothing handles yet,
// is logged by name.
func TestInfoSendsHelloAndLogsInitCryptoByName(t *testing.T) {
	c := dial(t, infoPort)
	if id, body := c.receive(t); id != 0 || body != "" {
		t.Fatalf("received %d %q, want HELLO, 0 with no body", id, body)
	}
	c.send(t, 206, "")
	logged.wait(t, "r26 "+c.addr+" unhandled INIT_CRYPTO (206), 0 bytes")
}

// Packets share frames and spread over several, and each is logged in the order it came.
func TestInfoReadsPacketsWhateverTheFrames(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	c.write(t, append(packet(t, 206, ""), packet(t, 2002, b64String(t, "ab"))...))
	versionCheck := packet(t, 1170, "I@@@@")
	c.write(t, versionCheck[:4])
	c.write(t, versionCheck[4:])
	last := -1
	for _, want := range []string{"INIT_CRYPTO (206), 0 bytes", "GENERATEKEY (2002), 4 bytes", "VERSIONCHECK (1170), 5 bytes"} {
		line := "r26 " + c.addr + " unhandled " + want
		logged.wait(t, line)
		i := slices.Index(logged.all(), line)
		if i < last {
			t.Errorf("%q was logged out of order", line)
		}
		last = i
	}
}

// Until login is handled, TRY_LOGIN carries the typed password and SSO the ticket (decision 0021).
func TestInfoNeverLogsABody(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	c.send(t, 756, b64String(t, "habbo")+b64String(t, "hunter2"))
	c.send(t, 204, b64String(t, "the-sso-ticket"))
	logged.wait(t, "r26 "+c.addr+" unhandled TRY_LOGIN (756), 16 bytes")
	logged.wait(t, "r26 "+c.addr+" unhandled SSO (204), 16 bytes")
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
	good.send(t, 206, "")
	logged.wait(t, "r26 "+good.addr+" unhandled INIT_CRYPTO (206), 0 bytes")
}

// Until S7 frames MUS, the mus listener logs what a client sends and never answers (decision 0023).
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
	s := New(nil)
	for name, start := range map[string]func() error{"info": s.StartInfo, "mus": s.StartMus} {
		if err := start(); err == nil || !strings.HasPrefix(err.Error(), "server: "+name+": ") {
			t.Errorf("starting %s on a port in use = %v, want an error", name, err)
		}
	}
}
