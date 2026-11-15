package router

import (
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleHomesItemsDelete handles POST /homes/{id}/items/{item}/delete: a sticker
// goes back to the inventory of the user whose habbo placed it, and a note is
// gone, as in Holo, though on a group's home a note goes back too, blank (0083,
// 0098). Holo also let the profile and Group information widgets go, and wrote
// them again in their corner the next time anyone looked, so here they go
// straight back there.
func (r *Router) HandleHomesItemsDelete(w http.ResponseWriter, req *http.Request) {
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
	session, _ := auth.FromContext(ctx)
	missing := false
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		item, err := q.GetHomeItem(ctx, store.GetHomeItemParams{ID: itemID, HomeID: home.ID})
		if store.IsNotFound(err) {
			missing = true
			return nil
		}
		if err != nil {
			return err
		}
		if item.Kind == "widget" && (item.Widget.String == "profile" || item.Widget.String == widgetGroup) {
			if _, err := q.SkinHomeItem(ctx, store.SkinHomeItemParams{ID: item.ID, HomeID: home.ID, Skin: "defaultskin", UpdatedAt: now}); err != nil {
				return err
			}
			_, err := q.MoveHomeItem(ctx, store.MoveHomeItemParams{ID: item.ID, HomeID: home.ID, X: profileX, Y: profileY, Z: profileZ, UpdatedAt: now})
			return err
		}
		// A placer whose row is gone leaves the item to the user removing it, as
		// Holo gave every removed sticker.
		placer, err := q.GetHomeItemPlacer(ctx, item.ID)
		switch {
		case store.IsNotFound(err):
			placer = session.UserID
		case err != nil:
			return err
		}
		if _, err := q.DeleteHomeItem(ctx, store.DeleteHomeItemParams{ID: item.ID, HomeID: home.ID}); err != nil {
			return err
		}
		returned := item.Kind == "sticker" || (item.Kind == "note" && home.GroupID.Valid)
		if !returned || !item.HomeStoreItemID.Valid {
			return nil
		}
		return q.AddHomeInventory(ctx, store.AddHomeInventoryParams{UserID: placer, HomeStoreItemID: item.HomeStoreItemID.Int64, Quantity: 1})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case missing:
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeNotThere})
	default:
		r.answerJSON(w, http.StatusOK, struct{}{})
	}
}
