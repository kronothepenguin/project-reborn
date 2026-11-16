package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleGroupsJoin handles POST /groups/{id}/join, joingroup.php, for the active
// habbo: it joins a Regular or Unlimited group or asks to join an Exclusive one,
// with Holo's checks in Holo's order. Every answer is a message for the dialog.
func (r *Router) HandleGroupsJoin(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.actedGroup(w, req)
	if !ok {
		return
	}
	session, _ := auth.FromContext(ctx)
	message := ""
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		held, err := q.CountAvatarMemberships(ctx, session.AvatarID)
		if err != nil {
			return err
		}
		if limit := settings.Int(ctx, q, "groups.maxMemberships"); held >= int64(limit) {
			message = fmt.Sprintf(joinLimit, limit)
			return nil
		}
		switch _, err := q.GetGroupMember(ctx, store.GetGroupMemberParams{GroupID: group.ID, AvatarID: session.AvatarID}); {
		case err == nil:
			message = joinAlready
			return nil
		case !store.IsNotFound(err):
			return err
		}
		row := store.AddGroupMemberParams{GroupID: group.ID, AvatarID: session.AvatarID, Role: roleMember, RequestedAt: now}
		switch group.Access {
		case accessRegular:
			members, err := q.CountGroupMembers(ctx, group.ID)
			if err != nil {
				return err
			}
			if members >= int64(settings.Int(ctx, q, "groups.maxMembers")) {
				message = joinFull
				return nil
			}
			fallthrough
		case accessUnlimited:
			row.JoinedAt = sql.NullTime{Time: now, Valid: true}
			message = joinJoined
		case accessExclusive:
			message = joinRequested
		default:
			message = joinClosed
			return nil
		}
		return q.AddGroupMember(ctx, row)
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, groupAnswer{Message: message})
}
