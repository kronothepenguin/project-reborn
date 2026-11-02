package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	lastManager  = "Access denied. The last user who can manage access groups must keep housekeeping.access and housekeeping.accessGroups."
	groupAbove   = "Access denied. You may not change a group above your level."
	levelAbove   = "Access denied. You may not set a level above your own."
	levelInvalid = "The level must be a number from 0 to 99."
)

func groupURL(id int64) string {
	return "/housekeeping/access-groups/" + strconv.FormatInt(id, 10)
}

func memberURL(userID int64) string {
	return fmt.Sprintf("/housekeeping/users/%d/access-groups", userID)
}

func groupAttributes(t *testing.T, db *sql.DB, id int64) []string {
	t.Helper()
	held, err := store.New(db).ListAccessGroupAttributes(t.Context(), id)
	if err != nil {
		t.Fatalf("ListAccessGroupAttributes: %v", err)
	}
	return held
}

func isMember(t *testing.T, db *sql.DB, group, userID int64) bool {
	t.Helper()
	_, err := store.New(db).GetAccessGroupMember(t.Context(), store.GetAccessGroupMemberParams{AccessGroupID: group, UserID: userID})
	if err != nil && !store.IsNotFound(err) {
		t.Fatalf("GetAccessGroupMember: %v", err)
	}
	return err == nil
}

func logActions(t *testing.T, db *sql.DB) []string {
	t.Helper()
	var actions []string
	for _, row := range staffLogs(t, db) {
		actions = append(actions, row.Action)
	}
	return actions
}

// groupForm is what the group's page posts: its fields and the attributes ticked.
func groupForm(name string, attributes ...auth.Attribute) url.Values {
	form := url.Values{"name": {name}, "level": {"0"}}
	for _, attribute := range attributes {
		form.Add("attribute", string(attribute))
	}
	return form
}

func habboOf(t *testing.T, db *sql.DB, name string) store.Avatar {
	t.Helper()
	avatar, err := store.New(db).GetAvatarByName(t.Context(), name)
	if err != nil {
		t.Fatalf("GetAvatarByName %s: %v", name, err)
	}
	return avatar
}

// manager is a signed-in user who can manage access groups, through one group.
func manager(t *testing.T, db *sql.DB, name string) (userID, group int64, cookie *http.Cookie) {
	t.Helper()
	userID = habbo(t, db, strings.ToLower(name)+"@example.com", name)
	group = grant(t, db, userID, auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	return userID, group, login(t, db, name)
}

func TestAccessGroupsTakeTheirAttribute(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)
	group := grant(t, db, habbo(t, db, "other@example.com", "Other"), auth.HousekeepingLogs)

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
	}{
		{"GET", "/housekeeping/access-groups", nil},
		{"POST", "/housekeeping/access-groups", groupForm("Mine")},
		{"GET", groupURL(group), nil},
		{"POST", groupURL(group), groupForm("Mine", auth.HousekeepingAccessGroups)},
		{"POST", groupURL(group) + "/delete", url.Values{"confirm": {"1"}}},
		{"POST", memberURL(userID), url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {"1"}}},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusForbidden, "access-denied.html")
	}

	if isMember(t, db, group, userID) {
		t.Error("a user without the attribute joined a group")
	}
	if got := logActions(t, db); len(got) != 0 {
		t.Errorf("staff log rows: %v", got)
	}
}

func TestCreatingAGroup(t *testing.T) {
	db, mux := newSite(t)
	adminID, _, cookie := manager(t, db, "Admin")

	form := groupForm("Moderators")
	form.Set("description", "They moderate")
	form.Set("staffListed", "1")
	rec := serve(mux, "POST", "/housekeeping/access-groups", cookie, form)

	groups, err := store.New(db).ListAccessGroups(t.Context())
	if err != nil {
		t.Fatalf("ListAccessGroups: %v", err)
	}
	at := slices.IndexFunc(groups, func(g store.ListAccessGroupsRow) bool { return g.Name == "Moderators" })
	if at < 0 {
		t.Fatalf("no group was created: %+v", groups)
	}
	created := groups[at]
	wantRedirect(t, rec, groupURL(created.ID))
	if created.Description != "They moderate" || !created.StaffListed || created.MemberCount != 0 {
		t.Errorf("the group = %+v", created)
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.create" || logs[0].Detail != "Moderators" || logs[0].UserID.Int64 != adminID {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/access-groups", cookie, nil), http.StatusOK,
		"access-groups.html", "Name:Moderators Description:They moderate Level:0 Members:0 StaffListed:true")
}

