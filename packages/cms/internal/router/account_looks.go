package router

import (
	"context"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// looksPage gives club members the wardrobe: WardrobeSlots slots, with the
// active habbo's Outfits in them.
type looksPage struct {
	accountPage
	Figure        string
	Gender        string
	Club          bool
	WardrobeSlots int
	Outfits       []wardrobeOutfit
}

func (r *Router) newLooksPage(ctx context.Context) (looksPage, error) {
	session, _ := auth.FromContext(ctx)
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return looksPage{}, err
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return looksPage{}, err
	}
	club, err := r.inClub(ctx, session.UserID)
	if err != nil {
		return looksPage{}, err
	}
	page := looksPage{accountPage: account, Figure: avatar.Figure, Gender: avatar.Gender, Club: club}
	if club {
		page.WardrobeSlots = settings.Int(ctx, r.deps.Queries, "homes.wardrobeSlots")
		if page.Outfits, err = r.wardrobeOutfits(ctx, session.AvatarID, page.WardrobeSlots); err != nil {
			return looksPage{}, err
		}
	}
	return page, nil
}

// HandleAccountLooksView renders GET /account/looks.
func (r *Router) HandleAccountLooksView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newLooksPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/looks.html", false, page)
}

// HandleAccountLooksSave handles the POST /account/looks action.
func (r *Router) HandleAccountLooksSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	figure, gender := req.PostFormValue("figure"), req.PostFormValue("gender")

	result := "Account settings updated successfully."
	failed := true
	switch {
	case gender != "M" && gender != "F":
		result = "An error occurred. Please try again."
	case auth.ValidateLook(figure, gender) != nil:
		result = "An error occurred trying to process your request."
	default:
		err := r.deps.Queries.UpdateAvatarLook(ctx, store.UpdateAvatarLookParams{
			ID:        session.AvatarID,
			Figure:    figure,
			Gender:    gender,
			UpdatedAt: time.Now().UTC(),
		})
		if err != nil {
			r.fail(w, err)
			return
		}
		r.sendLook(ctx, session.AvatarID)
		failed = false
	}

	page, err := r.newLooksPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Result, page.Failed = result, failed
	r.answer(w, "account/looks.html", failed, page)
}
