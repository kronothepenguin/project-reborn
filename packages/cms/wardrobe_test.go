package cms

import (
	"database/sql"
	"encoding/json/v2"
	"fmt"
	"html"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	outfitOne = "hd-180-1.ch-210-66.lg-270-82.sh-290-80.hr-100-61"
	outfitTwo = "hd-600-1.ch-630-62.lg-695-62.sh-725-62.hr-515-33"
)

// joinClub gives the user a club period from an hour ago until ends.
func joinClub(t *testing.T, db *sql.DB, userID int64, ends time.Time) {
	t.Helper()
	now := time.Now().UTC()
	_, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, now.Add(-time.Hour), ends, now)
	if err != nil {
		t.Fatalf("insert subscription: %v", err)
	}
}

// clubMember is member, in the club for a day.
func clubMember(t *testing.T, db *sql.DB, mux *http.ServeMux) (cookie *http.Cookie, avatarID, userID int64) {
	t.Helper()
	cookie, avatarID, userID = member(t, db, mux)
	joinClub(t, db, userID, time.Now().UTC().Add(24*time.Hour))
	return cookie, avatarID, userID
}

func storeOutfit(mux *http.ServeMux, cookie *http.Cookie, slot, figure, gender string) *httptest.ResponseRecorder {
	return edit(mux, cookie, "/account/looks/wardrobe/"+slot, map[string]string{"figure": figure, "gender": gender})
}

func picture(figure string) string {
	return "https://www.habbo.com/habbo-imaging/avatarimage?figure=" + figure + "&size=s&direction=4&head_direction=4&gesture=sml"
}

// pagePicture is the picture as the page prints it.
func pagePicture(figure string) string {
	return html.EscapeString(picture(figure))
}

func wantPicture(t *testing.T, rec *httptest.ResponseRecorder, figure string) {
	t.Helper()
	var answer struct {
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &answer); err != nil || rec.Code != http.StatusOK || answer.Picture != picture(figure) {
		t.Errorf("got %d %s, want 200 with the picture of %s", rec.Code, rec.Body, figure)
	}
}

// outfits lists the habbo's stored outfits as slot:figure:gender.
func outfits(t *testing.T, db *sql.DB, avatarID int64) []string {
	t.Helper()
	stored, err := store.New(db).ListWardrobeOutfits(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("ListWardrobeOutfits: %v", err)
	}
	list := []string{}
	for _, outfit := range stored {
		list = append(list, fmt.Sprintf("%d:%s:%s", outfit.Slot, outfit.Figure, outfit.Gender))
	}
	return list
}

func wantOutfits(t *testing.T, db *sql.DB, avatarID int64, want ...string) {
	t.Helper()
	if got := outfits(t, db, avatarID); strings.Join(got, " ") != strings.Join(want, " ") {
		t.Errorf("outfits = %v, want %v", got, want)
	}
}

func TestTheWardrobeIsForClubMembers(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, userID := member(t, db, mux)

	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "Club:false WardrobeSlots:0 Outfits:[]")
	editError(t, storeOutfit(mux, cookie, "1", outfitOne, "M"), "invalid")

	joinClub(t, db, userID, time.Now().UTC().Add(-time.Minute))
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "Club:false")
	editError(t, storeOutfit(mux, cookie, "1", outfitOne, "M"), "invalid")
	wantOutfits(t, db, avatarID)

	joinClub(t, db, userID, time.Now().UTC().Add(time.Hour))
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "Club:true WardrobeSlots:5 Outfits:[]")
	wantPicture(t, storeOutfit(mux, cookie, "1", outfitOne, "M"), outfitOne)
	wantOutfits(t, db, avatarID, "1:"+outfitOne+":M")
}

func TestTheWardrobeKeepsOutfitsBySlot(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, _ := clubMember(t, db, mux)

	wantPicture(t, storeOutfit(mux, cookie, "3", outfitOne, "M"), outfitOne)
	wantPicture(t, storeOutfit(mux, cookie, "1", outfitTwo, "F"), outfitTwo)
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK,
		"Outfits:[{Slot:1 Figure:"+outfitTwo+" Gender:F Picture:"+pagePicture(outfitTwo)+"} {Slot:3 Figure:"+outfitOne+" Gender:M Picture:"+pagePicture(outfitOne)+"}]")

	wantPicture(t, storeOutfit(mux, cookie, "3", outfitTwo, "F"), outfitTwo)
	wantOutfits(t, db, avatarID, "1:"+outfitTwo+":F", "3:"+outfitTwo+":F")

	// The looks form wears the look the editor shows, a dressed outfit too.
	wantPage(t, serve(mux, "POST", "/account/looks", cookie, url.Values{"figure": {outfitTwo}, "gender": {"F"}}), http.StatusOK,
		"Result:Account settings updated successfully.", "Figure:"+outfitTwo, "Club:true")
}

