package virtual

import (
	"encoding/json/v2"
	"errors"
	"fmt"
	"net/url"
	"unicode/utf8"
)

var catalogue = map[string]declaration{
	"cms.refresh": declare(1, between(1, 3600)),

	"site.name":        declare("Holo Hotel", length(1, 30)),
	"site.shortName":   declare("Holo", length(1, 30)),
	"site.url":         declare("http://localhost:17387", origin),
	"site.maintenance": declare(false, nil),

	"auth.secureCookies":      declare(true, nil),
	"auth.sessionIdleMinutes": declare(30, between(5, 1440)),
	"auth.rememberDays":       declare(100, between(1, 365)),
	"auth.loginMaxFailures":   declare(5, between(1, 100)),
	"auth.loginWindowMinutes": declare(15, between(1, 1440)),
	"auth.passwordMinLength":  declare(6, between(6, 128)),
	"auth.passwordMaxLength":  declare(25, between(6, 1024)),
	"auth.resetTokenMinutes":  declare(60, between(5, 1440)),
}

// rules check settings that depend on each other. keys lists every setting a
// rule reads, so that rows breaking the rule can go back to their defaults.
var rules = []rule{
	{
		keys: []string{"auth.passwordMinLength", "auth.passwordMaxLength"},
		check: func(values map[string]any) error {
			low, high := values["auth.passwordMinLength"].(int), values["auth.passwordMaxLength"].(int)
			if high < low {
				return fmt.Errorf("auth.passwordMaxLength: must be at least auth.passwordMinLength (%d), got %d", low, high)
			}
			return nil
		},
	},
}

type declaration struct {
	def      any
	decode   func(literal string) (any, error)
	validate func(value any) error
}

type rule struct {
	keys  []string
	check func(values map[string]any) error
}

// declare takes the setting's type from its default; a nil valid accepts every
// value of that type.
func declare[T int | bool | string](def T, valid func(T) error) declaration {
	return declaration{
		def: def,
		decode: func(literal string) (any, error) {
			var value *T
			if err := json.Unmarshal([]byte(literal), &value); err != nil {
				return nil, err
			}
			if value == nil {
				return nil, errors.New("value is null")
			}
			return *value, nil
		},
		validate: func(value any) error {
			typed, ok := value.(T)
			if !ok {
				return fmt.Errorf("expected %T, got %T", def, value)
			}
			if valid == nil {
				return nil
			}
			return valid(typed)
		},
	}
}

func between(low, high int) func(int) error {
	return func(value int) error {
		if value < low || value > high {
			return fmt.Errorf("must be between %d and %d, got %d", low, high, value)
		}
		return nil
	}
}

func length(low, high int) func(string) error {
	return func(value string) error {
		if n := utf8.RuneCountInString(value); n < low || n > high {
			return fmt.Errorf("must be %d to %d characters, got %d", low, high, n)
		}
		return nil
	}
}

// origin requires a bare origin because links are built by appending a path
// such as /reset/<token> to it.
func origin(value string) error {
	u, err := url.Parse(value)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" ||
		u.Path != "" || u.RawQuery != "" || u.Fragment != "" || u.User != nil {
		return fmt.Errorf("must be an http or https origin without a path, like https://example.com, got %q", value)
	}
	return nil
}
