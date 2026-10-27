package site

import (
	"fmt"
	"net/url"
	"unicode/utf8"
)

type Site struct {
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	URL         string `json:"url"`
	Maintenance bool   `json:"maintenance"`
}

func DefaultName() string {
	return "Holo Hotel"
}

func ValidateName(value string) error {
	return length(value, 1, 30)
}

func DefaultShortName() string {
	return "Holo"
}

func ValidateShortName(value string) error {
	return length(value, 1, 30)
}

func DefaultURL() string {
	return "http://localhost:17387"
}

// ValidateURL requires the bare origin because links are built by appending a
// path such as /reset/<token> to it.
func ValidateURL(value string) error {
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" ||
		u.Path != "" || u.RawQuery != "" || u.Fragment != "" || u.User != nil {
		return fmt.Errorf("must be an http or https origin without a path, like https://example.com, got %q", value)
	}
	return nil
}

func DefaultMaintenance() bool {
	return false
}

func ValidateMaintenance(bool) error {
	return nil
}

func (s Site) Validate() error {
	checks := []struct {
		key string
		err error
	}{
		{"name", ValidateName(s.Name)},
		{"shortName", ValidateShortName(s.ShortName)},
		{"url", ValidateURL(s.URL)},
		{"maintenance", ValidateMaintenance(s.Maintenance)},
	}
	for _, check := range checks {
		if check.err != nil {
			return fmt.Errorf("%s: %w", check.key, check.err)
		}
	}
	return nil
}

func length(value string, low, high int) error {
	if n := utf8.RuneCountInString(value); n < low || n > high {
		return fmt.Errorf("must be %d to %d characters, got %d", low, high, n)
	}
	return nil
}
