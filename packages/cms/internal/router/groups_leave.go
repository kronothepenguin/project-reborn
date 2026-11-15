package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleGroupsLeave handles POST /groups/{id}/leave, leavegroup.php: the active
// habbo leaves the group, or withdraws its request. The owner never leaves.
func (r *Router) HandleGroupsLeave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.actedGroup(w, req)
	if !ok {
		return
	}
	session, _ := auth.FromContext(ctx)
	n, err := r.deps.Queries.LeaveGroup(ctx, store.LeaveGroupParams{GroupID: group.ID, AvatarID: session.AvatarID})
	switch {
	case err != nil:
		r.fail(w, err)
	case n == 0:
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: "notLeaving"})
	default:
		r.answerJSON(w, http.StatusOK, groupAnswer{Message: leftGroup})
	}
}
