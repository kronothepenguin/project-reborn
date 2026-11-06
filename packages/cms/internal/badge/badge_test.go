package badge

import (
	"bytes"
	"image"
	"image/color"
	"image/gif"
	"strings"
	"testing"
)

func TestParseTakesWhatTheEditorWrites(t *testing.T) {
	for code, want := range map[string]Badge{
		Default: {
			Base:    &Layer{Part: 5, Tint: 3, Position: 4},
			Symbols: []Layer{{Part: 9, Tint: 11, Position: 4}, {Part: 5, Tint: 1, Position: 3}, {Part: 5, Tint: 1, Position: 5}},
		},
		"b2418X":                         {Base: &Layer{Part: 24, Tint: 18, Position: 4}},
		"s67180":                         {Symbols: []Layer{{Part: 67, Tint: 18, Position: 0}}},
		"b0101Xs01018s02027s03036s04045": {Base: &Layer{Part: 1, Tint: 1, Position: 4}, Symbols: []Layer{{1, 1, 8}, {2, 2, 7}, {3, 3, 6}, {4, 4, 5}}},
	} {
		got, err := Parse(code)
		if err != nil {
			t.Errorf("Parse(%q) = %v", code, err)
			continue
		}
		if !sameBadge(got, want) {
			t.Errorf("Parse(%q) = %+v, want %+v", code, got, want)
		}
	}
}

func TestParseRefusesAnythingElse(t *testing.T) {
	for _, code := range []string{
		"",
		"X",
		"b0503",
		"b0503Y",
		"b0503s09114",
		"b2503X",
		"b0003X",
		"b0519X",
		"b0500X",
		"s68114",
		"s00114",
		"s09194",
		"s09004",
		"s09119",
		"s0911",
		"s09114s",
		"s09114x",
		"b0503Xb0503X",
		"s09114b0503X",
		"b0503Xs01014s01014s01014s01014s01014",
		"B0503X",
		"b0503x",
		"b0503Xs09114 ",
		" b0503X",
		"b05\x003X",
		"../../etc/passwd",
		"b0503Xs09114%2F",
		"b-503X",
		"b+503X",
		"s0911٤",
	} {
		if b, err := Parse(code); err == nil {
			t.Errorf("Parse(%q) = %+v, want an error", code, b)
		}
	}
}

func TestEncodingKeepsEveryPixel(t *testing.T) {
	b, err := Parse("b1007Xs67180s01148s40036s23122")
	if err != nil {
		t.Fatal(err)
	}
	img, err := Draw(b)
	if err != nil {
		t.Fatal(err)
	}
	var buf bytes.Buffer
	if err := Encode(&buf, img); err != nil {
		t.Fatal(err)
	}
	back, err := gif.Decode(&buf)
	if err != nil {
		t.Fatal(err)
	}
	if diff := differences(img, back); diff != "" {
		t.Errorf("the GIF lost pixels: %s", diff)
	}
	if back.Bounds() != image.Rect(0, 0, Size, Size) {
		t.Errorf("the GIF is %v", back.Bounds())
	}
}

// Tint 10, red-700, has no green, so no pixel of a symbol without an overlay in it
// may have any.
func TestTheTintsComeFromThePalette(t *testing.T) {
	if Tailwind[9].G != 0 {
		t.Fatalf("tint 10 is %v; this test needs a tint without green", Tailwind[9])
	}
	b, err := Parse("s01100")
	if err != nil {
		t.Fatal(err)
	}
	img, err := Draw(b)
	if err != nil {
		t.Fatal(err)
	}
	red := false
	for y := range Size {
		for x := range Size {
			c := img.RGBAAt(x, y)
			if c.A != 0 && c.G != 0 {
				t.Fatalf("pixel %d,%d is %v, which no shade of tint 10 is", x, y, c)
			}
			red = red || c.R > 0
		}
	}
	if !red {
		t.Error("the symbol took no red from tint 10")
	}
}

