package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	sticker    = "c_images/stickers/bling_star.gif"
	background = "c_images/backgrounds2/bg_rain.gif"
	storeBlank = "Please do not leave any fields blank."
	storePrice = "The price must be a number from 0 to 2147483647."
	seedItems  = 298
)

// storeRow finds the items of a printed page.
var storeRow = regexp.MustCompile(`\{ID:(\d+) Asset:`)

func storeItemURL(id int64) string {
	return fmt.Sprintf("/housekeeping/home-store/%d", id)
}

func seedStore(t *testing.T, db *sql.DB) {
	t.Helper()
	if err := seed.HomeStore(t.Context(), store.New(db)); err != nil {
		t.Fatalf("seed.HomeStore: %v", err)
	}
}

func keeper(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingHomeStore)
}

func createForm(asset, category, name, price string) url.Values {
	return url.Values{"asset": {asset}, "category": {category}, "name": {name}, "price": {price}}
}

// editForm is what an item's row posts when nothing in it was touched.
func editForm(item store.HomeStoreItem) url.Values {
	form := url.Values{
		"name":     {item.Name},
		"category": {fmt.Sprint(item.HomeStoreCategoryID)},
		"price":    {fmt.Sprint(item.Price)},
		"quantity": {fmt.Sprint(item.Quantity)},
	}
	if item.Enabled {
		form.Set("enabled", "1")
	}
	return form
}

func storeItem(t *testing.T, db *sql.DB, id int64) store.HomeStoreItem {
	t.Helper()
	item, err := store.New(db).GetHomeStoreItem(t.Context(), id)
	if err != nil {
		t.Fatalf("GetHomeStoreItem %d: %v", id, err)
	}
	return item
}

func newestStoreItem(t *testing.T, db *sql.DB) store.HomeStoreItem {
	t.Helper()
	var id int64
	if err := db.QueryRowContext(t.Context(), `SELECT MAX(id) FROM home_store_items`).Scan(&id); err != nil {
		t.Fatalf("find the newest item: %v", err)
	}
	return storeItem(t, db, id)
}

func storeItems(t *testing.T, db *sql.DB) []store.HomeStoreItem {
	t.Helper()
	items, err := store.New(db).ListHomeStoreItems(t.Context())
	if err != nil {
		t.Fatalf("ListHomeStoreItems: %v", err)
	}
	return items
}

func wantActor(t *testing.T, db *sql.DB, action string, userID int64) {
	t.Helper()
	for _, row := range logsOf(t, db, action) {
		if row.UserID.Int64 != userID {
			t.Errorf("%s was written by user %v, want %d", action, row.UserID, userID)
		}
	}
}

func rowsOf(body string) []string {
	var ids []string
	for _, match := range storeRow.FindAllStringSubmatch(body, -1) {
		ids = append(ids, match[1])
	}
	return ids
}

func TestTheHomeStoreTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := ranked(t, db, "Writer", 7, auth.HousekeepingAccess, auth.HousekeepingSettings, auth.HousekeepingNews, auth.HousekeepingLogs)
	before := storeItem(t, db, 2)
	changed := editForm(before)
	changed.Set("price", "9")
	changed.Del("enabled")

	wantPage(t, serve(mux, "GET", "/housekeeping/home-store", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(sticker, "3", "Shining Star", "5")), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", storeItemURL(2), cookie, changed), http.StatusForbidden, "access-denied.html")

	if got := count(t, db, `SELECT COUNT(*) FROM home_store_items`); got != seedItems {
		t.Errorf("%d items, want %d", got, seedItems)
	}
	if after := storeItem(t, db, 2); after != before {
		t.Errorf("item = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestCreatingASticker(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	actor, cookie := keeper(t, db)

	rec := serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(sticker, "3", "Shining Star", "5"))
	wantRedirect(t, rec, "/housekeeping/home-store?created=1")

	item := newestStoreItem(t, db)
	want := store.HomeStoreItem{ID: item.ID, HomeStoreCategoryID: 3, Kind: "sticker", Asset: sticker, Name: "Shining Star", Price: 5, Quantity: 1, Enabled: true}
	if item != want {
		t.Errorf("item = %+v, want %+v", item, want)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/home-store?created=1", cookie, nil), http.StatusOK,
		"home-store.html", "Message:Success, your sticker/background has been added Error:",
		fmt.Sprintf("{ID:%d Asset:%s Name:Shining Star Price:5 Quantity:1 Enabled:true", item.ID, sticker))
	wantOneLog(t, db, "homeStore.create", "Shining Star worth 5 credits", 0, 0)
	wantActor(t, db, "homeStore.create", actor)
}

// Holo made every item a sticker, even in its Backgrounds category.
func TestTheKindComesFromTheFolder(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)

	for _, c := range []struct {
		asset    string
		category string
		kind     string
	}{
		{background, "27", "background"},
		{sticker, "27", "sticker"},
		{background, "3", "background"},
	} {
		rec := serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(c.asset, c.category, "Item", "1"))
		wantRedirect(t, rec, "/housekeeping/home-store?created=1")
		if item := newestStoreItem(t, db); item.Kind != c.kind || item.Asset != c.asset || fmt.Sprint(item.HomeStoreCategoryID) != c.category {
			t.Errorf("%s in %s = %+v, want a %s", c.asset, c.category, item, c.kind)
		}
	}
	if rows := logsOf(t, db, "homeStore.create"); len(rows) != 3 {
		t.Errorf("%d log rows, want 3", len(rows))
	}
}

