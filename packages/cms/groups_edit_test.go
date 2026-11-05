package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// The seeded store's first sticker and a note pad.
const (
	stickerItem = 1
	noteItem    = 13
)

func groupHomeOf(t *testing.T, db *sql.DB, groupID int64) store.Home {
	t.Helper()
	home, err := store.New(db).GetGroupHome(t.Context(), groupID)
	if err != nil {
		t.Fatalf("GetGroupHome: %v", err)
	}
	return home
}

func userOf(t *testing.T, db *sql.DB, avatarID int64) int64 {
	t.Helper()
	var userID int64
	if err := db.QueryRowContext(t.Context(), `SELECT user_id FROM avatars WHERE id = ?`, avatarID).Scan(&userID); err != nil {
		t.Fatal(err)
	}
	return userID
}

// placed puts a home store item on a home as the habbo placedBy did, 0 for none.
func placed(t *testing.T, db *sql.DB, homeID int64, kind string, item, placedBy int64) int64 {
	t.Helper()
	row, err := store.New(db).CreateHomeItem(t.Context(), store.CreateHomeItemParams{
		HomeID: homeID, Kind: kind, HomeStoreItemID: sql.NullInt64{Int64: item, Valid: true}, Skin: "defaultskin",
		X: 50, Y: 50, Z: 2, CreatedByAvatarID: sql.NullInt64{Int64: placedBy, Valid: placedBy != 0}, CreatedAt: testNow, UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatal(err)
	}
	return row.ID
}

func removeItem(mux *http.ServeMux, cookie *http.Cookie, homeID, itemID int64) *httptest.ResponseRecorder {
	return edit(mux, cookie, fmt.Sprintf("/homes/%d/items/%d/delete", homeID, itemID), map[string]any{})
}

func TestTheGroupEditPageIsTheAdmins(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	crowd(t, db, club, "Admin", 1, "admin", true)
	crowd(t, db, club, "Member", 1, "member", true)
	crowd(t, db, club, "Asker", 1, "admin", false)
	secondHabbo(t, db, userOf(t, db, avatarID(t, db, "club-owner")), "OwnerToo")
	path := fmt.Sprintf("/groups/%d/edit", club.ID)

	wantPage(t, serve(mux, "GET", path, login(t, db, "club-owner"), nil), http.StatusOK, "groups/id/edit.html", "Group:Club", "NoteMax:500 Smilies:true")
	wantPage(t, serve(mux, "GET", path, login(t, db, "Admin0"), nil), http.StatusOK, "groups/id/edit.html")
	for _, name := range []string{"Member0", "Asker0", "OwnerToo"} {
		wantRedirect(t, serve(mux, "GET", path, login(t, db, name), nil), fmt.Sprintf("/groups/%d", club.ID))
	}
	wantRedirect(t, serve(mux, "GET", path, nil, nil), "/")
	wantPage(t, serve(mux, "GET", "/groups/9999/edit", login(t, db, "Admin0"), nil), http.StatusNotFound, "groups/not-found.html")
	wantPage(t, serve(mux, "GET", "/groups/x/edit", login(t, db, "Admin0"), nil), http.StatusNotFound, "groups/not-found.html")
}

func TestTheGroupEditMenuKeepsHolosSkinOrder(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	ownerUser := userOf(t, db, avatarID(t, db, "club-owner"))
	path := fmt.Sprintf("/groups/%d/edit", club.ID)

	body := serve(mux, "GET", path, login(t, db, "club-owner"), nil).Body.String()
	wantInOrder(t, body, "Label:Default}", "Label:Golden}", "Label:Metal}", "Label:Notepad}", "Label:Speech Bubble}", "Label:Stickie Note}")
	for _, kept := range []string{"hc_pillowskin", "hc_machineskin", "nakedskin"} {
		if strings.Contains(body, kept) {
			t.Errorf("the menu offers %s to a user without club or staff items", kept)
		}
	}

	if _, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		ownerUser, time.Now().UTC().Add(-time.Hour), time.Now().UTC().Add(24*time.Hour), testNow); err != nil {
		t.Fatal(err)
	}
	grant(t, db, ownerUser, auth.HomesStaffItems)
	body = serve(mux, "GET", path, login(t, db, "club-owner"), nil).Body.String()
	wantInOrder(t, body, "Label:Default}", "Label:Golden}", "Label:HC Bling}", "Label:HC Scifi}", "Label:Staff - Naked Skin}",
		"Label:Metal}", "Label:Notepad}", "Label:Speech Bubble}", "Label:Stickie Note}")
}

func wantInOrder(t *testing.T, body string, texts ...string) {
	t.Helper()
	at := 0
	for _, text := range texts {
		i := strings.Index(body[at:], text)
		if i < 0 {
			t.Errorf("%q is missing or out of order in %s", text, body)
			return
		}
		at += i + len(text)
	}
}

