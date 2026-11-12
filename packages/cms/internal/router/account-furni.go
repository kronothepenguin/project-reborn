package router

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The answers of the Furni page.
const (
	furniTaken   = "%d furni moved to %s's hand."
	furniNothing = "There is no such furni to take."
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
// the furni that none of its habbos holds, a row for each kind (plans/server
// decisions 0122 and 0123).
func (r *Router) HandleAccountFurniView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newFurniPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/furni.html", false, page)
}

// HandleAccountFurniTake handles POST /account/furni/take: every shared furni of
// the kind named by furni, or all of the shared furni without it, goes to the hand
// of the active habbo. Shared furni moves one way.
func (r *Router) HandleAccountFurniTake(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	var taken int64
	var err error
	if kind := req.PostFormValue("furni"); kind == "" {
		taken, err = r.deps.Queries.TakeAllSharedFurni(ctx, store.TakeAllSharedFurniParams{UserID: session.UserID, AvatarID: session.AvatarID})
	} else if id, parseErr := strconv.ParseInt(kind, 10, 64); parseErr == nil {
		taken, err = r.deps.Queries.TakeSharedFurni(ctx, store.TakeSharedFurniParams{UserID: session.UserID, AvatarID: session.AvatarID, FurniDefinitionID: id})
	}
	if err != nil {
		r.fail(w, err)
		return
	}
	page, err := r.newFurniPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Result, page.Failed = furniNothing, true
	if taken > 0 {
		page.Result, page.Failed = fmt.Sprintf(furniTaken, taken, page.Habbo), false
	}
	r.answer(w, "account/furni.html", page.Failed, page)
}
