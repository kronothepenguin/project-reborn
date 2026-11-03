package cms

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// shopper is a signed-in habbo with credits on a site whose store is seeded.
func shopper(t *testing.T, credits int64) (*sql.DB, *http.ServeMux, *http.Cookie, int64) {
	t.Helper()
	db, mux := newSite(t)
	userID := habbo(t, db, "frank@example.com", "Frank")
	if credits > 0 {
		if _, err := store.New(db).ChangeWalletCredits(t.Context(), store.ChangeWalletCreditsParams{UserID: userID, Credits: credits, UpdatedAt: testNow}); err != nil {
			t.Fatalf("ChangeWalletCredits: %v", err)
		}
	}
	return db, mux, login(t, db, "Frank"), userID
}

func getJSON(mux *http.ServeMux, path string, cookie *http.Cookie) *httptest.ResponseRecorder {
	r := httptest.NewRequest("GET", path, nil)
	r.Header.Set("Accept", "application/json")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func buy(mux *http.ServeMux, cookie *http.Cookie, item int64) *httptest.ResponseRecorder {
	r := httptest.NewRequest("POST", fmt.Sprintf("/home-store/items/%d/purchase", item), nil)
	r.Header.Set("Accept", "application/json")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func decode[T any](t *testing.T, rec *httptest.ResponseRecorder) T {
	t.Helper()
	var v T
	if err := json.Unmarshal(rec.Body.Bytes(), &v); err != nil {
		t.Fatalf("decode %q: %v", rec.Body.String(), err)
	}
	return v
}

func walletOf(t *testing.T, db *sql.DB, userID int64) int64 {
	t.Helper()
	wallet, err := store.New(db).GetWallet(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}
	return wallet.Credits
}

func heldOf(t *testing.T, db *sql.DB, userID, item int64) int64 {
	t.Helper()
	held, err := store.New(db).GetHomeInventoryQuantity(t.Context(), store.GetHomeInventoryQuantityParams{UserID: userID, HomeStoreItemID: item})
	if store.IsNotFound(err) {
		return 0
	}
	if err != nil {
		t.Fatalf("GetHomeInventoryQuantity: %v", err)
	}
	return held
}

type categoryView struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	StaffOnly bool   `json:"staffOnly"`
	Section   string `json:"section"`
}

type storeAnswer struct {
	Credits    int64          `json:"credits"`
	Categories []categoryView `json:"categories"`
}

func TestTheStoreNeedsASession(t *testing.T) {
	_, mux := newSite(t)
	for _, path := range []string{"/home-store", "/home-store/categories/19", "/me/inventory"} {
		if rec := getJSON(mux, path, nil); rec.Code != http.StatusUnauthorized {
			t.Errorf("%s answers %d to a guest", path, rec.Code)
		}
	}
	if rec := buy(mux, nil, 1); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's purchase answers %d", rec.Code)
	}
}

func TestTheStoreListsHolosCategories(t *testing.T) {
	_, mux, cookie, _ := shopper(t, 50)

	answer := decode[storeAnswer](t, getJSON(mux, "/home-store", cookie))
	if answer.Credits != 50 {
		t.Errorf("credits = %d", answer.Credits)
	}
	got := make(map[int64]categoryView)
	for _, c := range answer.Categories {
		got[c.ID] = c
	}
	if len(answer.Categories) != 19 || answer.Categories[0].Name != "General" {
		t.Errorf("categories = %+v", answer.Categories)
	}
	for id, section := range map[int64]string{19: "stickers", 3: "stickers", 17: "stickers", 20: "stickers", 27: "backgrounds", 29: "notes"} {
		if got[id].Section != section {
			t.Errorf("category %d is under %q, want %q", id, got[id].Section, section)
		}
	}
	if _, ok := got[50]; ok {
		t.Error("the staff category shows without homes.staffItems")
	}
}

