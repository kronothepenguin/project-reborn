package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const noteKey = "housekeeping.note"

// HandleNoteSave handles POST /housekeeping/note, the note every staff member
// shares. The log row and the note commit together.
func (r *Router) HandleNoteSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	note := req.PostFormValue("notes")
	if note != settings.String(ctx, r.deps.Queries, noteKey) {
		session, _ := auth.FromContext(ctx)
		err := r.inTx(ctx, func(q *store.Queries) error {
			if err := writeLog(req, q, staffLog{action: actionNoteUpdate}); err != nil {
				return err
			}
			return settings.Set(ctx, q, session.UserID, noteKey, note)
		})
		if err != nil {
			r.fail(w, err)
			return
		}
	}
	http.Redirect(w, req, "/housekeeping/", http.StatusSeeOther)
}
