package router

import (
	"errors"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleAccessGroupDelete handles POST /housekeeping/access-groups/{id}/delete. The
// group's attributes and memberships go with it, so the guard runs in the same
// transaction.
func (r *Router) HandleAccessGroupDelete(w http.ResponseWriter, req *http.Request) {
	group, ok := r.groupFromPath(w, req)
	if !ok {
		return
	}
	if req.PostFormValue("confirm") == "" {
		r.refuseMember(w, req, group, groupNotTicked)
		return
	}
	level, err := r.actorLevel(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if group.Level > level {
		if err := r.refused(req, group.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		r.refuseMember(w, req, group, groupAbove)
		return
	}

	err = r.inTx(req.Context(), func(q *store.Queries) error {
		if err := q.DeleteAccessGroup(req.Context(), group.ID); err != nil {
			return err
		}
		if err := keepManager(req.Context(), q); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionGroupsDelete, detail: group.Name})
	})
	switch {
	case errors.Is(err, errLastManager):
		if err := r.refused(req, group.Name, 0); err != nil {
			r.fail(w, err)
			return
		}
		r.refuseMember(w, req, group, lastManager)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/access-groups?deleted=1", http.StatusSeeOther)
	}
}
