package auth

import "fmt"

type Auth struct {
	SecureCookies      bool `json:"secureCookies"`
	SessionIdleMinutes int  `json:"sessionIdleMinutes"`
	RememberDays       int  `json:"rememberDays"`
	LoginMaxFailures   int  `json:"loginMaxFailures"`
	LoginWindowMinutes int  `json:"loginWindowMinutes"`
	PasswordMinLength  int  `json:"passwordMinLength"`
	PasswordMaxLength  int  `json:"passwordMaxLength"`
	ResetTokenMinutes  int  `json:"resetTokenMinutes"`
}

func DefaultSecureCookies() bool {
	return true
}

func ValidateSecureCookies(bool) error {
	return nil
}

func DefaultSessionIdleMinutes() int {
	return 30
}

func ValidateSessionIdleMinutes(value int) error {
	return between(value, 5, 1440)
}

func DefaultRememberDays() int {
	return 100
}

func ValidateRememberDays(value int) error {
	return between(value, 1, 365)
}

func DefaultLoginMaxFailures() int {
	return 5
}

func ValidateLoginMaxFailures(value int) error {
	return between(value, 1, 100)
}

func DefaultLoginWindowMinutes() int {
	return 15
}

func ValidateLoginWindowMinutes(value int) error {
	return between(value, 1, 1440)
}

func DefaultPasswordMinLength() int {
	return 6
}

func ValidatePasswordMinLength(value int) error {
	return between(value, 6, 128)
}

func DefaultPasswordMaxLength() int {
	return 25
}

func ValidatePasswordMaxLength(value int) error {
	return between(value, 6, 1024)
}

func DefaultResetTokenMinutes() int {
	return 60
}

func ValidateResetTokenMinutes(value int) error {
	return between(value, 5, 1440)
}

func (a Auth) Validate() error {
	checks := []struct {
		key string
		err error
	}{
		{"secureCookies", ValidateSecureCookies(a.SecureCookies)},
		{"sessionIdleMinutes", ValidateSessionIdleMinutes(a.SessionIdleMinutes)},
		{"rememberDays", ValidateRememberDays(a.RememberDays)},
		{"loginMaxFailures", ValidateLoginMaxFailures(a.LoginMaxFailures)},
		{"loginWindowMinutes", ValidateLoginWindowMinutes(a.LoginWindowMinutes)},
		{"passwordMinLength", ValidatePasswordMinLength(a.PasswordMinLength)},
		{"passwordMaxLength", ValidatePasswordMaxLength(a.PasswordMaxLength)},
		{"resetTokenMinutes", ValidateResetTokenMinutes(a.ResetTokenMinutes)},
	}
	for _, check := range checks {
		if check.err != nil {
			return fmt.Errorf("%s: %w", check.key, check.err)
		}
	}
	if a.PasswordMaxLength < a.PasswordMinLength {
		return fmt.Errorf("passwordMaxLength: must be at least passwordMinLength (%d), got %d", a.PasswordMinLength, a.PasswordMaxLength)
	}
	return nil
}

func between(value, low, high int) error {
	if value < low || value > high {
		return fmt.Errorf("must be between %d and %d, got %d", low, high, value)
	}
	return nil
}
