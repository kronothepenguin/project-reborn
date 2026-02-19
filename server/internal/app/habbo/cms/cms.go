package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/cms/pages/index"
)

func ServeMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", index.Index)

	return mux
}
