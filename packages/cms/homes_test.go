package cms

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// owner registers a habbo with its profile, home and profile widget, and the
// credits to shop with.
func owner(t *testing.T, db *sql.DB, email, name string, credits int64) (userID, avatarID int64) {
	t.Helper()
	userID, avatarID, err := auth.CreateAccount(t.Context(), store.New(db), auth.Account{
		Email:        email,
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		IP:           "127.0.0.1",
		PasswordHash: auth.HashPassword("secret123"),
		Credits:      credits,
		Habbo:        auth.Habbo{Name: name, Figure: "hd-180-1", Gender: "M"},
	})
	if err != nil {
		t.Fatalf("CreateAccount %s: %v", name, err)
	}
	return userID, avatarID
}

func storeSite(t *testing.T) (*sql.DB, *http.ServeMux) {
	t.Helper()
	db, mux := newSite(t)
	if err := seed.HomeStore(t.Context(), store.New(db)); err != nil {
		t.Fatalf("seed: %v", err)
	}
	return db, mux
}

func homeOf(t *testing.T, db *sql.DB, avatarID int64) store.Home {
	t.Helper()
	home, err := store.New(db).GetProfileHome(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("GetProfileHome: %v", err)
	}
	return home
}

func itemsOf(t *testing.T, db *sql.DB, homeID int64) []store.HomeItem {
	t.Helper()
	items, err := store.New(db).ListHomeItems(t.Context(), homeID)
	if err != nil {
		t.Fatalf("ListHomeItems: %v", err)
	}
	return items
}

