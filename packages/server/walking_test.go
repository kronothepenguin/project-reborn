package server

import (
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/internal/encoding"
)

func b64Short(t *testing.T, v int) string {
	t.Helper()
	var b strings.Builder
	if err := encoding.WriteB64(&b, v, 2); err != nil {
		t.Fatal(err)
	}
	return b.String()
}

// extendDeadline gives the client's connection a new deadline, for a test that walks longer than one allows.
func (c *client) extendDeadline(t *testing.T) {
	t.Helper()
	if err := c.ws.SetDeadline(time.Now().Add(timeout)); err != nil {
		t.Fatal(err)
	}
}

// statusLines splits a 34 into its lines, by the index that starts each.
func statusLines(body string) map[string]string {
	lines := map[string]string{}
	for line := range strings.SplitSeq(body, "\r") {
		if index, _, ok := strings.Cut(line, " "); ok {
			lines[index] = line
		}
	}
	return lines
}

// Each tick of a room's clock, 500 ms apart, takes every walking habbo a step and sends one 34 with all of them to
// everyone in the room (decisions server/0065 and server/0072).
func TestHabbosWalkAStepEvery500Milliseconds(t *testing.T) {
	ownerID := habboWithTickets(t, "Strider", "strider")
	habboWithTickets(t, "Ambler", "ambler")
	flat := newRoom(t, ownerID, 2, "Promenade", true)
	strider, _ := login(t, "strider")
	ambler, _ := login(t, "ambler")
	strider.enterFlat(t, flat, 47, 42)
	ambler.enterFlat(t, flat)
	strider.nextBody(t, 28)
	strider.nextBody(t, 34)

	start := time.Now()
	strider.send(t, 75, b64Short(t, 7)+b64Short(t, 5))
	var arrived []time.Duration
	for _, want := range []string{
		"0 3,5,0,2,2/flatctrl useradmin/mv 4,5,0/\r",
		"0 4,5,0,2,2/flatctrl useradmin/mv 5,5,0/\r",
		"0 5,5,0,2,2/flatctrl useradmin/mv 6,5,0/\r",
		"0 6,5,0,2,2/flatctrl useradmin/mv 7,5,0/\r",
		"0 7,5,0,2,2/flatctrl useradmin/\r",
	} {
		ambler.expectNext(t, 34, want)
		strider.expectNext(t, 34, want)
		arrived = append(arrived, time.Since(start))
	}
	if total := arrived[4]; total < 1900*time.Millisecond || total > 3*time.Second {
		t.Errorf("4 steps and the stop took %v, want 2 s to 2.5 s", total)
	}
	for i := 1; i < len(arrived); i++ {
		if gap := arrived[i] - arrived[i-1]; gap < 300*time.Millisecond || gap > 900*time.Millisecond {
			t.Errorf("step %d came %v after the one before, want about 500 ms", i, gap)
		}
	}

	strider.extendDeadline(t)
	ambler.extendDeadline(t)
	strider.send(t, 75, b64Short(t, 7)+b64Short(t, 9))
	ambler.send(t, 75, b64Short(t, 6)+b64Short(t, 9))
	for _, c := range []*client{strider, ambler} {
		together, stopped := false, map[string]string{}
		for len(stopped) < 2 {
			lines := statusLines(c.nextBody(t, 34))
			if len(lines) == 2 {
				together = true
			}
			for index, line := range lines {
				if !strings.Contains(line, "/mv ") {
					stopped[index] = line
				}
			}
		}
		if !together {
			t.Error("no tick carried both walking habbos")
		}
		if stopped["0"] != "0 7,9,0,4,4/flatctrl useradmin/" || !strings.HasPrefix(stopped["1"], "1 6,9,0,") {
			t.Errorf("stopped as %q, want Strider at 7,9 facing south and Ambler at 6,9", stopped)
		}
	}

	strider.send(t, 79, "3 9")
	if lines := statusLines(ambler.nextBody(t, 34)); lines["0"] != "0 7,9,0,6,6/flatctrl useradmin/" {
		t.Errorf("Strider looked as %q, want facing west", lines["0"])
	}
}
