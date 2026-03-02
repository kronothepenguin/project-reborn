package pages

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func MeView(w http.ResponseWriter, r *http.Request) {
	tmpl.Lookup("me.html").Execute(w, nil)
}
