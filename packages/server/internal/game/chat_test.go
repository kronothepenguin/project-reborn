package game

import (
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// Smileys show faces in the order Holo's checkEmotion looked for them, so >:( is angry before it is sad.
func TestASmileyShowsItsFace(t *testing.T) {
	for text, want := range map[string]string{
		"hi :)":          "sml",
		":D":             "sml",
		"grr >:(":        "agr",
		"see http://x":   "agr",
		"oh :(":          "sad",
		":'(":            "sad",
		"wow :O":         "srp",
		"zero :0":        "srp",
		"no smiley here": "",
		"both :( and :)": "sml",
	} {
		if got := gestureOf(text); got != want {
			t.Errorf("gestureOf(%q) = %q, want %q", text, got, want)
		}
	}
}

func TestALineIsCutByCharacters(t *testing.T) {
	if got := cut(strings.Repeat("é", 150), 100); got != strings.Repeat("é", 100) {
		t.Errorf("cut kept %d characters, want 100", len([]rune(got)))
	}
	if got := cut("short", 100); got != "short" {
		t.Errorf("cut(%q) = %q", "short", got)
	}
}

func TestTimedStatusesEndOnTheirTick(t *testing.T) {
	now := time.Now()
	statuses := []room.Status{
		{Action: "flatctrl", Parameters: "useradmin"},
		{Action: "talk", Until: now},
		{Action: "gest", Parameters: "sml", Until: now.Add(time.Second)},
	}
	statuses, dropped := expire(statuses, now)
	if !dropped || len(statuses) != 2 || statuses[1].Action != "gest" {
		t.Errorf("expire left %+v, %t; want flatctrl and gest", statuses, dropped)
	}
	if _, dropped := expire(statuses, now.Add(500*time.Millisecond)); dropped {
		t.Error("a status ended before its time")
	}
}
