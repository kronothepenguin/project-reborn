package proxy

import (
	"errors"
	"fmt"
	"net/netip"
	"strings"
)

type Proxy struct {
	Enabled bool     `json:"enabled"`
	Trusted []string `json:"trusted"`
}

func DefaultEnabled() bool {
	return false
}

func ValidateEnabled(bool) error {
	return nil
}

// DefaultTrusted trusts a proxy on the same machine.
func DefaultTrusted() []string {
	return []string{"127.0.0.1", "::1"}
}

func ValidateTrusted(values []string) error {
	for _, value := range values {
		if _, err := ParseTrusted(value); err != nil {
			return err
		}
	}
	return nil
}

// ParseTrusted reads one trusted entry as a range: an address is the range of
// that address alone, and a CIDR range such as 10.0.0.0/8 covers a pod network.
func ParseTrusted(value string) (netip.Prefix, error) {
	if strings.Contains(value, "/") {
		prefix, err := netip.ParsePrefix(value)
		if err != nil {
			return netip.Prefix{}, fmt.Errorf("must be IP addresses or CIDR ranges, got %q", value)
		}
		return prefix.Masked(), nil
	}
	addr, err := netip.ParseAddr(value)
	if err != nil {
		return netip.Prefix{}, fmt.Errorf("must be IP addresses or CIDR ranges, got %q", value)
	}
	addr = addr.Unmap()
	return netip.PrefixFrom(addr, addr.BitLen()), nil
}

func (p Proxy) Validate() error {
	if err := ValidateEnabled(p.Enabled); err != nil {
		return fmt.Errorf("enabled: %w", err)
	}
	if err := ValidateTrusted(p.Trusted); err != nil {
		return fmt.Errorf("trusted: %w", err)
	}
	if p.Enabled && len(p.Trusted) == 0 {
		return errors.New("trusted: must list at least one proxy when enabled is true")
	}
	return nil
}
