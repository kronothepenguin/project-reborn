package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (c *CMS) handleRegisterView(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(r.Context(), w, "register.page.html", nil)
}
