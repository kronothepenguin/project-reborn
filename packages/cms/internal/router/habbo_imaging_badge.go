package router

import (
	"bytes"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
)

// HandleHabboImagingBadgeImage serves GET /habbo-imaging/badge/{code}, Holo's
// habbo-imaging/badge.php: a group badge drawn in the Tailwind palette. A code
// that the badge editor would not write is not found. A code always draws the
// same, so browsers keep it.
func (r *Router) HandleHabboImagingBadgeImage(w http.ResponseWriter, req *http.Request) {
	b, err := badge.Parse(req.PathValue("code"))
	if err != nil {
		http.NotFound(w, req)
		return
	}
	img, err := badge.Draw(b)
	if err != nil {
		r.fail(w, err)
		return
	}
	var out bytes.Buffer
	if err := badge.Encode(&out, img); err != nil {
		r.fail(w, err)
		return
	}
	w.Header().Set("Content-Type", "image/gif")
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Write(out.Bytes())
}