func TestStaffSeeTheStaffCategory(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 50)
	grant(t, db, userID, auth.HomesStaffItems)

	answer := decode[storeAnswer](t, getJSON(mux, "/home-store", cookie))
	if len(answer.Categories) != 20 || !answer.Categories[1].StaffOnly || answer.Categories[1].Section != "stickers" {
		t.Errorf("categories = %+v", answer.Categories)
	}
	if rec := getJSON(mux, "/home-store/categories/50", cookie); rec.Code != http.StatusOK {
		t.Errorf("the staff category answers %d", rec.Code)
	}
}

func TestACategoryListsWhatIsSold(t *testing.T) {
	db, mux, cookie, _ := shopper(t, 50)
	if err := store.New(db).UpdateHomeStoreItem(t.Context(), store.UpdateHomeStoreItemParams{ID: 2, HomeStoreCategoryID: 3, Name: "Trax SFX", Price: 1, Quantity: 1, Enabled: false}); err != nil {
		t.Fatal(err)
	}

	type item struct {
		ID       int64  `json:"id"`
		Kind     string `json:"kind"`
		Image    string `json:"image"`
		Price    int64  `json:"price"`
		Quantity int64  `json:"quantity"`
	}
	items := decode[[]item](t, getJSON(mux, "/home-store/categories/3", cookie))
	if len(items) != 9 || items[0].ID != 3 || items[0].Image != "/c_images/stickers/trax_disco.gif" || items[0].Kind != "sticker" {
		t.Errorf("items = %+v", items)
	}
	notes := decode[[]item](t, getJSON(mux, "/home-store/categories/29", cookie))
	if len(notes) != 1 || notes[0].Quantity != 5 || notes[0].Price != 2 {
		t.Errorf("notes = %+v", notes)
	}
	for _, path := range []string{"/home-store/categories/50", "/home-store/categories/999", "/home-store/categories/x"} {
		if rec := getJSON(mux, path, cookie); rec.Code != http.StatusNotFound {
			t.Errorf("%s answers %d", path, rec.Code)
		}
	}
}

func TestBuyingAStickerPaysAndFillsTheInventory(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 10)
	avatar, err := store.New(db).GetAvatarByName(t.Context(), "Frank")
	if err != nil {
		t.Fatal(err)
	}

	rec := buy(mux, cookie, 1)
	if rec.Code != http.StatusOK || decode[purchaseAnswer](t, rec).Credits != 8 {
		t.Fatalf("purchase = %d %s", rec.Code, rec.Body.String())
	}
	buy(mux, cookie, 1)
	if got := walletOf(t, db, userID); got != 6 {
		t.Errorf("credits = %d, want 6", got)
	}
	if got := heldOf(t, db, userID, 1); got != 2 {
		t.Errorf("held = %d, want 2", got)
	}
	rows, err := store.New(db).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 2 || rows[0].Credits != -2 || rows[0].Reason != "store" || rows[0].Detail != "Webstore purchase" || rows[0].Habbo.String != avatar.Name {
		t.Errorf("ledger = %+v", rows)
	}
}

type purchaseAnswer struct {
	Credits int64  `json:"credits"`
	Error   string `json:"error"`
}

func TestANotePackGivesFiveNotes(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 10)

	if rec := buy(mux, cookie, 13); rec.Code != http.StatusOK {
		t.Fatalf("purchase = %d %s", rec.Code, rec.Body.String())
	}
	if got := heldOf(t, db, userID, 13); got != 5 {
		t.Errorf("held = %d notes, want 5", got)
	}
}

func TestAPurchaseNeedsTheCredits(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 1)

	rec := buy(mux, cookie, 1)
	if rec.Code != http.StatusUnprocessableEntity || decode[purchaseAnswer](t, rec).Error != "You do not have enough credits to buy this item." {
		t.Errorf("purchase = %d %s", rec.Code, rec.Body.String())
	}
	if walletOf(t, db, userID) != 1 || heldOf(t, db, userID, 1) != 0 {
		t.Error("a refused purchase changed the wallet or the inventory")
	}
	if n, _ := store.New(db).CountWalletTransactions(t.Context(), userID); n != 0 {
		t.Errorf("%d ledger rows", n)
	}
}

