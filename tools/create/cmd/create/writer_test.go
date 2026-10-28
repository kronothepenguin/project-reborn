package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The dev runner works from the repository root, so the generated Makefile
// starts air there and .air.toml names every path from the root.
func TestWriteRendersTheRunnerFromTheRoot(t *testing.T) {
	root := t.TempDir()
	if err := write(root, "probe", 10001, 20001); err != nil {
		t.Fatalf("write: %v", err)
	}
	for file, want := range map[string]string{
		".air.toml": `cmd = "go build -o ./apps/probe/tmp/probe ./apps/probe/cmd/probe-dev"`,
		"Makefile":  "cd ../.. && go tool air -c apps/probe/.air.toml",
	} {
		data, err := os.ReadFile(filepath.Join(root, "apps", "probe", file))
		if err != nil {
			t.Errorf("read the generated %s: %v", file, err)
			continue
		}
		if !strings.Contains(string(data), want) {
			t.Errorf("the generated %s lacks %q:\n%s", file, want, data)
		}
	}
}
