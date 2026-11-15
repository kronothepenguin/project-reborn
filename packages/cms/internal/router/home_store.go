package router

import (
	"context"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The main categories of Holo's webstore, which held the categories as fixed HTML.
const (
	sectionStickers    = "stickers"
	sectionBackgrounds = "backgrounds"
	sectionNotes       = "notes"
)

type storeCategory struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	StaffOnly bool   `json:"staffOnly"`
	Section   string `json:"section"`
}

// image is the address of an item's art, which the CMS serves from its public
// files.
func image(asset string) string {
	return "/" + asset
}

// section is the main category of Holo's webstore that holds category. The staff
// category stays under Stickers although it sells backgrounds, as in Holo.
func section(category int64) string {
	switch category {
	case seed.BackgroundsCategory:
		return sectionBackgrounds
	case seed.NotesCategory:
		return sectionNotes
	}
	return sectionStickers
}

// shown reports whether the habbo making the request may see category: the staff
// one takes homes.staffItems, as Holo's took a rank above 5.
func (r *Router) shown(ctx context.Context, category store.HomeStoreCategory) bool {
	return !category.StaffOnly || r.holds(ctx, auth.HomesStaffItems)
}

type storeView struct {
	Credits    int64           `json:"credits"`
	Categories []storeCategory `json:"categories"`
}

// HandleHomeStoreJSON handles GET /home-store: the categories the habbo may see,
// each with its main category, and the credits the user has.
func (r *Router) HandleHomeStoreJSON(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	categories, err := r.deps.Queries.ListHomeStoreCategories(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	wallet, err := r.deps.Queries.GetWallet(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	view := storeView{Credits: wallet.Credits, Categories: []storeCategory{}}
	for _, category := range categories {
		if !r.shown(ctx, category) {
			continue
		}
		view.Categories = append(view.Categories, storeCategory{
			ID:        category.ID,
			Name:      category.Name,
			StaffOnly: category.StaffOnly,
			Section:   section(category.ID),
		})
	}
	r.answerJSON(w, http.StatusOK, view)
}
