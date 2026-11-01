package housekeeping

import (
	"fmt"
	"net"
	"regexp"
)

type Housekeeping struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

var hostname = regexp.MustCompile(`^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$`)

func DefaultHost() string {
	return "localhost"
}

// ValidateHost accepts a hostname or an IP address, such as 0.0.0.0 for every
// IPv4 interface.
func ValidateHost(value string) error {
	if net.ParseIP(value) == nil && !hostname.MatchString(value) {
		return fmt.Errorf("must be a hostname or an IP address, got %q", value)
	}
	return nil
}

// DefaultPort is the port tools/create derives for the name housekeeping.
func DefaultPort() int {
	return 18465
}

func ValidatePort(value int) error {
	if value < 1 || value > 65535 {
		return fmt.Errorf("must be between 1 and 65535, got %d", value)
	}
	return nil
}

func (h Housekeeping) Validate() error {
	if err := ValidateHost(h.Host); err != nil {
		return fmt.Errorf("host: %w", err)
	}
	if err := ValidatePort(h.Port); err != nil {
		return fmt.Errorf("port: %w", err)
	}
	return nil
}
