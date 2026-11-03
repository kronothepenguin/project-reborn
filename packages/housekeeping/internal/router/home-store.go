package router

import (
	"context"
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const homeStorePerPage = 100

const (
	storeCreated         = "Success, your sticker/background has been added"
	storeSaved           = "Item updated successfully."
	storeBlank           = "Please do not leave any fields blank."
	storeImageMissing    = "This image does not exist."
	storeCategoryMissing = "This category does not exist."
	storePriceInvalid    = "The price must be a number from 0 to 2147483647."
	storeQuantityInvalid = "The quantity must be a number from 1 to 2147483647."
)

// artFolders give an item its kind. Notes come only from the seed, so no art makes one.
var artFolders = []struct{ prefix, kind string }{
	{"c_images/stickers/", "sticker"},
	{"c_images/backgrounds2/", "background"},
}

// artKind accepts only the art of the CMS's public files, because the path becomes
// the address of an image on every page that shows the item.
func artKind(asset string) (string, bool) {
	if !slices.Contains(seed.Art(), asset) {
		return "", false
	}
	for _, folder := range artFolders {
		if strings.HasPrefix(asset, folder.prefix) {
			return folder.kind, true
		}
	}
	return "", false
}

// storeItemForm is a form as it was typed, so that a refused one shows it again.
type storeItemForm struct {
	Asset    string
	Category string
	Name     string
	Price    string
	Quantity string
	Enabled  bool
}

type homeStorePage struct {
	chrome
	New        storeItemForm
	Art        []string
	Categories []categoryOption
	Items      []storeItemRow
	Page       int
	Older      int
	Newer      int
	Message    string
	Error      string
}

type categoryOption struct {
	ID       int64
	Name     string
	Selected bool
}

type storeItemRow struct {
	ID         int64
	Asset      string
	Name       string
	Price      string
	Quantity   string
	Enabled    bool
	Categories []categoryOption
}

// storeEdit is a refused edit, whose row shows what was typed. An id of 0 means none.
type storeEdit struct {
	id   int64
	form storeItemForm
}

func categoryOptions(categories []store.HomeStoreCategory, selected string) []categoryOption {
	options := make([]categoryOption, 0, len(categories))
	for _, category := range categories {
		options = append(options, categoryOption{
			ID:       category.ID,
			Name:     category.Name,
			Selected: strconv.FormatInt(category.ID, 10) == selected,
		})
	}
	return options
}

// newHomeStorePage reads the whole store and pages it here: it is a catalogue of a
// few hundred items that staff keep, not a list that grows by itself.
func (r *Router) newHomeStorePage(req *http.Request, create storeItemForm, edit storeEdit) (homeStorePage, error) {
	ctx := req.Context()
	page := homeStorePage{chrome: r.chrome(req), New: create, Art: seed.Art()}
	categories, err := r.deps.Queries.ListHomeStoreCategories(ctx)
	if err != nil {
		return page, err
	}
	page.Categories = categoryOptions(categories, create.Category)
	items, err := r.deps.Queries.ListHomeStoreItems(ctx)
	if err != nil {
		return page, err
	}
	total := int64(len(items))
	paged := pageOf(req, total, homeStorePerPage)
	page.Page = int(paged.offset/homeStorePerPage) + 1
	page.Older, page.Newer = paged.older, paged.newer
	for _, item := range items[paged.offset:min(paged.offset+homeStorePerPage, total)] {
		form := storeItemForm{
			Category: strconv.FormatInt(item.HomeStoreCategoryID, 10),
			Name:     item.Name,
			Price:    strconv.FormatInt(item.Price, 10),
			Quantity: strconv.FormatInt(item.Quantity, 10),
			Enabled:  item.Enabled,
		}
		if item.ID == edit.id {
			form = edit.form
		}
		page.Items = append(page.Items, storeItemRow{
			ID:         item.ID,
			Asset:      item.Asset,
			Name:       form.Name,
			Price:      form.Price,
			Quantity:   form.Quantity,
			Enabled:    form.Enabled,
			Categories: categoryOptions(categories, form.Category),
		})
	}
	return page, nil
}

// HandleHomeStoreView renders GET /housekeeping/home-store: Holo's Stickers &
// Backgrounds form, over the store, where each item is edited in its row.
func (r *Router) HandleHomeStoreView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newHomeStorePage(req, storeItemForm{}, storeEdit{})
	if err != nil {
		r.fail(w, err)
		return
	}
	switch query := req.URL.Query(); {
	case query.Has("created"):
		page.Message = storeCreated
	case query.Has("saved"):
		page.Message = storeSaved
	}
	astro.WriteTemplate(w, r.deps.Resolver, "home-store.html", page)
}

func (r *Router) refuseHomeStore(w http.ResponseWriter, req *http.Request, create storeItemForm, edit storeEdit, message string) {
	page, err := r.newHomeStorePage(req, create, edit)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, "home-store.html", page)
}

// storeCategory reports false for a category that does not exist.
func (r *Router) storeCategory(ctx context.Context, posted string) (store.HomeStoreCategory, bool, error) {
	id, err := strconv.ParseInt(posted, 10, 64)
	if err != nil {
		return store.HomeStoreCategory{}, false, nil
	}
	category, err := r.deps.Queries.GetHomeStoreCategory(ctx, id)
	if store.IsNotFound(err) {
		return category, false, nil
	}
	return category, err == nil, err
}

