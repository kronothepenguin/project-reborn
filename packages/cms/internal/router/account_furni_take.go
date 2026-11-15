package router

import (
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
