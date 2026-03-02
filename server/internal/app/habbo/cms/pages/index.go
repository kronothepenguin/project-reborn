package pages

import (
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func IndexView(w http.ResponseWriter, r *http.Request) {
	tmpl.Lookup("index.html").Execute(w, nil)
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.FormValue("username"), r.FormValue("password"), r.FormValue("remember"))
	http.Redirect(w, r, "/me", http.StatusFound)
}
