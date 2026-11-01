package router

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleUsersAccessGroupsSave handles POST /housekeeping/users/{id}/access-groups:
// it adds the user to the posted group with a display habbo, changes that habbo,
// or, with remove, takes the user out of the group.
func (r *Router) HandleUsersAccessGroupsSave(w http.ResponseWriter, req *http.Request) {
	userID, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	groupID, err := strconv.ParseInt(req.PostFormValue("group"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	group, ok := r.group(w, req, groupID)
	if !ok {
		return
	}
	switch _, err := r.deps.Queries.GetUser(req.Context(), userID); {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}

	if req.PostForm.Has("remove") {
		r.removeMember(w, req, group, userID)
		return
	}
	r.saveMember(w, req, group, userID)
}

func (r *Router) refuseMember(w http.ResponseWriter, req *http.Request, group store.AccessGroup, message string) {
	page, err := r.newAccessGroupPage(req, group)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "access-groups/id.html", page)
}

func (r *Router) saveMember(w http.ResponseWriter, req *http.Request, group store.AccessGroup, userID int64) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PostFormValue("habbo"), 10, 64)
	if err != nil {
		r.refuseMember(w, req, group, displayNotOwned)
		return
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, id)
	if err != nil && !store.IsNotFound(err) {
		r.fail(w, err)
		return
	}
	if err != nil || avatar.UserID != userID {
		r.refuseMember(w, req, group, displayNotOwned)
		return
	}

	display := sql.NullInt64{Int64: avatar.ID, Valid: true}
	err = r.inTx(ctx, func(q *store.Queries) error {
		entry := staffLog{detail: group.Name, targetUser: userID, targetAvatar: avatar.ID}
		member, err := q.GetAccessGroupMember(ctx, store.GetAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID})
		switch {
		case store.IsNotFound(err):
			session, _ := auth.FromContext(ctx)
			entry.action = actionGroupsAddMember
			err = q.AddAccessGroupMember(ctx, store.AddAccessGroupMemberParams{
				AccessGroupID:   group.ID,
				UserID:          userID,
				DisplayAvatarID: display,
				GrantedAt:       time.Now().UTC(),
				GrantedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			})
		case err != nil:
			return err
		case member.DisplayAvatarID == display:
			return nil
		default:
			entry.action = actionGroupsSetDisplayHabbo
			err = q.UpdateAccessGroupMemberDisplay(ctx, store.UpdateAccessGroupMemberDisplayParams{
				DisplayAvatarID: display,
				AccessGroupID:   group.ID,
				UserID:          userID,
			})
		}
		if err != nil {
			return err
		}
		return writeLog(req, q, entry)
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, groupPath(group.ID)+"?saved=1", http.StatusSeeOther)
}

func (r *Router) removeMember(w http.ResponseWriter, req *http.Request, group store.AccessGroup, userID int64) {
	ctx := req.Context()
	err := r.inTx(ctx, func(q *store.Queries) error {
		member := store.GetAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID}
		switch _, err := q.GetAccessGroupMember(ctx, member); {
		case store.IsNotFound(err):
			return nil
		case err != nil:
			return err
		}
		err := q.RemoveAccessGroupMember(ctx, store.RemoveAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID})
		if err != nil {
			return err
		}
		if err := keepManager(ctx, q); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionGroupsRemoveMember, detail: group.Name, targetUser: userID})
	})
	switch {
	case errors.Is(err, errLastManager):
		if err := r.refused(req, group.Name, userID); err != nil {
			r.fail(w, err)
			return
		}
		r.refuseMember(w, req, group, lastManager)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, groupPath(group.ID)+"?saved=1", http.StatusSeeOther)
	}
}
