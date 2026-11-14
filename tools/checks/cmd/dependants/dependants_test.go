package main

import (
	"os"
	"path/filepath"
	"slices"
	"testing"
)

func writeFiles(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for name, content := range files {
		path := filepath.Join(root, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// newWorkspace builds a workspace where packages/b imports packages/a in a
// test only, apps/c imports packages/b, packages/b depends on packages/ui
// through pnpm, and packages/b depends on packages/other by a registry
// version, which is no workspace dependency.
func newWorkspace(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	writeFiles(t, root, map[string]string{
		"go.work":                     "go 1.27.0\n\nuse (\n\t./apps/c\n\t./packages/a\n\t./packages/b\n)\n",
		"pnpm-workspace.yaml":         "packages:\n- apps/*\n- packages/*\n",
		"packages/a/go.mod":           "module example.com/w/packages/a\n\ngo 1.27.0\n",
		"packages/a/a.go":             "package a\n\nfunc Hello() string { return \"hello\" }\n",
		"packages/b/go.mod":           "module example.com/w/packages/b\n\ngo 1.27.0\n",
		"packages/b/b.go":             "package b\n\nfunc Name() string { return \"b\" }\n",
		"packages/b/b_test.go":        "package b\n\nimport (\n\t\"testing\"\n\n\t\"example.com/w/packages/a\"\n)\n\nfunc TestHello(t *testing.T) { _ = a.Hello() }\n",
		"packages/b/package.json":     `{"name": "@w/b", "dependencies": {"@w/ui": "workspace:*", "@w/other": "^1.0.0"}}`,
		"packages/ui/package.json":    `{"name": "@w/ui"}`,
		"packages/other/package.json": `{"name": "@w/other"}`,
		"apps/c/go.mod":               "module example.com/w/apps/c\n\ngo 1.27.0\n",
		"apps/c/cmd/c/main.go":        "package main\n\nimport \"example.com/w/packages/b\"\n\nfunc main() { println(b.Name()) }\n",
	})
	return root
}

func TestDependantsListEveryProjectThatUsesItDirectlyOrThroughAnother(t *testing.T) {
	root := newWorkspace(t)
	cases := map[string][]string{
		"packages/a":  {"apps/c", "packages/b"},
		"packages/ui": {"apps/c", "packages/b"},
		"packages/b/": {"apps/c"},
	}
	for project, want := range cases {
		got, err := dependants(root, project)
		if err != nil {
			t.Fatalf("dependants(%s): %v", project, err)
		}
		if !slices.Equal(got, want) {
			t.Errorf("dependants(%s) = %v, want %v", project, got, want)
		}
	}
}

func TestDependantsOfAProjectNoProjectUsesAreEmpty(t *testing.T) {
	root := newWorkspace(t)
	for _, project := range []string{"apps/c", "packages/other"} {
		got, err := dependants(root, project)
		if err != nil {
			t.Fatalf("dependants(%s): %v", project, err)
		}
		if len(got) != 0 {
			t.Errorf("dependants(%s) = %v, want none", project, got)
		}
	}
}

func TestDependantsOfAFolderThatIsNoProjectAreRefused(t *testing.T) {
	root := newWorkspace(t)
	if got, err := dependants(root, "packages/missing"); err == nil {
		t.Fatalf("dependants(packages/missing) = %v, want refused", got)
	}
}
