package router

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// memberPage is how many habbos groups_memberlist.php listed at once.
const memberPage = 12

type memberRow struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Owner bool   `json:"owner"`
	Admin bool   `json:"admin"`
}

// memberList is one page of groups_memberlist.php, with the counts of both tabs
// that Holo sent for the titles.
type memberList struct {
	Members int64       `json:"members"`
	Pending int64       `json:"pending"`
	Page    int64       `json:"page"`
	Pages   int64       `json:"pages"`
	Total   int64       `json:"total"`
	Rows    []memberRow `json:"rows"`
}

// adminGroup is the group of the path when the active habbo is one of its admins
// (0086), as every groups_*.php but groups_accept.php checked; anyone else gets 403.
func (r *Router) adminGroup(w http.ResponseWriter, req *http.Request) (store.Group, bool) {
	group, ok := r.actedGroup(w, req)
	if !ok {
		return group, false
	}
	session, _ := auth.FromContext(req.Context())
	row, err := r.deps.Queries.GetGroupMember(req.Context(), store.GetGroupMemberParams{GroupID: group.ID, AvatarID: session.AvatarID})
	switch {
	case store.IsNotFound(err) || (err == nil && (!row.JoinedAt.Valid || row.Role != roleAdmin)):
		r.answerJSON(w, http.StatusForbidden, groupAnswer{Error: "notAdmin"})
		return group, false
	case err != nil:
		r.fail(w, err)
		return group, false
	}
	return group, true
}

// HandleGroupsMembersView handles GET /groups/{id}/members, groups_memberlist.php:
// a page of the members, admins first, or with pending=true of the waiting
// requests. A page out of range is the first, as in Holo.
func (r *Router) HandleGroupsMembersView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.adminGroup(w, req)
	if !ok {
		return
	}
	q := r.deps.Queries
	var list memberList
	var err error
	if list.Members, err = q.CountGroupMembers(ctx, group.ID); err != nil {
		r.fail(w, err)
		return
	}
	if list.Pending, err = q.CountGroupRequests(ctx, group.ID); err != nil {
		r.fail(w, err)
		return
	}
	pending := req.URL.Query().Get("pending") == "true"
	list.Total = list.Members
	if pending {
		list.Total = list.Pending
	}
	list.Pages = (list.Total + memberPage - 1) / memberPage
	list.Page, _ = strconv.ParseInt(req.URL.Query().Get("page"), 10, 64)
	if list.Page < 1 || list.Page > list.Pages {
		list.Page = 1
	}
	offset := (list.Page - 1) * memberPage
	list.Rows = []memberRow{}
	if pending {
		rows, err := q.ListGroupRequests(ctx, store.ListGroupRequestsParams{GroupID: group.ID, RowLimit: memberPage, RowOffset: offset})
		if err != nil {
			r.fail(w, err)
			return
		}
		for _, row := range rows {
			list.Rows = append(list.Rows, memberRow{ID: row.ID, Name: row.Name})
		}
	} else {
		rows, err := q.ListGroupMembers(ctx, store.ListGroupMembersParams{GroupID: group.ID, RowLimit: memberPage, RowOffset: offset})
		if err != nil {
			r.fail(w, err)
			return
		}
		for _, row := range rows {
			list.Rows = append(list.Rows, memberRow{ID: row.ID, Name: row.Name, Owner: row.ID == group.AvatarID, Admin: row.Role == roleAdmin})
		}
	}
	r.answerJSON(w, http.StatusOK, list)
}

// HandleGroupsMembersAction handles POST /groups/{id}/members/{member}/{action},
// groups_accept.php and the others, one member at a time. Accept and decline
// touch only requests, the others only members, and none the owner.
func (r *Router) HandleGroupsMembersAction(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	member, err := strconv.ParseInt(req.PathValue("member"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	action := req.PathValue("action")
	switch action {
	case "accept", "decline", "promote", "demote", "remove":
	default:
		http.NotFound(w, req)
		return
	}
	group, ok := r.adminGroup(w, req)
	if !ok {
		return
	}
	q := r.deps.Queries
	var changed int64
	switch action {
	case "accept":
		changed, err = q.AcceptGroupRequest(ctx, store.AcceptGroupRequestParams{GroupID: group.ID, AvatarID: member, JoinedAt: sql.NullTime{Time: time.Now().UTC(), Valid: true}})
	case "decline":
		changed, err = q.DeclineGroupRequest(ctx, store.DeclineGroupRequestParams{GroupID: group.ID, AvatarID: member})
	case "promote":
		changed, err = q.SetGroupMemberRole(ctx, store.SetGroupMemberRoleParams{GroupID: group.ID, AvatarID: member, Role: roleAdmin})
	case "demote":
		changed, err = q.SetGroupMemberRole(ctx, store.SetGroupMemberRoleParams{GroupID: group.ID, AvatarID: member, Role: roleMember})
	case "remove":
		changed, err = q.RemoveGroupMember(ctx, store.RemoveGroupMemberParams{GroupID: group.ID, AvatarID: member})
	}
	switch {
	case err != nil:
		r.fail(w, err)
	case changed == 0:
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: "notChanged"})
	default:
		r.answerJSON(w, http.StatusOK, groupAnswer{})
	}
}
