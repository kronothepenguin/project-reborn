package auth

import (
	"net/http"
	"net/http/httptest"
	"slices"
	"strings"
	"testing"
	"unicode"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestCatalogue(t *testing.T) {
	entries := Catalogue()
	if len(entries) != 20 {
		t.Errorf("the catalogue has %d attributes, want the 18 of decision 0015, housekeeping.usersPrivate and housekeeping.database", len(entries))
	}
	seen := make(map[Attribute]bool)
	for _, entry := range entries {
		if seen[entry.Attribute] {
			t.Errorf("%s is listed twice", entry.Attribute)
		}
		seen[entry.Attribute] = true
		if entry.Description == "" {
			t.Errorf("%s has no description", entry.Attribute)
		}
		section, name, ok := strings.Cut(string(entry.Attribute), ".")
		if !ok || section == "" || name == "" || strings.Contains(name, ".") || unicode.IsUpper(rune(name[0])) {
			t.Errorf("%s is not a dotted lowerCamelCase name", entry.Attribute)
		}
	}

	entries[0].Description = "changed"
	if Catalogue()[0].Description == "changed" {
		t.Error("Catalogue returns the shared slice")
	}
}

func TestAttributesAreTheUnionOfTheGroups(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	outsider, _ := f.habbo(t, "other@example.com", "Other", testPassword)
	f.join(t, f.group(t, "Moderators", HousekeepingAccess, ForumEdit), userID)
	f.join(t, f.group(t, "Writers", ForumEdit, HousekeepingNews), userID)

	got, err := Attributes(t.Context(), f.db, userID)
	if want := []Attribute{ForumEdit, HousekeepingAccess, HousekeepingNews}; err != nil || !slices.Equal(got, want) {
		t.Errorf("Attributes() = %v, %v, want %v", got, err, want)
	}
	if got, err := Attributes(t.Context(), f.db, outsider); err != nil || len(got) != 0 {
		t.Errorf("Attributes() of a user without groups = %v, %v, want none", got, err)
	}
}

func TestAttributesAddWhatTheUserHolds(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "staff@example.com", "Staff", testPassword)
	otherID, _ := f.habbo(t, "other@example.com", "Other", testPassword)
	f.join(t, f.group(t, "Staff", HousekeepingAccess), userID)
	q := store.New(f.db)
	for _, attribute := range []Attribute{HousekeepingBans, HousekeepingAccess} {
		err := q.AddUserAttribute(t.Context(), store.AddUserAttributeParams{UserID: userID, Attribute: string(attribute), GrantedAt: testNow})
		if err != nil {
			t.Fatalf("AddUserAttribute: %v", err)
		}
	}

	got, err := Attributes(t.Context(), f.db, userID)
	if err != nil {
		t.Fatalf("Attributes: %v", err)
	}
	if want := []Attribute{HousekeepingAccess, HousekeepingBans}; !slices.Equal(got, want) {
		t.Errorf("Attributes = %v, want %v", got, want)
	}
	if got, err := Attributes(t.Context(), f.db, otherID); err != nil || len(got) != 0 {
		t.Errorf("Attributes of another user = %v, %v", got, err)
	}

	err = q.RemoveUserAttribute(t.Context(), store.RemoveUserAttributeParams{UserID: userID, Attribute: string(HousekeepingBans)})
	if err != nil {
		t.Fatalf("RemoveUserAttribute: %v", err)
	}
	if got, _ := Attributes(t.Context(), f.db, userID); !slices.Equal(got, []Attribute{HousekeepingAccess}) {
		t.Errorf("Attributes after removing = %v", got)
	}
}

func (f *fixture) setLevel(t *testing.T, group, level int64) {
	t.Helper()
	if _, err := f.db.ExecContext(t.Context(), `UPDATE access_groups SET level = ? WHERE id = ?`, level, group); err != nil {
		t.Fatalf("set level: %v", err)
	}
}

func TestLevelIsTheHighestOfTheGroups(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "staff@example.com", "Staff", testPassword)
	none, _ := f.habbo(t, "player@example.com", "Player", testPassword)
	low := f.group(t, "Low")
	high := f.group(t, "High")
	f.setLevel(t, low, 3)
	f.setLevel(t, high, 6)
	f.join(t, low, userID)
	f.join(t, high, userID)

	if got, err := Level(t.Context(), f.db, userID); err != nil || got != 6 {
		t.Errorf("Level = %d, %v, want 6", got, err)
	}
	if got, err := Level(t.Context(), f.db, none); err != nil || got != 0 {
		t.Errorf("Level without a group = %d, %v, want 0", got, err)
	}
}

