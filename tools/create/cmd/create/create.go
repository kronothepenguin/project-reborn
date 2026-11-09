package main

import (
	"cmp"
	"errors"
	"fmt"
	"go/token"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
)

// The kinds of project, each named after its folder in templates/.
const (
	fullstack = "fullstack"
	backend   = "backend"
	client    = "client"
)

var kinds = []string{fullstack, backend, client}

// project is what one run makes, and the data of its templates. A port is 0
// when the kind has no server for it.
type project struct {
	Kind      string
	Name      string
	AppPort   int
	AstroPort int
	VitePort  int
}

// newProject derives the ports of the kind's servers from the name, unless
// appPort or astroPort is given.
func newProject(kind, name string, appPort, astroPort int) project {
	p := project{Kind: kind, Name: name}
	switch kind {
	case fullstack:
		p.AppPort = cmp.Or(appPort, AppPort(name))
		p.AstroPort = cmp.Or(astroPort, AstroPort(name))
	case backend:
		p.AppPort = cmp.Or(appPort, AppPort(name))
	case client:
		p.VitePort = VitePort(name)
	}
	return p
}

// Package is the name of the Go package: the name without its dashes, which a
// Go identifier cannot hold. Folders and module paths keep them.
func (p project) Package() string {
	return strings.ReplaceAll(p.Name, "-", "")
}

// Type is the name of the package's exported type.
func (p project) Type() string {
	pkg := p.Package()
	return strings.ToUpper(pkg[:1]) + pkg[1:]
}

// dirs are the folders the project makes, relative to the repository root.
func (p project) dirs() []string {
	dirs := []string{filepath.Join("packages", p.Name)}
	if p.Kind != client {
		dirs = append(dirs, filepath.Join("apps", p.Name))
	}
	return dirs
}

// taken are the names the Go of each template already uses where the
// project's package is in scope, so that the package cannot be named after
// them: the runners' other imports, the variables they declare before their
// last use of the package and the predeclared identifiers they use, and new
// and option, whose type would be the New or Option the package declares.
var taken = map[string][]string{
	backend: {"db", "http", "log", "new", "store"},
	fullstack: {
		"astro", "db", "err", "fs", "http", "httputil", "log", "new", "nil", "option", "panic", "proxy", "resolver",
		"store", "url",
	},
}

// specialFolders compile as Go package names but not as the folders a project
// makes: only code under packages may import packages/internal, the go tool
// reads packages/vendor as vendored code, and ./... skips folders named
// testdata, so a backend's gates would fail.
var specialFolders = []string{"internal", "testdata", "vendor"}

// validateName refuses a name the folders cannot hold and, in a template with
// Go, a name whose Go package cannot compile there (plans/server decision
// 0025) or whose folders the go tool treats specially (0026).
func validateName(kind, name string) error {
	if name == "" {
		return errors.New("name is required")
	}
	if name[0] < 'a' || name[0] > 'z' {
		return errors.New("name must start with a lowercase letter: " + name)
	}

	for i := 0; i < len(name); i++ {
		c := name[i]
		if !((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-') {
			return errors.New("name may contain only lowercase letters, digits, and '-': " + name)
		}
	}

	if kind == client {
		return nil
	}
	if slices.Contains(specialFolders, name) {
		return fmt.Errorf("name cannot be %s: the go tool treats a folder named %s specially", name, name)
	}
	pkg := project{Name: name}.Package()
	switch {
	case token.IsKeyword(pkg):
		return fmt.Errorf("name cannot be %s: its Go package would be %s, a Go keyword", name, pkg)
	case pkg == "main":
		return fmt.Errorf("name cannot be %s: its Go package would be main, which Go keeps for programs", name)
	case pkg == "init":
		return fmt.Errorf("name cannot be %s: its Go package would be init, which Go keeps for init functions", name)
	case slices.Contains(taken[kind], pkg):
		return fmt.Errorf("name cannot be %s: its Go package would be %s, which the %s template's Go already uses",
			name, pkg, kind)
	}
	return nil
}

func describe(code int, err error) string {
	if err == nil {
		return "exit " + strconv.Itoa(code)
	}
	return "exit " + strconv.Itoa(code) + ": " + err.Error()
}

func run(root, name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Dir = root
	return cmd.Run()
}

func scaffold(root, kind, name string, appPort, astroPort uint, dryRun bool) error {
	if err := validateName(kind, name); err != nil {
		return err
	}

	p := newProject(kind, name, int(appPort), int(astroPort))

	for _, dir := range p.dirs() {
		if _, err := os.Stat(filepath.Join(root, dir)); err == nil {
			return errors.New(dir + " already exists")
		}
	}

	if dryRun {
		printPlan(os.Stdout, root, p)
		return nil
	}

	if err := write(root, p); err != nil {
		return err
	}
	if err := install(root, p); err != nil {
		return err
	}

	printPlan(os.Stdout, root, p)
	return nil
}

// install leaves the new project ready to run: a client gets its pnpm
// dependencies, and a Go project joins go.work and runs its make install.
func install(root string, p project) error {
	if p.Kind == client {
		return run(root, "pnpm", "--filter", "@project-reborn/"+p.Name+"...", "install")
	}

	relAppDir := filepath.Join("apps", p.Name)
	relPkgDir := filepath.Join("packages", p.Name)
	appDir := filepath.Join(root, relAppDir)
	pkgDir := filepath.Join(root, relPkgDir)

	if err := run(root, "go", "work", "use", relAppDir); err != nil {
		return err
	}
	if err := run(root, "go", "work", "use", relPkgDir); err != nil {
		return err
	}
	if err := run(root, "go", "work", "sync"); err != nil {
		return err
	}

	if err := run(pkgDir, "go", "mod", "tidy", "-e"); err != nil {
		return err
	}
	if err := run(appDir, "go", "mod", "tidy", "-e"); err != nil {
		return err
	}
	return run(appDir, "make", "install")
}

// printPlan walks the kind's embedded templates and prints the files that
// would be (or were) created, the ports of its servers and what to run next.
func printPlan(w io.Writer, root string, p project) {
	fmt.Fprintln(w)
	fmt.Fprintln(w, "created:")
	for _, dir := range p.dirs() {
		fmt.Fprintln(w, "  "+dir+"/")
	}

	walkTemplates(p, func(_, target string) error {
		fmt.Fprintln(w, "  "+filepath.Join(root, target))
		return nil
	})

	fmt.Fprintln(w)
	fmt.Fprintln(w, "ports:")
	if p.AppPort != 0 {
		fmt.Fprintln(w, "  app:   http://localhost:"+strconv.Itoa(p.AppPort))
	}
	if p.AstroPort != 0 {
		fmt.Fprintln(w, "  astro: http://localhost:"+strconv.Itoa(p.AstroPort))
	}
	if p.VitePort != 0 {
		fmt.Fprintln(w, "  vite:  http://localhost:"+strconv.Itoa(p.VitePort))
	}
	fmt.Fprintln(w)
	fmt.Fprintln(w, "next:")
	switch p.Kind {
	case fullstack:
		fmt.Fprintln(w, "  make dev        # in apps/"+p.Name+": astro (background) + air hot reload")
	case backend:
		fmt.Fprintln(w, "  make dev        # in apps/"+p.Name+": air hot reload")
	case client:
		fmt.Fprintln(w, "  pnpm dev        # in packages/"+p.Name+": vite dev server")
	}
	fmt.Fprintln(w, "  make install    # at repo root: wires go workspace + pnpm + tools")
	fmt.Fprintln(w)
}
