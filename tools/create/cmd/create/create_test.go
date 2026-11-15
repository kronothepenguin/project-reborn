package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"go/types"
	"maps"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
)

func TestValidateName(t *testing.T) {
	names := map[string]bool{
		"housekeeping": true,
		"a-b-c":        true,
		"a1":           true,
		"":             false,
		"9abc":         false,
		"Abc":          false,
		"a_b":          false,
		"a/b":          false,
	}

	for _, kind := range kinds {
		for name, valid := range names {
			got := validateName(kind, name) == nil
			if got != valid {
				t.Errorf("validateName(%q, %q) = %t; want %t", kind, name, got, valid)
			}
		}
	}
}

// A name is refused by the templates whose Go it cannot compile in, and only
// by them (decision server/0025): a client has no Go, and nil, for one,
// compiles in a backend, whose runner never compares with nil.
func TestValidateNameRefusesNamesWhoseGoPackageCannotCompile(t *testing.T) {
	withGo := []string{backend, fullstack}
	refusedBy := map[string][]string{
		"main":  withGo,
		"ma-in": withGo,
		"init":  withGo,
		"in-it": withGo,
		"go-to": withGo,

		"db":    withGo,
		"http":  withGo,
		"log":   withGo,
		"l-og":  withGo,
		"new":   withGo,
		"store": withGo,

		"astro":    {fullstack},
		"err":      {fullstack},
		"fs":       {fullstack},
		"httputil": {fullstack},
		"nil":      {fullstack},
		"option":   {fullstack},
		"panic":    {fullstack},
		"proxy":    {fullstack},
		"resolver": {fullstack},
		"url":      {fullstack},

		// The runners declare c, mux and server after their last use of the
		// package, and router, sql, embed and fmt are used only by the
		// package's own files, which do not import it.
		"c":      nil,
		"mux":    nil,
		"server": nil,
		"router": nil,
		"sql":    nil,
		"embed":  nil,
		"fmt":    nil,
	}
	for _, keyword := range []string{
		"break", "case", "chan", "const", "continue", "default", "defer", "else", "fallthrough", "for", "func", "go",
		"goto", "if", "import", "interface", "map", "package", "range", "return", "select", "struct", "switch", "type",
		"var",
	} {
		refusedBy[keyword] = withGo
	}

	for name, want := range refusedBy {
		pkg := project{Name: name}.Package()
		for _, kind := range kinds {
			err := validateName(kind, name)
			if refused := err != nil; refused != slices.Contains(want, kind) {
				t.Errorf("validateName(%q, %q) = %v; want refused: %t", kind, name, err, !refused)
				continue
			}
			if err != nil && !strings.HasPrefix(err.Error(), "name cannot be "+name+": its Go package would be "+pkg+",") {
				t.Errorf("validateName(%q, %q) = %q; want it to name %s and its Go package %s", kind, name, err, name, pkg)
			}
		}
	}
}

// The go tool's special folders are refused by the templates with Go and only
// by them (decision server/0026). The check is on the name, which names
// the folders: ven-dor's Go package is vendor, and it compiles.
func TestValidateNameRefusesNamesTheGoToolTreatsSpecially(t *testing.T) {
	for _, name := range []string{"internal", "testdata", "vendor"} {
		for _, kind := range kinds {
			err := validateName(kind, name)
			if kind == client {
				if err != nil {
					t.Errorf("validateName(%q, %q) = %v; want nil, a client has no Go", kind, name, err)
				}
				continue
			}
			want := "name cannot be " + name + ": the go tool treats a folder named " + name + " specially"
			if err == nil || err.Error() != want {
				t.Errorf("validateName(%q, %q) = %v; want %q", kind, name, err, want)
			}
		}
	}
	for _, name := range []string{"inter-nal", "test-data", "ven-dor", "internals", "vendors"} {
		for _, kind := range kinds {
			if err := validateName(kind, name); err != nil {
				t.Errorf("validateName(%q, %q) = %v; want nil", kind, name, err)
			}
		}
	}
}

// taken is derived here from the files of a generated project, so that a
// template that starts using one more name fails until taken lists it.
func TestTakenHoldsTheNamesTheTemplatesUse(t *testing.T) {
	packageName := regexp.MustCompile(`^[a-z][a-z0-9]*$`)
	for _, kind := range []string{backend, fullstack} {
		t.Run(kind, func(t *testing.T) {
			root := writeProbe(t, kind)
			used := map[string]bool{}

			runners, err := filepath.Glob(filepath.Join(root, "apps", "probe", "cmd", "*", "main.go"))
			if err != nil || len(runners) == 0 {
				t.Fatalf("find the generated runners: %v", err)
			}
			for _, runner := range runners {
				usedByRunner(parseGo(t, runner), used)
			}
			usedByType(parseGo(t, filepath.Join(root, "packages", "probe", "probe.go")), used)

			maps.DeleteFunc(used, func(name string, _ bool) bool { return !packageName.MatchString(name) })
			if want := slices.Sorted(maps.Keys(used)); !slices.Equal(taken[kind], want) {
				t.Errorf("taken[%s] = %q; the template's Go uses %q", kind, taken[kind], want)
			}
		})
	}
}

func parseGo(t *testing.T, file string) *ast.File {
	t.Helper()
	f, err := parser.ParseFile(token.NewFileSet(), file, nil, parser.SkipObjectResolution)
	if err != nil {
		t.Fatalf("parse the generated %s: %v", file, err)
	}
	return f
}

// usedByRunner adds the names a runner uses where its import of the package
// probe is in scope: its other imports, the variables it declares before its
// last use of probe, and the predeclared identifiers it uses.
func usedByRunner(f *ast.File, used map[string]bool) {
	for _, imp := range f.Imports {
		name := path.Base(strings.Trim(imp.Path.Value, `"`))
		if imp.Name != nil {
			name = imp.Name.Name
		}
		if name != "probe" {
			used[name] = true
		}
	}

	var last token.Pos
	selected := map[*ast.Ident]bool{}
	ast.Inspect(f, func(n ast.Node) bool {
		if sel, ok := n.(*ast.SelectorExpr); ok {
			selected[sel.Sel] = true
			if x, ok := sel.X.(*ast.Ident); ok && x.Name == "probe" {
				last = sel.Pos()
			}
		}
		return true
	})
	ast.Inspect(f, func(n ast.Node) bool {
		switch n := n.(type) {
		case *ast.AssignStmt:
			if n.Tok == token.DEFINE && n.End() < last {
				for _, lhs := range n.Lhs {
					if id, ok := lhs.(*ast.Ident); ok {
						used[id.Name] = true
					}
				}
			}
		case *ast.Ident:
			if !selected[n] && types.Universe.Lookup(n.Name) != nil {
				used[n.Name] = true
			}
		}
		return true
	})
}

// usedByType adds the names the package probe declares, with their first
// letter lowered: a package named new would declare its type New next to the
// function New.
func usedByType(f *ast.File, used map[string]bool) {
	var declared []string
	for _, decl := range f.Decls {
		switch d := decl.(type) {
		case *ast.FuncDecl:
			if d.Recv == nil {
				declared = append(declared, d.Name.Name)
			}
		case *ast.GenDecl:
			for _, spec := range d.Specs {
				switch s := spec.(type) {
				case *ast.TypeSpec:
					declared = append(declared, s.Name.Name)
				case *ast.ValueSpec:
					for _, name := range s.Names {
						declared = append(declared, name.Name)
					}
				}
			}
		}
	}
	for _, name := range declared {
		if name != "Probe" {
			used[strings.ToLower(name[:1])+name[1:]] = true
		}
	}
}
