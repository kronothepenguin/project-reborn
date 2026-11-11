package r26

import (
	"bytes"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// activeObjectsBody writes the floor furni among items as 32 carries them: their count, then each as an active
// object.
func activeObjectsBody(items []room.Furni) []byte {
	var b bytes.Buffer
	count := 0
	for _, item := range items {
		if item.Definition.Kind != "wall" {
			count++
			b.Write(activeObject(item))
		}
	}
	return append(vl64(count), b.Bytes()...)
}

// activeObject writes a floor furni as the client reads one in 32, 93 and 95: its id and class, its tile, its length
// and width, its direction, its altitude, its colours, an empty runtime data, 0 for the extra, and its state as the
// stuff data (plans/server/reference/r26/hh_room.md#an-active-object).
func activeObject(item room.Furni) []byte {
	d := item.Definition
	var b bytes.Buffer
	b.Write(str(strconv.FormatInt(item.ID, 10)))
	b.Write(str(stuffData(d.Sprite)))
	for _, v := range []int64{item.X, item.Y, d.Length, d.Width, item.Direction} {
		b.Write(vl64(int(v)))
	}
	b.Write(str(height(item.Altitude)))
	b.Write(str(stuffData(d.Colours)))
	b.Write(str(""))
	b.Write(vl64(0))
	b.Write(str(stuffData(item.State)))
	return b.Bytes()
}

// stuffData keeps a state inside its string: any control character but the tab, which separates a trophy's name,
// day and inscription, becomes a space.
func stuffData(value string) string {
	return strings.Map(func(r rune) rune {
		if r < ' ' && r != '\t' {
			return ' '
		}
		return r
	}, value)
}

// wallItemLines writes the wall items among items as 45 and 83 carry them, a line each: the id, the class, a space
// where the owner goes, the place on the wall, and the item's state, or without one what its definition carries, a
// poster's number, tab-separated (plans/server/reference/r26/hh_room.md#a-wall-item).
func wallItemLines(items []room.Furni) string {
	var b strings.Builder
	for _, item := range items {
		if item.Definition.Kind != "wall" {
			continue
		}
		data := item.State
		if data == "" {
			data = item.Definition.Data
		}
		values := []string{strconv.FormatInt(item.ID, 10), printable(item.Definition.Sprite), " ", printable(item.WallPosition), printable(data)}
		b.WriteString(strings.Join(values, "\t") + "\r")
	}
	return b.String()
}
