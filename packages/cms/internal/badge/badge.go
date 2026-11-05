// Package badge draws group badges as Holo's habbo-imaging/badge.php drew them,
// from Holo's part images, after a strict check of the code.
package badge

import (
	"embed"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/gif"
	"io"
	"sync"
)

// Size is the side of a badge: the size of Holo's badges/base/base.gif, on which
// badge.php drew every layer.
const Size = 39

// Default is the badge a new group gets, as in Holo.
const Default = "b0503Xs09114s05013s05015"

const (
	bases     = 24
	symbols   = 67
	tints     = 18
	positions = 9
	maxLayers = 4
)

// ErrInvalid is any code that Holo's badge editor would not write.
var ErrInvalid = errors.New("badge: invalid code")

// A Layer is the base or one symbol of a badge.
type Layer struct {
	// Part is 1 to 24 for a base, 1 to 67 for a symbol.
	Part int
	// Tint is 1 to 18, an entry of the palette.
	Tint int
	// Position is 0 to 8 on a 3x3 grid read row by row; a base is centred.
	Position int
}

// A Badge is drawn base first, then its symbols in order.
type Badge struct {
	// Base is nil for a badge of symbols alone.
	Base    *Layer
	Symbols []Layer
}

// Parse reads a code as the badge editor writes it: an optional base "bBBCCX",
// then up to four symbols "sTTCCP".
func Parse(code string) (Badge, error) {
	var b Badge
	rest := code
	if len(rest) > 0 && rest[0] == 'b' {
		if len(rest) < 6 || rest[5] != 'X' {
			return Badge{}, ErrInvalid
		}
		part, okPart := number(rest[1:3], bases)
		tint, okTint := number(rest[3:5], tints)
		if !okPart || !okTint {
			return Badge{}, ErrInvalid
		}
		b.Base = &Layer{Part: part, Tint: tint, Position: 4}
		rest = rest[6:]
	}
	for len(rest) > 0 {
		if len(b.Symbols) == maxLayers || len(rest) < 6 || rest[0] != 's' {
			return Badge{}, ErrInvalid
		}
		part, okPart := number(rest[1:3], symbols)
		tint, okTint := number(rest[3:5], tints)
		position := int(rest[5]) - '0'
		if !okPart || !okTint || position < 0 || position >= positions {
			return Badge{}, ErrInvalid
		}
		b.Symbols = append(b.Symbols, Layer{Part: part, Tint: tint, Position: position})
		rest = rest[6:]
	}
	if b.Base == nil && len(b.Symbols) == 0 {
		return Badge{}, ErrInvalid
	}
	return b, nil
}

// number reads two ASCII digits from 01 to high.
func number(s string, high int) (int, bool) {
	if len(s) != 2 || s[0] < '0' || s[0] > '9' || s[1] < '0' || s[1] > '9' {
		return 0, false
	}
	n := int(s[0]-'0')*10 + int(s[1]-'0')
	return n, n >= 1 && n <= high
}

// A Palette holds the colours of the tints 01 to 18.
type Palette [tints]color.RGBA

// Holo is the tints of Holo's badge.php (decision 0042).
var Holo = Palette{
	rgb(0xffd601), rgb(0xee7600), rgb(0x84de00), rgb(0x589a00), rgb(0x50c1fb), rgb(0x006fcf),
	rgb(0xff98e3), rgb(0xf334bf), rgb(0xff2d2d), rgb(0xaf0a0a), rgb(0xffffff), rgb(0xc0c0c0),
	rgb(0x373737), rgb(0xfbe7ac), rgb(0x977641), rgb(0xc2eaff), rgb(0xfff165), rgb(0xaaff7d),
}

// Tailwind is the closest Tailwind colour to each of Holo's tints, by
// tools/tw-color, in sRGB: amber-300, amber-600, lime-400, lime-600, sky-400,
// sky-600, pink-300, pink-500, red-500, red-700, white, mauve-300, taupe-700,
// amber-100, olive-500, sky-200, yellow-200 and lime-300. Seven of them lie
// outside sRGB and are clipped to it, as their usual hex values are.
var Tailwind = Palette{
	rgb(0xffd230), rgb(0xe17100), rgb(0x9ae600), rgb(0x5ea500), rgb(0x00bcff), rgb(0x0084d1),
	rgb(0xfda5d5), rgb(0xf6339a), rgb(0xfb2c36), rgb(0xc10007), rgb(0xffffff), rgb(0xd7d0d7),
	rgb(0x473c39), rgb(0xfef3c6), rgb(0x7c7c67), rgb(0xb8e6fe), rgb(0xfff085), rgb(0xbbf451),
}

// Live is the palette the site draws with until the user picks one (decision 0093).
var Live = Tailwind

func rgb(hex uint32) color.RGBA {
	return color.RGBA{R: uint8(hex >> 16), G: uint8(hex >> 8), B: uint8(hex), A: 0xff}
}

