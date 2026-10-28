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
	if len(entries) != 18 {
		t.Errorf("the catalogue has %d attributes, want the 18 of decision 0015", len(entries))
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

	got, err := f.auth.Attributes(t.Context(), userID)
	if want := []Attribute{ForumEdit, HousekeepingAccess, HousekeepingNews}; err != nil || !slices.Equal(got, want) {
		t.Errorf("Attributes() = %v, %v, want %v", got, err, want)
	}
	if got, err := f.auth.Attributes(t.Context(), outsider); err != nil || len(got) != 0 {
		t.Errorf("Attributes() of a user without groups = %v, %v, want none", got, err)
	}
}

func TestRequireAttribute(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	f.habbo(t, "other@example.com", "Other", testPassword)
	f.join(t, f.group(t, "Staff", HousekeepingAccess), userID)
	handler := f.auth.Sessions(f.auth.RequireAttribute(HousekeepingAccess)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