func TestAdminsDecorateTheirGroupsHome(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	admins := crowd(t, db, club, "Admin", 1, "admin", true)
	crowd(t, db, club, "Member", 1, "member", true)
	owner(t, db, "out@example.com", "Outsider", 0)
	home := groupHomeOf(t, db, club.ID).ID
	adminUser := userOf(t, db, admins[0])
	hold(t, db, adminUser, stickerItem, 2)
	admin := login(t, db, "Admin0")

	rec := edit(mux, admin, itemsPath(home), map[string]any{"kind": "sticker", "item": stickerItem, "z": 1})
	if rec.Code != http.StatusOK {
		t.Fatalf("an admin placing = %d %s", rec.Code, rec.Body)
	}
	if held := heldOf(t, db, adminUser, stickerItem); held != 1 {
		t.Errorf("the admin holds %d after placing one of two", held)
	}
	sticker := decode[[]struct {
		ID int64 `json:"id"`
	}](t, rec)[0].ID
	layout := map[string]any{"items": []map[string]int64{{"id": sticker, "x": 300, "y": 400, "z": 4}}}
	if rec := edit(mux, admin, fmt.Sprintf("/homes/%d/layout", home), layout); rec.Code != http.StatusOK {
		t.Errorf("an admin saving = %d %s", rec.Code, rec.Body)
	}
	if items := itemsOf(t, db, home); len(items) != 1 || items[0].X != 300 || items[0].Y != 400 {
		t.Errorf("the group home holds %+v", items)
	}

	for _, name := range []string{"Member0", "Outsider"} {
		cookie := login(t, db, name)
		for _, rec := range []*httptest.ResponseRecorder{
			edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": stickerItem, "z": 1}),
			edit(mux, cookie, fmt.Sprintf("/homes/%d/layout", home), layout),
			edit(mux, cookie, fmt.Sprintf("/homes/%d/items/%d/skin", home, sticker), map[string]string{"skin": "goldenskin"}),
			removeItem(mux, cookie, home, sticker),
		} {
			if rec.Code != http.StatusForbidden {
				t.Errorf("%s changing the group home = %d, want 403", name, rec.Code)
			}
		}
	}
	if rec := edit(mux, nil, itemsPath(home), map[string]any{"kind": "sticker", "item": stickerItem}); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest placing = %d, want 401", rec.Code)
	}
}

