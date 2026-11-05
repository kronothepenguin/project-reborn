package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type purchased struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Error string `json:"error"`
}

// buyer is a habbo with credits, signed in.
func buyer(t *testing.T, credits int64) (*sql.DB, *http.ServeMux, *http.Cookie, int64) {
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

func purchase(mux *http.ServeMux, cookie *http.Cookie, name, description string) *httptest.ResponseRecorder {
	return edit(mux, cookie, "/groups", map[string]string{"name": name, "description": description})
}

func countRows(t *testing.T, db *sql.DB, query string, args ...any) int64 {
	t.Helper()
	var n int64
	if err := db.QueryRowContext(t.Context(), query, args...).Scan(&n); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return n
}

func avatarID(t *testing.T, db *sql.DB, name string) int64 {
	t.Helper()
	a, err := store.New(db).GetAvatarByName(t.Context(), name)
	if err != nil {
		t.Fatalf("GetAvatarByName %s: %v", name, err)
	}
	return a.ID
}

func TestBuyingAGroupWritesItAllTogether(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 25)
	frank := avatarID(t, db, "Frank")
	q := store.New(db)

	rec := purchase(mux, cookie, "  Cool Kids  ", " The coolest. ")
	if rec.Code != http.StatusOK {
		t.Fatalf("POST /groups = %d %s", rec.Code, rec.Body)
	}
	answer := decode[purchased](t, rec)
	if answer.Name != "Cool Kids" || answer.ID == 0 || answer.Error != "" {
		t.Fatalf("the answer = %+v", answer)
	}

	g, err := q.GetGroup(t.Context(), answer.ID)
	if err != nil {
		t.Fatal(err)
	}
	if g.AvatarID != frank || g.Name != "Cool Kids" || g.Description != "The coolest." || g.Badge != badge.Default || g.Access != "open" {
		t.Errorf("the group = %+v", g)
	}
	owner, err := q.GetGroupMember(t.Context(), store.GetGroupMemberParams{GroupID: g.ID, AvatarID: frank})
	if err != nil || owner.Role != "admin" || !owner.JoinedAt.Valid {
		t.Errorf("the owner's row = %+v, %v", owner, err)
	}
	home, err := q.GetGroupHome(t.Context(), g.ID)
	if err != nil {
		t.Fatal(err)
	}
	items := itemsOf(t, db, home.ID)
	if len(items) != 1 || items[0].Kind != "widget" || items[0].Widget.String != "group_info" || items[0].X != 25 || items[0].Y != 25 || items[0].Z != 5 || items[0].Skin != "defaultskin" {
		t.Errorf("the home's items = %+v, want the Group information widget where Holo wrote it", items)
	}
	if got := walletOf(t, db, userID); got != 5 {
		t.Errorf("the wallet holds %d, want 25 - 20", got)
	}
	ledger, err := q.ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(ledger) != 1 || ledger[0].Credits != -20 || ledger[0].Reason != "group" || ledger[0].Detail != "Group purchase" || ledger[0].Habbo.String != "Frank" {
		t.Errorf("the ledger = %+v", ledger)
	}
}

