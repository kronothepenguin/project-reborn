package assets

import (
	"errors"
	"fmt"
)

type Assets struct {
	Path string `json:"path"`
}

func DefaultPath() string {
	return "assets"
}

func ValidatePath(value string) error {
	if value == "" {
		return errors.New("must not be empty")
	}
	return nil
}

func (a Assets) Validate() error {
	if err := ValidatePath(a.Path); err != nil {
		return fmt.Errorf("path: %w", err)
	}
	return nil
}