func TestABackgroundIsBoughtOnce(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 100)
	rows, err := store.New(db).ListEnabledHomeStoreItems(t.Context(), 27)
	if err != nil || len(rows) == 0 || rows[0].Price == 0 {
		t.Fatalf("backgrounds: %v %+v", err, rows)
	}
	background := rows[0].ID

	if rec := buy(mux, cookie, background); rec.Code != http.StatusOK {
		t.Fatalf("purchase = %d %s", rec.Code, rec.Body.String())
	}
	paid := walletOf(t, db, userID)
	rec := buy(mux, cookie, background)
	if rec.Code != http.StatusUnprocessableEntity || decode[purchaseAnswer](t, rec).Error != "You already have a background of this type in your inventory!" {
		t.Errorf("second purchase = %d %s", rec.Code, rec.Body.String())
	}
	if walletOf(t, db, userID) != paid || heldOf(t, db, userID, background) != 1 {
		t.Error("the second purchase changed the wallet or the inventory")
	}
}

func TestWhatIsNotSoldCannotBeBought(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 100)
	if err := store.New(db).UpdateHomeStoreItem(t.Context(), store.UpdateHomeStoreItemParams{ID: 2, HomeStoreCategoryID: 3, Name: "Trax SFX", Price: 1, Quantity: 1, Enabled: false}); err != nil {
		t.Fatal(err)
	}
	staffItems, err := store.New(db).ListEnabledHomeStoreItems(t.Context(), 50)
	if err != nil || len(staffItems) == 0 {
		t.Fatalf("staff items: %v", err)
	}

	for _, id := range []int64{2, staffItems[0].ID, 102, 99999} {
		rec := buy(mux, cookie, id)
		if rec.Code != http.StatusUnprocessableEntity || decode[purchaseAnswer](t, rec).Error != "Sorry, but you can not buy this item!" {
			t.Errorf("item %d: %d %s", id, rec.Code, rec.Body.String())
		}
	}
	if walletOf(t, db, userID) != 100 {
		t.Error("a refused purchase took credits")
	}

	grant(t, db, userID, auth.HomesStaffItems)
	if rec := buy(mux, cookie, staffItems[0].ID); rec.Code != http.StatusOK {
		t.Errorf("staff purchase = %d %s", rec.Code, rec.Body.String())
	}
}

func TestTheInventoryIsTheUsers(t *testing.T) {
	db, mux, cookie, userID := shopper(t, 100)
	secondHabbo(t, db, userID, "FrankToo")
	buy(mux, cookie, 1)
	buy(mux, cookie, 13)
	rows, _ := store.New(db).ListEnabledHomeStoreItems(t.Context(), 27)
	buy(mux, cookie, rows[0].ID)

	type held struct {
		ID       int64  `json:"id"`
		Name     string `json:"name"`
		Image    string `json:"image"`
		Quantity int64  `json:"quantity"`
	}
	type answer struct {
		Stickers    []held `json:"stickers"`
		Backgrounds []held `json:"backgrounds"`
		Notes       []held `json:"notes"`
		Widgets     []held `json:"widgets"`
	}
	for _, name := range []string{"Frank", "FrankToo"} {
		got := decode[answer](t, getJSON(mux, "/me/inventory", login(t, db, name)))
		if len(got.Stickers) != 1 || got.Stickers[0].Name != "Genie Fire Head" || got.Stickers[0].Image != "/c_images/stickers/sticker_geniefirehead.gif" ||
			len(got.Notes) != 1 || got.Notes[0].Quantity != 5 || len(got.Backgrounds) != 1 || got.Widgets == nil {
			t.Errorf("%s's inventory = %+v", name, got)
		}
	}
	if strings.Contains(getJSON(mux, "/me/inventory", cookie).Body.String(), "null") {
		t.Error("an empty tab is null, not a list")
	}
}
