package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleGroupsDelete handles POST /groups/{id}/delete, groups_delete_group.php:
// the owner deletes the group. Its home's stickers and notes go back to the users
// whose habbos placed them (0083), and its memberships and home go with it.
func (r *Router) HandleGroupsDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.ownedGroup(w, req)
	if !ok {
		return
	}
	err := r.inTx(ctx, func(q *store.Queries) error {
		home, err := q.GetGroupHome(ctx, group.ID)
		if err != nil {
			return err
		}
		if err := q.ReturnHomeItemsToPlacers(ctx, home.ID); err != nil {
			return err
		}
		_, err = q.DeleteGroup(ctx, group.ID)
		return err
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, groupAnswer{Message: groupDeleted})
}
