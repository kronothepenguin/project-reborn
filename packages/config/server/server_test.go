package server

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
)

func TestDefaultsAreValid(t *testing.T) {
	for name, c := range map[string]Connection{"info": DefaultInfo(), "mus": DefaultMUS()} {
		if err := c.Validate(); err != nil {
			t.Errorf("the default %s %+v: %v", name, c, err)
		}
	}
	if err := (Server{Info: DefaultInfo(), MUS: DefaultMUS()}).Validate(); err != nil {
		t.Errorf("the default section: %v", err)
	}
}

func TestValidateHostIsTheRuleOfCMSHost(t *testing.T) {
	for _, host := range []string{"localhost", "0.0.0.0", "127.0.0.1", "::", "::1", "hotel.example.com", "game-1"} {
		if err := ValidateHost(host); err != nil {
			t.Errorf("ValidateHost(%q) = %v, want nil", host, err)
		}
	}
	for _, host := range []string{"", " ", "localhost:80", "http://localhost", "-host", "host-", "a b", "[::1]"} {
		if err := ValidateHost(host); err == nil {
			t.Errorf("ValidateHost(%q) = nil, want an error", host)
		}
		if got, want := ValidateHost(host), cms.ValidateHost(host); got.Error() != want.Error() {
			t.Errorf("ValidateHost(%q) = %v, but cms.ValidateHost gives %v", host, got, want)
		}
	}
}

func TestValidatePort(t *testing.T) {
	for _, port := range []int{1, 80, 30000, 65535} {
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

func TestValidateNamesTheKey(t *testing.T) {
	for _, c := range []struct {
		server Server
		want   string
	}{
		{Server{Info: Connection{Host: "", Port: 30000}, MUS: DefaultMUS()}, "info.host: must"},
		{Server{Info: DefaultInfo(), MUS: Connection{Host: "localhost", Port: 0}}, "mus.port: must"},
		{Server{Info: DefaultInfo(), MUS: Connection{Host: "127.0.0.1", Port: 30000}}, "mus.port: must differ from info.port"},
	} {
		if err := c.server.Validate(); err == nil || !strings.HasPrefix(err.Error(), c.want) {
			t.Errorf("Validate(%+v) = %v, want an error starting %q", c.server, err, c.want)
		}
	}
}

func TestJSONTags(t *testing.T) {
	in := Server{Info: Connection{Host: "0.0.0.0", Port: 31000}, MUS: Connection{Host: "game.example.com", Port: 31001}}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if want := `{"info":{"host":"0.0.0.0","port":31000},"mus":{"host":"game.example.com","port":31001}}`; string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Server
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out != in {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
