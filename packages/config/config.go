package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"sync"

	"github.com/kronothepenguin/project-reborn/packages/config/cms"
	"github.com/kronothepenguin/project-reborn/packages/config/proxy"
	"github.com/kronothepenguin/project-reborn/packages/config/store"
)

const configFilename = "config.json"

var (
	once    sync.Once
	loaded  *Config
	loadErr error
)

type Config struct {
	Store store.Store `json:"store"`
	CMS   cms.CMS     `json:"cms"`
	Proxy proxy.Proxy `json:"proxy"`
}

func defaults() *Config {
	return &Config{
		Store: store.Store{Path: store.DefaultPath()},
		CMS:   cms.CMS{Port: cms.DefaultPort()},
		Proxy: proxy.Proxy{Enabled: proxy.DefaultEnabled(), Trusted: proxy.DefaultTrusted()},
	}
}

// Validate prefixes each error with the full key path (cms.port), the same path
// virtual.Settings uses for the value.
func (c *Config) Validate() error {
	if err := c.Store.Validate(); err != nil {
		return fmt.Errorf("store.%w", err)
	}
	if err := c.CMS.Validate(); err != nil {
		return fmt.Errorf("cms.%w", err)
	}
	if err := c.Proxy.Validate(); err != nil {
		return fmt.Errorf("proxy.%w", err)
	}
	return nil
}

func Load() (*Config, error) {
	once.Do(func() {
		loaded, loadErr = load()
	})
	return loaded, loadErr
}

func Must() *Config {
	cfg, err := Load()
	if err != nil {
		panic(err)
	}
	return cfg
}

func Get() *Config {
	return Must()
}

// Create writes cfg as config.json and fails when the file already exists, so
// it never rewrites one. Call it before anything calls Load, which creates the
// file with the defaults when it is absent.
func Create(cfg *Config) error {
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("config: %s: %w", configFilename, err)
	}
	data, err := encode(cfg)
	if err != nil {
		return fmt.Errorf("config: %s: %w", configFilename, err)
	}

	f, err := os.OpenFile(configFilename, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		return fmt.Errorf("config: %s: %w", configFilename, err)
	}
	if _, err := f.Write(data); err != nil {
		f.Close()
		os.Remove(configFilename)
		return fmt.Errorf("config: %s: %w", configFilename, err)
	}
	if err := f.Close(); err != nil {
		os.Remove(configFilename)
		return fmt.Errorf("config: %s: %w", configFilename, err)
	}
	return nil
}

func load() (*Config, error) {
	data, err := os.ReadFile(configFilename)
	if errors.Is(err, fs.ErrNotExist) {
		data, err = create()
	}
	if err != nil {
		return nil, fmt.Errorf("config: %s: %w", configFilename, err)
	}

	cfg := defaults()
	if err := json.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("config: %s: %w", configFilename, jsonError(err))
	}
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("config: %s: %w", configFilename, err)
	}
	return cfg, nil
}

func jsonError(err error) error {
	if typeErr, ok := errors.AsType[*json.UnmarshalTypeError](err); ok {
		return fmt.Errorf("%s: expected %s, got %s", typeErr.Field, typeErr.Type, typeErr.Value)
	}
	return fmt.Errorf("invalid JSON: %w", err)
}

func encode(cfg *Config) ([]byte, error) {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return nil, err
	}
	return append(data, '\n'), nil
}

func create() ([]byte, error) {
	data, err := encode(defaults())
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(configFilename, data, 0o644); err != nil {
		return nil, err
	}
	return data, nil
}
