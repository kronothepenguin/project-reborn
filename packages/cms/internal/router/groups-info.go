package router

import (
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type groupInfoBox struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Badge       string `json:"badge"`
	Created     string `json:"created"`
	Description string `json:"description"`
}

// HandleGroupsInfoView handles GET /groups/{id}/info, groupinfo.php: the info box
// a MY GROUPS widget opens for one of its groups, for anyone.
func (r *Router) HandleGroupsInfoView(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.answerJSON(w, http.StatusNotFound, groupAnswer{Error: "notFound"})
		return
	}
	group, err := r.deps.Queries.GetGroup(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		r.answerJSON(w, http.StatusNotFound, groupAnswer{Error: "notFound"})
	case err != nil:
		r.fail(w, err)
	default:
		r.answerJSON(w, http.StatusOK, groupInfoBox{
			ID:          group.ID,
			Name:        group.Name,
			Badge:       group.Badge,
			Created:     group.CreatedAt.UTC().Format(dateFull),
			Description: group.Description,
		})
	}
}
