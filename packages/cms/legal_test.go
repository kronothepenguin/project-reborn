package cms

import (
	"net/http"
	"testing"
)

func TestLegalPages(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "site.name", "Retro Hotel")
	setSetting(t, db, "site.shortName", "Retro")
	habbo(t, db, "admin@example.com", "Admin")
	cookie := login(t, db, "Admin")

	for path, name := range map[string]string{"/disclaimer": "disclaimer.html", "/privacy": "privacy.html"} {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, name, "Name:Retro Hotel", "ShortName:Retro")
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, name)
	}
}