func TestTheNameIsTrimmedAndAPriceCanBeZero(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(sticker, "19", "  Free Star \t", "0")), "/housekeeping/home-store?created=1")
	if item := newestStoreItem(t, db); item.Name != "Free Star" || item.Price != 0 {
		t.Errorf("item = %+v", item)
	}
	wantOneLog(t, db, "homeStore.create", "Free Star worth 0 credits", 0, 0)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(sticker, "19", "Dear Star", "2147483647")), "/housekeeping/home-store?created=1")
	if item := newestStoreItem(t, db); item.Price != 2147483647 {
		t.Errorf("item = %+v", item)
	}
}

func TestABadItemIsRefused(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)

	for _, c := range []struct {
		name  string
		field string
		value string
		want  string
	}{
		{"no image", "asset", "", storeBlank},
		{"no category", "category", "", storeBlank},
		{"no name", "name", "", storeBlank},
		{"a name of spaces", "name", "   ", storeBlank},
		{"no price", "price", "", storeBlank},
		{"an image that is not there", "asset", "c_images/stickers/nope.gif", "This image does not exist."},
		{"a path out of the art", "asset", "c_images/stickers/../../config.json", "This image does not exist."},
		{"other art of the site", "asset", "c_images/album1584/ADM.gif", "This image does not exist."},
		{"an address", "asset", "https://images.habbo.com/c_images/stickers/bling_star.gif", "This image does not exist."},
		{"an unknown category", "category", "999", "This category does not exist."},
		{"a category by name", "category", "General", "This category does not exist."},
		{"a negative price", "price", "-1", storePrice},
		{"a price too high", "price", "2147483648", storePrice},
		{"a price with decimals", "price", "1.5", storePrice},
		{"a price that is no number", "price", "free", storePrice},
	} {
		t.Run(c.name, func(t *testing.T) {
			form := createForm(sticker, "3", "Shining Star", "5")
			form.Set(c.field, c.value)
			rec := serve(mux, "POST", "/housekeeping/home-store", cookie, form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "home-store.html", "Error:"+c.want)
		})
	}
	if got := count(t, db, `SELECT COUNT(*) FROM home_store_items`); got != seedItems {
		t.Errorf("%d items, want %d", got, seedItems)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestARefusedItemKeepsWhatWasTyped(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)

	rec := serve(mux, "POST", "/housekeeping/home-store", cookie, createForm("c_images/stickers/nope.gif", "27", " Typed ", "12"))
	wantPage(t, rec, http.StatusUnprocessableEntity,
		"New:{Asset:c_images/stickers/nope.gif Category:27 Name:Typed Price:12 Quantity: Enabled:false}",
		"{ID:27 Name:Backgrounds Selected:true}")
}

func TestEditingAnItem(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	actor, cookie := keeper(t, db)

	form := url.Values{"name": {" Trax Sound "}, "category": {"19"}, "price": {"4"}, "quantity": {"3"}, "enabled": {"1"}}
	wantRedirect(t, serve(mux, "POST", storeItemURL(2)+"?page=1", cookie, form), "/housekeeping/home-store?page=1&saved=1")

	want := store.HomeStoreItem{ID: 2, HomeStoreCategoryID: 19, Kind: "sticker", Asset: "c_images/stickers/trax_sfx.gif", Name: "Trax Sound", Price: 4, Quantity: 3, Enabled: true}
	if item := storeItem(t, db, 2); item != want {
		t.Errorf("item = %+v, want %+v", item, want)
	}
	wantOneLog(t, db, "homeStore.update", "Trax Sound (ID: 2): name, price, category, quantity", 0, 0)
	wantActor(t, db, "homeStore.update", actor)
	wantPage(t, serve(mux, "GET", "/housekeeping/home-store?page=1&saved=1", cookie, nil), http.StatusOK,
		"Message:Item updated successfully. Error:")
}

