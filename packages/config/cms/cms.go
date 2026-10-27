package cms

import "fmt"

type CMS struct {
	Port int `json:"port"`
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
	if err := ValidatePort(c.Port); err != nil {
		return fmt.Errorf("port: %w", err)
	}
	return nil
}
