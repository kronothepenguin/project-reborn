package router

import (
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
		{Key: "example.maxCount", Value: 6},
		{Key: "example.name", Value: "Example"},
		{Key: "payments.apiKey", Secret: true},
	})

	features, ok := findSection(sections, "features")
	if !ok || len(features.Fields) != 1 {
		t.Fatalf("features = %+v, %t, want its one declared field", features, ok)
	}
	if got := features.Fields[0]; got.Key != "features.example" || got.Label != "features.example" || got.Kind != kindToggle || !got.On || got.OnLabel != "Enabled" {
		t.Errorf("the field = %+v", got)
	}

	example, ok := findSection(sections, "example")
	if !ok || len(example.Fields) != 2 {
		t.Fatalf("example = %+v, %t, want a new form with both fields", example, ok)
	}
	if example.Button == "" || example.Title == "" || example.Menu == "" {
		t.Errorf("the new form is missing its texts: %+v", example)
	}
	if got := example.Fields[0]; got.Kind != kindNumber || got.Value != "6" {
		t.Errorf("the number = %+v", got)
	}
	if got := example.Fields[1]; got.Kind != kindText || got.Value != "Example" {
		t.Errorf("the text = %+v", got)
	}

	payments, ok := findSection(sections, "payments")
	if !ok || len(payments.Fields) != 1 || payments.Fields[0].Kind != kindPassword {
		t.Errorf("a secret declared later = %+v, %t, want a masked field", payments, ok)
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
