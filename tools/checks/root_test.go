package checks

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// newRoot builds a tiny repository root whose Makefile includes the real
// make/check-all.mk. Each project's check, and the knowledge check, leave a
// file in ran/ so a test sees which ran.
func newRoot(t *testing.T, failing string) string {
	t.Helper()
	loop, err := filepath.Abs(filepath.Join("..", "..", "make", "check-all.mk"))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	files := map[string]string{
		"Makefile": "include " + loop + "\n",
		".agents/skills/documenting-with-okf/scripts/check.py": "open('ran/knowledge', 'w').close()\n",
		"ran/.keep": "",
	}
	for _, project := range []string{"apps/a", "packages/b", "tools/c", "tests/e2e"} {
		step := "\ttouch ../../ran/" + filepath.Base(project) + "\n"
		if project == failing {
			step = "\t@echo broken on purpose; exit 1\n"
		}
		files[project+"/Makefile"] = "check:\n" + step
	}
	writeFiles(t, root, files)
	return root
}

func ran(root string) []string {
	var names []string
	for _, name := range []string{"a", "b", "c", "e2e", "knowledge"} {
		if _, err := os.Stat(filepath.Join(root, "ran", name)); err == nil {
			names = append(names, name)
		}
	}
	return names
}

func TestRootRunsEveryProjectAndTheKnowledgeCheck(t *testing.T) {
	t.Parallel()
	root := newRoot(t, "")

	out, err := check(t, root)

	if err != nil {
		t.Fatalf("make check: %v\n%s", err, out)
	}
	if got, want := strings.Join(ran(root), " "), "a b c knowledge"; got != want {
		t.Errorf("checks that ran = %q, want %q:\n%s", got, want, out)
	}
}

func TestRootFailsAndNamesTheProjectThatFails(t *testing.T) {
	t.Parallel()
	root := newRoot(t, "packages/b")

	out, err := check(t, root)

	if err == nil {
		t.Fatalf("make check passed, want packages/b to fail it:\n%s", out)
	}
	if !strings.Contains(out, "make check failed in packages/b") {
		t.Errorf("output does not name packages/b:\n%s", out)
	}
	if strings.Contains(strings.Join(ran(root), " "), "knowledge") {
		t.Errorf("the knowledge check ran after a project failed:\n%s", out)
	}
}
