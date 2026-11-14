// The tests of make/check.mk: each builds a tiny project in a temporary
// folder, includes the real recipe and runs make check on it.
package checks

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func recipe(t *testing.T) string {
	t.Helper()
	path, err := filepath.Abs(filepath.Join("..", "..", "make", "check.mk"))
	if err != nil {
		t.Fatal(err)
	}
	return path
}

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

func run(t *testing.T, dir, name string, args ...string) (string, error) {
	t.Helper()
	cmd := exec.Command(name, args...)
	cmd.Dir = dir
	// The outer make's flags and jobserver belong to the outer make.
	cmd.Env = append(os.Environ(), "MAKEFLAGS=", "MFLAGS=", "MAKELEVEL=", "GOWORK=")
	out, err := cmd.CombinedOutput()
	return string(out), err
}

// newRepo writes files into a new git repository with every file tracked, and
// gives each folder in projects a Makefile that includes the recipe.
func newRepo(t *testing.T, files map[string]string, projects ...string) string {
	t.Helper()
	root := t.TempDir()
	writeFiles(t, root, files)
	for _, project := range projects {
		writeFiles(t, root, map[string]string{
			filepath.Join(project, "Makefile"): "include " + recipe(t) + "\n",
		})
	}
	for _, args := range [][]string{{"init", "-q"}, {"add", "-A"}} {
		if out, err := run(t, root, "git", args...); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	return root
}

func check(t *testing.T, dir string) (string, error) {
	t.Helper()
	return run(t, dir, "make", "check")
}

const goMod = "module example.com/p\n\ngo 1.27.0\n"

func goProject(files map[string]string) map[string]string {
	all := map[string]string{
		"go.mod":    goMod,
		"p.go":      "package p\n\nfunc Add(a, b int) int { return a + b }\n",
		"p_test.go": "package p\n\nimport \"testing\"\n\nfunc TestAdd(t *testing.T) {\n\tif Add(1, 2) != 3 {\n\t\tt.Fatal(\"Add(1, 2) != 3\")\n\t}\n}\n",
	}
	for name, content := range files {
		all[name] = content
	}
	return all
}

func TestRightProjectPasses(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(nil), ".")

	out, err := check(t, dir)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
}

func TestGoProjectChecksFormattingVetsTestsAndBuilds(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(nil), ".")

	out, err := check(t, dir)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
	for _, step := range []string{"go vet ./...", "go test ./... -race", "go build -o /dev/null ./..."} {
		if !strings.Contains(out, step) {
			t.Errorf("output lacks %q:\n%s", step, out)
		}
	}
}

func TestGoProjectThatFailsVetFails(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(map[string]string{
		"vet.go": "package p\n\nimport \"fmt\"\n\nfunc Show() { fmt.Printf(\"%d\\n\", \"text\") }\n",
	}), ".")

	out, err := check(t, dir)

	if err == nil {
		t.Fatalf("make check passed, want a vet failure:\n%s", out)
	}
	if !strings.Contains(out, "vet.go") {
		t.Errorf("output does not name vet.go:\n%s", out)
	}
}

func TestGoProjectThatFailsToBuildFails(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(map[string]string{
		"cmd/p/main.go": "package main\n\nfunc main() { missing() }\n",
	}), ".")

	out, err := check(t, dir)

	if err == nil {
		t.Fatalf("make check passed, want a build failure:\n%s", out)
	}
	if !strings.Contains(out, "undefined: missing") {
		t.Errorf("output does not show the build error:\n%s", out)
	}
}

func TestPackageRunsTheBuildCheckAndTestScriptsItDeclares(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, map[string]string{
		"package.json": `{"name": "p", "scripts": {
			"build": "touch ran-build", "check": "touch ran-check", "test": "touch ran-test", "lint": "touch ran-lint"}}`,
	}, ".")

	out, err := check(t, dir)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
	for _, script := range []string{"build", "check", "test"} {
		if _, err := os.Stat(filepath.Join(dir, "ran-"+script)); err != nil {
			t.Errorf("script %s did not run:\n%s", script, out)
		}
	}
	if _, err := os.Stat(filepath.Join(dir, "ran-lint")); err == nil {
		t.Error("script lint ran, want only build, check and test")
	}
}

