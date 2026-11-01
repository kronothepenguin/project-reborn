package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const noteKey = "housekeeping.note"

// HandleNoteSave handles POST /housekeeping/note, the note every staff member
// shares. settings.Set cannot join a transaction, so the log row goes first: a
// failed write then leaves a row for nothing, never a change without a row.
func (r *Router) HandleNoteSave(w http.ResponseWriter, req *http.Request) {
	note := req.PostFormValue("notes")
	if note != settings.GetString(noteKey) {
		if err := writeLog(req, r.deps.Queries, staffLog{action: actionNoteUpdate}); err != nil {
			r.fail(w, err)
			return
		}
		session, _ := auth.FromContext(req.Context())
		if err := settings.Set(req.Context(), r.deps.DB, session.UserID, noteKey, note); err != nil {
			r.fail(w, err)
			return
		}
	}
	http.Redirect(w, req, "/housekeeping/", http.StatusSeeOther)
}