func TestDirectAttributesDoNotRaiseTheLevel(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "staff@example.com", "Staff", testPassword)
	err := store.New(f.db).AddUserAttribute(t.Context(), store.AddUserAttributeParams{UserID: userID, Attribute: string(HousekeepingBans), GrantedAt: testNow})
	if err != nil {
		t.Fatalf("AddUserAttribute: %v", err)
	}
	if got, err := Level(t.Context(), f.db, userID); err != nil || got != 0 {
		t.Errorf("Level = %d, %v, want 0", got, err)
	}
}

func TestOutranksTakesAHigherLevel(t *testing.T) {
	f := newFixture(t)
	admin, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	other, _ := f.habbo(t, "other@example.com", "Other", testPassword)
	mod, _ := f.habbo(t, "mod@example.com", "Mod", testPassword)
	player, _ := f.habbo(t, "player@example.com", "Player", testPassword)
	admins := f.group(t, "Admins")
	mods := f.group(t, "Mods")
	f.setLevel(t, admins, 7)
	f.setLevel(t, mods, 6)
	f.join(t, admins, admin)
	f.join(t, admins, other)
	f.join(t, mods, mod)

	for _, c := range []struct {
		name          string
		actor, target int64
		want          bool
	}{
		{"an administrator acts on a moderator", admin, mod, true},
		{"a moderator acts on a player", mod, player, true},
		{"a moderator cannot reach an administrator", mod, admin, false},
		{"equals cannot act on each other", admin, other, false},
		{"nobody acts on themselves", admin, admin, false},
		{"a player reaches nobody", player, mod, false},
		{"two players are equals", player, player, false},
	} {
		t.Run(c.name, func(t *testing.T) {
			if got, err := Outranks(t.Context(), f.db, c.actor, c.target); err != nil || got != c.want {
				t.Errorf("Outranks = %t, %v, want %t", got, err, c.want)
			}
		})
	}
}

func TestRequireAttribute(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.habbo(t, "other@example.com", "Other", testPassword)
	f.join(t, f.group(t, "Staff", HousekeepingAccess), userID)
	handler := Sessions(f.db)(RequireAttribute(f.db, HousekeepingAccess)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})))

	for _, c := range []struct {
		name   string
		cookie *http.Cookie
		status int
	}{
		{"guest", nil, http.StatusSeeOther},
		{"user without the attribute", f.mustLogin(t, "Other", false), http.StatusForbidden},
		{"user with the attribute", f.mustLogin(t, "Admin", false), http.StatusNoContent},
	} {
		r := httptest.NewRequest(http.MethodGet, "/housekeeping/", nil)
		if c.cookie != nil {
			r.AddCookie(c.cookie)
		}
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, r)
		if rec.Code != c.status {
			t.Errorf("%s: %d, want %d", c.name, rec.Code, c.status)
		}
	}
}

func (f *fixture) group(t *testing.T, name string, attributes ...Attribute) int64 {
	t.Helper()
	q := store.New(f.db)
	group, err := q.CreateAccessGroup(t.Context(), store.CreateAccessGroupParams{Name: name, CreatedAt: testNow, UpdatedAt: testNow})
	if err != nil {
		t.Fatalf("CreateAccessGroup %s: %v", name, err)
	}
	for _, attribute := range attributes {
		err := q.AddAccessGroupAttribute(t.Context(), store.AddAccessGroupAttributeParams{AccessGroupID: group.ID, Attribute: string(attribute)})
		if err != nil {
			t.Fatalf("AddAccessGroupAttribute %s: %v", attribute, err)
		}
	}
	return group.ID
}

func (f *fixture) join(t *testing.T, groupID, userID int64) {
	t.Helper()
	err := store.New(f.db).AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: groupID, UserID: userID, GrantedAt: testNow})
	if err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
}

// A new attribute comes with an update that grants it to the groups managing
// access, so a new hotel's administrator holds every attribute.
func TestTheGroupsManagingAccessHoldEveryAttribute(t *testing.T) {
	f := newFixture(t)
	q := store.New(f.db)
	groups, err := q.ListAccessGroups(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	managers := 0
	for _, group := range groups {
		attributes, err := q.ListAccessGroupAttributes(t.Context(), group.ID)
		if err != nil {
			t.Fatal(err)
		}
		if !slices.Contains(attributes, string(HousekeepingAccessGroups)) {
			if slices.Contains(attributes, string(HousekeepingDatabase)) {
				t.Errorf("%s holds %s without managing access", group.Name, HousekeepingDatabase)
			}
			continue
		}
		managers++
		for _, entry := range Catalogue() {
			if !slices.Contains(attributes, string(entry.Attribute)) {
				t.Errorf("%s manages access without %s: add an update that grants it", group.Name, entry.Attribute)
			}
		}
	}
	if managers == 0 {
		t.Error("no group of a new hotel manages access")
	}
}
