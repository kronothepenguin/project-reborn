package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// groupOf is a group the habbo owner made at, with its admin row and home.
func groupOf(t *testing.T, db *sql.DB, owner int64, name string, at time.Time) store.Group {
	t.Helper()
	q := store.New(db)
	g, err := q.CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: owner, Name: name, Badge: "b0503Xs01010", Access: "open", CreatedAt: at, UpdatedAt: at})
	if err != nil {
		t.Fatal(err)
	}
	enrol(t, db, g.ID, owner, "admin", at, true)
	if _, err := q.CreateGroupHome(t.Context(), store.CreateGroupHomeParams{GroupID: g.ID, UpdatedAt: at}); err != nil {
		t.Fatal(err)
	}
	return g
}

// enrol gives the habbo a row in the group, asked at at, joined or waiting.
func enrol(t *testing.T, db *sql.DB, groupID, avatar int64, role string, at time.Time, joined bool) {
	t.Helper()
	err := store.New(db).AddGroupMember(t.Context(), store.AddGroupMemberParams{
		GroupID: groupID, AvatarID: avatar, Role: role, RequestedAt: at, JoinedAt: sql.NullTime{Time: at, Valid: joined},
	})
	if err != nil {
		t.Fatal(err)
	}
}

func favourite(t *testing.T, db *sql.DB, groupID, avatar int64) {
	t.Helper()
	if _, err := db.ExecContext(t.Context(), `UPDATE group_members SET favourite = TRUE WHERE group_id = ? AND avatar_id = ?`, groupID, avatar); err != nil {
		t.Fatal(err)
	}
}

// franksGroups gives Frank, in this order, a favourite membership of Alpha, the
// group Beta he owns, an admin's row in Gamma, a membership of Delta and a
// waiting request to Pending.
func franksGroups(t *testing.T, db *sql.DB, frank int64) map[string]store.Group {
	t.Helper()
	habbo(t, db, "other@example.com", "Other")
	other := avatarID(t, db, "Other")
	at := func(minute int) time.Time { return testNow.Add(time.Duration(minute) * time.Minute) }
	groups := map[string]store.Group{
		"Alpha":   groupOf(t, db, other, "Alpha", testNow),
		"Beta":    groupOf(t, db, frank, "Beta", at(2)),
		"Gamma":   groupOf(t, db, other, "Gamma", testNow),
		"Delta":   groupOf(t, db, other, "Delta", testNow),
		"Pending": groupOf(t, db, other, "Pending", testNow),
	}
	enrol(t, db, groups["Alpha"].ID, frank, "member", at(1), true)
	favourite(t, db, groups["Alpha"].ID, frank)
	enrol(t, db, groups["Gamma"].ID, frank, "admin", at(3), true)
	enrol(t, db, groups["Delta"].ID, frank, "member", at(4), true)
	enrol(t, db, groups["Pending"].ID, frank, "member", at(5), false)
	return groups
}

type menuAnswer struct {
	Groups []struct {
		ID        int64  `json:"id"`
		Name      string `json:"name"`
		Favourite bool   `json:"favourite"`
		Admin     bool   `json:"admin"`
		Owner     bool   `json:"owner"`
	} `json:"groups"`
	Purchase struct {
		Enabled        bool  `json:"enabled"`
		Price          int   `json:"price"`
		Credits        int64 `json:"credits"`
		Owned          int64 `json:"owned"`
		MaxOwned       int   `json:"maxOwned"`
		NameMax        int   `json:"nameMax"`
		DescriptionMax int   `json:"descriptionMax"`
	} `json:"purchase"`
}

func (m menuAnswer) rows() string {
	rows := make([]string, 0, len(m.Groups))
	for _, g := range m.Groups {
		row := g.Name
		if g.Favourite {
			row += " favourite"
		}
		if g.Admin {
			row += " admin"
		}
		if g.Owner {
			row += " owner"
		}
		rows = append(rows, row)
	}
	return strings.Join(rows, ", ")
}

func TestTheMyGroupsMenuListsMembershipsBeforeAdminRoles(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 25)
	frank := avatarID(t, db, "Frank")
	franksGroups(t, db, frank)
	secondHabbo(t, db, userID, "FrankToo")

	rec := getJSON(mux, "/me/groups", cookie)
	menu := decode[menuAnswer](t, rec)
	if rec.Code != http.StatusOK || menu.rows() != "Alpha favourite, Delta, Beta owner, Gamma admin" {
		t.Errorf("the menu = %d %s", rec.Code, menu.rows())
	}
	p := menu.Purchase
	if !p.Enabled || p.Price != 20 || p.Credits != 25 || p.Owned != 1 || p.MaxOwned != 3 || p.NameMax != 25 || p.DescriptionMax != 200 {
		t.Errorf("the purchase limits = %+v", p)
	}

	// quickmenu.php's LIMIT 10 keeps the first ten, the memberships first.
	other := avatarID(t, db, "Other")
	for i := range 8 {
		g := groupOf(t, db, other, fmt.Sprintf("Extra%d", i), testNow)
		enrol(t, db, g.ID, frank, "member", testNow.Add(time.Duration(10+i)*time.Minute), true)
	}
	menu = decode[menuAnswer](t, getJSON(mux, "/me/groups", cookie))
	if want := "Alpha favourite, Delta, Extra0, Extra1, Extra2, Extra3, Extra4, Extra5, Extra6, Extra7"; menu.rows() != want {
		t.Errorf("the full menu = %s, want %s", menu.rows(), want)
	}

	switchTo := fmt.Sprintf("/account/habbos/%d/switch", avatarID(t, db, "FrankToo"))
	wantRedirect(t, serve(mux, "POST", switchTo, cookie, url.Values{}), "/account/habbos")
	menu = decode[menuAnswer](t, getJSON(mux, "/me/groups", cookie))
	if len(menu.Groups) != 0 || menu.Purchase.Owned != 1 {
		t.Errorf("FrankToo's menu = %s, owned %d; want no groups and the user's one", menu.rows(), menu.Purchase.Owned)
	}
	if rec := getJSON(mux, "/me/groups", nil); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's menu = %d, want 401", rec.Code)
	}
}