func TestEachHabboHasItsOwnWardrobe(t *testing.T) {
	db, mux := newSite(t)
	cookie, first, _ := clubMember(t, db, mux)
	wantPicture(t, storeOutfit(mux, cookie, "1", outfitOne, "M"), outfitOne)

	wantPage(t, serve(mux, "POST", "/account/habbos", cookie, newHabbo("Second")), http.StatusOK, "Second is ready to use.")
	second, err := store.New(db).GetAvatarByName(t.Context(), "Second")
	if err != nil {
		t.Fatalf("GetAvatarByName: %v", err)
	}
	wantRedirect(t, serve(mux, "POST", fmt.Sprintf("/account/habbos/%d/switch", second.ID), cookie, url.Values{}), "/account/habbos")

	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "Club:true WardrobeSlots:5 Outfits:[]")
	wantPicture(t, storeOutfit(mux, cookie, "1", outfitTwo, "F"), outfitTwo)
	wantOutfits(t, db, second.ID, "1:"+outfitTwo+":F")
	wantOutfits(t, db, first, "1:"+outfitOne+":M")
}

// Holo turned a slot it did not know into slot 1 and a gender into M.
func TestTheWardrobeRefusesABadSlotOrLook(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, _ := clubMember(t, db, mux)

	for _, c := range []struct{ name, slot, figure, gender string }{
		{"slot 0", "0", outfitOne, "M"},
		{"slot 6 of 5", "6", outfitOne, "M"},
		{"a negative slot", "-1", outfitOne, "M"},
		{"a slot that is not a number", "x", outfitOne, "M"},
		{"no gender", "1", outfitOne, ""},
		{"an unknown gender", "1", outfitOne, "U"},
		{"a lower-case gender", "1", outfitOne, "m"},
		{"no figure", "1", "", "M"},
		{"a malformed figure", "1", "not a figure", "M"},
		{"a figure too long", "1", "hd-180-1" + strings.Repeat(".ch-210-66", 25), "M"},
	} {
		t.Run(c.name, func(t *testing.T) {
			editError(t, storeOutfit(mux, cookie, c.slot, c.figure, c.gender), "invalid")
		})
	}
	wantOutfits(t, db, avatarID)
}

func TestTheWardrobeFollowsItsSlots(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, _ := clubMember(t, db, mux)
	wantPicture(t, storeOutfit(mux, cookie, "2", outfitOne, "M"), outfitOne)
	wantPicture(t, storeOutfit(mux, cookie, "5", outfitTwo, "F"), outfitTwo)

	setting(t, db, "homes.wardrobeSlots", 3)
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK,
		"WardrobeSlots:3 Outfits:[{Slot:2 Figure:"+outfitOne+" Gender:M Picture:"+pagePicture(outfitOne)+"}]")
	editError(t, storeOutfit(mux, cookie, "4", outfitTwo, "F"), "invalid")
	wantPicture(t, storeOutfit(mux, cookie, "3", outfitTwo, "F"), outfitTwo)
	wantOutfits(t, db, avatarID, "2:"+outfitOne+":M", "3:"+outfitTwo+":F", "5:"+outfitTwo+":F")

	setting(t, db, "homes.wardrobeSlots", 6)
	wantPicture(t, storeOutfit(mux, cookie, "6", outfitOne, "M"), outfitOne)
}

func TestTheWardrobeTakesSignedInPostsFromTheSite(t *testing.T) {
	db, mux := newSite(t)
	cookie, avatarID, _ := clubMember(t, db, mux)

	if rec := storeOutfit(mux, nil, "1", outfitOne, "M"); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's outfit = %d, want 401", rec.Code)
	}
	if rec := edit(mux, cookie, "/account/looks/wardrobe/1", "not an object"); rec.Code != http.StatusBadRequest {
		t.Errorf("a body that is not an outfit = %d, want 400", rec.Code)
	}

	r := httptest.NewRequest("POST", "/account/looks/wardrobe/1", strings.NewReader(`{"figure":"`+outfitOne+`","gender":"M"}`))
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	if rec.Code != http.StatusForbidden {
		t.Errorf("a cross-site outfit = %d, want 403", rec.Code)
	}
	wantOutfits(t, db, avatarID)
}

func TestTheWardrobeShowsTheImager(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := clubMember(t, db, mux)
	setSetting(t, db, "imaging.avatarUrl", "http://imager.example/avatar")

	rec := storeOutfit(mux, cookie, "1", outfitOne, "M")
	want := "http://imager.example/avatar?figure=" + outfitOne + "&size=s&direction=4&head_direction=4&gesture=sml"
	if !strings.Contains(rec.Body.String(), `"picture":"`+want+`"`) {
		t.Errorf("got %s, want the picture %s", rec.Body, want)
	}
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "Picture:"+html.EscapeString(want))
}
