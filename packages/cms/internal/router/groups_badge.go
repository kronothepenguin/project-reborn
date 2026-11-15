package router

import (
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type badgeBody struct {
	Code string `json:"code"`
}

// HandleGroupsBadgeSave handles POST /groups/{id}/badge, save_group_badge.php: an admin
// stores the code the badge editor wrote. A code the editor would not write is
// refused, where Holo stored anything it was sent.
func (r *Router) HandleGroupsBadgeSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	group, ok := r.adminGroup(w, req)
	if !ok {
		return
	}
	var body badgeBody
	if !readEdit(w, req, &body) {
		return
	}
	if _, err := badge.Parse(body.Code); err != nil {
		r.answerJSON(w, http.StatusUnprocessableEntity, groupAnswer{Error: "badCode"})
		return
	}
	if err := r.deps.Queries.SetGroupBadge(ctx, store.SetGroupBadgeParams{ID: group.ID, Badge: body.Code, UpdatedAt: time.Now().UTC()}); err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, groupAnswer{})
}
