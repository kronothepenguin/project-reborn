package proxy

import (
	"encoding/json"
	"net/netip"
	"reflect"
	"testing"
)

func TestDefaultsSatisfyTheirValidators(t *testing.T) {
	if err := ValidateEnabled(DefaultEnabled()); err != nil {
		t.Errorf("default enabled is invalid: %v", err)
	}
	if err := ValidateTrusted(DefaultTrusted()); err != nil {
		t.Errorf("default trusted is invalid: %v", err)
	}
	if err := (Proxy{Enabled: true, Trusted: DefaultTrusted()}).Validate(); err != nil {
		t.Errorf("enabling the default trusted list is invalid: %v", err)
	}
}

func TestValidateTrusted(t *testing.T) {
	for _, value := range []string{"127.0.0.1", "::1", "10.0.0.0/8", "2001:db8::/32", "::ffff:10.0.0.1"} {
		if err := ValidateTrusted([]string{value}); err != nil {
			t.Errorf("ValidateTrusted(%q) = %v, want nil", value, err)
		}
	}
	for _, value := range []string{"", "localhost", "300.1.1.1", "10.0.0.0/33", "10.0.0.1:80"} {
		if err := ValidateTrusted([]string{value}); err == nil {
			t.Errorf("ValidateTrusted(%q) = nil, want an error", value)
		}
	}
}

func TestParseTrusted(t *testing.T) {
	for value, want := range map[string]string{
		"127.0.0.1":       "127.0.0.1/32",
		"::1":             "::1/128",
		"::ffff:10.0.0.1": "10.0.0.1/32",
		"10.1.2.3/8":      "10.0.0.0/8",
	} {
		got, err := ParseTrusted(value)
		if err != nil || got != netip.MustParsePrefix(want) {
			t.Errorf("ParseTrusted(%q) = %v, %v, want %s", value, got, err, want)
		}
	}
}

func TestEnabledNeedsATrustedProxy(t *testing.T) {
	if err := (Proxy{Enabled: true}).Validate(); err == nil {
		t.Error("Validate() accepted enabled without trusted proxies")
	}
	if err := (Proxy{}).Validate(); err != nil {
		t.Errorf("Validate() rejected a disabled proxy without trusted proxies: %v", err)
	}
}

func TestJSONTags(t *testing.T) {
	in := Proxy{Enabled: true, Trusted: []string{"10.0.0.0/8"}}
	data, err := json.Marshal(in)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if want := `{"enabled":true,"trusted":["10.0.0.0/8"]}`; string(data) != want {
		t.Errorf("marshal = %s, want %s", data, want)
	}
	var out Proxy
	if err := json.Unmarshal(data, &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if !reflect.DeepEqual(out, in) {
		t.Errorf("round trip = %+v, want %+v", out, in)
	}
}