func TestTheGroupInfoBoxIsForAnyone(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "owner@example.com", "Owner")
	g, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{
		AvatarID: avatarID(t, db, "Owner"), Name: "Club", Description: "One\nTwo <b>", Badge: "b0503X", Access: "open", CreatedAt: testNow, UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatal(err)
	}
	type box struct {
		ID          int64  `json:"id"`
		Name        string `json:"name"`
		Badge       string `json:"badge"`
		Created     string `json:"created"`
		Description string `json:"description"`
	}
	rec := getJSON(mux, fmt.Sprintf("/groups/%d/info", g.ID), nil)
	got := decode[box](t, rec)
	if want := (box{g.ID, "Club", "b0503X", "27-10-2026 21:00:00", "One\nTwo <b>"}); rec.Code != http.StatusOK || got != want {
		t.Errorf("the info box = %d %+v, want %+v", rec.Code, got, want)
	}
	for _, path := range []string{"/groups/9999/info", "/groups/x/info"} {
		if rec := getJSON(mux, path, nil); rec.Code != http.StatusNotFound {
			t.Errorf("%s = %d, want 404", path, rec.Code)
		}
	}
}

func TestTheMyGroupsWidgetGoesOnHabboHomesOnce(t *testing.T) {
	db, mux := storeSite(t)
	_, frank := owner(t, db, "frank@example.com", "Frank", 0)
	cookie := login(t, db, "Frank")
	home := homeOf(t, db, frank).ID
	widget := func(name string) *httptest.ResponseRecorder {
		return edit(mux, cookie, itemsPath(home), map[string]any{"kind": "widget", "widget": name, "z": 4})
	}
	rec := widget("groups")
	type drawnWidget struct {
		Widget string `json:"widget"`
		X      int64  `json:"x"`
		Y      int64  `json:"y"`
		Z      int64  `json:"z"`
	}
	if got := decode[[]drawnWidget](t, rec); rec.Code != http.StatusOK || len(got) != 1 || got[0] != (drawnWidget{"groups", 20, 20, 4}) {
		t.Fatalf("placing MY GROUPS = %d %s", rec.Code, rec.Body)
	}
	editError(t, widget("groups"), "You do not have this item in your inventory.")
	editError(t, widget("members"), "You do not have this item in your inventory.")
}

func TestHomesShowTheHabbosGroupsAndFavourite(t *testing.T) {
	db, mux := storeSite(t)
	_, frank := owner(t, db, "frank@example.com", "Frank", 0)
	groups := franksGroups(t, db, frank)
	row := func(name string, fav, admin, own bool) string {
		g := groups[name]
		return fmt.Sprintf("{ID:%d Name:%s Badge:%s Created:%s Favourite:%t Admin:%t Owner:%t}",
			g.ID, name, g.Badge, g.CreatedAt.Format("02-01-2006 15:04:05"), fav, admin, own)
	}
	alpha := groups["Alpha"]
	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK,
		"Groups:["+row("Alpha", true, false, false)+" "+row("Beta", false, false, true)+" "+row("Gamma", false, true, false)+" "+row("Delta", false, false, false)+"]",
		fmt.Sprintf("Group:%d GroupBadge:%s Online:false}", alpha.ID, alpha.Badge))
	wantPage(t, serve(mux, "GET", "/home/Other", nil, nil), http.StatusOK, "Group:0 GroupBadge: Online:false}")

	wantPage(t, serve(mux, "GET", "/home/Frank/edit", login(t, db, "Frank"), nil), http.StatusOK,
		"NewGroups:{ID:0 Kind:widget Widget:groups Skin:defaultskin X:20 Y:20 Z:0 Image: HTML: Foreign:false}")
}

func TestTheStaffListShowsTheFavouriteGroupsBadge(t *testing.T) {
	db, mux := newSite(t)
	amy := habbo(t, db, "amy@example.com", "Amy")
	staffGroup(t, db, "Moderators", 5, amy)
	club := groupOf(t, db, avatarID(t, db, "Amy"), "Club", testNow)
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK, "Group:0 GroupBadge: Online:false}")
	favourite(t, db, club.ID, avatarID(t, db, "Amy"))
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK, fmt.Sprintf("Group:%d GroupBadge:%s Online:false}", club.ID, club.Badge))
}
