package pages

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func RegisterView(w http.ResponseWriter, r *http.Request) {
	tmpl.Lookup("register.html").Execute(w, nil)
}
