package router

import (
	"errors"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleGroupsFavourite handles POST /groups/{id}/favourite,
// groups_select_favorite.php: the group becomes the active habbo's one
// favourite. Holo let a habbo with a waiting request choose it too.
func (r *Router) HandleGroupsFavourite(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.actedGroup(w, req)
	if !ok {
		return
	}
	session, _ := auth.FromContext(ctx)
	changed := int64(0)
	err := r.inTx(ctx, func(q *store.Queries) error {
		if err := q.ClearFavouriteGroup(ctx, session.AvatarID); err != nil {
			return err
		}
		var err error
		changed, err = q.SetFavouriteGroup(ctx, store.SetFavouriteGroupParams{GroupID: group.ID, AvatarID: session.AvatarID})
		if err != nil {
			return err
		}
		if changed == 0 {
			return errNotMember
		}
		return nil
	})
	switch {
	case errors.Is(err, errNotMember):
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: "notMember"})
	case err != nil:
		r.fail(w, err)
	default:
		r.answerJSON(w, http.StatusOK, groupAnswer{})
	}
}

// errNotMember rolls back a change that only a member may make.
var errNotMember = errors.New("not a member")
