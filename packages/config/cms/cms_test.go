package cms

import (
	"encoding/json"
	"testing"
)

func TestDefaultPortIsValid(t *testing.T) {
	if err := ValidatePort(DefaultPort()); err != nil {
		t.Errorf("ValidatePort(DefaultPort()) = %v, want nil", err)
	}
}

func TestValidatePort(t *testing.T) {
	for _, port := range []int{1, 80, 17387, 65535} {
		if err := ValidatePort(port); err != nil {
			t.Errorf("ValidatePort(%d) = %v, want nil", port, err)
		}
	}
	for _, port := range []int{-1, 0, 65536} {
		if err := ValidatePort(port); err == nil {
			t.Errorf("ValidatePort(%d) = nil, want an error", port)
		}
	}
}

func TestJSONTags(t *testing.T) {
	in := CMS{Port: 8080}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if want := `{"port":8080}`; string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out CMS
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