func TestStoppingTheSalesOfAnItem(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	actor, cookie := keeper(t, db)
	q := store.New(db)

	form := editForm(storeItem(t, db, 2))
	form.Del("enabled")
	wantRedirect(t, serve(mux, "POST", storeItemURL(2)+"?page=1", cookie, form), "/housekeeping/home-store?page=1&saved=1")

	if item := storeItem(t, db, 2); item.Enabled || item.Name != "Trax SFX" || item.Price != 1 {
		t.Errorf("item = %+v", item)
	}
	sold, err := q.ListEnabledHomeStoreItems(t.Context(), 3)
	if err != nil {
		t.Fatalf("ListEnabledHomeStoreItems: %v", err)
	}
	for _, item := range sold {
		if item.ID == 2 {
			t.Error("the store still sells the item")
		}
	}
	wantOneLog(t, db, "homeStore.update", "Trax SFX (ID: 2): enabled", 0, 0)
	wantActor(t, db, "homeStore.update", actor)
	wantPage(t, serve(mux, "GET", "/housekeeping/home-store", cookie, nil), http.StatusOK,
		"{ID:2 Asset:c_images/stickers/trax_sfx.gif Name:Trax SFX Price:1 Quantity:1 Enabled:false")

	form.Set("enabled", "1")
	wantRedirect(t, serve(mux, "POST", storeItemURL(2)+"?page=1", cookie, form), "/housekeeping/home-store?page=1&saved=1")
	if !storeItem(t, db, 2).Enabled {
		t.Error("the item is not sold again")
	}
	if rows := logsOf(t, db, "homeStore.update"); len(rows) != 2 {
		t.Errorf("%d log rows, want 2", len(rows))
	}
}

