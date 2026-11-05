package router

import "net/http"

// hotGroups is how many groups randomgroups.php listed.
const hotGroups = 12

type hotGroup struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Badge string `json:"badge"`
}

type hotGroupsAnswer struct {
	Groups []hotGroup `json:"groups"`
}

// HandleGroupsRandomView handles GET /groups/random, randomgroups.php: twelve
// groups in random order for the Hot Groups tab.
func (r *Router) HandleGroupsRandomView(w http.ResponseWriter, req *http.Request) {
	rows, err := r.deps.Queries.ListRandomGroups(req.Context(), hotGroups)
	if err != nil {
		r.fail(w, err)
		return
	}
	answer := hotGroupsAnswer{Groups: make([]hotGroup, 0, len(rows))}
	for _, row := range rows {
		answer.Groups = append(answer.Groups, hotGroup{ID: row.ID, Name: row.Name, Badge: row.Badge})
	}
	r.answerJSON(w, http.StatusOK, answer)
}
