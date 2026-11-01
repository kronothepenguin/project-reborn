package cms

import (
	"fmt"
	"net"
	"regexp"
)

type CMS struct {
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

func DefaultPort() int {
	return 17387
}

func ValidatePort(value int) error {
	if value < 1 || value > 65535 {
		return fmt.Errorf("must be between 1 and 65535, got %d", value)
	}
	return nil
}

func (c CMS) Validate() error {
	if err := ValidateHost(c.Host); err != nil {
		return fmt.Errorf("host: %w", err)
	}
	if err := ValidatePort(c.Port); err != nil {
		return fmt.Errorf("port: %w", err)
	}
	return nil
}
