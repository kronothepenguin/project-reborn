package server

import (
	"context"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/encoding"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// pingEvery sets how often the server pings and how long it waits for PONG, in seconds, and puts the defaults back
// after the test. Each value is set where the rule that the timeout is longer than the interval lets it.
func pingEvery(t *testing.T, interval, timeout int) {
	t.Helper()
	// The test's context ends before its cleanups run.
	set := func(key string, value int) {
		t.Helper()
		if err := settings.Set(context.Background(), testDB, 0, key, value); err != nil {
			t.Fatalf("settings.Set %s: %v", key, err)
		}
	}
	set("game.pingSeconds", interval)
	set("game.pongTimeoutSeconds", timeout)
	t.Cleanup(func() {
		set("game.pongTimeoutSeconds", 90)
		set("game.pingSeconds", 30)
	})
}

// next receives the next message that is not a PING.
func (c *client) next(t *testing.T) (id int, body string) {
	t.Helper()
	for {
		if id, body = c.receive(t); id != 50 {
			return id, body
		}
	}
}

func vl64String(t *testing.T, values ...int32) string {
	t.Helper()
	var b strings.Builder
	for _, v := range values {
		if err := encoding.WriteVL64(&b, v); err != nil {
			t.Fatal(err)
		}
	}
	return b.String()
}

func TestTheServerPingsAndKeepsAClientThatAnswers(t *testing.T) {
	pingEvery(t, 1, 2)
	c := dial(t, infoPort)
	c.expectMessage(t, 0, "")
	for range 3 {
		c.expectMessage(t, 50, "")
		c.send(t, 196, "")
	}
	c.send(t, 49, "")
	if id, _ := c.next(t); id != 163 {
		t.Errorf("received %d, want the date: a client that answers every PING stays", id)
	}
}

// A connection the server closes logs its habbo out, as one the client closes does.
func TestASilentClientIsClosedAndItsHabboLoggedOut(t *testing.T) {
	pingEvery(t, 1, 2)
	id := habboWithTickets(t, "Silent", "silent")
	c := dial(t, infoPort)
	c.expectMessage(t, 0, "")
	c.send(t, 206, "")
	for _, want := range []int{277, 278} {
		if got, _ := c.next(t); got != want {
			t.Fatalf("received %d, want %d", got, want)
		}
	}
	c.write(t, append(packet(t, 1170, versionCheck(t, 1, "", "")), packet(t, 1817, "")...))
	if got, _ := c.next(t); got != 257 {
		t.Fatalf("received %d, want 257", got)
	}
	c.send(t, 204, b64String(t, "silent"))
	for _, want := range []int{2, 3} {
		if got, _ := c.next(t); got != want {
			t.Fatalf("received %d, want %d", got, want)
		}
	}

	for {
		if _, err := c.r.ReadByte(); err != nil {
			break
		}
	}
	logged.wait(t, "r26 "+c.addr+" closed: no PONG for 2s")
	eventually(t, "offline", func() bool {
		_, ok := habbo.Get(id)
		return !ok
	})
}

// The bytes of packages/server/knowledge/r26/hh_entry_init.md for the test with id 1.
func TestTheLatencyTestInBytes(t *testing.T) {
	c := dial(t, infoPort)
	c.expect(t, "@@\x01")
	c.write(t, []byte("@@CD{I"))
	c.expect(t, "EbI\x01")
}

func TestALatencyReportIsLogged(t *testing.T) {
	c := dial(t, infoPort)
	c.receive(t)
	c.send(t, 316, vl64String(t, 120, 110, 15))
	logged.wait(t, "r26 "+c.addr+" latency: mean 120 ms, 110 ms below twice the mean, 15 answers")
}
