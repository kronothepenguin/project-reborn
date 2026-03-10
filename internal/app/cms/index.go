package cms

import (
	"errors"
	"maps"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (c *CMS) handleIndexView(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(r.Context(), w, "index.page.html", c.data)
}

func (c *CMS) handleLogin(w http.ResponseWriter, r *http.Request) {
	username := r.FormValue("username")
	password := r.FormValue("password")
	remember := r.FormValue("remember") == "true"

	if err := login(c.db, r.Context(), username, password); err != nil {
		data := maps.Clone(c.data)
		data["Error"] = errors.New("wrong_credentials")
		tmpl.ExecuteTemplate(r.Context(), w, "index.page.html", data)
		return
	}

	if err := createSession(c.db, r.Context(), w, username, remember); err != nil {
		data := maps.Clone(c.data)
		data["Error"] = errors.New("session_failed")
		tmpl.ExecuteTemplate(r.Context(), w, "index.page.html", data)
		return
	}

	http.Redirect(w, r, "/me", http.StatusFound)
}
