package router

import (
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type storeItem struct {
	ID       int64  `json:"id"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
	Image    string `json:"image"`
	Price    int64  `json:"price"`
	Quantity int64  `json:"quantity"`
}

// HandleHomeStoreCategoryJSON handles GET /home-store/categories/{id}: the items of
// the category that are sold. A category the habbo may not see does not exist.
func (r *Router) HandleHomeStoreCategoryJSON(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	category, err := r.deps.Queries.GetHomeStoreCategory(ctx, id)
	switch {
	case store.IsNotFound(err) || (err == nil && !r.shown(ctx, category)):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	rows, err := r.deps.Queries.ListEnabledHomeStoreItems(ctx, id)
	if err != nil {
		r.fail(w, err)
		return
	}
	items := make([]storeItem, 0, len(rows))
	for _, it := range rows {
		items = append(items, storeItem{
			ID:       it.ID,
			Kind:     it.Kind,
			Name:     it.Name,
			Image:    image(it.Asset),
			Price:    it.Price,
			Quantity: it.Quantity,
		})
	}
	r.answerJSON(w, http.StatusOK, items)
}
