package config

import (
	"bytes"
	"os"
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
	if err := os.WriteFile(configFilename, []byte(content), 0o644); err != nil {
		t.Fatalf("write %s: %v", configFilename, err)
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
	if *cfg != (Config{}) {
		t.Errorf("Load() = %+v, want defaults %+v", *cfg, Config{})
	}

	data, err := os.ReadFile(configFilename)
	if err != nil {
		t.Fatalf("read created %s: %v", configFilename, err)
	}
	if string(data) != "{}\n" {
		t.Errorf("created file = %q, want %q", data, "{}\n")
	}

	info, err := os.Stat(configFilename)
	if err != nil {
		t.Fatalf("stat created %s: %v", configFilename, err)
	}
	if perm := info.Mode().Perm(); perm != 0o644 {
		t.Errorf("created file mode = %o, want %o", perm, 0o644)
	}
}

func TestLoadLeavesExistingFileByteIdentical(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{\n  \"future\": true\n}\n")

	before, err := os.ReadFile(configFilename)
	if err != nil {
		t.Fatalf("read %s before: %v", configFilename, err)
	}

	if _, err := Load(); err != nil {
		t.Fatalf("Load() error = %v, want nil", err)
	}

	after, err := os.ReadFile(configFilename)
	if err != nil {
		t.Fatalf("read %s after: %v", configFilename, err)
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
			if !strings.Contains(err.Error(), configFilename) {
				t.Errorf("Load() error = %q, want it to name %s", err, configFilename)
			}
		})
	}
}

func TestLoadRejectsUnreadableFile(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	if err := os.Mkdir(configFilename, 0o755); err != nil {
		t.Fatalf("mkdir %s: %v", configFilename, err)
	}

	_, err := Load()
	if err == nil {
		t.Fatal("Load() error = nil, want error")
	}
	if !strings.Contains(err.Error(), configFilename) {
		t.Errorf("Load() error = %q, want it to name %s", err, configFilename)
	}
}

func TestMustAndGetPanicOnFailure(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{")

	_, wantErr := Load()
	if wantErr == nil {
		t.Fatal("Load() error = nil, want error")
	}

	assertPanicsWithLoadError(t, "Must", wantErr, func() { Must() })
	assertPanicsWithLoadError(t, "Get", wantErr, func() { Get() })
}

func assertPanicsWithLoadError(t *testing.T, name string, want error, fn func()) {
	t.Helper()
	defer func() {
		recovered := recover()
		if recovered == nil {
			t.Errorf("%s() did not panic", name)
			return
		}
		got, ok := recovered.(error)
		if !ok {
			t.Errorf("%s() panicked with %v (%T), want the load error", name, recovered, recovered)
			return
		}
		if got != want {
			t.Errorf("%s() panic = %v, want load error %v", name, got, want)
		}
	}()
	fn()
}

func TestFailedLoadIsNotRetried(t *testing.T) {
	t.Chdir(t.TempDir())
	resetLoadState(t)
	writeConfig(t, "{")

	_, firstErr := Load()
	if firstErr == nil {
		t.Fatal("Load() error = nil, want error")
	}

	writeConfig(t, "{}\n")

	_, secondErr := Load()
	if secondErr == nil {
		t.Fatal("Load() after correcting the file = nil, want the cached error")
	}
	if secondErr != firstErr {
		t.Errorf("second Load() error = %v, want cached %v", secondErr, firstErr)
	}
	if !strings.Contains(firstErr.Error(), configFilename) {
		t.Errorf("Load() error = %q, want it to name %s", firstErr, configFilename)
	}
}
