package cms

import (
	"database/sql"
	"html"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func staffGroup(t *testing.T, db *sql.DB, name string, level int64, members ...int64) {
	t.Helper()
	q := store.New(db)
	group, err := q.CreateAccessGroup(t.Context(), store.CreateAccessGroupParams{Name: name, StaffListed: true, Level: level, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	for _, userID := range members {
		if err := q.AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: group.ID, UserID: userID, GrantedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}
}

func TestTheStaffPageListsTheStaff(t *testing.T) {
	db, mux := newSite(t)
	q := store.New(db)
	admin := habbo(t, db, "admin@example.com", "Zed")
	moderator := habbo(t, db, "mod@example.com", "Amy")
	habbo(t, db, "player@example.com", "Player")
	staffGroup(t, db, "Administrators", 10, admin)
	staffGroup(t, db, "Moderators", 5, moderator, admin)
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET motto = 'Ask <me>' WHERE name = 'Amy'`); err != nil {
		t.Fatal(err)
	}
	amy, err := q.GetAvatarByName(t.Context(), "Amy")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := q.GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: amy.ID, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	if err := q.WearAvatarBadge(t.Context(), store.WearAvatarBadgeParams{AvatarID: amy.ID, Code: "ADM"}); err != nil {
		t.Fatal(err)
	}

	rec := serve(mux, "GET", "/staff", nil, nil)
	wantPage(t, rec, http.StatusOK, "staff.html {",
		"Members:["+html.EscapeString("{Name:Amy Figure:hd-180-1 Motto:Ask <me> Rank:Moderators LastVisit:27-10-2026 21:00:00 Badge:/c_images/album1584/ADM.gif}")+
			" {Name:Zed Figure:hd-180-1 Motto:No motto Rank:Administrators LastVisit:27-10-2026 21:00:00 Badge:}]")
	if strings.Contains(rec.Body.String(), "Player") {
		t.Error("the staff page lists a player")
	}
}

func TestTheLastVisitIsTheLastTimeTheHabboWasSeen(t *testing.T) {
	db, mux := newSite(t)
	admin := habbo(t, db, "admin@example.com", "Zed")
	staffGroup(t, db, "Administrators", 10, admin)
	login(t, db, "Zed")
	if _, err := db.ExecContext(t.Context(), `UPDATE login_attempts SET created_at = ?`, testNow.Add(time.Hour)); err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), `UPDATE sessions SET last_seen_at = ?`, testNow.Add(2*time.Hour)); err != nil {
		t.Fatal(err)
	}
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK, "LastVisit:27-10-2026 23:00:00 ")

	if _, err := db.ExecContext(t.Context(), `DELETE FROM sessions`); err != nil {
		t.Fatal(err)
	}
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK, "LastVisit:27-10-2026 22:00:00 ")
}

func TestNoStaffYet(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK, "Members:[] Boxes:")
}

func TestTheStaffBoxesAreHolosUntilChanged(t *testing.T) {
	db, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK,
		"Boxes:[{Heading:Need our help? Body:You can find the staff members all over the hotel",
		"Color:green} {Heading:Joining the Team Body:So you want that sexy staff badge",
	)

	setSetting(t, db, "staffPage.box1Heading", "Ask us")
	setSetting(t, db, "staffPage.box1Body", "[b]Hi[/b] :)\nThere <b>")
	setSetting(t, db, "staffPage.box1Color", "white")
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusOK,
		html.EscapeString("Boxes:[{Heading:Ask us Body:<strong>Hi</strong> :)<br />\nThere &lt;b&gt; Color:white} {Heading:Joining the Team"))
}

func TestTheStaffPageSwitch(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "features.staffPage", false)
	wantRedirect(t, serve(mux, "GET", "/staff", nil, nil), "/")
}

func TestTheStaffPageClosesForMaintenance(t *testing.T) {
	db, mux := newSite(t)
	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/staff", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
}