func TestAPurchaseRefusedWritesNothing(t *testing.T) {
	for _, c := range []struct {
		name        string
		credits     int64
		before      func(t *testing.T, db *sql.DB, userID int64)
		group       string
		description string
		want        string
	}{
		{name: "switched off", credits: 50, before: func(t *testing.T, db *sql.DB, _ int64) {
			if err := settings.Set(t.Context(), db, 0, "features.groupPurchase", false); err != nil {
				t.Fatal(err)
			}
		}, group: "Club", description: "Ours", want: "disabled"},
		{name: "too few credits", credits: 19, group: "Club", description: "Ours", want: "credits"},
		{name: "a blank name", credits: 50, group: "   ", description: "Ours", want: "blank"},
		{name: "a blank description", credits: 50, group: "Club", description: " \n ", want: "blank"},
		{name: "a name over 25", credits: 50, group: strings.Repeat("é", 26), description: "Ours", want: "nameLong"},
		{name: "a description over 200", credits: 50, group: "Club", description: strings.Repeat("ü", 201), want: "descriptionLong"},
		{name: "a taken name", credits: 50, before: func(t *testing.T, db *sql.DB, _ int64) {
			habbo(t, db, "other@example.com", "Other")
			if _, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: avatarID(t, db, "Other"), Name: "Club", Badge: badge.Default, Access: "open", CreatedAt: testNow, UpdatedAt: testNow}); err != nil {
				t.Fatal(err)
			}
		}, group: "cLUB", description: "Ours", want: "taken"},
		{name: "three owned across the user's habbos", credits: 50, before: func(t *testing.T, db *sql.DB, userID int64) {
			secondHabbo(t, db, userID, "FrankToo")
			for i, owner := range []string{"Frank", "FrankToo", "FrankToo"} {
				if _, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: avatarID(t, db, owner), Name: fmt.Sprintf("Owned %d", i), Badge: badge.Default, Access: "open", CreatedAt: testNow, UpdatedAt: testNow}); err != nil {
					t.Fatal(err)
				}
			}
		}, group: "Club", description: "Ours", want: "owned"},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux, cookie, userID := buyer(t, c.credits)
			if c.before != nil {
				c.before(t, db, userID)
			}
			groupsBefore := countRows(t, db, "SELECT COUNT(*) FROM groups")
			rec := purchase(mux, cookie, c.group, c.description)
			if rec.Code != http.StatusUnprocessableEntity {
				t.Fatalf("POST /groups = %d %s, want 422", rec.Code, rec.Body)
			}
			if got := decode[purchased](t, rec); got.Error != c.want {
				t.Errorf("the refusal = %+v, want %q", got, c.want)
			}
			if got := walletOf(t, db, userID); got != c.credits {
				t.Errorf("the wallet holds %d, want %d", got, c.credits)
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM wallet_transactions"); n != 0 {
				t.Errorf("%d ledger rows", n)
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM groups"); n != groupsBefore {
				t.Errorf("%d groups, want %d", n, groupsBefore)
			}
		})
	}
}

func TestTheLimitsComeFromTheSettings(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 10)
	for key, value := range map[string]any{"groups.price": 10, "groups.nameMaxLength": 30, "groups.descriptionMaxLength": 5} {
		if err := settings.Set(t.Context(), db, 0, key, value); err != nil {
			t.Fatal(err)
		}
	}
	if got := decode[purchased](t, purchase(mux, cookie, strings.Repeat("n", 30), "sixsix")); got.Error != "descriptionLong" {
		t.Errorf("a description of 6 = %+v, want it too long", got)
	}
	rec := purchase(mux, cookie, strings.Repeat("n", 30), "five5")
	if rec.Code != http.StatusOK {
		t.Fatalf("a name of 30 and a description of 5 = %d %s", rec.Code, rec.Body)
	}
	if got := walletOf(t, db, userID); got != 0 {
		t.Errorf("the wallet holds %d, want 10 - 10", got)
	}
	if err := settings.Set(t.Context(), db, 0, "groups.maxOwned", 1); err != nil {
		t.Fatal(err)
	}
	if err := settings.Set(t.Context(), db, 0, "groups.price", 0); err != nil {
		t.Fatal(err)
	}
	if got := decode[purchased](t, purchase(mux, cookie, "Second", "Two")); got.Error != "owned" {
		t.Errorf("a second group with one allowed = %+v", got)
	}
}

func TestGuestsCannotBuyAGroup(t *testing.T) {
	db, mux := newSite(t)
	rec := purchase(mux, nil, "Club", "Ours")
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's POST /groups = %d, want 401", rec.Code)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM groups"); n != 0 {
		t.Errorf("%d groups", n)
	}
}

