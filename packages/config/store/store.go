package store

import (
	"errors"
	"fmt"
	"strings"
)

type Store struct {
	Path string `json:"path"`
}

func DefaultPath() string {
	return "habbo.db"
}

// ValidatePath rejects '?' and '#' because store.Open builds a file: URI from
// the path, where they would start the options and a fragment.
func ValidatePath(value string) error {
	if value == "" {
		return errors.New("must not be empty")
	}
	if strings.ContainsAny(value, "?#") {
		return fmt.Errorf("must not contain '?' or '#', got %q", value)
	}
	return nil
}

func (s Store) Validate() error {
	if err := ValidatePath(s.Path); err != nil {
		return fmt.Errorf("path: %w", err)
	}
	return nil
}
