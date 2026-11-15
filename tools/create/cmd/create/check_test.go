package main

import (
	"encoding/json/v2"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// repoRoot is the repository that holds this test: the shared recipe and the
// modules a new project imports.
func repoRoot(t *testing.T) string {
	t.Helper()
	root, err := filepath.Abs(filepath.Join("..", "..", "..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	return root
}

func runIn(t *testing.T, dir, name string, args ...string) (string, error) {
	t.Helper()
	cmd := exec.Command(name, args...)
	cmd.Dir = dir
	// The outer make's flags and jobserver belong to the outer make, and
	// GOWORK is cleared so the go tool finds the root's own go.work.
	cmd.Env = append(os.Environ(), "MAKEFLAGS=", "MFLAGS=", "MAKELEVEL=", "GOWORK=")
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// newCheckRoot writes the project into a temporary repository root that holds
// the shared recipe and a go.work using the project's folders and every module
// of this repository, with every file tracked so gofmt sees them.
func newCheckRoot(t *testing.T, p project) string {
	t.Helper()
	repo := repoRoot(t)
	root := t.TempDir()

	recipe, err := os.ReadFile(filepath.Join(repo, "make", "check.mk"))
	if err != nil {
		t.Fatalf("read the recipe: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(root, "make"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "make", "check.mk"), recipe, 0o644); err != nil {
		t.Fatal(err)
	}

	if err := write(root, p); err != nil {
		t.Fatalf("write: %v", err)
	}

	if p.Kind != client {
		out, err := runIn(t, repo, "go", "list", "-m", "-f", "{{.Dir}}")
		if err != nil {
			t.Fatalf("list the modules of the repository: %v\n%s", err, out)
		}
		work := "go 1.27.0\n\nuse (\n"
		for _, dir := range p.dirs() {
			work += "\t./" + filepath.ToSlash(dir) + "\n"
		}
		for dir := range strings.FieldsSeq(out) {
			work += "\t" + dir + "\n"
		}
		work += ")\n"
		if err := os.WriteFile(filepath.Join(root, "go.work"), []byte(work), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	for _, args := range [][]string{{"init", "-q"}, {"add", "-A"}} {
		if out, err := runIn(t, root, "git", args...); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	return root
}

func checkPasses(t *testing.T, dir string) {
	t.Helper()
	out, err := runIn(t, dir, "make", "check")
	if err != nil {
		t.Fatalf("make check in %s: %v\n%s", dir, err, out)
	}
	for _, step := range []string{"go vet ./...", "go test ./... -race", "go build -o /dev/null ./..."} {
		if !strings.Contains(out, step) {
			t.Errorf("make check in %s did not run %q:\n%s", dir, step, out)
		}
	}
}

// A backend has only Go, so both of its folders run their whole check here.
func TestNewBackendPassesItsCheck(t *testing.T) {
	t.Parallel()
	p := newProject(backend, "probe", 10001, 0)
	root := newCheckRoot(t, p)

	for _, dir := range p.dirs() {
		checkPasses(t, filepath.Join(root, dir))
	}
}

// The fullstack runner has only Go, and the package's placeholder dist/
// stands in for the build, so apps/<name> runs its whole check here. The
// package's check runs its build script, which needs the pnpm workspace:
// TestNewProjectIncludesTheRecipeAndDeclaresItsScripts covers it.
func TestNewFullstackRunnerPassesItsCheck(t *testing.T) {
	t.Parallel()
	p := newProject(fullstack, "probe", 10001, 20001)
	root := newCheckRoot(t, p)

	checkPasses(t, filepath.Join(root, "apps", "probe"))
}

// Every folder a template writes includes the recipe, so make check runs in
// it, and a folder with a package.json declares the build script the recipe
// runs.
func TestNewProjectIncludesTheRecipeAndDeclaresItsScripts(t *testing.T) {
	for _, kind := range kinds {
		t.Run(kind, func(t *testing.T) {
			p := newProject(kind, "probe", 10001, 20001)
			root := writeProbe(t, kind)
			for _, dir := range p.dirs() {
				makefile, err := os.ReadFile(filepath.Join(root, dir, "Makefile"))
				if err != nil {
					t.Fatalf("read the generated %s/Makefile: %v", dir, err)
				}
				if !strings.HasPrefix(string(makefile), "include ../../make/check.mk\n") {
					t.Errorf("the generated %s/Makefile does not include the recipe:\n%s", dir, makefile)
				}

				data, err := os.ReadFile(filepath.Join(root, dir, "package.json"))
				if os.IsNotExist(err) {
					continue
				}
				if err != nil {
					t.Fatalf("read the generated %s/package.json: %v", dir, err)
				}
				var pkg struct {
					Scripts map[string]string `json:"scripts"`
				}
				if err := json.Unmarshal(data, &pkg); err != nil {
					t.Fatalf("parse the generated %s/package.json: %v", dir, err)
				}
				if pkg.Scripts["build"] == "" {
					t.Errorf("the generated %s/package.json has no build script", dir)
				}
			}
		})
	}
}

// A new project starts with a knowledge bundle that the repository's knowledge
// check accepts.
func TestNewProjectKnowledgePassesTheKnowledgeCheck(t *testing.T) {
	script := filepath.Join(repoRoot(t), ".agents", "skills", "documenting-with-okf", "scripts", "check.py")
	for _, kind := range kinds {
		t.Run(kind, func(t *testing.T) {
			root := writeProbe(t, kind)
			bundle := filepath.Join(root, "packages", "probe", "knowledge")
			if _, err := os.Stat(filepath.Join(bundle, "index.md")); err != nil {
				t.Fatalf("the generated project has no knowledge/index.md: %v", err)
			}
			if out, err := runIn(t, root, "python3", "-I", script, bundle); err != nil {
				t.Errorf("check.py on the generated knowledge: %v\n%s", err, out)
			}
		})
	}
}
