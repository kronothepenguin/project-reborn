package router

import (
	"html/template"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type previewBody struct {
	Text string `json:"text"`
}

type previewAnswer struct {
	HTML template.HTML `json:"html"`
}

// HandleBBCodePreview handles POST /bbcode/preview: text as a note, and later a
// post, will show it, as store.php's noteeditor-preview did.
func (r *Router) HandleBBCodePreview(w http.ResponseWriter, req *http.Request) {
	var body previewBody
	if !readEdit(w, req, &body) {
		return
	}
	r.answerJSON(w, http.StatusOK, previewAnswer{HTML: bbcode.Format(body.Text, settings.GetBool("features.smilies"))})
}
