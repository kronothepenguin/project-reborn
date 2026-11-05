package router

import (
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// P2 and later phases declare settings of their own, and each must get a form
// without anyone touching this package.
func TestASettingDeclaredLaterGetsAForm(t *testing.T) {
	sections := sectionsOver([]settings.Setting{
		{Key: "site.name", Value: "Hotel"},
		{Key: "features.example", Value: true},
		{Key: "club.maxMonths", Value: 6},
		{Key: "club.name", Value: "Club"},
		{Key: "payments.apiKey", Secret: true},
	})

	features, ok := findSection(sections, "features")
	if !ok || len(features.Fields) != 1 {
		t.Fatalf("features = %+v, %t, want its one declared field", features, ok)
	}
	if got := features.Fields[0]; got.Key != "features.example" || got.Label != "features.example" || got.Kind != kindToggle || !got.On || got.OnLabel != "Enabled" {
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
	sections := sectionsOver([]settings.Setting{{Key: "housekeeping.note", Value: "note"}})
	if s, ok := findSection(sections, "housekeeping"); ok {
		t.Errorf("a form holds a hidden setting: %+v", s)
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

func TestLongTextsAndChoicesGetTheirFields(t *testing.T) {
	short := filled(field{Key: "staff.body", Long: true}, settings.Setting{Key: "staff.body", Value: "A line.\nAnother."})
	if short.Kind != kindLongText || short.Rows != 2 || short.Value != "A line.\nAnother." {
		t.Errorf("a short long text = %+v", short)
	}
	long := filled(field{Key: "staff.body", Long: true}, settings.Setting{Key: "staff.body", Value: strings.Repeat("word ", 300)})
	if long.Rows != 10 {
		t.Errorf("a long text of 1500 characters has %d rows, want Holo's most, 10", long.Rows)
	}
	middle := filled(field{Key: "staff.body", Long: true}, settings.Setting{Key: "staff.body", Value: strings.Repeat("x", 250)})
	if middle.Rows != 5 {
		t.Errorf("250 characters have %d rows, want one per 60, 5", middle.Rows)
	}

	colours := []choice{{Value: "red", Label: "Red"}, {Value: "green", Label: "Green"}}
	picked := filled(field{Key: "staff.color", Choices: colours}, settings.Setting{Key: "staff.color", Value: "green"})
	if picked.Kind != kindChoice || picked.Choices[0].Selected || !picked.Choices[1].Selected {
		t.Errorf("a choice = %+v", picked)
	}
	if colours[1].Selected {
		t.Error("filling a choice marked the shared list")
	}
}

func TestLongTextsAndChoicesAreRead(t *testing.T) {
	s := section{Fields: []field{
		{Key: "staff.body", Label: "Body", Kind: kindLongText, Value: "Old", Required: true},
		{Key: "staff.color", Label: "Colour", Kind: kindChoice, Value: "red", Choices: []choice{{Value: "red"}, {Value: "green"}}},
	}}

	changes, problem := readChanges(s, url.Values{"staff.body": {"New\r\nlines"}, "staff.color": {"green"}})
	if problem != "" || changes["staff.body"] != "New\nlines" || changes["staff.color"] != "green" {
		t.Errorf("readChanges = %v, %q", changes, problem)
	}
	if changes, problem := readChanges(s, url.Values{"staff.body": {"Old"}, "staff.color": {"red"}}); problem != "" || len(changes) != 0 {
		t.Errorf("unchanged values = %v, %q, want no change", changes, problem)
	}
	if _, problem := readChanges(s, url.Values{"staff.body": {" \r\n "}}); problem != settingsBlank {
		t.Errorf("a blank long text = %q, want %q", problem, settingsBlank)
	}
	if _, problem := readChanges(s, url.Values{"staff.color": {"purple"}}); problem != "Colour must be one of its choices. "+settingsNotSaved {
		t.Errorf("a value outside the choices = %q", problem)
	}
}
