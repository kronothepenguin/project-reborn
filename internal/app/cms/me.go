package cms

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (c *CMS) handleMeView(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(r.Context(), w, "me.page.html", nil)
}
