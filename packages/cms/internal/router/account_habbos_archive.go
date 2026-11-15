package router

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// HandleAccountHabbosArchive handles POST /account/habbos/{id}/archive, which takes
// the user's password, as the other forms that change an account do.
func (r *Router) HandleAccountHabbosArchive(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	match, err := auth.CheckPassword(ctx, r.deps.DB, session.UserID, req.PostFormValue("password"))
	if err != nil {
		r.fail(w, err)
		return
	}

	result, failed := "That is not your password.", true
	if match {
		switch err := auth.ArchiveHabbo(ctx, r.deps.DB, id); {
		case err == nil:
			result, failed = "The habbo is archived.", false
		case errors.Is(err, auth.ErrNotOwner):
			http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
			return
		case errors.Is(err, auth.ErrActiveHabbo):
			result = "Switch to another habbo first."
		case errors.Is(err, auth.ErrHabboOwnsGroup):
			result = "This habbo owns a group, so it cannot be archived."
		default:
			r.fail(w, err)
			return
		}
	}

	page, err := r.newHabbosPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Result, page.Failed = result, failed
	r.answer(w, "account/habbos.html", failed, page)
}
