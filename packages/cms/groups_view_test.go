package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// clubWithMembers is a group bought by Frank, with an admin, a member who made
// it his favourite, a waiting request and an archived member, who all came after.
func clubWithMembers(t *testing.T) (*sql.DB, *http.ServeMux, store.Group) {
	t.Helper()
	db, mux, cookie, _ := buyer(t, 50)
	if rec := purchase(mux, cookie, "Retro Club", "For fans of the old days."); rec.Code != http.StatusOK {
		t.Fatalf("buying the club = %d %s", rec.Code, rec.Body)
	}
	q := store.New(db)
	group, err := q.GetGroupByName(t.Context(), "Retro Club")
	if err != nil {
		t.Fatal(err)
	}
	join := func(name, role string, minutes int, joined bool) int64 {
		t.Helper()
		habbo(t, db, strings.ToLower(name)+"@example.com", name)
		id := avatarID(t, db, name)
		at := time.Now().UTC().Add(time.Duration(minutes) * time.Minute)
		if err := q.AddGroupMember(t.Context(), store.AddGroupMemberParams{GroupID: group.ID, AvatarID: id, Role: role, RequestedAt: at, JoinedAt: sql.NullTime{Time: at, Valid: joined}}); err != nil {
			t.Fatal(err)
		}
		return id
	}
	join("Admin", "admin", 3, true)
	fan := join("Fan", "member", 1, true)
	join("Asker", "member", 2, false)
	gone := join("Gone", "member", 4, true)
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, gone); err != nil {
		t.Fatal(err)
	}
	if err := q.ClearFavouriteGroup(t.Context(), fan); err != nil {
		t.Fatal(err)
	}
	if _, err := q.SetFavouriteGroup(t.Context(), store.SetFavouriteGroupParams{GroupID: group.ID, AvatarID: fan}); err != nil {
		t.Fatal(err)
	}
	return db, mux, group
}

func TestAnyoneReadsAGroupsHome(t *testing.T) {
	db, mux, group := clubWithMembers(t)
	if _, err := db.ExecContext(t.Context(), `UPDATE groups SET access = 'closed', badge = 's01010' WHERE id = ?`, group.ID); err != nil {
		t.Fatal(err)
	}
	home, err := store.New(db).GetGroupHome(t.Context(), group.ID)
	if err != nil {
		t.Fatal(err)
	}
	note := placeNote(t, db, home.ID, "[b]Welcome[/b]")

	rec := serve(mux, "GET", fmt.Sprintf("/groups/%d", group.ID), nil, nil)
	wantPage(t, rec, http.StatusOK,
		"groups/id.html",
		"Group:Retro Club Exclusive:false Private:true",
		"Background:/c_images/backgrounds2/bg_pattern_abstract2.gif BackgroundID:0 Wide:true",
		"Info:{Badge:s01010 Name:Retro Club Created:"+group.CreatedAt.UTC().Format("02-01-2006 15:04:05")+" Members:3 Description:For fans of the old days.}",
		"Members:[{Name:Frank Figure:hd-180-1 Created:27-10-2026 Owner:true Admin:true Favourite:false} {Name:Admin Figure:hd-180-1 Created:27-10-2026 Owner:false Admin:true Favourite:false} {Name:Fan Figure:hd-180-1 Created:27-10-2026 Owner:false Admin:false Favourite:true}]",
		"Kind:widget Widget:group_info Skin:defaultskin X:25 Y:25 Z:5",
		fmt.Sprintf("{ID:%d Kind:note", note),
		"HTML:&lt;strong&gt;Welcome&lt;/strong&gt;",
	)
	if strings.Contains(rec.Body.String(), "Name:Gone") || strings.Contains(rec.Body.String(), "Name:Asker") {
		t.Errorf("the members list an archived habbo or a request: %s", rec.Body)
	}
}

func TestAnExclusiveGroupShowsItsIcon(t *testing.T) {
	db, mux, group := clubWithMembers(t)
	if _, err := db.ExecContext(t.Context(), `UPDATE groups SET access = 'moderated' WHERE id = ?`, group.ID); err != nil {
		t.Fatal(err)
	}
	wantPage(t, serve(mux, "GET", fmt.Sprintf("/groups/%d", group.ID), nil, nil), http.StatusOK, "Exclusive:true Private:false")
}

// Holo deleted the viewer's request and wrote a missing widget when a group's page
// was viewed; here a view writes nothing.
func TestViewingAGroupWritesNothing(t *testing.T) {
	db, mux, group := clubWithMembers(t)
	home, err := store.New(db).GetGroupHome(t.Context(), group.ID)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), `DELETE FROM home_items WHERE home_id = ?`, home.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), `UPDATE groups SET access = 'open' WHERE id = ?`, group.ID); err != nil {
		t.Fatal(err)
	}
	asker := login(t, db, "Asker")
	before := countRows(t, db, "SELECT COUNT(*) FROM group_members") + countRows(t, db, "SELECT COUNT(*) FROM home_items")

	wantPage(t, serve(mux, "GET", fmt.Sprintf("/groups/%d", group.ID), asker, nil), http.StatusOK, "groups/id.html")
	if after := countRows(t, db, "SELECT COUNT(*) FROM group_members") + countRows(t, db, "SELECT COUNT(*) FROM home_items"); after != before {
		t.Errorf("viewing changed the rows from %d to %d", before, after)
	}
}

func TestAMissingGroupShowsHolosPageWithTheSearch(t *testing.T) {
	_, mux := newSite(t)
	for _, path := range []string{"/groups/999", "/groups/abc", "/groups"} {
		rec := serve(mux, "GET", path, nil, nil)
		wantPage(t, rec, http.StatusNotFound, "groups/not-found.html", "Searched:false Search: NameMax:25")
	}
}

func TestTheGroupSearchFindsTheNameExactly(t *testing.T) {
	_, mux, group := clubWithMembers(t)
	wantRedirect(t, serve(mux, "GET", "/groups?name=rETRO+cLUB", nil, nil), fmt.Sprintf("/groups/%d", group.ID))
	for name, query := range map[string]string{"Retro%": "Retro%25", "Retro_Club": "Retro_Club", "Retro": "Retro", "": ""} {
		rec := serve(mux, "GET", "/groups?name="+query, nil, nil)
		wantPage(t, rec, http.StatusNotFound, "groups/not-found.html", "Searched:true Search:"+name+" NameMax:25")
	}
}

func TestTheGroupBadgeIsDrawnForItsCode(t *testing.T) {
	_, mux := newSite(t)
	if rec := serve(mux, "GET", "/habbo-imaging/badge/"+badge.Default, nil, nil); rec.Code != http.StatusOK {
		t.Errorf("the default badge = %d", rec.Code)
	}
}

func placeNote(t *testing.T, db *sql.DB, homeID int64, text string) int64 {
	t.Helper()
	var noteItem int64
	if err := db.QueryRowContext(t.Context(), `SELECT id FROM home_store_items WHERE kind = 'note' LIMIT 1`).Scan(&noteItem); err != nil {
		t.Fatal(err)
	}
	item, err := store.New(db).CreateHomeItem(t.Context(), store.CreateHomeItemParams{
		HomeID: homeID, Kind: "note", HomeStoreItemID: sql.NullInt64{Int64: noteItem, Valid: true}, Skin: "noteitskin", Body: text,
		X: 100, Y: 100, Z: 7, CreatedAt: testNow, UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatal(err)
	}
	return item.ID
}
