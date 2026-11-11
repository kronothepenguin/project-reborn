package r26

import (
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/server/game"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// A slash ends a furni in the hand and the character 30 separates its values, so neither stays in a value.
func TestAHandValueKeepsItsPlace(t *testing.T) {
	trophy := store.FurniDefinition{Sprite: "prizetrophy*1", Kind: "solid", Length: 1, Width: 1, Colours: "#ffffff"}
	hand := game.Hand{Total: 1, Items: []game.HandItem{{Furni: store.Furni{ID: 7, State: "Ana\t1/2/2026\x1eBest room"}, Definition: trophy}}}
	want := "SI\x1e7\x1e0\x1eS\x1e7\x1eprizetrophy*1\x1e1\x1e1\x1eAna 1 2 2026 Best room\x1e#ffffff\x1e0/\r1"
	if got := handLines(hand); got != want {
		t.Errorf("handLines() = %q, want %q", got, want)
	}
}
