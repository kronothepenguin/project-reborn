package game

import (
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// A drink is carried 9 seconds and drunk 1, ten times over, and then leaves the hand, as in Holo.
func TestADrinkIsSippedTenTimes(t *testing.T) {
	start := time.Now()
	o := &room.Occupant{Carry: room.Carry{Item: "5", Sips: sips, Next: start.Add(sipInterval)}}
	o.Statuses = []room.Status{{Action: "carryd", Parameters: "5"}}
	at := start
	for n := 1; n <= sips; n++ {
		sip(o, at.Add(sipInterval-time.Millisecond))
		if !hasStatus(o, "carryd") || hasStatus(o, "drink") {
			t.Fatalf("before sip %d the statuses are %+v, want the drink carried", n, o.Statuses)
		}
		at = at.Add(sipInterval)
		o.Changed = false
		sip(o, at)
		if hasStatus(o, "carryd") || !hasStatus(o, "drink") || !o.Changed {
			t.Fatalf("at sip %d the statuses are %+v, want the habbo drinking, and told", n, o.Statuses)
		}
		at = at.Add(sipTime)
		sip(o, at)
		if n < sips && !hasStatus(o, "carryd") {
			t.Fatalf("after sip %d the statuses are %+v, want the drink carried again", n, o.Statuses)
		}
	}
	if len(o.Statuses) != 0 || o.Carry.Item != "" {
		t.Errorf("after the last sip the habbo carries %+v with the statuses %+v, want nothing", o.Carry, o.Statuses)
	}
}
