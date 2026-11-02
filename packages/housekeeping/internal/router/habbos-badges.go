package router

import (
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const badgeInvalid = "Invalid badge. Badge codes may only be 3-4 characters long."

// badgeCode is Holo's length, in the letters and digits of the badge art, because
// a code also names a file and a segment of a path.
var badgeCode = regexp.MustCompile(`^[A-Z0-9]{3,4}$`)

// HandleHabboBadgesGive handles POST /housekeeping/habbos/{id}/badges, Holo's badge
// tool: the habbo gets the badge and wears it, and a badge it already has becomes
// the worn one. MySQL matched codes ignoring case, and the art is in upper case.
func (r *Router) HandleHabboBadgesGive(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	allowed, err := r.mayActOn(req, "give a badge", avatar.UserID, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}
	code := strings.ToUpper(req.PostFormValue("badge"))
	if !badgeCode.MatchString(code) {
		r.refuseHabbo(w, req, avatar, badgeInvalid)
		return
	}

	entry := staffLog{action: actionBadgesGive, detail: code, targetUser: avatar.UserID, targetAvatar: avatar.ID}
	answer := "given"
	err = r.inTx(ctx, func(q *store.Queries) error {
		if err := q.TakeOffAvatarBadge(ctx, avatar.ID); err != nil {
			return err
		}
		granted, err := q.GrantAvatarBadge(ctx, store.GrantAvatarBadgeParams{
			AvatarID:  avatar.ID,
			Code:      code,
			GrantedAt: time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		if granted == 0 {
			entry.action, answer = actionBadgesWear, "worn"
			err := q.WearAvatarBadge(ctx, store.WearAvatarBadgeParams{AvatarID: avatar.ID, Code: code})
			if err != nil {
				return err
			}
		}
		return writeLog(req, q, entry)
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, habboPath(avatar.ID)+"?"+answer+"=1&badge="+code, http.StatusSeeOther)
}

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