// storePrice takes the wallet's limit, because a price is paid from a wallet.
func storePrice(posted string) (int64, bool) {
	price, err := strconv.ParseInt(posted, 10, 64)
	return price, err == nil && price >= 0 && price <= maxWalletAmount
}

// storeQuantity is capped like a wallet, since every purchase adds it to an
// inventory, where a sum past SQLite's integers would turn into a float.
func storeQuantity(posted string) (int64, bool) {
	quantity, err := strconv.ParseInt(posted, 10, 64)
	return quantity, err == nil && quantity >= 1 && quantity <= maxWalletAmount
}

// HandleHomeStoreCreate handles POST /housekeeping/home-store, Holo's Create Sticker.
// Holo fetched any URL and appended CSS for it, and made every item a sticker. Here
// the image is one of the art in the repository, and its folder gives the kind.
func (r *Router) HandleHomeStoreCreate(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	form := storeItemForm{
		Asset:    req.PostFormValue("asset"),
		Category: req.PostFormValue("category"),
		Name:     strings.TrimSpace(req.PostFormValue("name")),
		Price:    req.PostFormValue("price"),
	}
	refuse := func(message string) {
		r.refuseHomeStore(w, req, form, storeEdit{}, message)
	}
	if form.Asset == "" || form.Category == "" || form.Name == "" || form.Price == "" {
		refuse(storeBlank)
		return
	}
	kind, ok := artKind(form.Asset)
	if !ok {
		refuse(storeImageMissing)
		return
	}
	category, found, err := r.storeCategory(ctx, form.Category)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !found {
		refuse(storeCategoryMissing)
		return
	}
	price, ok := storePrice(form.Price)
	if !ok {
		refuse(storePriceInvalid)
		return
	}

	err = r.inTx(ctx, func(q *store.Queries) error {
		_, err := q.CreateHomeStoreItem(ctx, store.CreateHomeStoreItemParams{
			HomeStoreCategoryID: category.ID,
			Kind:                kind,
			Asset:               form.Asset,
			Name:                form.Name,
			Price:               price,
			// Holo's form had no amount, and its column defaulted to 1.
			Quantity: 1,
			Enabled:  true,
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action: actionHomeStoreCreate,
			detail: fmt.Sprintf("%s worth %d credits", form.Name, price),
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/home-store?created=1", http.StatusSeeOther)
}

// storePage is the page a row's form came from, so that the answer goes back to it.
func storePage(req *http.Request) int {
	page, err := strconv.Atoi(req.URL.Query().Get("page"))
	if err != nil || page < 1 {
		return 1
	}
	return page
}

// HandleHomeStoreItemSave handles POST /housekeeping/home-store/{id}. Purchases point
// at items, so an item is never deleted: it stops being sold instead.
func (r *Router) HandleHomeStoreItemSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	_, err = r.deps.Queries.GetHomeStoreItem(ctx, id)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	form := storeItemForm{
		Category: req.PostFormValue("category"),
		Name:     strings.TrimSpace(req.PostFormValue("name")),
		Price:    req.PostFormValue("price"),
		Quantity: req.PostFormValue("quantity"),
		Enabled:  req.PostFormValue("enabled") != "",
	}
	refuse := func(message string) {
		r.refuseHomeStore(w, req, storeItemForm{}, storeEdit{id: id, form: form}, message)
	}
	if form.Category == "" || form.Name == "" || form.Price == "" || form.Quantity == "" {
		refuse(storeBlank)
		return
	}
	category, found, err := r.storeCategory(ctx, form.Category)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !found {
		refuse(storeCategoryMissing)
		return
	}
	price, ok := storePrice(form.Price)
	if !ok {
		refuse(storePriceInvalid)
		return
	}
	quantity, ok := storeQuantity(form.Quantity)
	if !ok {
		refuse(storeQuantityInvalid)
		return
	}

	err = r.inTx(ctx, func(q *store.Queries) error {
		item, err := q.GetHomeStoreItem(ctx, id)
		if err != nil {
			return err
		}
		var changed []string
		if form.Name != item.Name {
			changed = append(changed, "name")
		}
		if price != item.Price {
			changed = append(changed, "price")
		}
		if category.ID != item.HomeStoreCategoryID {
			changed = append(changed, "category")
		}
		if quantity != item.Quantity {
			changed = append(changed, "quantity")
		}
		if form.Enabled != item.Enabled {
			changed = append(changed, "enabled")
		}
		if len(changed) == 0 {
			return nil
		}
		err = q.UpdateHomeStoreItem(ctx, store.UpdateHomeStoreItemParams{
			ID:                  id,
			HomeStoreCategoryID: category.ID,
			Name:                form.Name,
			Price:               price,
			Quantity:            quantity,
			Enabled:             form.Enabled,
		})
		if err != nil {
			return err
		}
		// staff_logs has no column for an item, so the detail names it.
		return writeLog(req, q, staffLog{
			action: actionHomeStoreUpdate,
			detail: fmt.Sprintf("%s (ID: %d): %s", form.Name, id, strings.Join(changed, ", ")),
		})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, fmt.Sprintf("/housekeeping/home-store?page=%d&saved=1", storePage(req)), http.StatusSeeOther)
}
