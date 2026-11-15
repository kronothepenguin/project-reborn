package router

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's answers of store.php, and the description of its ledger rows.
const (
	storeCannotBuy     = "Sorry, but you can not buy this item!"
	storeNoCredits     = "You do not have enough credits to buy this item."
	storeHasBackground = "You already have a background of this type in your inventory!"
	storePurchase      = "Webstore purchase"
	reasonStore        = "store"
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

type storeItem struct {
	ID       int64  `json:"id"`
	Kind     string `json:"kind"`
	Name     string `json:"name"`
	Image    string `json:"image"`
	Price    int64  `json:"price"`
	Quantity int64  `json:"quantity"`
}

type storeError struct {
	Error string `json:"error"`
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

// HandleHomeStoreView handles GET /home-store: the categories the habbo may see,
// each with its main category, and the credits the user has.
func (r *Router) HandleHomeStoreView(w http.ResponseWriter, req *http.Request) {
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

// HandleHomeStoreCategoryView handles GET /home-store/categories/{id}: the items of
// the category that are sold. A category the habbo may not see does not exist.
func (r *Router) HandleHomeStoreCategoryView(w http.ResponseWriter, req *http.Request) {
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

type purchase struct {
	Credits int64 `json:"credits"`
}

// HandleHomeStoreItemPurchase handles POST /home-store/items/{id}/purchase: the
// wallet pays, the ledger says so and the inventory grows, in one transaction.
// The checks come in Holo's order: the item, the credits, then a background the
// user has already ([0064] makes a background an unlock).
func (r *Router) HandleHomeStoreItemPurchase(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{storeCannotBuy})
		return
	}
	item, ok, err := r.sellable(ctx, id)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !ok {
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{storeCannotBuy})
		return
	}

	refusal := ""
	var credits int64
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		if item.Kind == "background" {
			held, err := q.GetHomeInventoryQuantity(ctx, store.GetHomeInventoryQuantityParams{UserID: session.UserID, HomeStoreItemID: item.ID})
			switch {
			case err == nil && held > 0:
				refusal = storeHasBackground
				return nil
			case err != nil && !store.IsNotFound(err):
				return err
			}
		}
		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{
			UserID:    session.UserID,
			Credits:   -item.Price,
			UpdatedAt: now,
		})
		if err != nil {
			return err
		}
		if changed == 0 {
			refusal = storeNoCredits
			return nil
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    session.UserID,
			AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Credits:   -item.Price,
			Reason:    reasonStore,
			Detail:    storePurchase,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		err = q.AddHomeInventory(ctx, store.AddHomeInventoryParams{UserID: session.UserID, HomeStoreItemID: item.ID, Quantity: item.Quantity})
		if err != nil {
			return err
		}
		wallet, err := q.GetWallet(ctx, session.UserID)
		credits = wallet.Credits
		return err
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, storeError{refusal})
	default:
		r.answerJSON(w, http.StatusOK, purchase{Credits: credits})
	}
}

// sellable reports whether the habbo making the request may buy item id: it must
// exist, be sold, and sit in a category the habbo may see.
func (r *Router) sellable(ctx context.Context, id int64) (store.HomeStoreItem, bool, error) {
	item, err := r.deps.Queries.GetHomeStoreItem(ctx, id)
	if store.IsNotFound(err) {
		return item, false, nil
	}
	if err != nil {
		return item, false, err
	}
	category, err := r.deps.Queries.GetHomeStoreCategory(ctx, item.HomeStoreCategoryID)
	if err != nil {
		return item, false, err
	}
	return item, item.Enabled && r.shown(ctx, category), nil
}

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

// HandleMeInventoryView handles GET /me/inventory: what the user holds, which all
// their habbos share.
func (r *Router) HandleMeInventoryView(w http.ResponseWriter, req *http.Request) {
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
