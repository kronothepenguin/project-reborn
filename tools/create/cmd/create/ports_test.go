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
	if VitePort("foo") < ViteBase || VitePort("foo") >= ViteBase+Span {
		t.Errorf("vite port out of range [%d, %d): %d", ViteBase, ViteBase+Span, VitePort("foo"))
	}

	if AppPort("foo") == AstroPort("foo") || AstroPort("foo") == VitePort("foo") || AppPort("foo") == VitePort("foo") {
		t.Errorf("app, astro and vite ranges must be disjoint")
	}

	if AppPort("housekeeping") != AppPort("housekeeping") {
		t.Errorf("app port must be deterministic")
	}
	if AstroPort("housekeeping") != AstroPort("housekeeping") {
		t.Errorf("astro port must be deterministic")
	}
	if VitePort("housekeeping") != VitePort("housekeeping") {
		t.Errorf("vite port must be deterministic")
	}
}

// The example the user chose the vite range by, in decision server/0017.
func TestVitePortOfTheDecisionExample(t *testing.T) {
	if got := VitePort("client-r18"); got != 30050 {
		t.Errorf("VitePort(%q) = %d; want 30050", "client-r18", got)
	}
}
