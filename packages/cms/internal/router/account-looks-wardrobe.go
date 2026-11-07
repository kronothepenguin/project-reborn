package router

import (
	"context"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// outfitRefused answers every outfit the wardrobe does not keep, which the page
// shows as Holo's "Error! This outfit cannot be saved.".
const outfitRefused = "invalid"

// wardrobeOutfit is a filled slot of the club wardrobe, with its picture.
type wardrobeOutfit struct {
	Slot    int64
	Figure  string
	Gender  string
	Picture string
}

type outfitBody struct {
	Figure string `json:"figure"`
	Gender string `json:"gender"`
}

type outfitAnswer struct {
	Picture string `json:"picture,omitempty"`
	Error   string `json:"error,omitempty"`
}

// outfitPicture is the picture Holo's wardrobe showed of an outfit: small, facing
// the front and smiling.
func outfitPicture(figure string) string {
	return settings.GetString("imaging.avatarUrl") + "?figure=" + url.QueryEscape(figure) + "&size=s&direction=4&head_direction=4&gesture=sml"
}

// wardrobeOutfits lists the habbo's outfits in the first slots of the wardrobe.
// An outfit in a slot that a lower homes.wardrobeSlots took away stays stored,
// out of sight.
func (r *Router) wardrobeOutfits(ctx context.Context, avatarID int64, slots int) ([]wardrobeOutfit, error) {
	stored, err := r.deps.Queries.ListWardrobeOutfits(ctx, avatarID)
	if err != nil {
		return nil, err
	}
	var outfits []wardrobeOutfit
	for _, outfit := range stored {
		if outfit.Slot <= int64(slots) {
			outfits = append(outfits, wardrobeOutfit{Slot: outfit.Slot, Figure: outfit.Figure, Gender: outfit.Gender, Picture: outfitPicture(outfit.Figure)})
		}
	}
	return outfits, nil
}

// HandleAccountLooksWardrobeStore handles POST /account/looks/wardrobe/{slot},
// wardrobestore.php: a club member keeps the editor's look in a slot of the active
// habbo, over the outfit there, and the answer is the outfit's picture. Holo
// stored a slot it did not know as slot 1 and a gender as M, and never asked for
// the club; all three are refused here.
func (r *Router) HandleAccountLooksWardrobeStore(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body outfitBody
	if !readEdit(w, req, &body) {
		return
	}
	slot, err := strconv.ParseInt(req.PathValue("slot"), 10, 64)
	if err != nil || slot < 1 || slot > int64(settings.GetInt("homes.wardrobeSlots")) || auth.ValidateLook(body.Figure, body.Gender) != nil {
		r.answerJSON(w, http.StatusUnprocessableEntity, outfitAnswer{Error: outfitRefused})
		return
	}
	session, _ := auth.FromContext(ctx)
	club, err := r.inClub(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !club {
		r.answerJSON(w, http.StatusUnprocessableEntity, outfitAnswer{Error: outfitRefused})
		return
	}
	err = r.deps.Queries.UpsertWardrobeOutfit(ctx, store.UpsertWardrobeOutfitParams{
		AvatarID:  session.AvatarID,
		Slot:      slot,
		Figure:    body.Figure,
		Gender:    body.Gender,
		UpdatedAt: time.Now().UTC(),
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answerJSON(w, http.StatusOK, outfitAnswer{Picture: outfitPicture(body.Figure)})
}
