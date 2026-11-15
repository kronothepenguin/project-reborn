package auth

import (
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestFuseCatalogue(t *testing.T) {
	entries := FuseCatalogue()
	if len(entries) != 31 {
		t.Errorf("the fuse catalogue has %d fuses, want the 29 the client or Holo's server checks and the two club ones of decision server/0045", len(entries))
	}
	seen := make(map[Fuse]bool)
	for _, entry := range entries {
		if seen[entry.Fuse] {
			t.Errorf("%s is listed twice", entry.Fuse)
		}
		seen[entry.Fuse] = true
		if entry.Description == "" {
			t.Errorf("%s has no description", entry.Fuse)
		}
		if !strings.HasPrefix(string(entry.Fuse), "fuse_") {
			t.Errorf("%s is not a fuse name", entry.Fuse)
		}
	}
	for _, fuse := range defaultFuses {
		if seen[fuse] {
			t.Errorf("%s, which every habbo holds, is in the catalogue", fuse)
		}
	}
	for _, fuse := range clubFuses {
		if !seen[fuse] {
			t.Errorf("the club fuse %s cannot be granted", fuse)
		}
	}
	for _, entry := range Catalogue() {
		if strings.HasPrefix(string(entry.Attribute), "fuse_") {
			t.Errorf("the attribute %s takes a fuse's name", entry.Attribute)
		}
	}

	entries[0].Description = "changed"
	if FuseCatalogue()[0].Description == "changed" {
		t.Error("FuseCatalogue returns the shared slice")
	}
}

func TestEveryHabboHoldsTheDefaultFuses(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "player@example.com", "Player", testPassword)

	got, err := Fuses(t.Context(), f.db, userID)
	if want := []Fuse{FuseTrade, FuseBuyCredits}; err != nil || !slices.Equal(got, want) {
		t.Errorf("Fuses() = %v, %v, want %v", got, err, want)
	}
}

func TestClubMembersHoldTheClubFusesWhileTheClubRuns(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "member@example.com", "Member", testPassword)
	err := store.New(f.db).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{
		UserID:    userID,
		StartsAt:  testNow.Add(-time.Hour),
		EndsAt:    testNow.Add(31 * 24 * time.Hour),
		CreatedAt: testNow.Add(-time.Hour),
	})
	if err != nil {
		t.Fatalf("CreateClubSubscription: %v", err)
	}

	got, err := Fuses(t.Context(), f.db, userID)
	want := []Fuse{FuseTrade, FuseBuyCredits, FuseUseClubDance, FuseUseSpecialRoomLayouts, FuseHabboChooser, FuseFurniChooser}
	if err != nil || !slices.Equal(got, want) {
		t.Errorf("Fuses() of a club member = %v, %v, want %v", got, err, want)
	}

	f.advance(32 * 24 * time.Hour)
	got, err = Fuses(t.Context(), f.db, userID)
	if want := []Fuse{FuseTrade, FuseBuyCredits}; err != nil || !slices.Equal(got, want) {
		t.Errorf("Fuses() once the club ended = %v, %v, want %v", got, err, want)
	}
}

func TestAccessGroupsGrantFuses(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "guard@example.com", "Guard", testPassword)
	f.join(t, f.group(t, "Guards", HousekeepingAccess, Attribute(FuseKick), Attribute(FuseUseClubDance), "fuse_login"), userID)
	f.join(t, f.group(t, "Helpers", Attribute(FuseReceiveCallsForHelp), Attribute(FuseKick)), userID)

	got, err := Fuses(t.Context(), f.db, userID)
	want := []Fuse{FuseTrade, FuseBuyCredits, FuseKick, FuseReceiveCallsForHelp, FuseUseClubDance}
	if err != nil || !slices.Equal(got, want) {
		t.Errorf("Fuses() = %v, %v, want %v: the groups' catalogue fuses once each, without attributes", got, err, want)
	}

	err = store.New(f.db).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{
		UserID: userID, StartsAt: testNow, EndsAt: testNow.Add(time.Hour), CreatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateClubSubscription: %v", err)
	}
	got, err = Fuses(t.Context(), f.db, userID)
	want = []Fuse{FuseTrade, FuseBuyCredits, FuseUseClubDance, FuseUseSpecialRoomLayouts, FuseHabboChooser, FuseFurniChooser, FuseKick, FuseReceiveCallsForHelp}
	if err != nil || !slices.Equal(got, want) {
		t.Errorf("Fuses() of a club member in the groups = %v, %v, want %v", got, err, want)
	}
}

// The update of decision server/0046 gives level 7 every fuse it grants, so a new
// hotel's Administrator holds the whole catalogue and nothing outside it.
func TestANewHotelsAdministratorHoldsEveryFuse(t *testing.T) {
	f := newFixture(t)
	q := store.New(f.db)
	groups, err := q.ListAccessGroups(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	catalogue := FuseCatalogue()
	for _, group := range groups {
		attributes, err := q.ListAccessGroupAttributes(t.Context(), group.ID)
		if err != nil {
			t.Fatal(err)
		}
		var fuses []Fuse
		for _, name := range attributes {
			if strings.HasPrefix(name, "fuse_") {
				fuses = append(fuses, Fuse(name))
			}
		}
		for _, fuse := range fuses {
			if !slices.ContainsFunc(catalogue, func(entry FuseEntry) bool { return entry.Fuse == fuse }) {
				t.Errorf("%s holds %s, which is not in the catalogue", group.Name, fuse)
			}
		}
		if group.Level == 7 && len(fuses) != len(catalogue) {
			t.Errorf("%s holds %d fuses, want the catalogue's %d", group.Name, len(fuses), len(catalogue))
		}
	}
}
