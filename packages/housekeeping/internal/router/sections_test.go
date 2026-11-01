package router

import (
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// P2 and later phases declare settings of their own, and each must get a form
// without anyone touching this package.
func TestASettingDeclaredLaterGetsAForm(t *testing.T) {
	sections := sectionsOver([]settings.Setting{
		{Key: "site.name", Value: "Hotel"},
		{Key: "features.tagFight", Value: true},
		{Key: "club.maxMonths", Value: 6},
		{Key: "club.name", Value: "Club"},
		{Key: "payments.apiKey", Secret: true},
	})

	features, ok := findSection(sections, "features")
	if !ok || len(features.Fields) != 1 {
		t.Fatalf("features = %+v, %t, want its one declared field", features, ok)
	}
	if got := features.Fields[0]; got.Key != "features.tagFight" || got.Label != "features.tagFight" || got.Kind != kindToggle || !got.On || got.OnLabel != "Enabled" {
		t.Errorf("the field = %+v", got)
	}

	club, ok := findSection(sections, "club")
	if !ok || len(club.Fields) != 2 {
		t.Fatalf("club = %+v, %t, want a new form with both fields", club, ok)
	}
	if club.Button == "" || club.Title == "" || club.Menu == "" {
		t.Errorf("the new form is missing its texts: %+v", club)
	}
	if got := club.Fields[0]; got.Kind != kindNumber || got.Value != "6" {
		t.Errorf("the number = %+v", got)
	}
	if got := club.Fields[1]; got.Kind != kindText || got.Value != "Club" {
		t.Errorf("the text = %+v", got)
	}

	payments, ok := findSection(sections, "payments")
	if !ok || len(payments.Fields) != 1 || payments.Fields[0].Kind != kindPassword {
		t.Errorf("a secret declared later = %+v, %t, want a masked field", payments, ok)
	}
}

func TestHiddenSettingsGetNoForm(t *testing.T) {
	sections := sectionsOver([]settings.Setting{
		{Key: "cms.refresh", Value: 1},
		{Key: "housekeeping.note", Value: "note"},
	})
	for _, id := range []string{"cms", "housekeeping"} {
		if s, ok := findSection(sections, id); ok {
			t.Errorf("a form holds a hidden setting: %+v", s)
		}
	}
}

func TestASectionKeepsItsOrder(t *testing.T) {
	sections := sectionsOver([]settings.Setting{
		{Key: "site.url", Value: "https://hotel.example.com"},
		{Key: "site.name", Value: "Hotel"},
		{Key: "site.shortName", Value: "H"},
	})
	if sections[0].ID != "site" {
		t.Fatalf("the first form is %q", sections[0].ID)
	}
	for i, want := range []string{"site.name", "site.shortName", "site.url"} {
		if got := sections[0].Fields[i].Key; got != want {
			t.Errorf("field %d is %s, want %s", i, got, want)
		}
	}
}
