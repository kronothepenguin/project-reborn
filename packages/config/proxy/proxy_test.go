package proxy

import (
	"net/netip"
	"testing"
)

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
