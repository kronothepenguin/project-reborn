package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

type inventoryItem struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Image    string `json:"image"`
	Quantity int64  `json:"quantity"`
}

// inventory is Holo's four inventory tabs. Widgets are not bought: the ones a
// habbo can place come with groups.
type inventory struct {
	Stickers    []inventoryItem `json:"stickers"`
	Backgrounds []inventoryItem `json:"backgrounds"`
	Notes       []inventoryItem `json:"notes"`
	Widgets     []inventoryItem `json:"widgets"`
}

// HandleMeInventoryJSON handles GET /me/inventory: what the user holds, which all
// their habbos share.
func (r *Router) HandleMeInventoryJSON(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	rows, err := r.deps.Queries.ListHomeInventory(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	held := inventory{Stickers: []inventoryItem{}, Backgrounds: []inventoryItem{}, Notes: []inventoryItem{}, Widgets: []inventoryItem{}}
	for _, row := range rows {
		it := inventoryItem{ID: row.ID, Name: row.Name, Image: image(row.Asset), Quantity: row.Quantity}
		switch row.Kind {
		case "sticker":
			held.Stickers = append(held.Stickers, it)
		case "background":
			held.Backgrounds = append(held.Backgrounds, it)
		case "note":
			held.Notes = append(held.Notes, it)
		}
	}
	r.answerJSON(w, http.StatusOK, held)
}
