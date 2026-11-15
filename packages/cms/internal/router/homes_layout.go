package router

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type layoutItem struct {
	ID int64 `json:"id"`
	X  int64 `json:"x"`
	Y  int64 `json:"y"`
	Z  int64 `json:"z"`
}

type layoutBody struct {
	Items      []layoutItem `json:"items"`
	Background int64        `json:"background"`
}

// HandleHomesLayoutSave handles POST /homes/{id}/layout, savehome.php: the
// places of the items and the background, all or nothing. A background is one
// the user holds, or 0 for Holo's default.
func (r *Router) HandleHomesLayoutSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	home, ok := r.ownHome(w, req)
	if !ok {
		return
	}
	var body layoutBody
	if !readEdit(w, req, &body) {
		return
	}
	for _, it := range body.Items {
		if it.X < 0 || it.X > playgroundWidth || it.Y < 0 || it.Y > playgroundHeight || it.Z < 0 || it.Z > maxZ {
			r.answerJSON(w, http.StatusUnprocessableEntity, editError{homeBadPlace})
			return
		}
	}
	session, _ := auth.FromContext(ctx)
	refusal := ""
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		background := sql.NullInt64{}
		if body.Background != 0 {
			item, err := q.GetHomeStoreItem(ctx, body.Background)
			if err != nil && !store.IsNotFound(err) {
				return err
			}
			held, heldErr := q.GetHomeInventoryQuantity(ctx, store.GetHomeInventoryQuantityParams{UserID: session.UserID, HomeStoreItemID: body.Background})
			if heldErr != nil && !store.IsNotFound(heldErr) {
				return heldErr
			}
			if err != nil || item.Kind != "background" || held < 1 {
				refusal = backgroundNo
				return nil
			}
			background = sql.NullInt64{Int64: item.ID, Valid: true}
		}
		if err := q.SetHomeBackground(ctx, store.SetHomeBackgroundParams{ID: home.ID, BackgroundHomeStoreItemID: background, UpdatedAt: now}); err != nil {
			return err
		}
		for _, it := range body.Items {
			_, err := q.MoveHomeItem(ctx, store.MoveHomeItemParams{ID: it.ID, HomeID: home.ID, X: it.X, Y: it.Y, Z: it.Z, UpdatedAt: now})
			if err != nil {
				return err
			}
		}
		return nil
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, editError{refusal})
	default:
		r.answerJSON(w, http.StatusOK, struct{}{})
	}
}