func TestTheMePageListsTheHabbosGroupsAndThePurchase(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 40)
	secondHabbo(t, db, userID, "FrankToo")
	for _, name := range []string{"Mine", "Second"} {
		if rec := purchase(mux, cookie, name, "Ours"); rec.Code != http.StatusOK {
			t.Fatalf("buying %s = %d %s", name, rec.Code, rec.Body)
		}
	}
	habbo(t, db, "other@example.com", "Other")
	theirs, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: avatarID(t, db, "Other"), Name: "Theirs", Badge: "s01010", Access: "open", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	asked, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: avatarID(t, db, "Other"), Name: "Asked", Badge: "s01010", Access: "moderated", CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	// Frank joined Theirs before buying his own, so it comes first.
	frank := avatarID(t, db, "Frank")
	for _, row := range []store.AddGroupMemberParams{
		{GroupID: theirs.ID, AvatarID: frank, Role: "member", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}},
		{GroupID: asked.ID, AvatarID: frank, Role: "member", RequestedAt: testNow},
		{GroupID: theirs.ID, AvatarID: avatarID(t, db, "FrankToo"), Role: "member", RequestedAt: testNow, JoinedAt: sql.NullTime{Time: testNow, Valid: true}},
	} {
		if err := store.New(db).AddGroupMember(t.Context(), row); err != nil {
			t.Fatal(err)
		}
	}

	body := serve(mux, "GET", "/me", cookie, nil).Body.String()
	for _, text := range []string{
		"Groups:[{ID:3 Name:Theirs Badge:s01010} {ID:1 Name:Mine Badge:" + badge.Default + "} {ID:2 Name:Second Badge:" + badge.Default + "}]",
		"Purchase:{Enabled:true Price:20 Owned:2 MaxOwned:3 NameMax:25 DescriptionMax:200}",
		"Credits:0",
	} {
		if !strings.Contains(body, text) {
			t.Errorf("the page lacks %q: %s", text, body)
		}
	}

	// The groups are the active habbo's (0086), and the owned ones the user's.
	switchTo := fmt.Sprintf("/account/habbos/%d/switch", avatarID(t, db, "FrankToo"))
	wantRedirect(t, serve(mux, "POST", switchTo, cookie, url.Values{}), "/account/habbos")
	body = serve(mux, "GET", "/me", cookie, nil).Body.String()
	for _, text := range []string{
		"Groups:[{ID:3 Name:Theirs Badge:s01010}]",
		"Purchase:{Enabled:true Price:20 Owned:2 ",
	} {
		if !strings.Contains(body, text) {
			t.Errorf("FrankToo's page lacks %q: %s", text, body)
		}
	}
}

func TestHotGroupsAreTwelveAtRandom(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "owner@example.com", "Owner")
	owner := avatarID(t, db, "Owner")
	for i := range 13 {
		if _, err := store.New(db).CreateGroup(t.Context(), store.CreateGroupParams{AvatarID: owner, Name: fmt.Sprintf("Group %d", i), Badge: badge.Default, Access: "open", CreatedAt: testNow, UpdatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
	rec := getJSON(mux, "/groups/random", nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET /groups/random = %d", rec.Code)
	}
	answer := decode[struct {
		Groups []struct {
			ID    int64  `json:"id"`
			Name  string `json:"name"`
			Badge string `json:"badge"`
		} `json:"groups"`
	}](t, rec)
	if len(answer.Groups) != 12 {
		t.Fatalf("%d groups, want 12", len(answer.Groups))
	}
	for _, g := range answer.Groups {
		if g.ID == 0 || !strings.HasPrefix(g.Name, "Group ") || g.Badge != badge.Default {
			t.Errorf("a hot group = %+v", g)
		}
	}
}

// 0084 counts what is typed: 25 letters fill a name, whatever their bytes.
func TestLengthsCountCharacters(t *testing.T) {
	db, mux, cookie, _ := buyer(t, 20)
	rec := purchase(mux, cookie, strings.Repeat("é", 25), strings.Repeat("ü", 200))
	if rec.Code != http.StatusOK {
		t.Fatalf("a name of 25 and a description of 200 characters = %d %s", rec.Code, rec.Body)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM groups WHERE length(name) = 25"); n != 1 {
		t.Errorf("%d groups with the 25 letters", n)
	}
}