func TestPackageWithoutAScriptSkipsIt(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, map[string]string{
		"package.json": `{"name": "p", "scripts": {"test": "touch ran-test"}}`,
	}, ".")

	out, err := check(t, dir)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
	if _, err := os.Stat(filepath.Join(dir, "ran-test")); err != nil {
		t.Errorf("script test did not run:\n%s", out)
	}
}

func TestPackageScriptThatFailsFails(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, map[string]string{
		"package.json": `{"name": "p", "scripts": {"check": "exit 3"}}`,
	}, ".")

	out, err := check(t, dir)

	if err == nil {
		t.Fatalf("make check passed, want the check script to fail it:\n%s", out)
	}
}

func TestProjectWithBothRunsTheBuildScriptBeforeTheGoTestsAndBuild(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, map[string]string{
		"go.mod":       goMod,
		"package.json": `{"name": "p", "scripts": {"build": "mkdir -p dist && echo built > dist/page.html"}}`,
		"p.go":         "package p\n\nimport \"embed\"\n\n//go:embed dist/*\nvar Dist embed.FS\n",
		"p_test.go":    "package p\n\nimport \"testing\"\n\nfunc TestPage(t *testing.T) {\n\tif _, err := Dist.ReadFile(\"dist/page.html\"); err != nil {\n\t\tt.Fatal(err)\n\t}\n}\n",
	}, ".")

	out, err := check(t, dir)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
}

func TestUnformattedGoFileFailsAndIsNamed(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(map[string]string{
		"messy.go": "package p\n\nfunc   Messy( ) int {return 1}\n",
	}), ".")

	out, err := check(t, dir)

	if err == nil {
		t.Fatalf("make check passed, want a formatting failure:\n%s", out)
	}
	if !strings.Contains(out, "not formatted:\nmessy.go") {
		t.Errorf("output does not name messy.go:\n%s", out)
	}
}

func TestFailingTestFailsAndIsShown(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, goProject(map[string]string{
		"broken_test.go": "package p\n\nimport \"testing\"\n\nfunc TestBroken(t *testing.T) { t.Fatal(\"broken on purpose\") }\n",
	}), ".")

	out, err := check(t, dir)

	if err == nil {
		t.Fatalf("make check passed, want a test failure:\n%s", out)
	}
	if !strings.Contains(out, "--- FAIL: TestBroken") || !strings.Contains(out, "broken on purpose") {
		t.Errorf("output does not show the failing test:\n%s", out)
	}
}

func TestDependantFailsWhenAChangeBreaksTheProjectItUses(t *testing.T) {
	t.Parallel()
	dir := newRepo(t, map[string]string{
		"go.work":  "go 1.27.0\n\nuse (\n\t./a\n\t./b\n)\n",
		"a/go.mod": "module example.com/w/a\n\ngo 1.27.0\n",
		"a/a.go":   "package a\n\nfunc Hello() string { return \"hello\" }\n",
		"b/go.mod": "module example.com/w/b\n\ngo 1.27.0\n",
		"b/b.go":   "package b\n\nimport \"example.com/w/a\"\n\nfunc Greet() string { return a.Hello() }\n",
	}, "a", "b")
	if out, err := check(t, filepath.Join(dir, "b")); err != nil {
		t.Fatalf("make check in b before the change: %v\n%s", err, out)
	}
	writeFiles(t, dir, map[string]string{"a/a.go": "package a\n\nfunc Hi() string { return \"hi\" }\n"})

	out, err := check(t, filepath.Join(dir, "b"))

	if err == nil {
		t.Fatalf("make check in b passed, want it broken by the change in a:\n%s", out)
	}
	if !strings.Contains(out, "a.Hello") {
		t.Errorf("output does not show the broken use:\n%s", out)
	}
}
