package cms

import (
	"maps"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (c *CMS) handleMeView(w http.ResponseWriter, r *http.Request) {
	data := maps.Clone(c.data)
	data["Username"] = "test"
	tmpl.ExecuteTemplate(r.Context(), w, "me.page.html", data)
}
