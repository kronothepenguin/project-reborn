package router

import (
	"context"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
)

// sharedFurni is a kind of furni in the user's shared inventory, and how many of it wait there.
type sharedFurni struct {
	ID     int64
	Name   string
	Amount int64
}

type furniPage struct {
	accountPage
	Furni []sharedFurni
}

func (r *Router) newFurniPage(ctx context.Context) (furniPage, error) {
	session, _ := auth.FromContext(ctx)
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return furniPage{}, err
	}
	rows, err := r.deps.Queries.ListSharedFurni(ctx, session.UserID)
	if err != nil {
		return furniPage{}, err
	}
	page := furniPage{accountPage: account}
	for _, row := range rows {
		page.Furni = append(page.Furni, sharedFurni{ID: row.FurniDefinitionID, Name: row.Name, Amount: row.Amount})
	}
	return page, nil
}

// HandleAccountFurniView renders GET /account/furni, the user's shared inventory:
// the furni that none of its habbos holds, a row for each kind (decisions
// server/0122 and server/0123).
func (r *Router) HandleAccountFurniView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newFurniPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/furni.html", false, page)
}
