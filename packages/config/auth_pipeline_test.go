package config

import (
	"strings"
	"testing"
)

func TestAuthKeys(t *testing.T) {
	runKeyCases(t, []keyCase{
		{
			key:       "auth.secureCookies",
			value:     func(c *Config) any { return c.Auth.SecureCookies },
			def:       true,
			explicit:  `{"auth": {"secureCookies": false}}`,
			want:      false,
			wrongType: `{"auth": {"secureCookies": "no"}}`,
			typeName:  "bool",
		},
		{
			key:        "auth.sessionIdleMinutes",
			value:      func(c *Config) any { return c.Auth.SessionIdleMinutes },
			def:        30,
			explicit:   `{"auth": {"sessionIdleMinutes": 120}}`,
			want:       120,
			wrongType:  `{"auth": {"sessionIdleMinutes": "120"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"sessionIdleMinutes": 1}}`,
		},
		{
			key:        "auth.rememberDays",
			value:      func(c *Config) any { return c.Auth.RememberDays },
			def:        100,
			explicit:   `{"auth": {"rememberDays": 30}}`,
			want:       30,
			wrongType:  `{"auth": {"rememberDays": true}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"rememberDays": 400}}`,
		},
		{
			key:        "auth.loginMaxFailures",
			value:      func(c *Config) any { return c.Auth.LoginMaxFailures },
			def:        5,
			explicit:   `{"auth": {"loginMaxFailures": 10}}`,
			want:       10,
			wrongType:  `{"auth": {"loginMaxFailures": "10"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"loginMaxFailures": 0}}`,
		},
		{
			key:        "auth.loginWindowMinutes",
			value:      func(c *Config) any { return c.Auth.LoginWindowMinutes },
			def:        15,
			explicit:   `{"auth": {"loginWindowMinutes": 60}}`,
			want:       60,
			wrongType:  `{"auth": {"loginWindowMinutes": "60"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"loginWindowMinutes": 2000}}`,
		},
		{
			key:        "auth.passwordMinLength",
			value:      func(c *Config) any { return c.Auth.PasswordMinLength },
			def:        6,
			explicit:   `{"auth": {"passwordMinLength": 8}}`,
			want:       8,
			wrongType:  `{"auth": {"passwordMinLength": "8"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"passwordMinLength": 4}}`,
		},
		{
			key:        "auth.passwordMaxLength",
			value:      func(c *Config) any { return c.Auth.PasswordMaxLength },
			def:        25,
			explicit:   `{"auth": {"passwordMaxLength": 64}}`,
			want:       64,
			wrongType:  `{"auth": {"passwordMaxLength": "64"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"passwordMaxLength": 5}}`,
		},
		{
			key:        "auth.resetTokenMinutes",
			value:      func(c *Config) any { return c.Auth.ResetTokenMinutes },
			def:        60,
			explicit:   `{"auth": {"resetTokenMinutes": 30}}`,
			want:       30,
			wrongType:  `{"auth": {"resetTokenMinutes": "30"}}`,
			typeName:   "int",
			outOfRange: `{"auth": {"resetTokenMinutes": 1}}`,
		},
	})
}

func TestAuthPartialSectionKeepsOtherDefaults(t *testing.T) {
	cfg, err := loadWithFile(t, `{"auth": {"rememberDays": 10}}`)
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	want := defaults().Auth
	want.RememberDays = 10
	if cfg.Auth != want {
		t.Errorf("auth = %+v, want %+v", cfg.Auth, want)
	}
}

func TestAuthPasswordLengthsMustOverlap(t *testing.T) {
	_, err := loadWithFile(t, `{"auth": {"passwordMinLength": 30}}`)
	if err == nil {
		t.Fatal("Load() error = nil, want passwordMaxLength below passwordMinLength to fail")
	}
	for _, want := range []string{configFilename, "auth.passwordMaxLength: must be at least passwordMinLength (30)"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("Load() error = %q, want it to contain %q", err, want)
		}
	}
}
