package router

import (
	"net/http"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleHabboBadgesDelete handles POST /housekeeping/habbos/{id}/badges/{code}/delete.
// Any code the habbo has can go, whatever gave it.
func (r *Router) HandleHabboBadgesDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "remove a badge", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}

	code := req.PathValue("code")
	deleted := false
	err = r.inTx(ctx, func(q *store.Queries) error {
		removed, err := q.DeleteAvatarBadge(ctx, store.DeleteAvatarBadgeParams{AvatarID: avatar.ID, Code: code})
		if err != nil || removed == 0 {
			return err
		}
		deleted = true
		return writeLog(req, q, staffLog{
			action:       actionBadgesDelete,
			detail:       code,
			targetUser:   avatar.UserID,
			targetAvatar: avatar.ID,
		})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case !deleted:
		http.NotFound(w, req)
	default:
		http.Redirect(w, req, habboPath(avatar.ID)+"?removed=1&badge="+url.QueryEscape(code), http.StatusSeeOther)
	}
}
