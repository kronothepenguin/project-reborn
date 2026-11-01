package main

import (
	"bytes"
	"go/format"
	"io/fs"
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

// make install is what makes a fresh clone compile: the root runs it in every
// app, and the app runs the one of its package.
func TestWriteGeneratesInstallTargets(t *testing.T) {
	root := t.TempDir()
	if err := write(root, "probe", 10001, 20001); err != nil {
		t.Fatalf("write: %v", err)
	}
	for file, want := range map[string]string{
		"apps/probe/Makefile":     "$(MAKE) -C ../../packages/probe install",
		"packages/probe/Makefile": "test -e dist/index.html ||",
	} {
		data, err := os.ReadFile(filepath.Join(root, file))
		if err != nil {
			t.Errorf("read the generated %s: %v", file, err)
			continue
		}
		if !strings.Contains(string(data), want) {
			t.Errorf("the generated %s lacks %q:\n%s", file, want, data)
		}
	}
}

// A new project is not in git yet and has no build, so it starts with the
// placeholder go:embed needs.
func TestWriteGeneratesThePlaceholder(t *testing.T) {
	root := t.TempDir()
	if err := write(root, "probe", 10001, 20001); err != nil {
		t.Fatalf("write: %v", err)
	}
	data, err := os.ReadFile(filepath.Join(root, "packages", "probe", "dist", "index.html"))
	if err != nil {
		t.Fatalf("read the placeholder: %v", err)
	}
	if !strings.Contains(string(data), "<title>probe</title>") {
		t.Errorf("the placeholder is not rendered:\n%s", data)
	}
}

// A new app starts in the shape of the apps that exist: the runner opens the
// database and hands it to New, and a server that cannot start says why.
func TestWriteGeneratesTheCurrentAppShape(t *testing.T) {
	root := t.TempDir()
	if err := write(root, "probe", 10001, 20001); err != nil {
		t.Fatalf("write: %v", err)
	}
	for file, wants := range map[string][]string{
		"apps/probe/cmd/probe/main.go": {
			"db := store.FromConfig()",
			"probe.New(db,",
			"probe.WithResolver(resolver)",
			"probe.WithStatic(fileServer)",
			"log.Fatalln(server.ListenAndServe())",
		},
		"apps/probe/cmd/probe-dev/main.go": {
			"db := store.FromConfig()",
			"probe.New(db,",
			"probe.WithResolver(resolver)",
			"probe.WithStatic(proxy)",
			"log.Fatalln(server.ListenAndServe())",
		},
		"packages/probe/probe.go": {
			"func New(db *sql.DB, opts ...Option) *Probe {",
			"func (c *Probe) Mount(mux *http.ServeMux) {",
		},
		"packages/probe/internal/router/router.go": {"DB       *sql.DB"},
		"packages/probe/src/pages/index.astro":     {`<Counter client:only="svelte" />`},
		"packages/probe/src/components/counter.svelte": {
			"$state(0)",
			"onclick=",
		},
	} {
		data, err := os.ReadFile(filepath.Join(root, file))
		if err != nil {
			t.Errorf("read the generated %s: %v", file, err)
			continue
		}
		for _, want := range wants {
			if !strings.Contains(string(data), want) {
				t.Errorf("the generated %s lacks %q:\n%s", file, want, data)
			}
		}
	}
}

// Generated code passes the same checks as hand-written code, so that
// make create leaves nothing to fix.
func TestWriteGeneratesFormattedFiles(t *testing.T) {
	root := t.TempDir()
	if err := write(root, "probe", 10001, 20001); err != nil {
		t.Fatalf("write: %v", err)
	}
	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		name, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}
		if !bytes.HasSuffix(data, []byte("\n")) {
			t.Errorf("%s does not end with a newline", name)
		}
		if filepath.Ext(path) != ".go" {
			return nil
		}
		formatted, err := format.Source(data)
		if err != nil {
			t.Errorf("%s does not parse: %v", name, err)
			return nil
		}
		if !bytes.Equal(formatted, data) {
			t.Errorf("%s is not formatted", name)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("walk: %v", err)
	}
}