func TestTheGroupMembersWidgetGoesOnOnce(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	home := groupHomeOf(t, db, club.ID).ID
	cookie := login(t, db, "club-owner")
	widget := func(home int64, name string) *httptest.ResponseRecorder {
		return edit(mux, cookie, itemsPath(home), map[string]any{"kind": "widget", "widget": name, "z": 3})
	}

	placed(t, db, home, "sticker", stickerItem, avatarID(t, db, "club-owner"))
	setting(t, db, "homes.maxItems", 1)
	editError(t, widget(home, "members"), "This home cannot hold more than 1 items.")
	setting(t, db, "homes.maxItems", 200)
	editError(t, edit(mux, cookie, itemsPath(home), map[string]any{"kind": "widget", "widget": "members", "z": -1}), "Items must stay on the playground.")

	rec := widget(home, "members")
	type drawnWidget struct {
		ID     int64  `json:"id"`
		Kind   string `json:"kind"`
		Widget string `json:"widget"`
		X      int64  `json:"x"`
		Y      int64  `json:"y"`
		Z      int64  `json:"z"`
		Skin   string `json:"skin"`
	}
	got := decode[[]drawnWidget](t, rec)
	if rec.Code != http.StatusOK || len(got) != 1 || got[0].Kind != "widget" || got[0].Widget != "members" ||
		got[0].X != 20 || got[0].Y != 20 || got[0].Z != 3 || got[0].Skin != "defaultskin" {
		t.Fatalf("placing Group Members = %d %+v", rec.Code, got)
	}
	editError(t, widget(home, "members"), "You do not have this item in your inventory.")
	editError(t, widget(home, "groups"), "You do not have this item in your inventory.")
	editError(t, widget(home, "group_info"), "You do not have this item in your inventory.")
	ownHome := homeOf(t, db, avatarID(t, db, "club-owner")).ID
	editError(t, widget(ownHome, "members"), "You do not have this item in your inventory.")
	if n := countRows(t, db, `SELECT COUNT(*) FROM home_items WHERE home_id = ? AND widget = 'members'`, home); n != 1 {
		t.Errorf("the group home holds %d Group Members widgets", n)
	}

	if rec := removeItem(mux, cookie, home, got[0].ID); rec.Code != http.StatusOK {
		t.Fatalf("removing Group Members = %d %s", rec.Code, rec.Body)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM home_items WHERE home_id = ? AND kind = 'widget'`, home); n != 0 {
		t.Errorf("Group Members stayed after its removal: %d widgets", n)
	}
	if rec := widget(home, "members"); rec.Code != http.StatusOK {
		t.Errorf("placing Group Members again = %d %s", rec.Code, rec.Body)
	}
}

func TestRemovedItemsGoBackToWhoPlacedThem(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	dora := crowd(t, db, club, "Dora", 1, "admin", true)[0]
	frank := avatarID(t, db, "club-owner")
	doraUser, frankUser := userOf(t, db, dora), userOf(t, db, frank)
	home := groupHomeOf(t, db, club.ID).ID
	cookie := login(t, db, "club-owner")

	doraSticker := placed(t, db, home, "sticker", stickerItem, dora)
	doraNote := placed(t, db, home, "note", noteItem, dora)
	frankNote := placed(t, db, home, "note", noteItem, frank)
	nobodysSticker := placed(t, db, home, "sticker", stickerItem, 0)
	for _, item := range []int64{doraSticker, doraNote, frankNote, nobodysSticker} {
		if rec := removeItem(mux, cookie, home, item); rec.Code != http.StatusOK {
			t.Fatalf("removing %d = %d %s", item, rec.Code, rec.Body)
		}
	}
	want := map[string][2]int64{
		"Dora's stickers":  {heldOf(t, db, doraUser, stickerItem), 1},
		"Dora's notes":     {heldOf(t, db, doraUser, noteItem), 1},
		"Frank's notes":    {heldOf(t, db, frankUser, noteItem), 1},
		"Frank's stickers": {heldOf(t, db, frankUser, stickerItem), 1},
	}
	for what, pair := range want {
		if pair[0] != pair[1] {
			t.Errorf("%s = %d, want %d", what, pair[0], pair[1])
		}
	}

	// A habbo's own home keeps Holo's rule: a removed note is gone.
	frankHome := homeOf(t, db, frank).ID
	note := placed(t, db, frankHome, "note", noteItem, frank)
	if rec := removeItem(mux, cookie, frankHome, note); rec.Code != http.StatusOK {
		t.Fatalf("removing a note at home = %d", rec.Code)
	}
	if held := heldOf(t, db, frankUser, noteItem); held != 1 {
		t.Errorf("a note removed from a habbo home came back: Frank holds %d", held)
	}
}

func TestTheGroupInformationWidgetGoesBackToItsCorner(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	home := groupHomeOf(t, db, club.ID).ID
	info, err := store.New(db).CreateHomeItem(t.Context(), store.CreateHomeItemParams{
		HomeID: home, Kind: "widget", Widget: sql.NullString{String: "group_info", Valid: true}, Skin: "goldenskin",
		X: 400, Y: 300, Z: 9, CreatedAt: testNow, UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatal(err)
	}
	if rec := removeItem(mux, login(t, db, "club-owner"), home, info.ID); rec.Code != http.StatusOK {
		t.Fatalf("removing Group information = %d %s", rec.Code, rec.Body)
	}
	items := itemsOf(t, db, home)
	if len(items) != 1 || items[0].X != 25 || items[0].Y != 25 || items[0].Z != 5 || items[0].Skin != "defaultskin" {
		t.Errorf("Group information is %+v, want it back at 25, 25 in the default skin", items)
	}
}

func TestTheEditPageMarksItemsAnotherUserPlaced(t *testing.T) {
	db, mux := newSite(t)
	club := ownedGroup(t, db, "Club", "open")
	dora := crowd(t, db, club, "Dora", 1, "admin", true)[0]
	frank := avatarID(t, db, "club-owner")
	secondHabbo(t, db, userOf(t, db, frank), "FrankToo")
	home := groupHomeOf(t, db, club.ID).ID
	placed(t, db, home, "sticker", stickerItem, dora)
	placed(t, db, home, "note", noteItem, dora)
	placed(t, db, home, "sticker", stickerItem, frank)
	placed(t, db, home, "sticker", stickerItem, avatarID(t, db, "FrankToo"))
	if _, err := store.New(db).CreateHomeItem(t.Context(), store.CreateHomeItemParams{
		HomeID: home, Kind: "widget", Widget: sql.NullString{String: "members", Valid: true}, Skin: "defaultskin",
		CreatedByAvatarID: sql.NullInt64{Int64: dora, Valid: true}, CreatedAt: testNow, UpdatedAt: testNow,
	}); err != nil {
		t.Fatal(err)
	}

	body := serve(mux, "GET", fmt.Sprintf("/groups/%d/edit", club.ID), login(t, db, "club-owner"), nil).Body.String()
	if n := strings.Count(body, "Foreign:true"); n != 2 {
		t.Errorf("Frank's edit page marks %d items as another user's, want Dora's sticker and note: %s", n, body)
	}
	body = serve(mux, "GET", fmt.Sprintf("/groups/%d", club.ID), login(t, db, "club-owner"), nil).Body.String()
	if strings.Contains(body, "Foreign:true") {
		t.Errorf("the group page marks items as another user's: %s", body)
	}
}
