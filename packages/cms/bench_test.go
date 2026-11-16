package cms

import (
	"net/http"
	"testing"
)

// BenchmarkPages measures a few pages through the router, settings reads
// included, on a database of its own.
func BenchmarkPages(b *testing.B) {
	db, mux := newSite(b)
	habbo(b, db, "admin@example.com", "Admin")
	cookie := login(b, db, "Admin")

	for _, page := range []struct {
		name   string
		path   string
		cookie *http.Cookie
	}{
		{"front page signed out", "/", nil},
		{"me", "/me", cookie},
		{"community", "/community", nil},
	} {
		b.Run(page.name, func(b *testing.B) {
			b.ReportAllocs()
			for b.Loop() {
				if rec := serve(mux, "GET", page.path, page.cookie, nil); rec.Code != http.StatusOK {
					b.Fatalf("%s: got %d", page.path, rec.Code)
				}
			}
		})
	}
}
