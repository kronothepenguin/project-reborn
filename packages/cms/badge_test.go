package cms

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"image"
	"image/gif"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestGroupBadgesAreDrawnInTheTailwindPalette(t *testing.T) {
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
	want, err := badge.Draw(b)
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
				t.Fatalf("pixel %d,%d differs from the Tailwind palette's drawing", x, y)
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

// The badge editor reads its colours from its own file, as the CMS serves it; it
// and the renderer must share the Tailwind palette (0102).
func TestTheBadgeEditorSharesTheTailwindPalette(t *testing.T) {
	data, err := fs.ReadFile(DistFS, "dist/habbo-widgets/badge-editor/data/badge_data.xml")
	if err != nil {
		t.Fatal(err)
	}
	var file struct {
		Colours []string `xml:"c"`
	}
	if err := xml.Unmarshal(data, &file); err != nil {
		t.Fatal(err)
	}
	if len(file.Colours) != len(badge.Tailwind) {
		t.Fatalf("the editor has %d colours, the palette %d", len(file.Colours), len(badge.Tailwind))
	}
	for i, hex := range file.Colours {
		c := badge.Tailwind[i]
		if want := fmt.Sprintf("%02x%02x%02x", c.R, c.G, c.B); hex != want {
			t.Errorf("colour %02d is %s in the editor and %s in the renderer", i+1, hex, want)
		}
	}
}

type savedBadge struct {
	Error string `json:"error"`
}

func TestAnAdminSavesACheckedBadgeCode(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	crowd(t, db, club, "Member", 1, "member", true)
	save := func(cookie *http.Cookie, code string) *httptest.ResponseRecorder {
		return edit(mux, cookie, fmt.Sprintf("/groups/%d/badge", club.ID), map[string]string{"code": code})
	}
	owner := login(t, db, "club-owner")
	if rec := save(owner, "b0702Xs01124"); rec.Code != http.StatusOK {
		t.Fatalf("saving = %d %s", rec.Code, rec.Body)
	}
	for _, code := range []string{"", "b0702X;DROP", "../x", "b2503X", "NaN"} {
		rec := save(owner, code)
		if rec.Code != http.StatusUnprocessableEntity || decode[savedBadge](t, rec).Error != "badCode" {
			t.Errorf("saving %q = %d %s, want a refusal", code, rec.Code, rec.Body)
		}
	}
	if rec := save(login(t, db, "Member0"), "s01010"); rec.Code != http.StatusForbidden {
		t.Errorf("a member saving = %d, want 403", rec.Code)
	}
	if rec := save(nil, "s01010"); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest saving = %d, want 401", rec.Code)
	}
	got, err := store.New(db).GetGroup(t.Context(), club.ID)
	if err != nil || got.Badge != "b0702Xs01124" {
		t.Errorf("the badge = %q, %v, want the one code saved", got.Badge, err)
	}
}
