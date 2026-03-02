package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/cms/pages"
)

func ServeMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /{$}", pages.IndexView)
	mux.HandleFunc("POST /login", pages.HandleLogin)

	mux.HandleFunc("GET /me", pages.MeView)

	return mux
}
