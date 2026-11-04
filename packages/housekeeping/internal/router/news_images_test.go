package router

import (
	"bytes"
	"image"
	"image/color"
	"image/gif"
	"os"
	"path/filepath"
	"testing"
)

func encodeGIF(t *testing.T, g *gif.GIF) []byte {
	t.Helper()
	var out bytes.Buffer
	if err := gif.EncodeAll(&out, g); err != nil {
		t.Fatalf("gif.EncodeAll: %v", err)
	}
	return out.Bytes()
}

// frames gives each of count frames a palette of its own, so that the encoder
// writes local color tables, and a delay, so that it writes their extensions.
func frames(count int) *gif.GIF {
	g := &gif.GIF{LoopCount: 0}
	for i := range count {
		palette := color.Palette{color.RGBA{R: uint8(i), A: 255}, color.RGBA{G: 255, A: 255}, color.RGBA{}}
		frame := image.NewPaletted(image.Rect(i, i, 300-i, 187-i), palette)
		for p := range frame.Pix {
			frame.Pix[p] = uint8(p % 3)
		}
		g.Image = append(g.Image, frame)
		g.Delay = append(g.Delay, i)
	}
	g.Config = image.Config{Width: 300, Height: 187, ColorModel: color.Palette{color.Black, color.White}}
	return g
}

func TestGIFFramesCountWhatTheDecoderReads(t *testing.T) {
	gifs := map[string][]byte{}
	files, err := filepath.Glob("../../../cms/public/web-gallery/images/top-story/*.gif")
	if err != nil || len(files) != 2 {
		t.Fatalf("the top stories hold %d GIFs: %v", len(files), err)
	}
	for _, file := range files {
		data, err := os.ReadFile(file)
		if err != nil {
			t.Fatal(err)
		}
		gifs[filepath.Base(file)] = data
	}
	gifs["one frame"] = encodeGIF(t, frames(1))
	gifs["seven frames with local colors"] = encodeGIF(t, frames(7))
	commented := encodeGIF(t, frames(2))
	gifs["a comment before the end"] = append(append(commented[:len(commented)-1:len(commented)-1], 0x21, 0xfe, 3, 'a', 'b', 'c', 0), 0x3b)

	for name, data := range gifs {
		decoded, err := gif.DecodeAll(bytes.NewReader(data))
		if err != nil {
			t.Fatalf("%s: %v", name, err)
		}
		if got, ok := gifFrames(data); !ok || got != len(decoded.Image) {
			t.Errorf("%s: gifFrames = %d, %t; the decoder reads %d frames", name, got, ok, len(decoded.Image))
		}
	}

	whole := gifs["seven frames with local colors"]
	for name, data := range map[string][]byte{
		"nothing":            nil,
		"the header alone":   whole[:13],
		"half":               whole[:len(whole)/2],
		"no end":             whole[:len(whole)-1],
		"an unknown block":   append(append([]byte(nil), whole[:len(whole)-1]...), 0x99, 0x3b),
		"a cut color table":  whole[:14],
		"a cut frame header": append(append([]byte(nil), whole[:len(whole)-1]...), 0x2c, 0, 0),
	} {
		if got, ok := gifFrames(data); ok {
			t.Errorf("%s: gifFrames = %d, true", name, got)
		}
	}
}
