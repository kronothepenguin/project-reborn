package config

import (
	"bytes"
	"errors"
	"io/fs"
	"os"
	"strings"
	"testing"
)

func TestCreateWritesTheConfig(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	cfg := defaults()
	cfg.CMS.Port = 8080
	cfg.Store.Path = "data/reborn.db"

	if err := Create(cfg); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	data, err := os.ReadFile(configFilename)
	if err != nil {
		t.Fatalf("read %s: %v", configFilename, err)
	}
	want, err := encode(cfg)
	if err != nil {
		t.Fatalf("encode: %v", err)
	}
	if !bytes.Equal(data, want) {
		t.Errorf("written file = %q, want %q", data, want)
	}
	info, err := os.Stat(configFilename)
	if err != nil {
		t.Fatalf("stat %s: %v", configFilename, err)
	}
	if perm := info.Mode().Perm(); perm != 0o644 {
		t.Errorf("file mode = %o, want %o", perm, 0o644)
	}

	loaded, err := Load()
	if err != nil {
		t.Fatalf("Load() after Create() error = %v", err)
	}
	if *loaded != *cfg {
		t.Errorf("Load() = %+v, want the created %+v", *loaded, *cfg)
	}
}

func TestCreateRefusesAnExistingFile(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	existing := "{\n  \"cms\": {\"port\": 9000}\n}\n"
	writeConfig(t, existing)

	err := Create(defaults())
	if !errors.Is(err, fs.ErrExist) {
		t.Fatalf("Create() error = %v, want fs.ErrExist", err)
	}
	if !strings.Contains(err.Error(), configFilename) {
		t.Errorf("Create() error = %q, want it to name %s", err, configFilename)
	}
	data, readErr := os.ReadFile(configFilename)
	if readErr != nil {
		t.Fatalf("read %s: %v", configFilename, readErr)
	}
	if string(data) != existing {
		t.Errorf("existing file was changed: %q", data)
	}
}

func TestCreateRejectsAnInvalidConfig(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	cfg := defaults()
	cfg.CMS.Port = 0

	err := Create(cfg)
	if err == nil {
		t.Fatal("Create() error = nil, want a validation error")
	}
	for _, want := range []string{configFilename, "cms.port: must"} {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("Create() error = %q, want it to contain %q", err, want)
		}
	}
	if _, statErr := os.Stat(configFilename); !errors.Is(statErr, fs.ErrNotExist) {
		t.Errorf("Create() wrote %s for an invalid config (stat: %v)", configFilename, statErr)
	}
}
