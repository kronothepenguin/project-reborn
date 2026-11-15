package reborn

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
)

func TestDefaultHostIsValid(t *testing.T) {
	if err := ValidateHost(DefaultHost()); err != nil {
		t.Errorf("ValidateHost(DefaultHost()) = %v, want nil", err)
	}
}

func TestValidateHostIsTheRuleOfCMSHost(t *testing.T) {
	for _, host := range []string{"localhost", "0.0.0.0", "127.0.0.1", "::", "::1", "hotel.example.com", "reborn-1"} {
		if err := ValidateHost(host); err != nil {
			t.Errorf("ValidateHost(%q) = %v, want nil", host, err)
		}
	}
	for _, host := range []string{"", " ", "localhost:16416", "http://localhost", "-host", "host-", "a b", "[::1]"} {
		if err := ValidateHost(host); err == nil {
			t.Errorf("ValidateHost(%q) = nil, want an error", host)
		}
		if got, want := ValidateHost(host), cms.ValidateHost(host); got.Error() != want.Error() {
			t.Errorf("ValidateHost(%q) = %v, but cms.ValidateHost gives %v", host, got, want)
		}
	}
}

func TestDefaultPortIsValid(t *testing.T) {
	if err := ValidatePort(DefaultPort()); err != nil {
		t.Errorf("ValidatePort(DefaultPort()) = %v, want nil", err)
	}
}

func TestValidatePort(t *testing.T) {
	for _, port := range []int{1, 80, 16416, 65535} {
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

func TestDefaultSectionIsValid(t *testing.T) {
	if err := (Reborn{Host: DefaultHost(), Port: DefaultPort()}).Validate(); err != nil {
		t.Errorf("the default section: %v", err)
	}
}

func TestValidateNamesTheKey(t *testing.T) {
	for _, c := range []struct {
		section Reborn
		want    string
	}{
		{Reborn{Host: "http://localhost", Port: DefaultPort()}, "host: must be a hostname or an IP address"},
		{Reborn{Host: DefaultHost(), Port: 0}, "port: must be between 1 and 65535"},
	} {
		if err := c.section.Validate(); err == nil || !strings.HasPrefix(err.Error(), c.want) {
			t.Errorf("Validate(%+v) = %v, want it to start with %q", c.section, err, c.want)
		}
	}
}

func TestJSONTags(t *testing.T) {
	in := Reborn{Host: "0.0.0.0", Port: 8080}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if want := `{"host":"0.0.0.0","port":8080}`; string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Reborn
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