func TestEveryPartLoads(t *testing.T) {
	all, err := parts()
	if err != nil {
		t.Fatal(err)
	}
	if len(all) != bases+symbols {
		t.Errorf("%d parts, want %d", len(all), bases+symbols)
	}
	overlays := 0
	for name, pt := range all {
		if pt.image.Bounds().Dx() > Size || pt.image.Bounds().Dy() > Size {
			t.Errorf("%s is larger than the canvas", name)
		}
		if pt.overlay != nil {
			overlays++
			if pt.overlay.Bounds().Size() != pt.image.Bounds().Size() {
				t.Errorf("%s's overlay is %v, the part %v", name, pt.overlay.Bounds(), pt.image.Bounds())
			}
		}
	}
	if overlays != 35 {
		t.Errorf("%d overlays, want Holo's 35", overlays)
	}
}

// A GIF holds 256 colours. The base with the most colours and the four symbols
// with the most, with their overlays, stay under it, so no code can run out.
func TestNoBadgeNeedsMoreColoursThanAGIFHolds(t *testing.T) {
	all, err := parts()
	if err != nil {
		t.Fatal(err)
	}
	count := func(pt part) int {
		n := len(pt.image.Palette)
		if pt.overlay != nil {
			n += len(pt.overlay.Palette)
		}
		return n
	}
	most := map[string][]int{}
	for name, pt := range all {
		dir, _, _ := strings.Cut(name, "/")
		most[dir] = append(most[dir], count(pt))
	}
	worst := maxOf(most["base"])
	symbols := most["templates"]
	for range maxLayers {
		at := 0
		for i, n := range symbols {
			if n > symbols[at] {
				at = i
			}
		}
		worst += symbols[at]
		symbols = append(symbols[:at], symbols[at+1:]...)
	}
	if worst+1 > 256 {
		t.Errorf("a badge could need %d colours", worst+1)
	}
}

func TestDrawRefusesALayerOutOfRange(t *testing.T) {
	for _, b := range []Badge{
		{Base: &Layer{Part: 25, Tint: 1, Position: 4}},
		{Symbols: []Layer{{Part: 68, Tint: 1}}},
		{Symbols: []Layer{{Part: 1, Tint: 19}}},
		{Symbols: []Layer{{Part: 1, Tint: 1, Position: 9}}},
	} {
		if _, err := Draw(b); err == nil {
			t.Errorf("Draw(%+v) drew", b)
		}
	}
}

func maxOf(ns []int) int {
	m := 0
	for _, n := range ns {
		m = max(m, n)
	}
	return m
}

// differences names the first pixels that differ, comparing transparent pixels
// as one colour.
func differences(got, want image.Image) string {
	if got.Bounds() != want.Bounds() {
		return "bounds " + got.Bounds().String() + " and " + want.Bounds().String()
	}
	var out []string
	b := got.Bounds()
	for y := b.Min.Y; y < b.Max.Y; y++ {
		for x := b.Min.X; x < b.Max.X; x++ {
			g, w := opaque(got.At(x, y)), opaque(want.At(x, y))
			if g != w {
				out = append(out, image.Pt(x, y).String()+": "+colourString(g)+" for "+colourString(w))
				if len(out) == 5 {
					return strings.Join(out, ", ")
				}
			}
		}
	}
	return strings.Join(out, ", ")
}

func colourString(c color.RGBA) string {
	if c.A == 0 {
		return "transparent"
	}
	const hex = "0123456789abcdef"
	return "#" + string([]byte{hex[c.R>>4], hex[c.R&15], hex[c.G>>4], hex[c.G&15], hex[c.B>>4], hex[c.B&15]})
}

func sameBadge(a, b Badge) bool {
	if (a.Base == nil) != (b.Base == nil) || (a.Base != nil && *a.Base != *b.Base) || len(a.Symbols) != len(b.Symbols) {
		return false
	}
	for i := range a.Symbols {
		if a.Symbols[i] != b.Symbols[i] {
			return false
		}
	}
	return true
}
