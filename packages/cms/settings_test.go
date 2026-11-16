package cms

import (
	"net/http"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestSavedSettingShowsOnTheNextPage(t *testing.T) {
	db, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "Name:Reborn Hotel")

	if err := settings.Set(t.Context(), store.New(db), 0, "site.name", "Sunset Hotel"); err != nil {
		t.Fatalf("set site.name: %v", err)
	}

	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "Name:Sunset Hotel")
}