func edit(mux *http.ServeMux, cookie *http.Cookie, path string, body any) *httptest.ResponseRecorder {
	data, _ := json.Marshal(body)
	r := httptest.NewRequest("POST", path, bytes.NewReader(data))
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Accept", "application/json")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

func hold(t *testing.T, db *sql.DB, userID, item, quantity int64) {
	t.Helper()
	if err := store.New(db).AddHomeInventory(t.Context(), store.AddHomeInventoryParams{UserID: userID, HomeStoreItemID: item, Quantity: quantity}); err != nil {
		t.Fatalf("AddHomeInventory: %v", err)
	}
}

func setting(t *testing.T, db *sql.DB, key string, value any) {
	t.Helper()
	before := settings.GetInt(key)
	if err := settings.Set(t.Context(), db, 0, key, value); err != nil {
		t.Fatalf("set %s: %v", key, err)
	}
	t.Cleanup(func() { settings.Set(t.Context(), db, 0, key, before) })
}

func editError(t *testing.T, rec *httptest.ResponseRecorder, want string) {
	t.Helper()
	var answer struct {
		Error string `json:"error"`
	}
	json.Unmarshal(rec.Body.Bytes(), &answer)
	if rec.Code != http.StatusUnprocessableEntity || answer.Error != want {
		t.Errorf("got %d %s, want 422 %q", rec.Code, rec.Body.String(), want)
	}
}

func itemsPath(home int64) string {
	return fmt.Sprintf("/homes/%d/items", home)
}

func TestEditingAHomeNeedsItsOwner(t *testing.T) {
	db, mux := storeSite(t)
	_, frank := owner(t, db, "frank@example.com", "Frank", 0)
	owner(t, db, "other@example.com", "Other", 0)
	home := homeOf(t, db, frank).ID
	other := login(t, db, "Other")
	paths := []string{
		fmt.Sprintf("/homes/%d/layout", home),
		itemsPath(home),
		fmt.Sprintf("/homes/%d/items/1/skin", home),
		fmt.Sprintf("/homes/%d/items/1/delete", home),
	}
	for _, path := range paths {
		if rec := edit(mux, nil, path, map[string]any{}); rec.Code != http.StatusUnauthorized {
			t.Errorf("a guest's %s answers %d", path, rec.Code)
		}
		if rec := edit(mux, other, path, map[string]any{"skin": "metalskin"}); rec.Code != http.StatusForbidden {
			t.Errorf("another user's %s answers %d", path, rec.Code)
		}
	}
	if rec := edit(mux, other, "/homes/999/layout", map[string]any{}); rec.Code != http.StatusNotFound {
		t.Errorf("an unknown home answers %d", rec.Code)
	}
	if items := itemsOf(t, db, home); len(items) != 1 || items[0].Skin != "defaultskin" {
		t.Errorf("items = %+v", items)
	}
}

func TestAUserEditsTheHomesOfAllTheirHabbos(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	second, err := auth.CreateHabbo(t.Context(), store.New(db), userID, auth.Habbo{Name: "FrankToo", Figure: "hd-180-1", Gender: "M"})
	if err != nil {
		t.Fatal(err)
	}
	hold(t, db, userID, 1, 1)

	rec := edit(mux, login(t, db, "Frank"), itemsPath(homeOf(t, db, second).ID), map[string]any{"kind": "sticker", "item": 1, "z": 7})
	if rec.Code != http.StatusOK {
		t.Fatalf("placing on FrankToo's home from Frank: %d %s", rec.Code, rec.Body.String())
	}
}

func TestAnArchivedHabbosHomeCannotBeEdited(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	second, err := auth.CreateHabbo(t.Context(), store.New(db), userID, auth.Habbo{Name: "FrankToo", Figure: "hd-180-1", Gender: "M"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, second); err != nil {
		t.Fatal(err)
	}
	rec := edit(mux, login(t, db, "Frank"), fmt.Sprintf("/homes/%d/layout", homeOf(t, db, second).ID), map[string]any{})
	if rec.Code != http.StatusNotFound {
		t.Errorf("an archived habbo's home answers %d", rec.Code)
	}
}

func TestPlacingAStickerTakesItFromTheInventory(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	hold(t, db, userID, 1, 3)
	cookie := login(t, db, "Frank")

	rec := edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "z": 7})
	var placedItems []struct {
		ID    int64  `json:"id"`
		Kind  string `json:"kind"`
		X     int64  `json:"x"`
		Y     int64  `json:"y"`
		Z     int64  `json:"z"`
		Image string `json:"image"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &placedItems); err != nil || len(placedItems) != 1 {
		t.Fatalf("place = %d %s", rec.Code, rec.Body.String())
	}
	if p := placedItems[0]; p.Kind != "sticker" || p.X != 10 || p.Y != 10 || p.Z != 7 || p.Image != "/c_images/stickers/sticker_geniefirehead.gif" {
		t.Errorf("placed = %+v", p)
	}
	if got := heldOf(t, db, userID, 1); got != 2 {
		t.Errorf("held = %d, want 2", got)
	}

	rec = edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "all": true, "z": 8})
	if json.Unmarshal(rec.Body.Bytes(), &placedItems); len(placedItems) != 2 {
		t.Errorf("place all = %d %s", rec.Code, rec.Body.String())
	}
	if got := heldOf(t, db, userID, 1); got != 0 {
		t.Errorf("held = %d, want 0", got)
	}
	if got := len(itemsOf(t, db, home)); got != 4 {
		t.Errorf("%d items on the home, want the widget and three stickers", got)
	}
	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "z": 9}), "You do not have this item in your inventory.")
}

func TestOnlyStickersAndNotesArePlaced(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	backgrounds, _ := store.New(db).ListEnabledHomeStoreItems(t.Context(), 27)
	hold(t, db, userID, backgrounds[0].ID, 1)
	hold(t, db, userID, 1, 1)
	cookie := login(t, db, "Frank")

	for _, body := range []map[string]any{
		{"kind": "background", "item": backgrounds[0].ID},
		{"kind": "note", "item": 1, "skin": "defaultskin"},
		{"kind": "sticker", "item": 99999},
	} {
		editError(t, edit(mux, cookie, itemsPath(home), body), "You do not have this item in your inventory.")
	}
	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "z": -1}), "Items must stay on the playground.")
}

func TestAHomeHoldsAtMostItsLimit(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	setting(t, db, "homes.maxItems", 3)
	hold(t, db, userID, 1, 5)
	cookie := login(t, db, "Frank")

	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "all": true}), "This home cannot hold more than 3 items.")
	if got := heldOf(t, db, userID, 1); got != 5 {
		t.Errorf("held = %d after a refusal, want 5", got)
	}
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1})
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1})
	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1}), "This home cannot hold more than 3 items.")
}

func TestPlacingANote(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	hold(t, db, userID, 13, 5)
	cookie := login(t, db, "Frank")

	rec := edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": "noteitskin", "text": "Hello [b]all[/b]"})
	if rec.Code != http.StatusOK {
		t.Fatalf("place note = %d %s", rec.Code, rec.Body.String())
	}
	if got := heldOf(t, db, userID, 13); got != 4 {
		t.Errorf("held = %d notes, want 4", got)
	}
	var note store.HomeItem
	for _, it := range itemsOf(t, db, home) {
		if it.Kind == "note" {
			note = it
		}
	}
	if note.Kind != "note" || note.Skin != "noteitskin" || note.Body != "Hello [b]all[/b]" || note.Z != 18 || note.HomeStoreItemID.Int64 != 13 {
		t.Errorf("note = %+v", note)
	}
}

func TestANoteHasALengthAndASkin(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	hold(t, db, userID, 13, 5)
	setting(t, db, "homes.noteMaxLength", 5)
	cookie := login(t, db, "Frank")

	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": "defaultskin", "text": "éééééé"}), "Your note is too long.")
	for _, skin := range []string{"hc_machineskin", "nakedskin", "evilskin", ""} {
		editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": skin, "text": "hi"}), "This skin is not available.")
	}
	if got := heldOf(t, db, userID, 13); got != 5 {
		t.Errorf("held = %d after refusals, want 5", got)
	}
	if rec := edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": "defaultskin", "text": "ééééé"}); rec.Code != http.StatusOK {
		t.Errorf("a note at the limit = %d %s", rec.Code, rec.Body.String())
	}
}

func TestClubAndStaffSkins(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	widget := itemsOf(t, db, home)[0].ID
	cookie := login(t, db, "Frank")
	path := fmt.Sprintf("/homes/%d/items/%d/skin", home, widget)

	editError(t, edit(mux, cookie, path, map[string]any{"skin": "hc_pillowskin"}), "This skin is not available.")
	if _, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, time.Now().UTC().Add(-time.Hour), time.Now().UTC().Add(24*time.Hour), testNow); err != nil {
		t.Fatal(err)
	}
	if rec := edit(mux, cookie, path, map[string]any{"skin": "hc_pillowskin"}); rec.Code != http.StatusOK {
		t.Errorf("a club skin for a club member = %d %s", rec.Code, rec.Body.String())
	}
	editError(t, edit(mux, cookie, path, map[string]any{"skin": "nakedskin"}), "This skin is not available.")
	grant(t, db, userID, auth.HomesStaffItems)
	if rec := edit(mux, cookie, path, map[string]any{"skin": "nakedskin"}); rec.Code != http.StatusOK {
		t.Errorf("the staff skin for staff = %d %s", rec.Code, rec.Body.String())
	}
	if got := itemsOf(t, db, home)[0].Skin; got != "nakedskin" {
		t.Errorf("skin = %s", got)
	}
}

func TestAStickerTakesNoSkin(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	hold(t, db, userID, 1, 1)
	cookie := login(t, db, "Frank")
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1})
	var sticker store.HomeItem
	for _, it := range itemsOf(t, db, home) {
		if it.Kind == "sticker" {
			sticker = it
		}
	}

	editError(t, edit(mux, cookie, fmt.Sprintf("/homes/%d/items/%d/skin", home, sticker.ID), map[string]any{"skin": "metalskin"}), "This item is not on this home.")
	editError(t, edit(mux, cookie, fmt.Sprintf("/homes/%d/items/999/skin", home), map[string]any{"skin": "metalskin"}), "This item is not on this home.")
}

func TestRemovingItems(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	hold(t, db, userID, 1, 1)
	hold(t, db, userID, 13, 1)
	cookie := login(t, db, "Frank")
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1})
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": "defaultskin", "text": "bye"})
	byKind := make(map[string]store.HomeItem)
	for _, it := range itemsOf(t, db, home) {
		byKind[it.Kind] = it
	}
	remove := func(id int64) *httptest.ResponseRecorder {
		return edit(mux, cookie, fmt.Sprintf("/homes/%d/items/%d/delete", home, id), map[string]any{})
	}

	if rec := remove(byKind["sticker"].ID); rec.Code != http.StatusOK {
		t.Fatalf("remove sticker = %d %s", rec.Code, rec.Body.String())
	}
	if got := heldOf(t, db, userID, 1); got != 1 {
		t.Errorf("the sticker did not come back: held = %d", got)
	}
	remove(byKind["note"].ID)
	if got := heldOf(t, db, userID, 13); got != 0 {
		t.Errorf("a removed note came back: held = %d", got)
	}
	editError(t, remove(byKind["note"].ID), "This item is not on this home.")

	edit(mux, cookie, fmt.Sprintf("/homes/%d/items/%d/skin", home, byKind["widget"].ID), map[string]any{"skin": "metalskin"})
	edit(mux, cookie, fmt.Sprintf("/homes/%d/layout", home), map[string]any{"items": []map[string]int64{{"id": byKind["widget"].ID, "x": 300, "y": 400, "z": 9}}})
	if rec := remove(byKind["widget"].ID); rec.Code != http.StatusOK {
		t.Fatalf("remove widget = %d %s", rec.Code, rec.Body.String())
	}
	items := itemsOf(t, db, home)
	if len(items) != 1 || items[0].X != 25 || items[0].Y != 25 || items[0].Z != 5 || items[0].Skin != "defaultskin" {
		t.Errorf("the profile widget did not go back to its corner: %+v", items)
	}
}

func TestSavingTheLayout(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	_, otherAvatar := owner(t, db, "other@example.com", "Other", 0)
	home := homeOf(t, db, avatarID).ID
	otherWidget := itemsOf(t, db, homeOf(t, db, otherAvatar).ID)[0]
	widget := itemsOf(t, db, home)[0]
	backgrounds, _ := store.New(db).ListEnabledHomeStoreItems(t.Context(), 27)
	hold(t, db, userID, backgrounds[0].ID, 1)
	cookie := login(t, db, "Frank")
	path := fmt.Sprintf("/homes/%d/layout", home)

	rec := edit(mux, cookie, path, map[string]any{
		"items":      []map[string]int64{{"id": widget.ID, "x": 922, "y": 1360, "z": 40}, {"id": otherWidget.ID, "x": 1, "y": 1, "z": 1}},
		"background": backgrounds[0].ID,
	})
	if rec.Code != http.StatusOK {
		t.Fatalf("layout = %d %s", rec.Code, rec.Body.String())
	}
	if got := itemsOf(t, db, home)[0]; got.X != 922 || got.Y != 1360 || got.Z != 40 {
		t.Errorf("widget = %+v", got)
	}
	if got := itemsOf(t, db, homeOf(t, db, otherAvatar).ID)[0]; got.X != otherWidget.X {
		t.Error("the layout moved another home's item")
	}
	if got := homeOf(t, db, avatarID).BackgroundHomeStoreItemID; got.Int64 != backgrounds[0].ID {
		t.Errorf("background = %+v", got)
	}

	for _, bad := range []layoutItemBody{{X: -1}, {X: 923}, {Y: 1361}, {Z: -1}} {
		bad.ID = widget.ID
		editError(t, edit(mux, cookie, path, map[string]any{"items": []layoutItemBody{bad}}), "Items must stay on the playground.")
	}
	editError(t, edit(mux, cookie, path, map[string]any{"background": backgrounds[1].ID}), "You do not have this background in your inventory.")
	hold(t, db, userID, 1, 1)
	editError(t, edit(mux, cookie, path, map[string]any{"background": 1}), "You do not have this background in your inventory.")
	if got := homeOf(t, db, avatarID).BackgroundHomeStoreItemID; got.Int64 != backgrounds[0].ID {
		t.Errorf("a refused layout changed the background: %+v", got)
	}
	if rec := edit(mux, cookie, path, map[string]any{"background": 0}); rec.Code != http.StatusOK || homeOf(t, db, avatarID).BackgroundHomeStoreItemID.Valid {
		t.Errorf("background 0 = %d, want Holo's default", rec.Code)
	}
}

type layoutItemBody struct {
	ID int64 `json:"id"`
	X  int64 `json:"x"`
	Y  int64 `json:"y"`
	Z  int64 `json:"z"`
}
