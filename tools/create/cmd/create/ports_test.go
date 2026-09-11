package main

import (
	"testing"
)

func TestPorts(t *testing.T) {
	if AppPort("foo") < AppBase || AppPort("foo") >= AppBase+Span {
		t.Errorf("app port out of range [%d, %d): %d", AppBase, AppBase+Span, AppPort("foo"))
	}
	if AstroPort("foo") < AstroBase || AstroPort("foo") >= AstroBase+Span {
		t.Errorf("astro port out of range [%d, %d): %d", AstroBase, AstroBase+Span, AstroPort("foo"))
	}

	if AppPort("foo") == AstroPort("foo") {
		t.Errorf("app and astro ranges must be disjoint")
	}

	if AppPort("housekeeping") != AppPort("housekeeping") {
		t.Errorf("app port must be deterministic")
	}
	if AstroPort("housekeeping") != AstroPort("housekeeping") {
		t.Errorf("astro port must be deterministic")
	}
}

func TestValidateName(t *testing.T) {
	names := map[string]bool{
		"housekeeping": true,
		"a-b-c":        true,
		"a1":           true,
		"":             false,
		"9abc":         false,
		"Abc":          false,
		"a_b":          false,
		"a/b":          false,
	}

	for name, valid := range names {
		got := validateName(name) == nil
		if got != valid {
			t.Errorf("ValidateName(%q) = %t; want %t", name, got, valid)
		}
	}
}
