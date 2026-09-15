package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"time"
)

// Config is the resolved runtime configuration of the CMS application.
type Config struct {
	Addr          string
	BaseURL       *url.URL
	DBPath        string
	HelpURL       string
	TermsURL      string
	PrivacyURL    string
	FailureMax    int
	FailureWindow time.Duration
	LockDuration  time.Duration
	PurgeInterval time.Duration
}

// Load reads the CMS_* environment variables and applies the documented
// defaults so the app runs with no configuration. Invalid values are reported
// instead of being silently replaced.
func Load() (Config, error) {
	cfg := Config{
		Addr:          envOr("CMS_ADDR", "localhost:8080"),
		DBPath:        envOr("CMS_DB_PATH", "habbo.db"),
		HelpURL:       envOr("CMS_HELP_URL", "#"),
		TermsURL:      envOr("CMS_TERMS_URL", "#"),
		PrivacyURL:    envOr("CMS_PRIVACY_URL", "#"),
		FailureMax:    5,
		FailureWindow: 15 * time.Minute,
		LockDuration:  15 * time.Minute,
		PurgeInterval: time.Hour,
	}

	base, err := url.Parse(envOr("CMS_BASE_URL", "http://localhost:8080"))
	if err != nil {
		return Config{}, fmt.Errorf("config: CMS_BASE_URL: %w", err)
	}
	if base.Scheme == "" || base.Host == "" {
		return Config{}, fmt.Errorf("config: CMS_BASE_URL must be an absolute URL")
	}
	cfg.BaseURL = base

	if cfg.FailureMax, err = envInt("CMS_FAILURE_MAX", cfg.FailureMax); err != nil {
		return Config{}, err
	}
	if cfg.FailureWindow, err = envDuration("CMS_FAILURE_WINDOW", cfg.FailureWindow); err != nil {
		return Config{}, err
	}
	if cfg.LockDuration, err = envDuration("CMS_LOCK_DURATION", cfg.LockDuration); err != nil {
		return Config{}, err
	}
	if cfg.PurgeInterval, err = envDuration("CMS_PURGE_INTERVAL", cfg.PurgeInterval); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

// envOr returns the variable's value when set and non-empty, otherwise the
// fallback.
func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// envInt parses a positive integer variable.
func envInt(key string, fallback int) (int, error) {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback, nil
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("config: %s: %w", key, err)
	}
	if value < 1 {
		return 0, fmt.Errorf("config: %s must be positive", key)
	}
	return value, nil
}

// envDuration parses a positive duration variable.
func envDuration(key string, fallback time.Duration) (time.Duration, error) {
	raw := os.Getenv(key)
	if raw == "" {
		return fallback, nil
	}
	value, err := time.ParseDuration(raw)
	if err != nil {
		return 0, fmt.Errorf("config: %s: %w", key, err)
	}
	if value <= 0 {
		return 0, fmt.Errorf("config: %s must be positive", key)
	}
	return value, nil
}
