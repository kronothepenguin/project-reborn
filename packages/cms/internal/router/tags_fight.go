package router

import (
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/settings"
)

type fightBody struct {
	Tag1 string `json:"tag1"`
	Tag2 string `json:"tag2"`
}

type fightAnswer struct {
	Hits1 int64 `json:"hits1"`
	Hits2 int64 `json:"hits2"`
}

// HandleTagsFight handles POST /tags/fight, tagfight.php: how many habbos carry
// each tag. The island tells the winner from the counts, as Holo's page did.
func (r *Router) HandleTagsFight(w http.ResponseWriter, req *http.Request) {
	if !settings.Bool(req.Context(), r.deps.Queries, "features.tagFight") {
		http.NotFound(w, req)
		return
	}
	var body fightBody
	if !readEdit(w, req, &body) {
		return
	}
	if body.Tag1 == "" || body.Tag2 == "" {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	ctx := req.Context()
	var answer fightAnswer
	var err error
	if answer.Hits1, err = r.deps.Queries.CountTaggedAvatars(ctx, fightTag(body.Tag1)); err != nil {
		r.fail(w, err)
		return
	}
	if answer.Hits2, err = r.deps.Queries.CountTaggedAvatars(ctx, fightTag(body.Tag2)); err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, answer)
}

// fightTag is a typed tag as MySQL compared Holo's: in any case, and without the
// spaces after it.
func fightTag(typed string) string {
	return strings.ToLower(strings.TrimRight(typed, " "))
}
