package store

import (
	"encoding/json"
	"testing"
)

func TestDefaultPathIsValid(t *testing.T) {
	if err := ValidatePath(DefaultPath()); err != nil {
		t.Errorf("ValidatePath(DefaultPath()) = %v, want nil", err)
	}
}

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

func TestJSONTags(t *testing.T) {
	in := Store{Path: "data/habbo.db"}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if want := `{"path":"data/habbo.db"}`; string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Store
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
