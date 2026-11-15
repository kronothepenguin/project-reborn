package store

import "testing"

func TestValidatePath(t *testing.T) {
	for _, path := range []string{"habbo.db", "data/habbo.db", "/var/lib/reborn/habbo.db"} {
		if err := ValidatePath(path); err != nil {
			t.Errorf("ValidatePath(%q) = %v, want nil", path, err)
		}
	}
	for _, path := range []string{"", "habbo.db?mode=ro", "habbo#1.db"} {
		if err := ValidatePath(path); err == nil {
			t.Errorf("ValidatePath(%q) = nil, want an error", path)
		}
	}
}
