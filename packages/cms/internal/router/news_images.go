package router

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleNewsImagesImage serves GET /news/images/{file}, a picture staff uploaded,
// named by its id and format, such as 12.png. A stored image never changes, so
// browsers keep it.
func (r *Router) HandleNewsImagesImage(w http.ResponseWriter, req *http.Request) {
	name, format, ok := strings.Cut(req.PathValue("file"), ".")
	id, err := strconv.ParseInt(name, 10, 64)
	if !ok || err != nil || id <= 0 {
		http.NotFound(w, req)
		return
	}
	image, err := r.deps.Queries.GetImage(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	case image.Format != format:
		http.NotFound(w, req)
		return
	}
	w.Header().Set("Content-Type", "image/"+image.Format)
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Write(image.Data)
}
