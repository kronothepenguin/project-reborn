package reborn

import (
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
)

// Reborn is the address of the whole hotel run in one process, where one mux
// serves the installer, the site and housekeeping. Under reborn, cms.host,
// cms.port, housekeeping.host and housekeeping.port go unused; the separate
// programs still read them.
type Reborn struct {
	Host string `json:"host"`
	Port int    `json:"port"`
}

func DefaultHost() string {
	return "localhost"
}

func ValidateHost(value string) error {
	return cms.ValidateHost(value)
}

// DefaultPort is the port tools/create derives for the name reborn.
func DefaultPort() int {
	return 16416
}

func ValidatePort(value int) error {
	if value < 1 || value > 65535 {
		return fmt.Errorf("must be between 1 and 65535, got %d", value)
	}
	return nil
}

func (r Reborn) Validate() error {
	if err := ValidateHost(r.Host); err != nil {
		return fmt.Errorf("host: %w", err)
	}
	if err := ValidatePort(r.Port); err != nil {
		return fmt.Errorf("port: %w", err)
	}
	return nil
}
