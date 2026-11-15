package router

import (
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type skinBody struct {
	Skin string `json:"skin"`
}

// HandleHomesItemsSkin handles POST /homes/{id}/items/{item}/skin, for notes and
// widgets, as edit_stickie.php and edit_widget.php.
func (r *Router) HandleHomesItemsSkin(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	itemID, err := strconv.ParseInt(req.PathValue("item"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	var body skinBody
	if !readEdit(w, req, &body) {
		return
	}
	item, err := r.deps.Queries.GetHomeItem(ctx, store.GetHomeItemParams{ID: itemID, HomeID: home.ID})
	switch {
	case store.IsNotFound(err) || (err == nil && item.Kind == "sticker"):
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeNotThere})
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	allowed, err := r.skinAllowed(ctx, body.Skin)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadSkin})
		return
	}
	_, err = r.deps.Queries.SkinHomeItem(ctx, store.SkinHomeItemParams{ID: item.ID, HomeID: home.ID, Skin: body.Skin, UpdatedAt: time.Now().UTC()})
	if err != nil {
		r.fail(w, err)
		return
	}
	item.Skin = body.Skin
	r.answerJSON(w, http.StatusOK, r.drawn(item, ""))
}