func TestAGroupNeedsAFreeName(t *testing.T) {
	db, mux := newSite(t)
	_, _, cookie := manager(t, db, "Admin")
	serve(mux, "POST", "/housekeeping/access-groups", cookie, groupForm("Moderators"))
	before := len(staffLogs(t, db))

	for _, c := range []struct {
		name string
		want string
	}{
		{"", "Please do not leave any fields blank."},
		{"   ", "Please do not leave any fields blank."},
		{"Moderators", "A group with this name already exists."},
		{"MODERATORS", "A group with this name already exists."},
	} {
		wantPage(t, serve(mux, "POST", "/housekeeping/access-groups", cookie, groupForm(c.name)), http.StatusUnprocessableEntity, "access-groups.html", c.want)
	}
	if got := len(staffLogs(t, db)); got != before {
		t.Errorf("a refused group wrote %d staff log rows", got-before)
	}
}

func TestTheGroupPage(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")

	rec := serve(mux, "GET", groupURL(group), cookie, nil)
	wantPage(t, rec, http.StatusOK, "access-groups/id.html",
		"{Name:housekeeping.access Description:entering housekeeping Held:true}",
		"{Name:housekeeping.news Description:writing and deleting news Held:false}",
		"Name:Admin Habbos:")
	if got, want := strings.Count(rec.Body.String(), "Held:"), len(auth.Catalogue()); got != want {
		t.Errorf("the page has %d checkboxes, want the %d of the catalogue", got, want)
	}

	for _, path := range []string{"/housekeeping/access-groups/999", "/housekeeping/access-groups/x"} {
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusNotFound)
		wantPage(t, serve(mux, "POST", path, cookie, groupForm("Other")), http.StatusNotFound)
	}
}

func TestSavingAGroup(t *testing.T) {
	db, mux := newSite(t)
	_, _, cookie := manager(t, db, "Admin")
	group := grant(t, db, habbo(t, db, "other@example.com", "Other"), auth.HousekeepingLogs, auth.HousekeepingNews)

	form := groupForm("Writers", auth.HousekeepingNews, auth.HousekeepingBanners)
	form.Set("description", "They write")
	form.Set("staffListed", "1")
	rec := serve(mux, "POST", groupURL(group), cookie, form)
	wantRedirect(t, rec, groupURL(group)+"?saved=1")

	if got, want := groupAttributes(t, db, group), []string{"housekeeping.banners", "housekeeping.news"}; !slices.Equal(got, want) {
		t.Errorf("attributes = %v, want %v", got, want)
	}
	saved, err := store.New(db).GetAccessGroup(t.Context(), group)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}
	if saved.Name != "Writers" || saved.Description != "They write" || !saved.StaffListed {
		t.Errorf("the group = %+v", saved)
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.update" || logs[0].Detail != "Writers: +housekeeping.banners, -housekeeping.logs" {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", rec.Header().Get("Location"), cookie, nil), http.StatusOK, "Access groups updated successfully.")
}

func TestSavingAGroupUnchangedLogsNothing(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	before, err := store.New(db).GetAccessGroup(t.Context(), group)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}

	form := groupForm(before.Name, auth.HousekeepingAccessGroups, auth.HousekeepingAccess)
	wantRedirect(t, serve(mux, "POST", groupURL(group), cookie, form), groupURL(group)+"?saved=1")

	if got := logActions(t, db); len(got) != 0 {
		t.Errorf("staff log rows: %v", got)
	}
}

func TestOnlyTheCatalogueCanBeGiven(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	form := groupForm("Renamed", auth.HousekeepingAccess, auth.HousekeepingAccessGroups, "fuse_admin")

	wantPage(t, serve(mux, "POST", groupURL(group), cookie, form), http.StatusUnprocessableEntity,
		"Only the attributes of the catalogue can be given.")

	if got := groupAttributes(t, db, group); slices.Contains(got, "fuse_admin") {
		t.Errorf("attributes = %v", got)
	}
	saved, err := store.New(db).GetAccessGroup(t.Context(), group)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}
	if saved.Name == "Renamed" {
		t.Error("a refused form renamed the group")
	}
	if got := logActions(t, db); len(got) != 0 {
		t.Errorf("staff log rows: %v", got)
	}
}

func TestARenameIntoATakenNameChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	serve(mux, "POST", "/housekeeping/access-groups", cookie, groupForm("Taken"))
	before := len(staffLogs(t, db))

	form := groupForm("TAKEN", auth.HousekeepingAccess, auth.HousekeepingAccessGroups, auth.HousekeepingNews)
	wantPage(t, serve(mux, "POST", groupURL(group), cookie, form), http.StatusUnprocessableEntity, "A group with this name already exists.", "Name:TAKEN")

	if got := groupAttributes(t, db, group); slices.Contains(got, string(auth.HousekeepingNews)) {
		t.Errorf("the attributes changed: %v", got)
	}
	if got := len(staffLogs(t, db)); got != before {
		t.Errorf("a refused save wrote %d staff log rows", got-before)
	}
}

func TestTheLastHolderCannotLoseTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")

	form := groupForm("Renamed", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "POST", groupURL(group), cookie, form), http.StatusUnprocessableEntity, lastManager)

	if got := groupAttributes(t, db, group); !slices.Contains(got, string(auth.HousekeepingAccessGroups)) {
		t.Errorf("the attribute is gone: %v", got)
	}
	saved, err := store.New(db).GetAccessGroup(t.Context(), group)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}
	if saved.Name == "Renamed" {
		t.Error("the refused change was not rolled back")
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.refused" || logs[0].UserID.Int64 != adminID ||
		logs[0].Detail != "Renamed: -housekeeping.accessGroups" {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/access-groups", cookie, nil), http.StatusOK)
}

func TestTheLastManagerCannotLoseTheWayIn(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")

	wantPage(t, serve(mux, "POST", groupURL(group), cookie, groupForm("Group", auth.HousekeepingAccessGroups)), http.StatusUnprocessableEntity, lastManager)

	if got := groupAttributes(t, db, group); !slices.Contains(got, string(auth.HousekeepingAccess)) {
		t.Errorf("the attribute is gone: %v", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/", cookie, nil), http.StatusOK)
}

func TestAHolderWhoCannotEnterDoesNotCount(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	staff(t, db, "Outsider", auth.HousekeepingAccessGroups)

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "remove": {"1"}}
	wantPage(t, serve(mux, "POST", memberURL(adminID), cookie, form), http.StatusUnprocessableEntity, lastManager)
	if !isMember(t, db, group, adminID) {
		t.Error("the last user who can enter left the group")
	}
}

func TestTheLastHolderCannotLeaveTheGroup(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "remove": {"1"}}
	wantPage(t, serve(mux, "POST", memberURL(adminID), cookie, form), http.StatusUnprocessableEntity, lastManager)

	if !isMember(t, db, group, adminID) {
		t.Error("the removal was not rolled back")
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.refused" || logs[0].TargetUserID.Int64 != adminID {
		t.Errorf("staff logs = %+v", logs)
	}
}

func TestAnotherManagerLetsAHolderGo(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	secondID, second, _ := manager(t, db, "Second")

	form := url.Values{"group": {strconv.FormatInt(second, 10)}, "remove": {"1"}}
	wantRedirect(t, serve(mux, "POST", memberURL(secondID), cookie, form), groupURL(second)+"?saved=1")
	if isMember(t, db, second, secondID) {
		t.Error("the member was not removed")
	}

	// Admin is the last one now.
	form = url.Values{"group": {strconv.FormatInt(group, 10)}, "remove": {"1"}}
	wantPage(t, serve(mux, "POST", memberURL(adminID), cookie, form), http.StatusUnprocessableEntity, lastManager)
}

func TestAHolderInTwoGroupsCanLeaveOne(t *testing.T) {
	db, mux := newSite(t)
	adminID, first, cookie := manager(t, db, "Admin")
	second := grant(t, db, adminID, auth.HousekeepingAccess, auth.HousekeepingAccessGroups)

	form := url.Values{"group": {strconv.FormatInt(first, 10)}, "remove": {"1"}}
	wantRedirect(t, serve(mux, "POST", memberURL(adminID), cookie, form), groupURL(first)+"?saved=1")

	form = url.Values{"group": {strconv.FormatInt(second, 10)}, "remove": {"1"}}
	wantPage(t, serve(mux, "POST", memberURL(adminID), cookie, form), http.StatusUnprocessableEntity, lastManager)
}

func TestADirectHolderKeepsTheHotelManaged(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	otherID := habbo(t, db, "other@example.com", "Other")

	wantPage(t, serve(mux, "POST", groupURL(group), cookie, groupForm("Group")), http.StatusUnprocessableEntity, lastManager)

	q := store.New(db)
	for _, attribute := range []auth.Attribute{auth.HousekeepingAccess, auth.HousekeepingAccessGroups} {
		err := q.AddUserAttribute(t.Context(), store.AddUserAttributeParams{UserID: otherID, Attribute: string(attribute), GrantedAt: testNow})
		if err != nil {
			t.Fatalf("AddUserAttribute: %v", err)
		}
	}
	wantRedirect(t, serve(mux, "POST", groupURL(group), cookie, groupForm("Group")), groupURL(group)+"?saved=1")
}

func TestTheKeysCanComeFromAGroupAndDirectly(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	otherID := habbo(t, db, "other@example.com", "Other")
	grant(t, db, otherID, auth.HousekeepingAccess)

	err := store.New(db).AddUserAttribute(t.Context(), store.AddUserAttributeParams{UserID: otherID, Attribute: string(auth.HousekeepingAccessGroups), GrantedAt: testNow})
	if err != nil {
		t.Fatalf("AddUserAttribute: %v", err)
	}
	wantRedirect(t, serve(mux, "POST", groupURL(group), cookie, groupForm("Group")), groupURL(group)+"?saved=1")
}

func count(t *testing.T, db *sql.DB, query string) int {
	t.Helper()
	var n int
	if err := db.QueryRowContext(t.Context(), query).Scan(&n); err != nil {
		t.Fatalf("%s: %v", query, err)
	}
	return n
}

func setLevel(t *testing.T, db *sql.DB, group, level int64) {
	t.Helper()
	if _, err := db.ExecContext(t.Context(), `UPDATE access_groups SET level = ? WHERE id = ?`, level, group); err != nil {
		t.Fatalf("set level: %v", err)
	}
}

func groupLevel(t *testing.T, db *sql.DB, group int64) int64 {
	t.Helper()
	found, err := store.New(db).GetAccessGroup(t.Context(), group)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}
	return found.Level
}

