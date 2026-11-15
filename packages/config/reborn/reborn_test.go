package reborn

import "testing"

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
