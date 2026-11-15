package config

import (
	"bytes"
	"os"
	"reflect"
	"strings"
	"sync"
	"testing"
)

func resetLoadState(t *testing.T) {
	t.Helper()
	once = sync.Once{}
	loaded = nil
	loadErr = nil
	t.Cleanup(func() {
		once = sync.Once{}
		loaded = nil
		loadErr = nil
	})
}

func writeConfig(t *testing.T, content string) {
	t.Helper()
	if err := os.WriteFile(Filename, []byte(content), 0o644); err != nil {
		t.Fatalf("write %s: %v", Filename, err)
	}
}

func TestLoadUsesWorkingDirectory(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{}\n")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v, want nil", err)
	}
	if cfg == nil {
		t.Fatal("Load() returned nil config")
	}
	if got, _ := Load(); got != cfg {
		t.Errorf("second Load() = %p, want %p", got, cfg)
	}
	if got := Get(); got != cfg {
		t.Errorf("Get() = %p, want %p", got, cfg)
	}
}

func TestNoEnvironmentVariableConsulted(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{}\n")
	t.Setenv("CONFIG", "missing-from-env.json")
	t.Setenv("CONFIG_JSON", "missing-from-env.json")

	if _, err := Load(); err != nil {
		t.Fatalf("Load() error = %v, want nil from the working directory", err)
	}
}

func TestLoadCreatesFileWhenAbsent(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v, want nil", err)
	}
	if cfg == nil {
		t.Fatal("Load() returned nil config")
	}
	if !reflect.DeepEqual(cfg, defaults()) {
		t.Errorf("Load() = %+v, want defaults %+v", *cfg, *defaults())
	}

	data, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatalf("read created %s: %v", Filename, err)
	}
	want, err := encode(defaults())
	if err != nil {
		t.Fatalf("encode defaults: %v", err)
	}
	if !bytes.Equal(data, want) {
		t.Errorf("created file = %q, want %q", data, want)
	}

	info, err := os.Stat(Filename)
	if err != nil {
		t.Fatalf("stat created %s: %v", Filename, err)
	}
	if perm := info.Mode().Perm(); perm != 0o644 {
		t.Errorf("created file mode = %o, want %o", perm, 0o644)
	}
}

func TestLoadLeavesExistingFileByteIdentical(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{\n  \"future\": true\n}\n")

	before, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatalf("read %s before: %v", Filename, err)
	}

	if _, err := Load(); err != nil {
		t.Fatalf("Load() error = %v, want nil", err)
	}

	after, err := os.ReadFile(Filename)
	if err != nil {
		t.Fatalf("read %s after: %v", Filename, err)
	}
	if !bytes.Equal(before, after) {
		t.Errorf("file changed after Load():\nbefore %q\nafter  %q", before, after)
	}
}

func TestLoadRejectsInvalidJSON(t *testing.T) {
	for name, content := range map[string]string{
		"truncated": "{",
		"empty":     "",
	} {
		t.Run(name, func(t *testing.T) {
			t.Chdir(t.TempDir())
			resetLoadState(t)
			writeConfig(t, content)

			_, err := Load()
			if err == nil {
				t.Fatal("Load() error = nil, want error")
			}
			if !strings.Contains(err.Error(), Filename) {
				t.Errorf("Load() error = %q, want it to name %s", err, Filename)
			}
		})
	}
}

func TestLoadRejectsUnreadableFile(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	if err := os.Mkdir(Filename, 0o755); err != nil {
		t.Fatalf("mkdir %s: %v", Filename, err)
	}

	_, err := Load()
	if err == nil {
		t.Fatal("Load() error = nil, want error")
	}
	if !strings.Contains(err.Error(), Filename) {
		t.Errorf("Load() error = %q, want it to name %s", err, Filename)
	}
}
