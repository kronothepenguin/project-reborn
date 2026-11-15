package router

import (
	"fmt"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// HandleHabboRestore handles POST /housekeeping/habbos/{id}/restore. An archived
// habbo gave up its slot, so it comes back only into a free one: the count runs in
// the transaction, as on /account/habbos.
func (r *Router) HandleHabboRestore(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "restore a habbo", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}
	if !avatar.ArchivedAt.Valid {
		r.refuseHabbo(w, req, avatar, habboNotArchived)
		return
	}

	limit := settings.GetInt("registration.maxHabbosPerUser")
	var restored int64
	err = r.inTx(ctx, func(q *store.Queries) error {
		habbos, err := q.ListUserAvatars(ctx, avatar.UserID)
		if err != nil || len(habbos) >= limit {
			return err
		}
		restored, err = q.RestoreAvatar(ctx, store.RestoreAvatarParams{ID: avatar.ID, UpdatedAt: time.Now().UTC()})
		if err != nil || restored == 0 {
			return err
		}
		return writeLog(req, q, staffLog{action: actionHabbosRestore, targetUser: avatar.UserID, targetAvatar: avatar.ID})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case restored == 0:
		r.refuseHabbo(w, req, avatar, fmt.Sprintf("This user can have %d habbos at most.", limit))
	default:
		http.Redirect(w, req, habboPath(avatar.ID)+"?restored=1", http.StatusSeeOther)
	}
}