// Draw composes the badge as badge.php did. Each layer takes the tint times the
// grey level of each of its colours, its overlay is drawn on it untinted, and
// the layers go onto a transparent canvas in order.
func Draw(b Badge, p Palette) (*image.RGBA, error) {
	all, err := parts()
	if err != nil {
		return nil, err
	}
	canvas := image.NewRGBA(image.Rect(0, 0, Size, Size))
	layers := b.Symbols
	if b.Base != nil {
		layers = append([]Layer{*b.Base}, layers...)
	}
	for i, l := range layers {
		dir, count := "templates", symbols
		if i == 0 && b.Base != nil {
			dir, count = "base", bases
		}
		if l.Part < 1 || l.Part > count || l.Tint < 1 || l.Tint > tints || l.Position < 0 || l.Position >= positions {
			return nil, ErrInvalid
		}
		pt := all[fmt.Sprintf("%s/%02d", dir, l.Part)]
		drawLayer(canvas, pt, p[l.Tint-1], l.Position)
	}
	return canvas, nil
}

func drawLayer(canvas *image.RGBA, pt part, tint color.RGBA, position int) {
	bounds := pt.image.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	layer := image.NewRGBA(image.Rect(0, 0, w, h))
	tinted := make([]color.RGBA, len(pt.image.Palette))
	for i, c := range pt.image.Palette {
		tinted[i] = tinting(c, tint)
	}
	for y := range h {
		for x := range w {
			layer.SetRGBA(x, y, tinted[pt.image.ColorIndexAt(bounds.Min.X+x, bounds.Min.Y+y)])
		}
	}
	if pt.overlay != nil {
		ob := pt.overlay.Bounds()
		for y := range h {
			for x := range w {
				if c := opaque(pt.overlay.At(ob.Min.X+x, ob.Min.Y+y)); c.A != 0 {
					layer.SetRGBA(x, y, c)
				}
			}
		}
	}
	// badge.php halved the sizes in floats and imagecopy truncated them, which is
	// integer division for these sizes.
	left := [3]int{0, (Size - w) / 2, Size - w}[position%3]
	top := [3]int{0, (Size - h) / 2, Size - h}[position/3]
	for y := range h {
		for x := range w {
			if c := layer.RGBAAt(x, y); c.A != 0 {
				canvas.SetRGBA(left+x, top+y, c)
			}
		}
	}
}

// tinting is badge.php's image_colorize: the grey level of the colour, from 0 to
// 1, times each channel of the tint, truncated. The transparent colour stays so.
func tinting(c color.Color, tint color.RGBA) color.RGBA {
	o := opaque(c)
	if o.A == 0 {
		return o
	}
	grey := float64(int(o.R)+int(o.G)+int(o.B)) / 3 / 0xff
	return color.RGBA{
		R: uint8(grey * float64(tint.R)),
		G: uint8(grey * float64(tint.G)),
		B: uint8(grey * float64(tint.B)),
		A: 0xff,
	}
}

// opaque reads a GIF colour, which is either opaque or the transparent one.
func opaque(c color.Color) color.RGBA {
	r, g, b, a := c.RGBA()
	if a == 0 {
		return color.RGBA{}
	}
	return color.RGBA{R: uint8(r >> 8), G: uint8(g >> 8), B: uint8(b >> 8), A: 0xff}
}

// Encode writes the badge as a GIF, as badge.php answered, with the transparent
// colour first and the others in the order they first appear.
func Encode(w io.Writer, img *image.RGBA) error {
	palette := color.Palette{color.RGBA{}}
	index := map[color.RGBA]uint8{{}: 0}
	out := image.NewPaletted(img.Bounds(), nil)
	for y := img.Rect.Min.Y; y < img.Rect.Max.Y; y++ {
		for x := img.Rect.Min.X; x < img.Rect.Max.X; x++ {
			c := img.RGBAAt(x, y)
			i, ok := index[c]
			if !ok {
				if len(palette) == 256 {
					return errors.New("badge: more than 255 colours")
				}
				i = uint8(len(palette))
				index[c] = i
				palette = append(palette, c)
			}
			out.SetColorIndex(x, y, i)
		}
	}
	out.Palette = palette
	return gif.Encode(w, out, nil)
}

//go:embed parts
var partFiles embed.FS

type part struct {
	image *image.Paletted
	// overlay is NN_NN.gif, which badge.php drew untinted on the part.
	overlay *image.Paletted
}

var parts = sync.OnceValues(func() (map[string]part, error) {
	all := make(map[string]part, bases+symbols)
	for _, set := range []struct {
		dir   string
		count int
	}{{"base", bases}, {"templates", symbols}} {
		for n := 1; n <= set.count; n++ {
			name := fmt.Sprintf("%s/%02d", set.dir, n)
			img, err := decode(fmt.Sprintf("parts/%s.gif", name))
			if err != nil {
				return nil, err
			}
			pt := part{image: img}
			overlay, err := decode(fmt.Sprintf("parts/%s/%02d_%02d.gif", set.dir, n, n))
			switch {
			case err == nil:
				pt.overlay = overlay
			case !errors.Is(err, errMissing):
				return nil, err
			}
			all[name] = pt
		}
	}
	return all, nil
})

var errMissing = errors.New("badge: no such part")

func decode(path string) (*image.Paletted, error) {
	f, err := partFiles.Open(path)
	if err != nil {
		return nil, fmt.Errorf("%w: %s", errMissing, path)
	}
	defer f.Close()
	img, err := gif.Decode(f)
	if err != nil {
		return nil, fmt.Errorf("badge: %s: %w", path, err)
	}
	paletted, ok := img.(*image.Paletted)
	if !ok {
		return nil, fmt.Errorf("badge: %s is not a paletted image", path)
	}
	return paletted, nil
}
