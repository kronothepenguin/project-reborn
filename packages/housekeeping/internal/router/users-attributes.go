package router

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleUserAttributesSave handles POST /housekeeping/users/{id}/attributes: the
// ticked boxes replace what the user holds directly, and their groups are not
// touched. The guard of access groups cannot fire here, because the actor holds both
// of its attributes and is never the target.
func (r *Router) HandleUserAttributesSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.postedHabbo(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "change attributes", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}
	ticked, ok := knownAttributes(req.PostForm["attribute"])
	if !ok {
		r.refuseHabbo(w, req, avatar, groupUnknown)
		return
	}

	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		current, err := q.ListDirectUserAttributes(ctx, avatar.UserID)
		if err != nil {
			return err
		}
		added, removed := without(ticked, current), without(current, ticked)
		for _, attribute := range added {
			err := q.AddUserAttribute(ctx, store.AddUserAttributeParams{
				UserID:          avatar.UserID,
				Attribute:       attribute,
				GrantedAt:       now,
				GrantedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			})
			if err != nil {
				return err
			}
		}
		for _, attribute := range removed {
			err := q.RemoveUserAttribute(ctx, store.RemoveUserAttributeParams{UserID: avatar.UserID, Attribute: attribute})
			if err != nil {
				return err
			}
		}
		return writeLog(req, q, staffLog{
			action:       actionUsersAttributes,
			detail:       describeUpdate("direct", added, removed),
			targetUser:   avatar.UserID,
			targetAvatar: avatar.ID,
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, habboPath(avatar.ID)+"?saved=1", http.StatusSeeOther)
}
