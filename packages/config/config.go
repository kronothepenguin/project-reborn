package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"sync"
)

const configFilename = "config.json"

var (
	once    sync.Once
	loaded  *Config
	loadErr error
)

type Config struct{}

func defaults() *Config {
	return &Config{}
}

func (c *Config) Validate() error {
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

func create() ([]byte, error) {
	data, err := json.MarshalIndent(defaults(), "", "  ")
	if err != nil {
		return nil, err
	}
	data = append(data, '\n')
	if err := os.WriteFile(configFilename, data, 0o644); err != nil {
		return nil, err
	}
	return data, nil
}
