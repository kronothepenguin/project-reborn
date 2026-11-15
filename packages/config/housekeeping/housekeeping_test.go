package housekeeping

import "testing"

func TestValidateHost(t *testing.T) {
	for _, host := range []string{"localhost", "0.0.0.0", "127.0.0.1", "::", "::1", "hotel.example.com", "hk-1"} {
		if err := ValidateHost(host); err != nil {
			t.Errorf("ValidateHost(%q) = %v, want nil", host, err)
		}
	}
	for _, host := range []string{"", " ", "localhost:80", "http://localhost", "-host", "host-", "a b", "[::1]"} {
		if err := ValidateHost(host); err == nil {
			t.Errorf("ValidateHost(%q) = nil, want an error", host)
		}
	}
}

func TestValidatePort(t *testing.T) {
	for _, port := range []int{1, 80, 18465, 65535} {
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