// levels gives a hotel with a moderator managing groups at level 6 and the
// administrators' group at 7.
func levels(t *testing.T, db *sql.DB) (modID, admins int64, mod *http.Cookie) {
	t.Helper()
	adminID := habbo(t, db, "admin@example.com", "Admin")
	admins = grant(t, db, adminID, auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
	setLevel(t, db, admins, 7)
	modID, mods, mod := manager(t, db, "Mod")
	setLevel(t, db, mods, 6)
	return modID, admins, mod
}

func refusals(t *testing.T, db *sql.DB) int {
	t.Helper()
	return count(t, db, `SELECT COUNT(*) FROM staff_logs WHERE action = 'accessGroups.refused'`)
}

func TestAGroupAboveTheEditorCannotBeChanged(t *testing.T) {
	db, mux := newSite(t)
	_, admins, mod := levels(t, db)

	wantPage(t, serve(mux, "POST", groupURL(admins), mod, groupForm("Mine")), http.StatusUnprocessableEntity, groupAbove)
	if got := groupAttributes(t, db, admins); len(got) != 2 {
		t.Errorf("attributes = %v, want them untouched", got)
	}
	if n := refusals(t, db); n != 1 {
		t.Errorf("%d refusal rows, want 1", n)
	}
}

func TestNobodySetsALevelAboveTheirOwn(t *testing.T) {
	db, mux := newSite(t)
	modID, _, mod := levels(t, db)
	own := grant(t, db, modID)
	setLevel(t, db, own, 6)

	form := groupForm("Own")
	form.Set("level", "7")
	wantPage(t, serve(mux, "POST", groupURL(own), mod, form), http.StatusUnprocessableEntity, levelAbove)
	if got := groupLevel(t, db, own); got != 6 {
		t.Errorf("level = %d, want 6", got)
	}

	form = groupForm("New")
	form.Set("level", "7")
	wantPage(t, serve(mux, "POST", "/housekeeping/access-groups", mod, form), http.StatusUnprocessableEntity, levelAbove)
	if n := count(t, db, `SELECT COUNT(*) FROM access_groups WHERE name = 'New'`); n != 0 {
		t.Errorf("%d new groups, want none", n)
	}
	if n := refusals(t, db); n != 2 {
		t.Errorf("%d refusal rows, want 2", n)
	}
}

func TestALevelUpToYourOwnIsAllowed(t *testing.T) {
	db, mux := newSite(t)
	modID, _, mod := levels(t, db)
	own := grant(t, db, modID)
	found, err := store.New(db).GetAccessGroup(t.Context(), own)
	if err != nil {
		t.Fatalf("GetAccessGroup: %v", err)
	}

	form := groupForm(found.Name)
	form.Set("level", "6")
	wantRedirect(t, serve(mux, "POST", groupURL(own), mod, form), groupURL(own)+"?saved=1")
	if got := groupLevel(t, db, own); got != 6 {
		t.Errorf("level = %d, want the level alone to change", got)
	}
	if n := count(t, db, `SELECT COUNT(*) FROM staff_logs WHERE action = 'accessGroups.update'`); n != 1 {
		t.Errorf("%d update rows, want the level change logged", n)
	}

	form.Set("description", "At the editor's own level")
	wantRedirect(t, serve(mux, "POST", groupURL(own), mod, form), groupURL(own)+"?saved=1")
}

func TestLevelsAreChecked(t *testing.T) {
	for _, level := range []string{"", "abc", "-1", "100", "1.5"} {
		t.Run("level "+level, func(t *testing.T) {
			db, mux := newSite(t)
			_, group, cookie := manager(t, db, "Admin")
			form := groupForm("Group", auth.HousekeepingAccess, auth.HousekeepingAccessGroups)
			form.Set("level", level)

			wantPage(t, serve(mux, "POST", groupURL(group), cookie, form), http.StatusUnprocessableEntity, levelInvalid)
			wantPage(t, serve(mux, "POST", "/housekeeping/access-groups", cookie, form), http.StatusUnprocessableEntity, levelInvalid)
		})
	}
}

func TestNobodyJoinsOrLeavesAGroupAboveTheEditor(t *testing.T) {
	db, mux := newSite(t)
	modID, admins, mod := levels(t, db)
	avatar := habboOf(t, db, "Mod")

	form := url.Values{"group": {strconv.FormatInt(admins, 10)}, "habbo": {strconv.FormatInt(avatar.ID, 10)}}
	wantPage(t, serve(mux, "POST", memberURL(modID), mod, form), http.StatusUnprocessableEntity, groupAbove)
	if isMember(t, db, admins, modID) {
		t.Error("the moderator joined the administrators")
	}

	adminID := habboOf(t, db, "Admin").UserID
	form = url.Values{"group": {strconv.FormatInt(admins, 10)}, "remove": {"1"}}
	wantPage(t, serve(mux, "POST", memberURL(adminID), mod, form), http.StatusUnprocessableEntity, groupAbove)
	if !isMember(t, db, admins, adminID) {
		t.Error("the moderator removed an administrator")
	}
	if n := refusals(t, db); n != 2 {
		t.Errorf("%d refusal rows, want 2", n)
	}
}

func TestDeletingAGroup(t *testing.T) {
	db, mux := newSite(t)
	_, _, cookie := manager(t, db, "Admin")
	memberID := habbo(t, db, "member@example.com", "Member")
	group := grant(t, db, memberID, auth.HousekeepingAccess)

	wantRedirect(t, serve(mux, "POST", groupURL(group)+"/delete", cookie, url.Values{"confirm": {"1"}}), "/housekeeping/access-groups?deleted=1")

	if n := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM access_groups WHERE id = %d`, group)); n != 0 {
		t.Errorf("%d groups left", n)
	}
	if isMember(t, db, group, memberID) {
		t.Error("the membership survived its group")
	}
	if got := groupAttributes(t, db, group); len(got) != 0 {
		t.Errorf("attributes left: %v", got)
	}
	attributes, err := auth.Attributes(t.Context(), db, memberID)
	if err != nil || len(attributes) != 0 {
		t.Errorf("the member still holds %v, %v", attributes, err)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.delete" {
		t.Errorf("staff logs = %+v", logs)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/access-groups?deleted=1", cookie, nil), http.StatusOK, "Access group deleted successfully.")
}

func TestDeletingAGroupNeedsTheBoxTicked(t *testing.T) {
	db, mux := newSite(t)
	_, _, cookie := manager(t, db, "Admin")
	group := grant(t, db, habbo(t, db, "member@example.com", "Member"))

	wantPage(t, serve(mux, "POST", groupURL(group)+"/delete", cookie, url.Values{}), http.StatusUnprocessableEntity, "Tick the box to delete this group.")
	if got := groupLevel(t, db, group); got != 0 {
		t.Errorf("level = %d", got)
	}
	if n := len(staffLogs(t, db)); n != 0 {
		t.Errorf("%d staff log rows, want none", n)
	}
}

func TestTheGuardKeepsTheLastManagersGroup(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")

	wantPage(t, serve(mux, "POST", groupURL(group)+"/delete", cookie, url.Values{"confirm": {"1"}}), http.StatusUnprocessableEntity, lastManager)
	if got := groupAttributes(t, db, group); len(got) != 2 {
		t.Errorf("attributes = %v, want the group untouched", got)
	}
	if n := refusals(t, db); n != 1 {
		t.Errorf("%d refusal rows, want 1", n)
	}
}

func TestAGroupAboveTheEditorCannotBeDeleted(t *testing.T) {
	db, mux := newSite(t)
	_, admins, mod := levels(t, db)

	wantPage(t, serve(mux, "POST", groupURL(admins)+"/delete", mod, url.Values{"confirm": {"1"}}), http.StatusUnprocessableEntity, groupAbove)
	if got := groupLevel(t, db, admins); got != 7 {
		t.Errorf("level = %d, want the group untouched", got)
	}
	if n := refusals(t, db); n != 1 {
		t.Errorf("%d refusal rows, want 1", n)
	}
}

func TestDeletingAGroupThatDoesNotExistIsNotFound(t *testing.T) {
	db, mux := newSite(t)
	_, _, cookie := manager(t, db, "Admin")
	wantPage(t, serve(mux, "POST", groupURL(999)+"/delete", cookie, url.Values{"confirm": {"1"}}), http.StatusNotFound)
}

func TestAttributesLeaveOneGroupWhenAnotherHoldsThem(t *testing.T) {
	db, mux := newSite(t)
	adminID, first, cookie := manager(t, db, "Admin")
	grant(t, db, adminID, auth.HousekeepingAccess, auth.HousekeepingAccessGroups)

	wantRedirect(t, serve(mux, "POST", groupURL(first), cookie, groupForm("Group")), groupURL(first)+"?saved=1")
	if got := groupAttributes(t, db, first); len(got) != 0 {
		t.Errorf("attributes = %v", got)
	}
}

func TestFindingAUser(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")
	frank := habboOf(t, db, "Frank")

	for _, search := range []string{"Frank", "frank", strconv.FormatInt(frankID, 10)} {
		wantPage(t, serve(mux, "GET", groupURL(group)+"?habbo="+search, cookie, nil), http.StatusOK,
			fmt.Sprintf("Found:{UserID:%d Habbos:[{ID:%d Name:Frank", frankID, frank.ID))
	}
	for _, search := range []string{"Nobody", "99999"} {
		wantPage(t, serve(mux, "GET", groupURL(group)+"?habbo="+search, cookie, nil), http.StatusOK,
			"A user with this name/id does not exist!", "Found:{UserID:0")
	}
}

func TestAddingAMember(t *testing.T) {
	db, mux := newSite(t)
	adminID, _, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")
	frank := habboOf(t, db, "Frank")
	group := grant(t, db, adminID, auth.HousekeepingAccess)

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {strconv.FormatInt(frank.ID, 10)}}
	wantRedirect(t, serve(mux, "POST", memberURL(frankID), cookie, form), groupURL(group)+"?saved=1")

	member, err := store.New(db).GetAccessGroupMember(t.Context(), store.GetAccessGroupMemberParams{AccessGroupID: group, UserID: frankID})
	if err != nil {
		t.Fatalf("GetAccessGroupMember: %v", err)
	}
	if member.DisplayAvatarID.Int64 != frank.ID || member.GrantedByUserID.Int64 != adminID {
		t.Errorf("the member = %+v", member)
	}
	logs := staffLogs(t, db)
	if len(logs) != 1 || logs[0].Action != "accessGroups.addMember" || logs[0].TargetUserID.Int64 != frankID ||
		logs[0].TargetAvatarID.Int64 != frank.ID {
		t.Errorf("staff logs = %+v", logs)
	}

	// The change is real: Frank enters at once.
	frankCookie := login(t, db, "Frank")
	wantPage(t, serve(mux, "GET", "/housekeeping/", frankCookie, nil), http.StatusOK)

	form.Set("remove", "1")
	wantRedirect(t, serve(mux, "POST", memberURL(frankID), cookie, form), groupURL(group)+"?saved=1")
	wantPage(t, serve(mux, "GET", "/housekeeping/", frankCookie, nil), http.StatusForbidden)
}

func TestTheDisplayHabboMustBeTheirOwn(t *testing.T) {
	db, mux := newSite(t)
	adminID, _, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")
	group := grant(t, db, adminID, auth.HousekeepingNews)

	for _, habbo := range []string{strconv.FormatInt(habboOf(t, db, "Admin").ID, 10), "999999", "99999999999999999999", "x", ""} {
		form := url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {habbo}}
		wantPage(t, serve(mux, "POST", memberURL(frankID), cookie, form), http.StatusUnprocessableEntity,
			"The display habbo must be one of the user&#39;s own habbos.")
	}
	if isMember(t, db, group, frankID) {
		t.Error("the user joined with another user's habbo")
	}
	if got := logActions(t, db); len(got) != 0 {
		t.Errorf("staff log rows: %v", got)
	}
}

func TestAnArchivedHabboIsNoDisplayHabbo(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	userID := habbo(t, db, "frank@example.com", "Frank")
	archived := secondHabbo(t, db, userID, "FrankOld")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, archived.ID); err != nil {
		t.Fatalf("archive: %v", err)
	}

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {strconv.FormatInt(archived.ID, 10)}}
	wantPage(t, serve(mux, "POST", memberURL(userID), cookie, form), http.StatusUnprocessableEntity, "The display habbo must be one of the user")
}

func TestChangingTheDisplayHabbo(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	second := secondHabbo(t, db, adminID, "Staffname")

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {strconv.FormatInt(second.ID, 10)}}
	wantRedirect(t, serve(mux, "POST", memberURL(adminID), cookie, form), groupURL(group)+"?saved=1")
	wantRedirect(t, serve(mux, "POST", memberURL(adminID), cookie, form), groupURL(group)+"?saved=1")

	member, err := store.New(db).GetAccessGroupMember(t.Context(), store.GetAccessGroupMemberParams{AccessGroupID: group, UserID: adminID})
	if err != nil {
		t.Fatalf("GetAccessGroupMember: %v", err)
	}
	if member.DisplayAvatarID.Int64 != second.ID {
		t.Errorf("the member = %+v", member)
	}
	if got, want := logActions(t, db), []string{"accessGroups.setDisplayHabbo"}; !slices.Equal(got, want) {
		t.Errorf("staff log = %v, want one row: saving it again is no change", got)
	}
	wantPage(t, serve(mux, "GET", groupURL(group), cookie, nil), http.StatusOK, "Name:Staffname Selected:true")
}

func TestRemovingSomeoneWhoIsNotAMemberChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, group, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "remove": {"1"}}
	wantRedirect(t, serve(mux, "POST", memberURL(frankID), cookie, form), groupURL(group)+"?saved=1")
	if got := logActions(t, db); len(got) != 0 {
		t.Errorf("staff log rows: %v", got)
	}
}

func TestMembershipPostsNeedARealGroupAndUser(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	habboID := strconv.FormatInt(habboOf(t, db, "Admin").ID, 10)

	for _, c := range []struct {
		path  string
		group string
	}{
		{memberURL(adminID), "999999"},
		{memberURL(adminID), "x"},
		{memberURL(adminID), ""},
		{memberURL(999999), strconv.FormatInt(group, 10)},
		{"/housekeeping/users/x/access-groups", strconv.FormatInt(group, 10)},
	} {
		wantPage(t, serve(mux, "POST", c.path, cookie, url.Values{"group": {c.group}, "habbo": {habboID}}), http.StatusNotFound)
	}
}

func TestTheStaffList(t *testing.T) {
	db, mux := newSite(t)
	adminID, _, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")
	grant(t, db, frankID, auth.HousekeepingNews)

	wantPage(t, serve(mux, "GET", "/housekeeping/access-groups", cookie, nil), http.StatusOK,
		fmt.Sprintf("{UserID:%d Name:Admin Group:", adminID),
		fmt.Sprintf("{UserID:%d Name:Frank Group:", frankID))
}

// Every mutation of housekeeping leaves exactly one row, which is the promise the
// staff log makes. A new mutation belongs in this list.
func TestEveryMutationWritesOneRow(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	grant(t, db, adminID, auth.HousekeepingSettings)
	frankID := habbo(t, db, "frank@example.com", "Frank")
	frank := habboOf(t, db, "Frank")
	second := secondHabbo(t, db, frankID, "FrankStaff")
	groupID := strconv.FormatInt(group, 10)
	member := func(habbo int64) url.Values {
		return url.Values{"group": {groupID}, "habbo": {strconv.FormatInt(habbo, 10)}}
	}
	wantAttributes := groupForm("Renamed", auth.HousekeepingAccess, auth.HousekeepingAccessGroups, auth.HousekeepingNews)

	for _, c := range []struct {
		path         string
		form         url.Values
		action       string
		targetUser   int64
		targetAvatar int64
	}{
		{"/housekeeping/note", url.Values{"notes": {"Hello"}}, "note.update", 0, 0},
		{"/housekeeping/settings/site", siteForm(), "settings.update", 0, 0},
		{"/housekeeping/settings/maintenance", url.Values{"site.maintenance": {"1"}}, "settings.update", 0, 0},
		{"/housekeeping/access-groups", groupForm("New"), "accessGroups.create", 0, 0},
		{groupURL(group), wantAttributes, "accessGroups.update", 0, 0},
		{memberURL(frankID), member(frank.ID), "accessGroups.addMember", frankID, frank.ID},
		{memberURL(frankID), member(second.ID), "accessGroups.setDisplayHabbo", frankID, second.ID},
		{memberURL(frankID), url.Values{"group": {groupID}, "remove": {"1"}}, "accessGroups.removeMember", frankID, 0},
		{memberURL(adminID), url.Values{"group": {groupID}, "remove": {"1"}}, "accessGroups.refused", adminID, 0},
	} {
		t.Run(c.action, func(t *testing.T) {
			before := len(staffLogs(t, db))
			serve(mux, "POST", c.path, cookie, c.form)

			logs := staffLogs(t, db)
			if len(logs) != before+1 {
				t.Fatalf("got %d new rows, want 1", len(logs)-before)
			}
			got := logs[0]
			if got.Action != c.action || got.UserID.Int64 != adminID || got.IP == "" {
				t.Errorf("the row = %+v, want %s by the user, with the address", got, c.action)
			}
			if got.TargetUserID.Int64 != c.targetUser || got.TargetAvatarID.Int64 != c.targetAvatar {
				t.Errorf("the row names user %d and habbo %d, want %d and %d", got.TargetUserID.Int64, got.TargetAvatarID.Int64, c.targetUser, c.targetAvatar)
			}
		})
	}
}

func TestACrossOriginChangeChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	adminID, group, cookie := manager(t, db, "Admin")
	frankID := habbo(t, db, "frank@example.com", "Frank")

	form := url.Values{"group": {strconv.FormatInt(group, 10)}, "habbo": {strconv.FormatInt(habboOf(t, db, "Frank").ID, 10)}}
	wantPage(t, record(mux, postFrom("https://evil.example.com", memberURL(frankID), cookie, form)), http.StatusForbidden)
	if isMember(t, db, group, frankID) {
		t.Error("a cross-origin post added a member")
	}

	remove := url.Values{"group": {strconv.FormatInt(group, 10)}, "remove": {"1"}}
	wantPage(t, record(mux, postFrom("https://evil.example.com", memberURL(adminID), cookie, remove)), http.StatusForbidden)
	if !isMember(t, db, group, adminID) {
		t.Error("a cross-origin post removed a member")
	}
}