func TestSavingAnItemUnchangedLogsNothing(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)
	before := storeItem(t, db, 2)

	wantRedirect(t, serve(mux, "POST", storeItemURL(2)+"?page=1", cookie, editForm(before)), "/housekeeping/home-store?page=1&saved=1")
	if after := storeItem(t, db, 2); after != before {
		t.Errorf("item = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestABadEditIsRefused(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)
	before := storeItem(t, db, 2)

	for _, c := range []struct {
		name  string
		field string
		value string
		want  string
	}{
		{"no name", "name", "", storeBlank},
		{"a name of spaces", "name", "  ", storeBlank},
		{"no category", "category", "", storeBlank},
		{"no price", "price", "", storeBlank},
		{"no quantity", "quantity", "", storeBlank},
		{"an unknown category", "category", "999", "This category does not exist."},
		{"a category by name", "category", "Trax", "This category does not exist."},
		{"a negative price", "price", "-1", storePrice},
		{"a price too high", "price", "2147483648", storePrice},
		{"a price that is no number", "price", "cheap", storePrice},
		{"no units", "quantity", "0", "The quantity must be a number from 1 to 2147483647."},
		{"a negative quantity", "quantity", "-5", "The quantity must be a number from 1 to 2147483647."},
		{"a quantity with decimals", "quantity", "1.5", "The quantity must be a number from 1 to 2147483647."},
		{"a quantity past what a number holds", "quantity", "9223372036854775808", "The quantity must be a number from 1 to 2147483647."},
		{"a quantity past a wallet's limit", "quantity", "2147483648", "The quantity must be a number from 1 to 2147483647."},
	} {
		t.Run(c.name, func(t *testing.T) {
			form := editForm(before)
			form.Set("price", "9")
			form.Set(c.field, c.value)
			rec := serve(mux, "POST", storeItemURL(2)+"?page=1", cookie, form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "home-store.html", "Error:"+c.want)
		})
	}
	if after := storeItem(t, db, 2); after != before {
		t.Errorf("item = %+v, want %+v", after, before)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

// The row of a refused edit shows what was typed, on the page its form came from.
func TestARefusedEditKeepsWhatWasTyped(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)
	item := storeItems(t, db)[250]

	form := url.Values{"name": {"Typed Name"}, "category": {"27"}, "price": {"6"}, "quantity": {"0"}}
	rec := serve(mux, "POST", storeItemURL(item.ID)+"?page=3", cookie, form)
	wantPage(t, rec, http.StatusUnprocessableEntity, "Page:3 Older:0 Newer:2",
		fmt.Sprintf("{ID:%d Asset:%s Name:Typed Name Price:6 Quantity:0 Enabled:false", item.ID, item.Asset))
	if after := storeItem(t, db, item.ID); after != item {
		t.Errorf("item = %+v, want %+v", after, item)
	}
}

func TestEditingAnItemThatDoesNotExistIsNotFound(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)
	form := url.Values{"name": {"Ghost"}, "category": {"3"}, "price": {"1"}, "quantity": {"1"}}

	wantPage(t, serve(mux, "POST", storeItemURL(999), cookie, form), http.StatusNotFound)
	wantPage(t, serve(mux, "POST", "/housekeeping/home-store/ghost", cookie, form), http.StatusNotFound)
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestTheStoreComesInPages(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)
	items := storeItems(t, db)
	idsOf := func(items []store.HomeStoreItem) []string {
		var ids []string
		for _, item := range items {
			ids = append(ids, fmt.Sprint(item.ID))
		}
		return ids
	}

	for _, c := range []struct {
		path  string
		pages string
		want  []store.HomeStoreItem
	}{
		{"/housekeeping/home-store", "Page:1 Older:2 Newer:0", items[:100]},
		{"/housekeeping/home-store?page=2", "Page:2 Older:3 Newer:1", items[100:200]},
		{"/housekeeping/home-store?page=3", "Page:3 Older:0 Newer:2", items[200:]},
		{"/housekeeping/home-store?page=9", "Page:3 Older:0 Newer:2", items[200:]},
		{"/housekeeping/home-store?page=nine", "Page:1 Older:2 Newer:0", items[:100]},
	} {
		rec := serve(mux, "GET", c.path, cookie, nil)
		wantPage(t, rec, http.StatusOK, "home-store.html", c.pages)
		if got, want := rowsOf(rec.Body.String()), idsOf(c.want); strings.Join(got, ",") != strings.Join(want, ",") {
			t.Errorf("%s shows %d items %v, want %d %v", c.path, len(got), got, len(want), want)
		}
	}

	last := items[len(items)-1]
	wantRedirect(t, serve(mux, "POST", storeItemURL(last.ID)+"?page=3", cookie, editForm(last)), "/housekeeping/home-store?page=3&saved=1")
	wantRedirect(t, serve(mux, "POST", storeItemURL(last.ID)+"?page=x", cookie, editForm(last)), "/housekeeping/home-store?page=1&saved=1")
}

func TestThePageListsWhatTheFormsNeed(t *testing.T) {
	db, mux := newSite(t)
	seedStore(t, db)
	_, cookie := keeper(t, db)

	rec := serve(mux, "GET", "/housekeeping/home-store", cookie, nil)
	wantPage(t, rec, http.StatusOK, "SiteURL:http://localhost:17387",
		"Art:[c_images/stickers/27224_sticker_themepark_001.gif ", " c_images/backgrounds2/bg_rain.gif ",
		"Categories:[{ID:19 Name:General Selected:false} {ID:50 Name:Staff Selected:false} {ID:3 Name:Trax Selected:false}",
		"{ID:29 Name:Notes Selected:false}]",
		"{ID:2 Asset:c_images/stickers/trax_sfx.gif Name:Trax SFX Price:1 Quantity:1 Enabled:true Categories:[{ID:19 Name:General Selected:false} {ID:50 Name:Staff Selected:false} {ID:3 Name:Trax Selected:true}")
	if strings.Contains(rec.Body.String(), "Message:Success") {
		t.Error("a plain page has a message")
	}
}

func TestTheStoreWorksOnAnEmptyDatabase(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := keeper(t, db)

	wantPage(t, serve(mux, "GET", "/housekeeping/home-store", cookie, nil), http.StatusOK, "Categories:[] Items:[] Page:1 Older:0 Newer:0")
	rec := serve(mux, "POST", "/housekeeping/home-store", cookie, createForm(sticker, "3", "Shining Star", "5"))
	wantPage(t, rec, http.StatusUnprocessableEntity, "Error:This category does not exist.")
}
