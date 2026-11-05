package cms

import (
	"bytes"
	"image"
	"image/gif"
	"net/http"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
)

func TestGroupBadgesAreDrawnInTheLivePalette(t *testing.T) {
	_, mux := newSite(t)

	rec := serve(mux, "GET", "/habbo-imaging/badge/"+badge.Default, nil, nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET the default badge = %d %q", rec.Code, rec.Body)
	}
	for header, want := range map[string]string{
		"Content-Type":           "image/gif",
		"Cache-Control":          "public, max-age=31536000, immutable",
		"X-Content-Type-Options": "nosniff",
	} {
		if got := rec.Header().Get(header); got != want {
			t.Errorf("%s = %q, want %q", header, got, want)
		}
	}
	got, err := gif.Decode(bytes.NewReader(rec.Body.Bytes()))
	if err != nil {
		t.Fatal(err)
	}
	b, err := badge.Parse(badge.Default)
	if err != nil {
		t.Fatal(err)
	}
	want, err := badge.Draw(b, badge.Live)
	if err != nil {
		t.Fatal(err)
	}
	if got.Bounds() != image.Rect(0, 0, badge.Size, badge.Size) {
		t.Fatalf("the badge is %v", got.Bounds())
	}
	for y := range badge.Size {
		for x := range badge.Size {
			gr, gg, gb, ga := got.At(x, y).RGBA()
			wr, wg, wb, wa := want.At(x, y).RGBA()
			if ga != wa || (wa != 0 && (gr != wr || gg != wg || gb != wb)) {
				t.Fatalf("pixel %d,%d differs from the live palette's drawing", x, y)
			}
		}
	}
}

func TestBadCodesAreNotFound(t *testing.T) {
	_, mux := newSite(t)
	for _, path := range []string{
		"/habbo-imaging/badge/b0503",
		"/habbo-imaging/badge/b2503X",
		"/habbo-imaging/badge/s09194",
		"/habbo-imaging/badge/b0503Xs09114.gif",
		"/habbo-imaging/badge/..%2F..%2Fconfig.json",
		"/habbo-imaging/badge/b0503X%00",
	} {
		if rec := serve(mux, "GET", path, nil, nil); rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d, want 404", path, rec.Code)
		}
	}
}
