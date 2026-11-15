package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleGroupsUnfavourite handles POST /groups/{id}/unfavourite,
// groups_deselect_favorite.php: the group is no longer the active habbo's
// favourite.
func (r *Router) HandleGroupsUnfavourite(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.actedGroup(w, req)
	if !ok {
		return
	}
	session, _ := auth.FromContext(ctx)
	row, err := r.deps.Queries.GetGroupMember(ctx, store.GetGroupMemberParams{GroupID: group.ID, AvatarID: session.AvatarID})
	switch {
	case store.IsNotFound(err) || (err == nil && !row.JoinedAt.Valid):
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: "notMember"})
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	if _, err := r.deps.Queries.UnfavouriteGroup(ctx, store.UnfavouriteGroupParams{GroupID: group.ID, AvatarID: session.AvatarID}); err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, groupAnswer{})
}
